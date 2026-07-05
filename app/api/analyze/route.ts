import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const PROMPT = `You are a motion design tutor teaching someone to recreate this animation specifically in Jitter (the web-based motion tool, also directly applicable to Figma Motion, which uses the same model). Watch this video frame by frame and reverse-engineer every distinct motion event into Jitter's own animation model — NOT a generic keyframe timeline like After Effects.

Never reference or mention After Effects, Premiere, Rive, Blender, CSS, Framer Motion, GSAP, or any other animation tool — only describe what's achievable in Jitter's own model. If an effect can't be faithfully reproduced in Jitter, say so explicitly in the notes field rather than approximating silently.

Jitter works like this: each animation is applied to a layer as an instruction (e.g. Slide in, Fade out, Scale up, or a fully Custom animation), with an Initial Value, a To Value, a Duration, and an Easing (either a named preset like ease-out/ease-in-out/linear/slow-down/spring, or a custom cubic-bezier curve if the motion looks hand-tuned). Jitter only animates these properties: position (X/Y), size, rotation, scale, opacity, corner radius, shadow, stroke, blur, gradient, and shape/path morph. If something in the video doesn't map to one of these, note it in "notes" rather than inventing a property that doesn't exist in Jitter.

Before filling in any properties, mentally walk through the video's timeline for each element from start to end, identifying every distinct visual change in the order it happens. Then convert that timeline into steps.

If a single element undergoes multiple distinct phases of motion in sequence (e.g. it rotates, then separately scales, then separately fades out), treat each phase as its own separate step with its own clipTimestamp — do not merge sequential motions into one step. Only combine properties into the same step's "properties" array when they change simultaneously, at the same time, as one motion event.

A single Jitter animation can change multiple properties at once. If more than one property changes in the same motion event (e.g. both scale and position moving together), list ALL changed properties as separate entries, each with its own initial value and to value. Never collapse multiple properties into one field, and never omit a starting value for any property — every property must have both an initial and a to value stated explicitly.

For each motion event, identify:
- Element: what layer moves (e.g. "headline text", "logo", "card 2")
- Animation type: is this an "In" animation (appearing), an "Out" animation (disappearing), or a mid-scene "Custom" animation? Use Jitter's own category names.
- Properties: an array of every property that changes in this motion event. For each one, specify: the property name (position X, position Y, size, rotation, scale, opacity, corner radius, shadow, stroke, blur, gradient, or morph — only from Jitter's actual supported list), its initial value, and its to value. Most motion events only touch 1-2 properties, but include every one that visibly changes.
- Duration: in milliseconds or seconds, matching how Jitter displays it
- Easing: match to the closest Jitter preset name if possible (ease-in, ease-out, ease-in-out, linear, slow down, spring/bounce) — if the curve looks custom/non-standard, say "custom cubic-bezier, approx (x1,y1,x2,y2)"
- Delay/stagger: how long after the previous element's animation this one starts, since Jitter staggers are set as simple start-time offsets
- Clip timestamp: the absolute start time of this motion event in the source video (e.g. "0:00.4"), independent of the Jitter-relative duration/delay fields above — this is when it actually happens in the clip, not a stagger offset
- Confidence: rate your confidence in this step's accuracy from 0-100. Use 80-90 only for simple, clearly-observed motion like straightforward slides/fades/scales. Use 60-75 for pixel or value estimates that look plausible but can't be verified exactly. Use below 50 for anything ambiguous, fast, obscured, or unusual. Do not use 90 or above unless the motion is unmistakably simple and clearly visible — most real-world estimates should land in the 60-85 range.
- Notes: only if something doesn't map cleanly to Jitter's property list (e.g. complex 3D, particles) — otherwise leave empty

Write the instruction field using exactly this template, filling in the brackets and repeating the property line for each property that changes:
"Select [element]. In the Animate tab, click New Animation, choose [In/Out/Custom]. For [Property 1], set Initial Value to [X], To Value to [Y]. For [Property 2] (if any), set Initial Value to [X], To Value to [Y]. Set Duration to [Z]. Set Easing to [easing]."
Do not paraphrase or make this sound more natural — follow the template structure exactly, listing every changed property as its own sentence within the instruction.

Respond ONLY with valid JSON, no other text, no markdown formatting, no code fences. Use exactly this structure:
{
  "steps": [
    {
      "step": 1,
      "title": "Short title, e.g. 'Fade and slide in the headline'",
      "element": "what moves",
      "animationType": "In | Out | Custom",
      "properties": [
        {
          "property": "position X | position Y | size | rotation | scale | opacity | corner radius | shadow | stroke | blur | gradient | morph",
          "initialValue": "e.g. '100%' or '800px'",
          "toValue": "e.g. '20%' or '950px'"
        }
      ],
      "duration": "e.g. '300ms'",
      "easing": "e.g. 'ease-out' or 'custom cubic-bezier (.22,1,.36,1)'",
      "delay": "e.g. '50ms after previous element' or 'none'",
      "clipTimestamp": "e.g. '0:00.4' — absolute start time in the source video",
      "confidence": "number 0-100, e.g. 78",
      "notes": "empty string unless something doesn't map to Jitter's supported properties",
      "instruction": "Step written using the strict template above, with one sentence per property"
    }
  ]
}

Be precise with values — estimate confidently rather than being vague. Only use property names from Jitter's actual supported list. Include every property in the "properties" array that visibly changes in that motion event — do not pick just one if multiple properties move together. Keep sequential motions on the same element as separate steps, in the order they occur.`;

function stripCodeFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data with a video file or youtubeUrl." },
      { status: 400 }
    );
  }

  const video = formData.get("video");
  const youtubeUrl = formData.get("youtubeUrl");

  const hasVideo = video instanceof File && video.size > 0;
  const hasYoutubeUrl = typeof youtubeUrl === "string" && youtubeUrl.trim().length > 0;

  if (!hasVideo && !hasYoutubeUrl) {
    return NextResponse.json(
      { error: "Provide either a video file or a youtubeUrl." },
      { status: 400 }
    );
  }

  const mediaPart = hasVideo
    ? await (async () => {
        const file = video as File;
        const buffer = Buffer.from(await file.arrayBuffer());
        return {
          inline_data: {
            mime_type: file.type || "video/mp4",
            data: buffer.toString("base64"),
          },
        };
      })()
    : {
        file_data: {
          file_uri: (youtubeUrl as string).trim(),
        },
      };

  const requestBody = JSON.stringify({
    contents: [
      {
        parts: [mediaPart, { text: PROMPT }],
      },
    ],
  });

  const RETRY_DELAYS_MS = [2000, 5000];
  let geminiResponse: Response | undefined;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      geminiResponse = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
      });
    } catch (err) {
      console.error("Gemini fetch failed:", err);
      const detail = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: `Failed to reach the Gemini API (${detail}).` },
        { status: 502 }
      );
    }

    if (geminiResponse.status !== 503 || attempt === RETRY_DELAYS_MS.length) {
      break;
    }
    console.warn(
      `Gemini overloaded (503), retrying in ${RETRY_DELAYS_MS[attempt]}ms (attempt ${attempt + 1}/${RETRY_DELAYS_MS.length})`
    );
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
  }

  if (!geminiResponse) {
    return NextResponse.json(
      { error: "Failed to reach the Gemini API." },
      { status: 502 }
    );
  }

  if (!geminiResponse.ok) {
    let message = `Gemini API request failed with status ${geminiResponse.status}.`;
    try {
      const errorBody = await geminiResponse.json();
      message = errorBody?.error?.message || message;
    } catch {
      // ignore body parse failure, fall back to the generic message
    }
    return NextResponse.json({ error: message }, { status: geminiResponse.status });
  }

  const data = await geminiResponse.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return NextResponse.json(
      { error: "Gemini returned no content for this clip." },
      { status: 502 }
    );
  }

  const cleaned = stripCodeFences(text);

  try {
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ steps: parsed.steps ?? [] });
  } catch {
    return NextResponse.json({ steps: [], raw: text });
  }
}
