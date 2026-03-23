const { OpenAI } = require("openai");
const fs = require("fs");

// The user stored the key as OPEN_AI_KEY in their .env
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY, 
});

exports.processVoiceTutor = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    // 1. Transcribe audio using gpt-4o-mini
    const audioStream = fs.createReadStream(req.file.path);
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "gpt-4o-mini",
    });
    
    const studentText = transcription.text;

    // 2. Get AI Response using gpt-oss-120b
    const completion = await openai.chat.completions.create({
      model: "gpt-oss-120b",
      messages: [
        { 
          role: "system", 
          content: "You are an expert, friendly Nigerian high school tutor for WAEC and JAMB. Keep your answers brief, encouraging, and deeply educational. Speak warmly, naturally, and concisely since this will be converted to audio."
        },
        { 
          role: "user", 
          content: studentText 
        }
      ],
      max_tokens: 300, // Keep responses fast and optimized for TTS
    });

    const aiText = completion.choices[0].message.content;

    // 3. Generate Speech (TTS)
    const mp3Response = await openai.audio.speech.create({
      model: "gpt-4o-mini",
      voice: "alloy",
      input: aiText,
    });

    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    const audioBase64 = buffer.toString("base64");

    // Clean up temporary audio upload from mobile device
    fs.unlinkSync(req.file.path);

    // Return the complete conversation bundle
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
