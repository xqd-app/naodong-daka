import type { Cluster, MarketIntel } from '../types/lab'

export const CLUSTERS: Cluster[] = [
  {
    id: 'inspiration',
    name: '灵感资产管理',
    short: '灵感',
    color: '#00e5ff',
    keywords: ['灵感', '点子', '脑洞', '创意', '记录', '笔记', '碎片', '想法', '存', '素材'],
    demand: '点子不浪费、可复利',
    market: '笔记 / 知识管理、AI 创作工具',
    traits: { market: 4, difficulty: 4, fit: 5, monetize: 4, risk: 5 },
    swot: {
      s: '与现有项目代码同源，MVP 成本极低；机制有记忆点，适合传播',
      w: '新概念需要教育用户；AI 产出质量决定口碑；冷启动无内容生态',
      o: '笔记软件 AI 化趋势明确；创作者经济持续扩张',
      t: '大厂笔记产品可直接跟进同类功能；AI 生成同质化严重',
    },
  },
  {
    id: 'habit',
    name: '行为博弈化自律',
    short: '自律',
    color: '#39ff14',
    keywords: ['习惯', '打卡', '拖延', '自律', '坚持', '专注', '番茄', '目标', '早起', '计划'],
    demand: '靠损失厌恶推动行动',
    market: '习惯追踪、自律 / 效率工具',
    traits: { market: 3, difficulty: 5, fit: 4, monetize: 3, risk: 1 },
    swot: {
      s: '机制直观、上手快；对抗拖延的刚需真实存在',
      w: '付费意愿弱；「筹码 / 赌注」结构易触碰博彩与未成年人红线',
      o: '自律类内容在社交平台持续热门，易获自然流量',
      t: '监管对赌博化玩法敏感；同类工具极多、留存普遍偏低',
    },
  },
  {
    id: 'emotion',
    name: '自我叙事与情绪可视化',
    short: '情绪',
    color: '#ff2d95',
    keywords: ['情绪', '心情', '治愈', '解压', '焦虑', '陪伴', '孤独', '压力', '雨', '天气', '日记'],
    demand: '看见自己的轨迹、被理解',
    market: '情绪经济、情绪记录与疗愈',
    traits: { market: 5, difficulty: 3, fit: 3, monetize: 4, risk: 2 },
    swot: {
      s: '需求真实且高频；可视化天然适合分享传播',
      w: '情绪数据属敏感个人信息，合规成本高；赛道已相当拥挤',
      o: '情绪经济大盘持续扩张，政策明确支持体验式情绪消费',
      t: '大厂健康生态挤压；同质化「安慰剂」产品大量出现',
    },
  },
  {
    id: 'surprise',
    name: '惊喜消费与随机机制',
    short: '惊喜',
    color: '#fff720',
    keywords: ['盲盒', '随机', '惊喜', '抽', '礼物', '订阅', '零食', '外卖', '午餐', '神秘'],
    demand: '新鲜感与即时愉悦',
    market: '盲盒 / 情绪消费、订阅零售',
    traits: { market: 4, difficulty: 2, fit: 3, monetize: 5, risk: 2 },
    swot: {
      s: '变现路径最短，付费意愿最强',
      w: '重供应链与线下履约，纯软件难做；涉及未成年人保护',
      o: '情绪消费大盘万亿级，悦己逻辑成熟',
      t: '盲盒赛道已过高速增长期，复购率下滑、监管趋严',
    },
  },
  {
    id: 'social',
    name: '社交连接与流转',
    short: '社交',
    color: '#bc13fe',
    keywords: ['社交', '朋友', '交换', '分享', '社区', '陌生人', '匹配', '搭子', '当铺', '交易'],
    demand: '被看见、互相交换价值',
    market: '陪伴经济、兴趣社区',
    traits: { market: 4, difficulty: 3, fit: 4, monetize: 3, risk: 3 },
    swot: {
      s: '网络效应一旦建立即为护城河',
      w: '冷启动极难，早期缺少双边供给',
      o: '陪伴 / 搭子类需求已形成数百亿市场',
      t: '社区运营成本高，易陷入低活跃「空城」',
    },
  },
  {
    id: 'hardware',
    name: '智能硬件与线下体验',
    short: '硬件',
    color: '#ff9f1a',
    keywords: ['硬件', '设备', '传感', '机器', '气味', '声音', '线下', '实体', '闹钟', '冰箱', '直播'],
    demand: '把情绪关怀落到物理场景',
    market: 'AI 陪伴硬件、线下体验消费',
    traits: { market: 5, difficulty: 1, fit: 1, monetize: 4, risk: 4 },
    swot: {
      s: '客单价高、想象空间大，资本关注度高',
      w: '需供应链、模具与量产能力，与现有技术栈完全不匹配',
      o: '陪伴机器人市场高速扩容，端侧 AI 落地窗口期',
      t: '硬件毛利与售后压力大；迭代周期长、试错成本高',
    },
  },
]

