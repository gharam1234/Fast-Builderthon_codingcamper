import http from 'node:http';
import { createClient } from '@supabase/supabase-js';

const port = Number(process.env.PORT || 8080);
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const nimApiKey = process.env.NIM_API_KEY || '';
const nimBaseUrl = (process.env.NIM_BASE_URL || 'https://api.nim.nvidia.com').replace(/\/$/, '');
const nimModel = process.env.NIM_MODEL || 'meta/llama-3.1-8b-instruct';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
}

if (!nimApiKey) {
  console.warn('NIM_API_KEY가 설정되지 않았습니다.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const sendJson = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, authorization',
  });
  res.end(JSON.stringify(payload));
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString('utf-8');
  return body ? JSON.parse(body) : {};
};

const buildSummary = async (sessionId) => {
  const { data: session, error: sessionError } = await supabase
    .from('debate_sessions')
    .select('id, topic, lecture_title, user_id')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error('세션을 찾을 수 없습니다.');
  }

  const { data: messages, error: messageError } = await supabase
    .from('debate_messages')
    .select('sender, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (messageError) {
    throw messageError;
  }

  const transcript = (messages || [])
    .map((msg) => `${msg.sender}: ${msg.content}`)
    .join('\n');

  if (!transcript) {
    throw new Error('요약할 메시지가 없습니다.');
  }

  const systemPrompt = [
    '너는 토론을 요약하는 AI다.',
    '출력은 한국어로 간결하고 구조화된 요약이어야 한다.',
    '형식: 핵심 주장(2~4줄), 근거/반박 요약(불릿), 결론/다음 액션(1줄).',
  ].join('\n');

  const userPrompt = [
    `토론 주제: ${session.topic ?? session.lecture_title ?? '자유 토론'}`,
    '토론 기록:',
    transcript,
  ].join('\n');

  const nimResponse = await fetch(`${nimBaseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${nimApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: nimModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!nimResponse.ok) {
    const errorText = await nimResponse.text();
    throw new Error(`NIM 요청 실패: ${nimResponse.status} ${errorText}`);
  }

  const nimJson = await nimResponse.json();
  const summary = nimJson?.choices?.[0]?.message?.content?.trim() || '';

  if (!summary) {
    throw new Error('NIM 응답에서 요약을 찾을 수 없습니다.');
  }

  await supabase
    .from('debate_sessions')
    .update({
      summary,
      summary_created_at: new Date().toISOString(),
      summary_model: nimModel,
    })
    .eq('id', sessionId);

  return summary;
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'content-type, authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    });
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/summarize') {
    try {
      const body = await readBody(req);
      const sessionId = body?.session_id;
      if (!sessionId) {
        sendJson(res, 400, { error: 'session_id는 필수입니다.' });
        return;
      }

      const summary = await buildSummary(sessionId);
      sendJson(res, 200, { summary });
    } catch (error) {
      sendJson(res, 500, { error: error.message });
    }
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`NIM summary server running on port ${port}`);
});
