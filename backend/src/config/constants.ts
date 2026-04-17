// AI sampling limits — override via env for different environments
export const AI_CLASSIFY_MAX = Number(process.env.AI_CLASSIFY_MAX) || 20;
export const AI_SUMMARIZE_SAMPLE = Number(process.env.AI_SUMMARIZE_SAMPLE) || 30;
export const AI_SUGGESTIONS_NEGATIVE_SAMPLE = 15;
export const AI_SUGGESTIONS_MIN_RECORDS = Number(process.env.AI_SUGGESTIONS_MIN_RECORDS) || 10;
export const AI_SUGGESTIONS_TOP_TAGS = 10;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
