export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey, prompt } = req.body;

  if (!apiKey || !prompt) {
    return res.status(400).json({ error: 'Missing API key or prompt' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data);
      const errorMessage = data.error?.message || JSON.stringify(data);
      return res.status(response.status).json({
        error: `API Error: ${errorMessage}`
      });
    }

    if (!data.content || !data.content[0]) {
      return res.status(500).json({
        error: 'Invalid response format from Claude API'
      });
    }

    return res.status(200).json({
      content: data.content[0].text
    });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      error: `Server Error: ${error.message}`
    });
  }
}
