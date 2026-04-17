import fs from 'fs';
import path from 'path';

const cities = ['上海', '广州', '武汉', '重庆'];

const routes: Record<string, string[]> = {
  '上海': [
    '浦东国际机场 → 陆家嘴',
    '虹桥火车站 → 人民广场',
    '徐家汇 → 张江高科',
    '静安寺 → 外滩',
    '上海南站 → 徐汇滨江',
  ],
  '广州': [
    '白云国际机场 → 珠江新城',
    '广州南站 → 天河体育中心',
    '番禺广场 → 花城广场',
    '南沙客运港 → 琶洲',
  ],
  '武汉': [
    '武汉天河机场 → 武汉站',
    '光谷广场 → 武汉站',
    '汉口火车站 → 江汉路',
    '武昌火车站 → 武汉大学',
  ],
  '重庆': [
    '江北国际机场 → 解放碑',
    '重庆北站 → 观音桥',
    '南坪 → 洪崖洞',
    '大学城 → 沙坪坝',
  ],
};

const feedbackTypes = ['驾驶体验', '车内环境', '接驾体验', '路线规划', '安全感受'];

const vehicles: Record<string, string[]> = {
  '上海': ['AV-SH-001', 'AV-SH-002', 'AV-SH-003', 'AV-SH-004', 'AV-SH-005'],
  '广州': ['AV-GZ-001', 'AV-GZ-002', 'AV-GZ-003', 'AV-GZ-004'],
  '武汉': ['AV-WH-001', 'AV-WH-002', 'AV-WH-003'],
  '重庆': ['AV-CQ-001', 'AV-CQ-002', 'AV-CQ-003'],
};

const weathers = ['晴', '多云', '阴', '小雨', '大雨'];

const positiveFeedbacks: Partial<Record<string, string[]>> = {
  '驾驶体验': [
    '车辆行驶非常平稳，没有急加速急刹车，整体体验非常舒适。',
    '自动驾驶系统对路况判断准确，变道超车时机把握得很好，比人类司机还稳。',
    '全程没有多余的晃动，坐在后座完全可以安心看手机，很棒的体验！',
    '驾驶节奏跟人类司机差不多，不会有那种机器感，挺自然的。',
    '高速段行驶特别平稳，跟车距离保持得很好，完全不担心安全问题。',
  ],
  '车内环境': [
    '车内非常整洁，座椅舒适，空调温度适宜，整个行程很愉快。',
    '车内有轻柔的背景音乐，座椅宽敞，空间感很好，比普通出租车舒服多了。',
    '车辆内饰很新，没有异味，空气清新，坐了一个小时一点都不难受。',
    '屏幕显示信息清晰，行程进度一目了然，操作也很简单。',
  ],
  '接驾体验': [
    '到达接驾点非常准时，等待时间不到2分钟，导航指引也很清晰。',
    '车辆提前到达指定位置，上车非常方便，没有找车找不到的问题。',
    '系统提前推送了接驾位置图片，很贴心，完全没有找车的困扰。',
    '接驾很顺利，车辆停在最方便的位置，行李箱也很宽敞。',
  ],
  '路线规划': [
    '路线规划很合理，全程没有走冤枉路，比我自己导航还快10分钟。',
    '系统自动规避了拥堵路段，绕行路线很科学，节省了不少时间。',
    '导航路线优化得很好，虽然绕了一点但避开了主干道拥堵，总时间更短。',
  ],
  '安全感受': [
    '全程有安全员监控，遇到复杂路口时处理得非常谨慎，很有安全感。',
    '过十字路口时提前减速，对行人的判断很准确，乘客完全放心。',
    '紧急情况处理得当，突然有电动车闯入时系统快速响应，没有任何危险。',
  ],
};

