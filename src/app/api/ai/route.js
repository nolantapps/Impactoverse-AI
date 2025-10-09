import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use your OpenAI key
});

export async function GET(req) {
  try {
    // Grab query parameters
    const question = req.nextUrl.searchParams.get("question");
    const audience = req.nextUrl.searchParams.get("audience") || "adults";
    const knowledge = req.nextUrl.searchParams.get("knowledge") || "docs-only";
    const outOfScope = req.nextUrl.searchParams.get("outOfScope") || "say-idk";
    const responseStyle =
      req.nextUrl.searchParams.get("responseStyle") || "short";

    // Build dynamic system prompt
    let systemPrompt = "You are an AI mentor.\n";

    // Audience tone
    if (audience === "kids") {
      systemPrompt +=
        "Explain things in simple words like talking to a 10-year-old.\n";
    } else if (audience === "professionals") {
      systemPrompt += "Use professional, precise language.\n";
    } else {
      systemPrompt += "Speak casually and clearly for a general audience.\n";
    }

    // Knowledge restriction
    if (knowledge === "docs-only") {
      systemPrompt +=
        "Only answer using the uploaded documents. If not in documents, say 'I dont know.'\n";
    } else if (knowledge === "docs-first") {
      systemPrompt +=
        "Prefer the uploaded documents, but if needed you can use general knowledge.\n";
    } else {
      systemPrompt += "You may use general knowledge freely.\n";
    }

    // Out of scope handling
    if (outOfScope === "say-idk") {
      systemPrompt +=
        "If asked something outside the allowed content, respond with: 'I dont know.'\n";
    } else if (outOfScope === "redirect") {
      systemPrompt +=
        "If asked something outside, respond with: 'This document doesnt cover that.'\n";
    } else {
      systemPrompt += "Try to answer even if the content is outside.\n";
    }

    // Response style
    if (responseStyle === "short") {
      systemPrompt += "Keep answers short and clear.\n";
    } else if (responseStyle === "detailed") {
      systemPrompt += "Give detailed explanations with examples.\n";
    } else if (responseStyle === "step-by-step") {
      systemPrompt += "Explain things step by step in an easy-to-follow way.\n";
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or gpt-4o / gpt-3.5-turbo
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    });

    const responseMessage = completion.choices[0].message.content;
    return Response.json({ message: responseMessage });
  } catch (error) {
    console.error("Error calling API", error);
    return Response.json(
      { error: "Failed to fetch response" },
      { status: 500 }
    );
  }
}
