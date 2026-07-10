import type { NatureTip } from "@/lib/query/mockData";

const TIP_TOPICS = [
  "identifying common backyard birds by song or plumage",
  "what birds eat in different seasons",
  "safe plants and native flowers that help birds",
  "how to keep cats and windows safer for birds",
  "reading bird behavior (alarm calls, flocking, bathing)",
  "migratory timing and when visitors change",
  "helping fledglings without intervening too much",
  "weather and how birds cope with heat, rain, or cold",
  "insects, spiders, and why a “messy” yard helps birds",
  "quiet watching etiquette so birds stay calm",
  "feathers, molting, and what a scruffy bird means",
  "bird baths, mud puddles, and clean water habits",
  "predators, hawks, and how songbirds stay alert",
  "seed types and which birds prefer which foods",
  "dawn chorus and why mornings sound so busy",
] as const;

const FALLBACK_TIPS: NatureTip[] = [
  {
    id: "tip-fallback-1",
    title: "Tip of the Day",
    body: "If a fledgling is fluffy and hopping, leave it be — parents are usually nearby.",
  },
  {
    id: "tip-fallback-2",
    title: "Tip of the Day",
    body: "A sticky silhouette on big windows cuts collisions more than any feeder tweak.",
  },
  {
    id: "tip-fallback-3",
    title: "Tip of the Day",
    body: "Black-oil sunflower seed feeds the widest mix of backyard birds year-round.",
  },
  {
    id: "tip-fallback-4",
    title: "Tip of the Day",
    body: "Listen for a sharp “chip” — many songbirds use it as a quiet alarm call.",
  },
  {
    id: "tip-fallback-5",
    title: "Tip of the Day",
    body: "Native berry shrubs beat ornamental plants for late-summer fuel stops.",
  },
  {
    id: "tip-fallback-6",
    title: "Tip of the Day",
    body: "Change bird-bath water every day or two so mosquitoes never settle in.",
  },
];

function fallbackTip(): NatureTip {
  const tip = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
  return {
    ...tip,
    id: `tip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
}

function pickTopic(): string {
  return TIP_TOPICS[Math.floor(Math.random() * TIP_TOPICS.length)];
}

function parseTipPayload(raw: string): NatureTip | null {
  try {
    const parsed = JSON.parse(raw) as { title?: string; body?: string };
    const title = parsed.title?.trim();
    const body = parsed.body?.trim();
    if (!title || !body) return null;
    return {
      id: `tip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.slice(0, 48),
      body: body.slice(0, 180),
    };
  } catch {
    return null;
  }
}

/**
 * Generate a fresh bird tip via OpenAI (or a local fallback).
 * Safe to call from Route Handlers and Server Components.
 */
export async function generateBirdTip(): Promise<NatureTip> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("[tip] OPENAI_API_KEY missing — using fallback tip");
    return fallbackTip();
  }

  const topic = pickTopic();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.95,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "You write Tip of the Day for Sara's Birdhouse, a peaceful backyard birdwatching app.",
              "Tone: warm, quiet, and clear — like a kind naturalist friend.",
              "Return JSON only with keys: title, body.",
              'title must be exactly "Tip of the Day".',
              "body: ONE short actionable tip (max 24 words).",
              "A good tip teaches something useful: what to do, what to notice, what to avoid, or a surprising bird fact people can use.",
              "Prefer concrete advice over poetic description.",
              "Do NOT write about arranging twigs, lining nests, placing water under/near a birdhouse, or watching birds build nests.",
              "Do NOT start with Observe/Watch/Consider/Notice unless the tip is a specific identification cue.",
              "Avoid repeating the words nest, birdhouse, and water unless the tip truly needs them.",
              "Vary species, seasons, food, safety, songs, and behavior.",
            ].join(" "),
          },
          {
            role: "user",
            content: `Write one practical tip about: ${topic}. Seed: ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("[tip] OpenAI error", response.status, await response.text());
      return fallbackTip();
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    return parseTipPayload(content) ?? fallbackTip();
  } catch (error) {
    console.error("[tip] OpenAI request failed", error);
    return fallbackTip();
  }
}
