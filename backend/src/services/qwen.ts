import OpenAI from 'openai';
import { logger } from '../middleware/logger';
import {
  AI_CLASSIFY_MAX,
  AI_SUMMARIZE_SAMPLE,
  AI_SUGGESTIONS_NEGATIVE_SAMPLE,
  AI_SUGGESTIONS_TOP_TAGS,
} from '../config/constants';

function getRuntimeConfig() {
  return {
    baseURL: (process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1').trim(),
    model: (process.env.QWEN_MODEL || 'qwen-plus').trim(),
    apiKey: (process.env.DASHSCOPE_API_KEY || '').trim(),
  };
}

function getClient() {
  const { apiKey, baseURL } = getRuntimeConfig();
  return new OpenAI({
    apiKey: apiKey || 'placeholder',
    baseURL,
  });
}

function assertApiKeyConfigured() {
  if (!getRuntimeConfig().apiKey) {
    throw new Error('DASHSCOPE_API_KEY is empty or missing');
  }
}

export interface ClassifyResult {
  id: string;
  originalText: string;
  suggestedCategory: string;
  confidence: number;
  reason: string;
}

export interface SummaryResult {
  period: string;
  totalCount: number;
  topIssues: { issue: string; count: number; examples: string[] }[];
  typicalQuotes: string[];
  overallSentiment: string;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
}

export interface SuggestionResult {
  generatedAt: string;
  dataRange: string;
  suggestions: {
    category: string;
    problem: string;
    impact: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  summary: string;
}

function parseJsonFromContent(content: string, pattern: RegExp): unknown {
  const match = content.match(pattern);
  if (!match) throw new Error('No JSON found in AI response');
  return JSON.parse(match[0]);
}

export async function classifyFeedbacks(
  feedbacks: { id: string; text: string }[]
): Promise<ClassifyResult[]> {
  assertApiKeyConfigured();
  const { model } = getRuntimeConfig();
  const client = getClient();
  const sample = feedbacks.slice(0, AI_CLASSIFY_MAX);
  const feedbackList = sample.map((f, i) => `${i + 1}. [ID: ${f.id}] ${f.text}`).join('\n');

  const prompt = `你是一个专业的Robotaxi用户反馈分析师。请将以下乘客反馈文本分类到以下5个类别之一：
- 驾驶体验：关于车辆行驶平稳性、加减速、变道等驾驶相关问题
- 车内环境：关于车内清洁度、空调、座椅、气味等环境问题
- 接驾体验：关于等待时间、接驾位置、上下车便利性等问题
- 路线规划：关于行驶路线合理性、是否绕路、导航等问题
- 安全感受：关于行驶安全、紧急情况处理、对特殊情况的应对等问题

请以JSON数组格式返回，每条包含：id(原始ID), suggestedCategory(分类名称), confidence(置信度0-1保留两位小数), reason(分类理由，一句话)

反馈列表：
${feedbackList}

只返回JSON数组，不要其他内容。`;

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content ?? '';
  let results: { suggestedCategory?: string; confidence?: number; reason?: string }[];

  try {
    results = parseJsonFromContent(content, /\[[\s\S]*\]/) as typeof results;
  } catch (parseErr) {
    logger.error('classify_parse_error', { error: String(parseErr), rawContent: content.slice(0, 200) });
    throw new Error(`Failed to parse classify response: ${String(parseErr)}`);
  }

  return sample.map((f, i) => ({
    id: f.id,
    originalText: f.text,
    suggestedCategory: results[i]?.suggestedCategory ?? '驾驶体验',
    confidence: results[i]?.confidence ?? 0.8,
    reason: results[i]?.reason ?? '基于文本内容判断',
  }));
}

export async function summarizeFeedbacks(
  feedbacks: { id: string; text: string; rating: number; feedbackType: string; sentiment: string }[],
  period: string
): Promise<SummaryResult> {
  assertApiKeyConfigured();
  const { model } = getRuntimeConfig();
  const client = getClient();
  const sentimentBreakdown = {
    positive: feedbacks.filter(f => f.sentiment === 'positive').length,
    neutral: feedbacks.filter(f => f.sentiment === 'neutral').length,
    negative: feedbacks.filter(f => f.sentiment === 'negative').length,
  };

  const sample = feedbacks.slice(0, AI_SUMMARIZE_SAMPLE);
  const feedbackList = sample
    .map((f, i) => `${i + 1}. [评分:${f.rating}/5, 类型:${f.feedbackType}] ${f.text}`)
    .join('\n');

  const prompt = `你是一个专业的产品分析师，请基于以下Robotaxi乘客反馈数据生成分析摘要。

数据概况：共${feedbacks.length}条反馈，好评${sentimentBreakdown.positive}条，中性${sentimentBreakdown.neutral}条，差评${sentimentBreakdown.negative}条。

反馈样本（前${sample.length}条）：
${feedbackList}

请生成一份结构化摘要，以JSON格式返回，包含：
{
  "topIssues": [{"issue": "问题名称", "count": 估计涉及数量, "examples": ["典型用户说词1", "典型用户说词2"]}],（列出3-5个核心问题）
  "typicalQuotes": ["代表性用户原话1", "代表性用户原话2", "代表性用户原话3"],（3-5句）
  "overallSentiment": "整体情感描述，一两句话"
}

只返回JSON，不要其他内容。`;

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });

  const content = response.choices[0]?.message?.content ?? '';
  let result: { topIssues?: unknown[]; typicalQuotes?: string[]; overallSentiment?: string };

  try {
    result = parseJsonFromContent(content, /\{[\s\S]*\}/) as typeof result;
  } catch (parseErr) {
    logger.error('summarize_parse_error', { error: String(parseErr), rawContent: content.slice(0, 200) });
    throw new Error(`Failed to parse summarize response: ${String(parseErr)}`);
  }

  return {
    period,
    totalCount: feedbacks.length,
    topIssues: (result.topIssues as SummaryResult['topIssues']) ?? [],
    typicalQuotes: result.typicalQuotes ?? [],
    overallSentiment: result.overallSentiment ?? '数据分析完成',
    sentimentBreakdown,
  };
}

