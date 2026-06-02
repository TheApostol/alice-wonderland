// api/narrative.js — Vercel Serverless Function
// Proxies requests to Anthropic API, keeping the key server-side

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers — tighten origin in production if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { zone, action } = req.body;

  if (!zone) {
    return res.status(400).json({ error: 'Missing zone parameter' });
  }

  const zoneDescriptions = {
    rabbit_hole: 'a spiraling dark vortex with clocks frozen mid-fall, gothic Victorian architecture dissolving into blackness',
    garden:      'a twisted garden of oversized dead roses painted red, crooked doorways, and trees with melancholy faces',
    tea_party:   'a chaotic eternal tea party with towers of mismatched teacups, a long warped table under dead moonlight',
    forest:      'a dark mushroom forest with bioluminescent fungi, the air thick with blue smoke, reality bending at edges',
    queens_court:'a blood-red court of playing card soldiers, severed heads as decorations, a throne of bones'
  };

  const characters = {
    rabbit_hole: 'The White Rabbit',
    garden:      'The Cheshire Cat',
    tea_party:   'The Mad Hatter',
    forest:      'The Caterpillar',
    queens_court:'The Red Queen'
  };

  const character = characters[zone] || 'The White Rabbit';
  const description = zoneDescriptions[zone] || zoneDescriptions.rabbit_hole;

  const prompt = `You are ${character} from Tim Burton's dark, gothic Alice in Wonderland (2010 film aesthetic — not the cartoon). 
Alice has just ${action === 'arrive' ? 'entered' : 'explored'} the zone: ${description}.
Speak ONE short, unsettling, poetic line (max 25 words) in character. 
Be darkly whimsical, slightly menacing, philosophically absurd. Tim Burton tone — not cheerful.
No quotes around the response. Just the line itself.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        system: "You are a character from Tim Burton's Alice in Wonderland. Respond with ONE line only — dark, poetic, unsettling, brief.",
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(500).json({ error: 'API call failed', line: getFallback(zone) });
    }

    const data = await response.json();
    const line = data.content?.[0]?.text || getFallback(zone);
    return res.status(200).json({ line, character });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: error.message, line: getFallback(zone) });
  }
}

function getFallback(zone) {
  const fallbacks = {
    rabbit_hole: "Time doesn't fall here... it crumbles.",
    garden:      "We're all mad here. You simply haven't realized it yet.",
    tea_party:   "The tea is cold. The day is wrong. Sit down anyway.",
    forest:      "The smoke reveals what your eyes refuse to see.",
    queens_court:"Every head that questions me finds itself... repositioned."
  };
  return fallbacks[zone] || "Nothing here is what it seems. Nothing ever was.";
}