export const MARKET_INTEL: MarketIntel[] = [
  {
    clusterId: 'inspiration',
    headline: '中国笔记管理软件市场',
    figures: [
      '2025 年规模 128.6 亿元，同比增长 19.3%',
      '2026 年预计扩大至 153.4 亿元',
      '笔记类 App 月活约 2.47 亿；头部产品付费转化率 12.6%',
      '全球笔记 App 市场 2025 年约 68 亿美元，2035 年预计 285 亿美元',
    ],
    tam: 153.4,
    sources: [
      {
        label: '2026年中国笔记管理软件行业市场现状调查（博研咨询，二手引用）',
        url: 'https://www.docin.com/touch_new/preview_new.do?id=4981837737',
      },
      {
        label: 'Note Taking App Market 2025-2035 – Emergen Research',
        url: 'https://www.emergenresearch.com/industry-report/note-taking-app-market',
      },
    ],
    query: '中国笔记管理软件 市场规模 付费转化率 2026',
  },
  {
    clusterId: 'habit',
    headline: '中国习惯追踪应用市场',
    figures: [
      '2025 年规模 14.36 亿元，同比增长 17.2%',
      '约 48% 用户 6 个月内流失，55% 因隐私顾虑放弃',
      '新上架产品中 60%+ 集成 AI 洞察、58% 含游戏化机制',
    ],
    tam: 14.36,
    sources: [
      {
        label: '2026年中国习惯追踪应用行业发展现状（博研咨询，二手引用）',
        url: 'https://www.docin.com/touch_new/preview_new.do?id=4980286987',
      },
      {
        label: 'Habit Tracking Apps Market – Business Research Insights',
        url: 'https://www.businessresearchinsights.com/jp/market-reports/habit-tracking-apps-market-109438',
      },
    ],
    query: '习惯追踪 App 市场规模 留存 流失率 2026',
  },
  {
    clusterId: 'emotion',
    headline: '中国情绪经济市场',
    figures: [
      '2025 年规模 2.72 万亿元，预计 2030 年达 5.12 万亿元',
      '近九成青年有为情绪价值付费经历，近四成为高频消费者',
      '超七成青年存在心理亚健康问题',
    ],
    tam: 27200,
    sources: [
      { label: '数说｜万亿情绪经济迭代 – 艾媒网', url: 'https://www.iimedia.cn/c1086/113468.html' },
      {
        label: '情绪消费新场景加速涌现 – 人民日报',
        url: 'http://paper.people.com.cn/rmrb/pc/content/202606/09/content_30161966.html',
      },
    ],
    query: '情绪经济 市场规模 2026 青年 情绪消费',
  },
  {
    clusterId: 'surprise',
    headline: '中国盲盒 / 惊喜消费市场',
    figures: [
      '2025 年盲盒市场规模约 580 亿元，占全球份额 65%',
      '近年年均复合增速约 28%',
      '赛道已进入存量竞争：复购率缓降、新品生命周期缩短',
    ],
    tam: 580,
    sources: [
      {
        label: '盲盒市场持续升温有秘诀 – 经济日报',
        url: 'http://www.ce.cn/xwzx/gnsz/gdxw/202604/t20260425_2927782.shtml',
      },
      {
        label: '2026年中产业观察｜潮玩传统赛道加速转型 – 新华网',
        url: 'https://www.news.cn/expo/20260710/9629b291999d4cbe946067f1230be956/c.html',
      },
    ],
    query: '盲盒 市场规模 2026 复购率 监管',
  },
  {
    clusterId: 'social',
    headline: '陪伴经济与兴趣社区',
    figures: [
      '陪伴类新型消费已形成规模超 500 亿元的市场',
      '中国陪伴机器人市场 2025 年约 900 亿元',
      '近九成青年为情绪价值付费，社交属性是重要驱动',
    ],
    tam: 500,
    sources: [
      {
        label: '从亲密关系到百亿生意 年轻人为何愿意为「陪伴」买单 – 中新网',
        url: 'https://www.chinanews.com.cn/sh/2026/04-14/10603259.shtml',
      },
    ],
    query: '陪伴经济 市场规模 2026 搭子 社交',
  },
  {
    clusterId: 'hardware',
    headline: 'AI 陪伴硬件市场',
    figures: [
      '陪伴机器人 2024 年约 796 亿元，2025 年约 900 亿元',
      '2026 年预计向 1100–1400 亿元区间迈进',
      'AI 玩具线上销售额 2025 上半年 8.5 亿元，同比增长 183.9%',
    ],
    tam: 900,
    sources: [
      {
        label: '启信宝行业报告：AI陪伴机器人崛起 – 新华报业网',
        url: 'https://www.xhby.net/content/s6a5ee4a4e4b04723d0fec4c3.html',
      },
      { label: 'AI陪伴硬件，开始比拼「言外之意」 – 界面新闻', url: 'https://www.jiemian.com/article/15151470.html' },
    ],
    query: 'AI 陪伴机器人 市场规模 2026 端侧 AI',
  },
]

export const PROJECT_NAMING = [
  {
    suffix: '银行',
    pitch: (a: string, b: string) => `把「${a}」做成可计息、可复利的资产账户，用「${b}」完成价值兑现`,
  },
  {
    suffix: '交易所',
    pitch: (a: string, b: string) => `让「${a}」在用户之间流转交易，用「${b}」做冷启动与信任机制`,
  },
  {
    suffix: '地图',
    pitch: (a: string, b: string) => `把「${a}」沉淀成可视化轨迹，由「${b}」提供长期回访理由`,
  },
  {
    suffix: '实验室',
    pitch: (a: string, b: string) => `用「${b}」的机制重构「${a}」，把一次性行为变成可积累的实验`,
  },
]

export const SAMPLE_IDEAS = [
  { title: '灵感银行', desc: '把随手冒出的碎片点子存进银行，按利率每月结算利息' },
  { title: '脑洞当铺', desc: '把半成品点子当掉换别人的点子，形成点子二手流转市场' },
  { title: '反拖延赌场', desc: '押虚拟筹码赌自己今天能完成计划，输了筹码折算成惩罚' },
  { title: '情绪条码', desc: '把每天的情绪打成一条可扫的条码，累积成个人情绪光谱' },
  { title: '盲盒午餐', desc: '每天随机分配一家餐厅，打卡解锁隐藏菜单' },
]
