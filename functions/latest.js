// Cloudflare Pages Function - 获取最新开奖数据
export async function onRequest(context) {
  const { request } = context;
  
  // 只允许 GET 请求
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const KJ_URL = 'https://axavdfvfb.poodco.com:22447/kj/his/am.html';
  
  try {
    // 使用 Cloudflare 的 fetch（无 CORS 限制）
    const response = await fetch(KJ_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      cf: {
        // 尝试绕过缓存
        cacheTtl: 0
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // 解析 HTML 提取开奖数据
    const result = parseKJHtml(html);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 解析开奖 HTML
function parseKJHtml(html) {
  try {
    // 提取期号、日期、号码
    // 格式: 20250401 2025-04-01 01,12,23,34,45,46+47
    const regex = /(\d{8})\s+(\d{4}-\d{2}-\d{2})\s+([\d,\+]+)/g;
    const matches = [...html.matchAll(regex)];
    
    if (matches.length === 0) {
      return { success: false, error: 'No data found' };
    }

    // 取第一条（最新）
    const match = matches[0];
    const dateShort = match[1];      // 20250401
    const date = match[2];           // 2025-04-01
    const numsStr = match[3];        // 01,12,23,34,45,46+47
    
    // 解析号码
    const parts = numsStr.split('+');
    const normalNums = parts[0].split(',').map(n => parseInt(n, 10));
    const specialNum = parts[1] ? parseInt(parts[1], 10) : normalNums[normalNums.length - 1];
    
    // 根据号码计算生肖（使用2025年偏移量=3）
    const zodiac = getZodiacByNumber(specialNum, 3);
    
    return {
      success: true,
      dateShort,
      date,
      specialNum,
      zodiac,
      allNumbers: [...normalNums, specialNum]
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// 根据号码和年份偏移量获取生肖
function getZodiacByNumber(num, yearOffset) {
  // GROUPS 基准数组（TB，offset=0）
  const GROUPS = [
    [3,15,27,39],      // 鼠
    [2,14,26,38],      // 牛
    [1,13,25,37,49],   // 虎
    [12,24,36,48],     // 兔
    [11,23,35,47],     // 龙
    [10,22,34,46],     // 蛇
    [9,21,33,45],      // 马
    [8,20,32,44],      // 羊
    [7,19,31,43],      // 猴
    [6,18,30,42],      // 鸡
    [5,17,29,41],      // 狗
    [4,16,28,40]       // 猪
  ];
  
  const ZODIAC_NAMES = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  
  // 找到号码在 GROUPS 中的位置
  for (let i = 0; i < GROUPS.length; i++) {
    if (GROUPS[i].includes(num)) {
      // 应用年份偏移量
      const adjustedIndex = (i + yearOffset) % 12;
      return ZODIAC_NAMES[adjustedIndex];
    }
  }
  
  return '?';
}