const neutralFeedbacks: Partial<Record<string, string[]>> = {
  '驾驶体验': [
    '总体还行，偶尔有轻微的顿挫感，但不影响整体体验。',
    '驾驶比较保守，有时候绿灯了还要停顿一下才启动，不过安全第一。',
    '路况复杂时系统会减速较多，导致行程时间比预期稍长。',
  ],
  '车内环境': [
    '车内基本整洁，有一处座椅有点脏，建议运营方加强清洁频率。',
    '空调噪音稍大，不影响使用，但如果能改善一下就更好了。',
    '车内屏幕有点旧，反应稍慢，功能都有只是操作流畅度一般。',
  ],
  '接驾体验': [
    '接驾位置稍微有些偏，走了大概50米才到，不算麻烦。',
    '等待了约5分钟，可以接受，不过如果能再快一点就更好了。',
  ],
  '路线规划': [
    '路线基本合理，中间走了一段小路，不过也没有明显绕路。',
    '导航选择了一条我平时不走的路，时间差不多，就是不熟悉有点担心。',
  ],
  '安全感受': [
    '整体感觉安全，只是在一次变道时感觉距离稍近，有点紧张。',
    '遇到复杂路口时系统处理稍慢，不过最终还是安全通过了。',
  ],
};

const negativeFeedbacks: Partial<Record<string, string[]>> = {
  '驾驶体验': [
    '刹车太突然，多次急刹，行李都从座位上掉下来了，体验很差。',
    '启动时顿挫感明显，加速不够平顺，感觉系统调校还不够成熟。',
    '在堵车路段频繁停停走走，每次启动都有明显冲击感，坐得很不舒服。',
    '变道时没有预警，突然向右变道，吓了一跳，希望优化变道逻辑。',
  ],
  '车内环境': [
    '车内有明显异味，像是香水和汗味混合，全程开着窗才勉强忍受。',
    '空调完全不制冷，夏天坐了30分钟，出来满身汗，太难受了。',
    '后排座椅损坏，坐下去有弹簧顶背的感觉，行程比较长所以很难受。',
    '车内非常脏乱，有之前乘客留下的垃圾，地毯上有明显污渍。',
  ],
  '接驾体验': [
    '等待时间超过20分钟，系统一直提示车辆将至却迟迟不到，误了会议。',
    '接驾位置设置不合理，停在了施工区域旁边，行李很难装进去。',
    '车辆停错了位置，我在A出口等，车停在了B出口，浪费了很多时间找车。',
  ],
  '路线规划': [
    '明显走了冤枉路，比正常路线多了将近5公里，费用也多扣了不少。',
    '路线选择错误，走了一条正在修路的道路，颠簸了很长时间。',
    '明明有更快的路线系统不走，非要走拥堵的主干道，多花了20分钟。',
  ],
  '安全感受': [
    '在高速上行驶时突然大幅度变道，完全没有预警，差点心脏病发作。',
    '遇到行人横穿时刹车距离太近，如果是小孩子真的很危险，必须改进。',
    '夜间行驶感觉系统对前方障碍物识别不够及时，有几次都有点险情。',
  ],
};

