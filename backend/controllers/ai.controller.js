const { OpenAI } = require("openai");
const fs = require("fs");
const { Weaknesses, Subjects, Users } = require("../models");

// The user stored the key as OPEN_AI_KEY in their .env
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY, 
});

exports.processVoiceTutor = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const { history, userId, persona } = req.body;
    let conversationHistory = [];
    if (history) {
      try {
        conversationHistory = JSON.parse(history);
      } catch (e) {
        console.error("Failed to parse history:", e);
      }
    }

    // 1. Fetch User and Weaknesses for "Emotional Intelligence"
    let studentContext = "";
    if (userId) {
      const user = await Users.findByPk(userId);
      const weaknesses = await Weaknesses.findAll({
        where: { userId },
        include: [{ model: Subjects, as: 'subject', attributes: ['name'] }],
        limit: 3,
        order: [['score', 'ASC']]
      });

      if (weaknesses.length > 0) {
        studentContext = `Context: The student is currently struggling with: ${weaknesses.map(w => `${w.topic} in ${w.subject?.name}`).join(", ")}. `;
        studentContext += `If they ask about these topics, be extra patient, notice their effort, and offer to break it down even more. `;
      }
    }

    // 2. Transcribe audio using whisper-1
    const audioStream = fs.createReadStream(req.file.path);
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
    });
    
    const studentText = transcription.text;

    // 3. Get AI Response using gpt-4o-mini (latest, fast, cost-effective)
    const systemPrompt = `You are 'Oga StudyAI', an expert and deeply supportive Nigerian high school tutor specializing in WAEC, JAMB, and NECO. 
Your tone is warm, professional yet relatable (using occasional light Nigerian English or phrases like 'No shaking' or 'You've got this' to build rapport). 
Keep your answers deeply educational, clear, and concise for audio delivery. 
Break down complex topics into simple, relatable examples from Nigerian life.

${studentContext}

${persona ? `PERSONA ADAPTATION: ${persona}` : ""}

CRITICAL: Notice if the student is repeating mistakes or sounding frustrated. If they scored low historically (based on context), say things like "I noticed you've been working hard on Osmosis, let's look at it from a different angle."
Always end with a follow-up question to check understanding.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: studentText }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 300,
    });

    const aiText = completion.choices[0].message.content;

    // 4. Generate Speech (TTS) using tts-1
    const ttsResponse = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: aiText,
    });

    const buffer = Buffer.from(await ttsResponse.arrayBuffer());
    const audioBase64 = buffer.toString("base64");

    // Clean up temporary audio upload
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      studentText,
      aiText,
      audioBase64
    });

  } catch (error) {
    console.error("AI Tutor Error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
       fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to process voice tutor. Please check OpenAI API permissions or balances." });
  }
};

exports.processImageTutor = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const { question } = req.body;
    const promptText = question || "Can you please explain this image clearly for a high school student?";

    const base64Image = fs.readFileSync(req.file.path).toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert, friendly Nigerian high school tutor for WAEC and JAMB. Keep your answers clear, encouraging, and deeply educational.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const aiText = completion.choices[0].message.content;

    // Clean up temporary image upload
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.json({
      success: true,
      aiText,
    });

  } catch (error) {
    console.error("AI Image Tutor Error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
       fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to process image tutor." });
  }
};

exports.processTextTutor = async (req, res) => {
  try {
    const { message, history, persona } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const systemPrompt = `You are an expert, friendly Nigerian high school tutor for WAEC and JAMB. Keep your answers clear, encouraging, and deeply educational. ${persona ? `PERSONA ADAPTATION: ${persona}` : ""}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...(history || []),
        { role: "user", content: message },
      ],
      max_tokens: 300,
    });

    const aiText = completion.choices[0].message.content;

    res.json({
      success: true,
      aiText,
    });

  } catch (error) {
    console.error("AI Text Tutor Error:", error);
    res.status(500).json({ error: "Failed to process text tutor." });
  }
};
