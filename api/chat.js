const KNOWLEDGE_BASE_ZH = `
公司：深圳市备影科技传媒管理有限公司（Backup Tech and Media Management Limited）。
定位：人工智能影像科技与媒体管理应用公司，起源香港，整合香港媒体制作经验与深圳AI技术资源。
服务：数字影像档案管理、AI影像处理、AI视频应用、图像与视频AI开发、媒体行业AI整合。
AI解决方案：AI媒体工作流程、AI影像资产系统、AI内容生成、AI媒体分析。
管理层：CEO 邱伟航 Tarrison Yau；COO 郭镇华 Billy Kwok。
目标客户：媒体制作公司、广告机构、影视团队、数字创作者、AI技术伙伴。
`;

const KNOWLEDGE_BASE_EN = `
Company: Backup Tech and Media Management Limited.
Positioning: AI visual media technology and media management applications, combining Hong Kong production expertise with Shenzhen AI resources.
Services: Digital media asset management, AI image processing, AI video applications, AI development for visual media, and AI integration for media industry.
AI Solutions: AI media workflow, AI media asset intelligence, AI content generation, AI media analysis.
Management: CEO Tarrison Yau; COO Billy Kwok.
Target users: Media production companies, advertising agencies, film studios, digital creators, and AI technology partners.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY on server.' });

  try {
    const { history = [], input = '', mode = 'chat', lang = 'zh' } = req.body || {};
    if (!input || typeof input !== 'string') return res.status(400).json({ error: 'Missing input.' });

    const isEn = lang === 'en';
    const systemPrompt = mode === 'summary'
      ? (isEn
        ? 'You are a business assistant for Backup Tech. Summarize the conversation with: client needs, interested services, budget/timeline (Not provided if missing), and recommended next steps. Output concise English.'
        : '你是备影科技商务助理。请把用户咨询对话整理成简洁可执行摘要，必须包含：客户需求、关注服务、预算/时间（如无写未提供）、建议下一步。输出简体中文。')
      : (isEn
        ? `You are the Backup Tech website assistant. Prioritize this knowledge base and do not fabricate:\n${KNOWLEDGE_BASE_EN}\nRespond mainly in English. If users ask for cooperation, guide them to submit the contact form.`
        : `你是备影科技网站AI助手。优先依据以下知识库回答，不要编造：\n${KNOWLEDGE_BASE_ZH}\n回答语言：简体中文为主。若用户询问合作，提醒填写联系表单。`);

    const messages = [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: input }];

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, temperature: 0.3, messages })
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) return res.status(openaiRes.status).json({ error: data?.error?.message || 'OpenAI request failed.' });

    return res.status(200).json({ output: data?.choices?.[0]?.message?.content || '' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error.' });
  }
}
