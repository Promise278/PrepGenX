const { StudyPlan, Users, Subjects } = require('../models');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY,
});

exports.generateStudyPlan = async (req, res) => {
  try {
    const { userId, diagnosticResults, examDate, subjects } = req.body;

    if (!userId || !diagnosticResults || !subjects) {
      return res.status(400).json({ error: "Missing required fields for study plan generation." });
    }

    // 1. Analyze diagnostic results to identify weak spots
    // Format for AI: [{ subject: 'Math', score: 40, topics: ['Algebra', 'Geometry'] }, ...]
    
    const prompt = `You are an expert academic counselor for Nigerian students preparing for JAMB/WAEC.
Based on these diagnostic test results: ${JSON.stringify(diagnosticResults)}.
Exam Date: ${examDate || 'in 6 weeks'}.
Generate a highly personalized 4-week study plan.
Format the output strictly as a JSON object with this structure:
{
  "summary": "Focus area and general advice...",
  "weeklyPlans": [
    {
      "week": 1,
      "focus": "...",
      "dailyTasks": [
        { "day": 1, "task": "Study topic X", "practice": "JAMB 2018 questions" },
        ...up to day 7
      ]
    },
    ...up to week 4
  ]
}
Ensure the plan prioritizes subjects where the student scored below 50%.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" }
    });

    const planData = JSON.parse(completion.choices[0].message.content);

    // 2. Save/Update StudyPlan in DB
    let studyPlan = await StudyPlan.findOne({ where: { userId, status: 'active' } });

    if (studyPlan) {
      studyPlan.planData = planData;
      studyPlan.startDate = new Date();
      await studyPlan.save();
    } else {
      studyPlan = await StudyPlan.create({
        userId,
        planData,
        startDate: new Date(),
        status: 'active'
      });
    }

    res.json({
      success: true,
      message: "Personalized study plan generated successfully.",
      studyPlan
    });

  } catch (error) {
    console.error("Generate Study Plan Error:", error);
    res.status(500).json({ error: "Failed to generate study plan." });
  }
};

exports.getStudyPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const studyPlan = await StudyPlan.findOne({ 
      where: { userId, status: 'active' },
      order: [['createdAt', 'DESC']]
    });

    if (!studyPlan) {
      return res.status(404).json({ error: "No active study plan found. Please take a diagnostic test." });
    }

    res.json({ success: true, studyPlan });
  } catch (error) {
    console.error("Get Study Plan Error:", error);
    res.status(500).json({ error: "Failed to fetch study plan." });
  }
};