export async function generateSuggestions(
  feedbacks: { text: string; rating: number; feedbackType: string; sentiment: string; tags: string[] }[],
  dataRange: string
): Promise<SuggestionResult> {
  assertApiKeyConfigured();
  const { model } = getRuntimeConfig();
  const client = getClient();
  const typeStats = feedbacks.reduce((acc, f) => {
    if (!acc[f.feedbackType]) acc[f.feedbackType] = { total: 0, negative: 0, ratings: [] };
    acc[f.feedbackType].total++;
    if (f.sentiment === 'negative') acc[f.feedbackType].negative++;
    acc[f.feedbackType].ratings.push(f.rating);
    return acc;
  }, {} as Record<string, { total: number; negative: number; ratings: number[] }>);

  const tagCounts = feedbacks.flatMap(f => f.tags).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, AI_SUGGESTIONS_TOP_TAGS)
    .map(([tag, count]) => `${tag}(${count}次)`)
    .join('、');

  const negativeSamples = feedbacks
    .filter(f => f.sentiment === 'negative')
    .slice(0, AI_SUGGESTIONS_NEGATIVE_SAMPLE)
    .map((f, i) => `${i + 1}. [${f.feedbackType}] ${f.text}`)
    .join('\n');

  const statsText = Object.entries(typeStats)
    .map(([type, stat]) => {
      const avg = stat.ratings.reduce((a, b) => a + b, 0) / stat.ratings.length;
      return `${type}：共${stat.total}条，差评${stat.negative}条，平均${avg.toFixed(1)}分`;
    })
    .join('\n');

  const prompt = `你是Robotaxi产品负责人的智能助理，请基于以下用户反馈数据分析结果，生成具体可落地的产品优化建议。

数据统计（${dataRange}）：
${statsText}

高频问题标签：${topTags}

典型差评反馈：
${negativeSamples}

请生成产品优化建议报告，以JSON格式返回：
{
  "suggestions": [
    {
      "category": "问题类别",
      "problem": "具体问题描述",
      "impact": "对用户体验的影响分析",
      "recommendation": "具体优化建议和实施方向",
      "priority": "high/medium/low"
    }
  ],（3-5条建议）
  "summary": "总体优化建议摘要，2-3句话"
}

只返回JSON，不要其他内容。`;

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
  });

  const content = response.choices[0]?.message?.content ?? '';
  let result: { suggestions?: SuggestionResult['suggestions']; summary?: string };

  try {
    result = parseJsonFromContent(content, /\{[\s\S]*\}/) as typeof result;
  } catch (parseErr) {
    logger.error('suggestions_parse_error', { error: String(parseErr), rawContent: content.slice(0, 200) });
    throw new Error(`Failed to parse suggestions response: ${String(parseErr)}`);
  }

  return {
    generatedAt: new Date().toISOString(),
    dataRange,
    suggestions: result.suggestions ?? [],
    summary: result.summary ?? '',
  };
}
