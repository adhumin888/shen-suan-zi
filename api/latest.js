// Vercel Serverless Function - 服务端抓取开奖数据，解决CORS问题
const KJ_URL = 'https://axavdfvfb.poodco.com:22447/kj/his/am.html';

function parseKJHtml(text) {
  const lines = text.replace(/<[^>]+>/g, ' ').split(/\s+/).map(s => s.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(\d{3,4})期\(开奖时间:(\d{4}-\d{2}-\d{2})\)$/);
    if (m) {
      const nums = [];
      for (let j = i + 1; j < lines.length && nums.length < 7; j++) {
        if (/^\d{1,2}$/.test(lines[j])) nums.push(parseInt(lines[j]));
      }
      if (nums.length === 7) {
        const specialNum = nums[6];
        const dateStr = m[2];
        const mo = dateStr.match(/\d{4}-(\d{2})-(\d{2})/);
        const dateShort = mo ? `${parseInt(mo[1])}.${parseInt(mo[2])}` : dateStr;
        return { success: true, period: m[1], date: dateStr, dateShort, specialNum };
      }
    }
  }
  return { success: false, error: '未找到开奖记录' };
}

export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(KJ_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(200).json({ success: false, error: `HTTP ${response.status}` });
    }

    const html = await response.text();
    const result = parseKJHtml(html);
    
    return res.status(200).json(result);
  } catch (e) {
    return res.status(200).json({ success: false, error: e.message });
  }
}
