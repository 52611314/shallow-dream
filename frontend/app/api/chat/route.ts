export async function POST(req: Request) {
  const body = await req.json()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  // 透传 SSE 流式响应
  return new Response(res.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