interface Feedback {
  id: string;
  passengerId: string;
  tripId: string;
  vehicleId: string;
  rating: number;
  feedbackText: string;
  feedbackType: string;
  city: string;
  route: string;
  tripStartTime: string;
  tripDuration: number;
  weather: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  createdAt: string;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const tagsByType: Record<string, Record<string, string[]>> = {
  '驾驶体验': {
    positive: ['平稳舒适', '驾驶自然', '跟车稳定', '加减速顺滑'],
    neutral: ['偶有顿挫', '保守驾驶', '速度偏慢'],
    negative: ['急刹车', '急加速', '顿挫感强', '变道突然'],
  },
  '车内环境': {
    positive: ['整洁干净', '空调舒适', '座椅舒适', '无异味'],
    neutral: ['基本整洁', '空调噪音', '屏幕老旧'],
    negative: ['有异味', '空调故障', '座椅损坏', '车内脏乱'],
  },
  '接驾体验': {
    positive: ['准时到达', '接驾便利', '停车位置好', '等待时间短'],
    neutral: ['稍有等待', '位置稍偏'],
    negative: ['等待过长', '位置不准', '找车困难', '停错地点'],
  },
  '路线规划': {
    positive: ['路线最优', '避开拥堵', '节省时间', '导航精准'],
    neutral: ['路线一般', '绕行合理'],
    negative: ['绕路收费', '走修路路段', '路线低效', '未避开拥堵'],
  },
  '安全感受': {
    positive: ['安全放心', '应急处理好', '谨慎驾驶', '行人判断准'],
    neutral: ['整体安全', '偶有紧张'],
    negative: ['变道危险', '刹车距离近', '障碍识别慢', '夜间感觉险'],
  },
};

function generateFeedback(index: number): Feedback {
  const city = randomElement(cities);
  const cityRoutes = routes[city];
  const route = randomElement(cityRoutes);
  const vehicleId = randomElement(vehicles[city]);
  const feedbackType = randomElement(feedbackTypes);

  // Sentiment distribution: ~50% positive, 20% negative, 30% neutral
  const rand = Math.random();
  let sentiment: 'positive' | 'neutral' | 'negative';
  let rating: number;

  if (rand < 0.50) {
    sentiment = 'positive';
    rating = Math.random() < 0.6 ? 5 : 4;
  } else if (rand < 0.70) {
    sentiment = 'negative';
    rating = Math.random() < 0.6 ? 1 : 2;
  } else {
    sentiment = 'neutral';
    rating = 3;
  }

  const feedbackPool = sentiment === 'positive'
    ? positiveFeedbacks[feedbackType]
    : sentiment === 'negative'
    ? negativeFeedbacks[feedbackType]
    : neutralFeedbacks[feedbackType];

  const feedbackText = feedbackPool
    ? randomElement(feedbackPool)
    : '行程体验一般，没有特别的问题，也没有太出色的地方。';

  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-03-31');
  const tripStartTime = randomDate(startDate, endDate);
  const createdAt = new Date(tripStartTime.getTime() + randomInt(5, 60) * 60 * 1000);
  const tripDuration = randomInt(15, 75);

  const tagPool = tagsByType[feedbackType][sentiment];
  const numTags = randomInt(1, 3);
  const shuffled = [...tagPool].sort(() => Math.random() - 0.5);
  const tags = shuffled.slice(0, Math.min(numTags, shuffled.length));

  const id = `F${String(index + 1).padStart(3, '0')}`;
  const passengerId = `P${String(randomInt(1, 80)).padStart(3, '0')}`;
  const tripId = `T${tripStartTime.getFullYear()}${String(tripStartTime.getMonth() + 1).padStart(2, '0')}${String(tripStartTime.getDate()).padStart(2, '0')}_${String(index + 1).padStart(3, '0')}`;

  return {
    id,
    passengerId,
    tripId,
    vehicleId,
    rating,
    feedbackText,
    feedbackType,
    city,
    route,
    tripStartTime: tripStartTime.toISOString(),
    tripDuration,
    weather: randomElement(weathers),
    sentiment,
    tags,
    createdAt: createdAt.toISOString(),
  };
}

const feedbacks: Feedback[] = [];
for (let i = 0; i < 150; i++) {
  feedbacks.push(generateFeedback(i));
}

// Sort by createdAt
feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const outputPath = path.join(__dirname, 'mock-data.json');
fs.writeFileSync(outputPath, JSON.stringify(feedbacks, null, 2), 'utf-8');
console.log(`Generated ${feedbacks.length} feedback records -> ${outputPath}`);

// Print distribution summary
const sentimentCounts = feedbacks.reduce((acc, f) => {
  acc[f.sentiment] = (acc[f.sentiment] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.log('Sentiment distribution:', sentimentCounts);

const cityCounts = feedbacks.reduce((acc, f) => {
  acc[f.city] = (acc[f.city] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
console.log('City distribution:', cityCounts);
