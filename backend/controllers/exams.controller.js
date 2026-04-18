const { Exams, Questions, Subjects, Weaknesses, Users } = require("../models");

exports.getExams = async (req, res) => {
  try {
    const exams = await Exams.findAll({
      include: [{ model: Subjects, as: "subject", attributes: ["name"] }]
    });
    res.json({ success: true, exams });
  } catch (error) {
    console.error("Fetch Exams Error:", error);
    res.status(500).json({ error: "Failed to fetch exams." });
  }
};

exports.getExamQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const questions = await Questions.findAll({
      where: { examId: id },
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    res.json({ success: true, questions });
  } catch (error) {
    console.error("Fetch Questions Error:", error);
    res.status(500).json({ error: "Failed to fetch exam questions." });
  }
};

// Simplified mock seeding endpoint for the user to populate some simulated data
exports.seedExams = async (req, res) => {
  try {
    // Basic seeder if user wants a quick test
    let subject = await Subjects.findOne();
    if (!subject) {
      subject = await Subjects.create({ name: 'Mathematics', description: 'Core Mathematics' });
    }
    
    let exam = await Exams.findOne({ where: { subjectId: subject.id } });
    if (!exam) {
      exam = await Exams.create({ year: 2024, type: 'JAMB', subjectId: subject.id });
      
      await Questions.bulkCreate([
        { text: "What is 2 + 2?", optionA: "3", optionB: "4", optionC: "5", optionD: "6", correctOption: "B", examId: exam.id },
        { text: "Solve for x: 2x = 10", optionA: "5", optionB: "2", optionC: "10", optionD: "20", correctOption: "A", examId: exam.id },
        { text: "What is the square root of 64?", optionA: "6", optionB: "7", optionC: "8", optionD: "9", correctOption: "C", examId: exam.id }
      ]);
    }
    
    res.json({ success: true, message: "Exams seeded successfully with dummy questions." });
  } catch (error) {
    console.error("Seed Exam Error:", error);
    res.status(500).json({ error: "Failed to seed exams." });
  }
};

exports.generateMock = async (req, res) => {
  try {
    const { examType, subjects, totalQuestions } = req.body;
    
    // We will find the subjects, and fetch their questions
    const dbSubjects = await Subjects.findAll({
      where: { name: subjects }
    });

    if (!dbSubjects || dbSubjects.length === 0) {
       return res.status(404).json({ error: "No matching subjects found in DB for the selected ones." });
    }

    const subjectIds = dbSubjects.map(s => s.id);
    
    // Fetch exams that match those subjectIds
    const exams = await Exams.findAll({
      where: { subjectId: subjectIds }
    });
    
    const examIds = exams.map(e => e.id);
    
    const questions = await Questions.findAll({
      where: { examId: examIds },
      include: [{ model: Exams, as: 'exam', include: [{ model: Subjects, as: 'subject' }] }]
    });

    if (questions.length === 0) {
      return res.status(404).json({ error: "No questions available in the database for the selected subjects." });
    }

    // Shuffle and pick
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, totalQuestions || 50);

    const formattedQuestions = selected.map(q => {
      const options = [q.optionA, q.optionB, q.optionC, q.optionD];
      const correctIdx = ["A", "B", "C", "D"].indexOf(q.correctOption);
      return {
        id: q.id,
        subject: q.exam?.subject?.name || "General",
        question: q.text,
        options,
        correctIdx: correctIdx >= 0 ? correctIdx : 0,
        explanation: q.explanation || "This is the correct answer according to standard guidelines."
      };
    });

    res.json({ success: true, questions: formattedQuestions });

  } catch (error) {
    console.error("Generate Mock Error:", error);
    res.status(500).json({ error: "Failed to generate mock exam." });
  }
};
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subjects.findAll();
    res.json({ success: true, subjects });
  } catch (error) {
    console.error("Fetch Subjects Error:", error);
    res.status(500).json({ error: "Failed to fetch subjects." });
  }
};

exports.getExamStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.findByPk(userId);
    
    if (!user || !user.examDate) {
      return res.status(404).json({ error: "Exam date not set. Please update your profile." });
    }

    const today = new Date();
    const examDate = new Date(user.examDate);
    const diffTime = examDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const weaknesses = await Weaknesses.findAll({ where: { userId } });
    const avgScore = weaknesses.length > 0 
      ? weaknesses.reduce((sum, w) => sum + w.score, 0) / weaknesses.length 
      : 0;
    
    const onTrackScore = Math.min(Math.round((avgScore / 100) * 400), 400);
    const targetScore = user.targetScore || 280;

    const topWeakTopics = await Weaknesses.findAll({
      where: { userId },
      include: [{ model: Subjects, as: 'subject', attributes: ['name'] }],
      order: [['score', 'ASC']],
      limit: 3
    });

    const suggestions = topWeakTopics.map(w => ({
      topic: w.topic,
      subject: w.subject?.name,
      score: w.score
    }));

    let urgencyMessage = "";
    if (daysLeft <= 0) {
       urgencyMessage = "Good luck! Today is the day.";
    } else if (daysLeft <= 7) {
       urgencyMessage = "Final week! Focus only on your weakest topics. Everything else is noise.";
    } else if (daysLeft <= 30) {
       urgencyMessage = `You have ${daysLeft} days left. You are currently on track to score ${onTrackScore}. To hit ${targetScore}, you need to fix these 3 topics.`;
    } else {
       urgencyMessage = `Keep it up! ${daysLeft} days to go. Plenty of time to hit your target of ${targetScore}.`;
    }

    res.json({
      success: true,
      daysLeft,
      onTrackScore,
      targetScore,
      suggestions,
      urgencyMessage
    });

  } catch (error) {
    console.error("Get Exam Status Error:", error);
    res.status(500).json({ error: "Failed to fetch exam status." });
  }
};
