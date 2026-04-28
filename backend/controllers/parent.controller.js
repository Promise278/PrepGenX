const { Users, Weaknesses, Subjects, Progresss, StudyPlan } = require("../models");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

// ─── Helper: Verify parent access (JWT or share token) ───
async function verifyParentAccess(req, userId) {
  // If authenticated via JWT, check if this is the student or their parent
  if (req.user && req.user.id === userId) return true;

  // Check share token
  const { token } = req.query;
  if (token) {
    const user = await Users.findByPk(userId);
    if (
      user &&
      user.parentShareToken === token &&
      user.parentShareTokenExpiry &&
      new Date(user.parentShareTokenExpiry) > new Date()
    ) {
      return true;
    }
  }
  return false;
}

// ─── 1. Child Overview ───
exports.getChildOverview = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: "Student not found" });

    // Platform average (from all users)
    const allUsers = await Users.findAll({ attributes: ["progress", "points"] });
    const platformAvg = allUsers.length > 0
      ? Math.round(allUsers.reduce((s, u) => s + (u.progress || 0), 0) / allUsers.length)
      : 0;

    // Weakness average
    const weaknesses = await Weaknesses.findAll({ where: { userId } });
    const avgScore = weaknesses.length > 0
      ? Math.round(weaknesses.reduce((s, w) => s + w.score, 0) / weaknesses.length)
      : 0;

    // Exam countdown
    let daysLeft = null;
    if (user.examDate) {
      const diff = new Date(user.examDate) - new Date();
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    // Predicted JAMB score
    const predictedScore = Math.min(Math.round((avgScore / 100) * 400), 400);

    return res.json({
      success: true,
      data: {
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        points: user.points || 0,
        streak: user.streak || 0,
        examsTaken: user.examsTaken || 0,
        progress: user.progress || 0,
        avgScore,
        platformAvg,
        predictedScore,
        targetScore: user.targetScore || 280,
        daysLeft,
        totalWeaknesses: weaknesses.length,
        highSeverityCount: weaknesses.filter(w => w.severity === "high").length,
      },
    });
  } catch (error) {
    console.error("getChildOverview Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─── 2. Child Weaknesses ───
exports.getChildWeaknesses = async (req, res) => {
  try {
    const { userId } = req.params;

    const weaknesses = await Weaknesses.findAll({
      where: { userId },
      include: [{ model: Subjects, as: "subject", attributes: ["name"] }],
      order: [["score", "ASC"]],
    });

    const formatted = weaknesses.map(w => ({
      id: w.id,
      subject: w.subject?.name || "General",
      topic: w.topic || "General",
      score: w.score,
      severity: w.severity,
      attempts: w.attempts || 1,
      aiAnalysis: w.aiAnalysis || null,
      lastAttemptDate: w.lastAttemptDate,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("getChildWeaknesses Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─── 3. Child Exam History ───
exports.getChildExamHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const progress = await Progresss.findAll({
      where: { userId },
      include: [{ model: Subjects, attributes: ["name"] }],
      order: [["createdAt", "DESC"]],
      limit: 30,
    });

    const history = progress.map(p => ({
      id: p.id,
      subject: p.Subject?.name || p.Subjects?.name || "General",
      score: p.score,
      difficulty: p.difficultyLevel,
      date: p.createdAt,
    }));

    // Trend calculation: compare last 5 vs previous 5
    const recent5 = history.slice(0, 5);
    const prev5 = history.slice(5, 10);
    const recentAvg = recent5.length > 0
      ? Math.round(recent5.reduce((s, h) => s + h.score, 0) / recent5.length)
      : 0;
    const prevAvg = prev5.length > 0
      ? Math.round(prev5.reduce((s, h) => s + h.score, 0) / prev5.length)
      : 0;
    const trend = recentAvg - prevAvg;

    return res.json({
      success: true,
      data: { history, recentAvg, prevAvg, trend, totalExams: history.length },
    });
  } catch (error) {
    console.error("getChildExamHistory Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─── 4. Child Study Activity (last 30 days) ───
exports.getChildStudyActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activity = await Progresss.findAll({
      where: {
        userId,
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
      include: [{ model: Subjects, attributes: ["name"] }],
      order: [["createdAt", "DESC"]],
    });

    // Group by date for heatmap
    const heatmap = {};
    activity.forEach(a => {
      const dateKey = new Date(a.createdAt).toISOString().split("T")[0];
      if (!heatmap[dateKey]) heatmap[dateKey] = { count: 0, avgScore: 0, scores: [] };
      heatmap[dateKey].count += 1;
      heatmap[dateKey].scores.push(a.score);
    });

    // Calculate averages for each day
    Object.keys(heatmap).forEach(key => {
      const scores = heatmap[key].scores;
      heatmap[key].avgScore = Math.round(scores.reduce((s, sc) => s + sc, 0) / scores.length);
      delete heatmap[key].scores;
    });

    // Active days count
    const activeDays = Object.keys(heatmap).length;

    const feed = activity.slice(0, 15).map(a => ({
      id: a.id,
      subject: a.Subject?.name || a.Subjects?.name || "Session",
      score: a.score,
      difficulty: a.difficultyLevel,
      date: a.createdAt,
    }));

    return res.json({
      success: true,
      data: { feed, heatmap, activeDays, totalSessions: activity.length },
    });
  } catch (error) {
    console.error("getChildStudyActivity Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─── 5. AI Report Card ───
exports.getChildReportCard = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: "Student not found" });

    const weaknesses = await Weaknesses.findAll({
      where: { userId },
      include: [{ model: Subjects, as: "subject", attributes: ["name"] }],
      order: [["score", "ASC"]],
    });

    const progress = await Progresss.findAll({
      where: { userId },
      include: [{ model: Subjects, attributes: ["name"] }],
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    const avgScore = weaknesses.length > 0
      ? Math.round(weaknesses.reduce((s, w) => s + w.score, 0) / weaknesses.length)
      : 0;

    const highWeaknesses = weaknesses.filter(w => w.severity === "high");
    const strengths = weaknesses.filter(w => w.severity === "low" && w.score >= 70);

    // Generate AI report using OpenAI
    let aiReport = null;
    try {
      const { OpenAI } = require("openai");
      const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY });

      const weaknessStr = highWeaknesses.map(w => `${w.subject?.name}: ${w.topic} (${w.score}%, ${w.attempts} attempts)`).join(", ");
      const strengthStr = strengths.map(w => `${w.subject?.name}: ${w.topic} (${w.score}%)`).join(", ");

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional academic counselor generating a parent-friendly report card. Be warm, encouraging, but honest. Format your response as JSON with keys: summary (2-3 sentences), strengths (array of strings), weaknesses (array of strings), recommendations (array of 3 actionable strings), predictedGrade (A/B/C/D/F), encouragement (1 motivational sentence).",
          },
          {
            role: "user",
            content: `Student: ${user.fullname}. Average score: ${avgScore}%. Exams taken: ${user.examsTaken || 0}. Study streak: ${user.streak || 0} days. Key weaknesses: ${weaknessStr || "None identified"}. Strengths: ${strengthStr || "Still building"}. Target JAMB score: ${user.targetScore || 280}. Generate a parent report card.`,
          },
        ],
      });

      const raw = completion.choices[0].message.content;
      // Try parsing JSON from the response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiReport = JSON.parse(jsonMatch[0]);
      } else {
        aiReport = { summary: raw, strengths: [], weaknesses: [], recommendations: [], predictedGrade: "B", encouragement: "Keep going!" };
      }
    } catch (aiErr) {
      console.error("AI Report Card generation failed:", aiErr.message);
      // Fallback static report
      aiReport = {
        summary: `${user.fullname} has an average score of ${avgScore}% across all subjects. ${highWeaknesses.length > 0 ? "There are areas that need attention." : "Performance is on track."}`,
        strengths: strengths.map(s => `${s.subject?.name}: ${s.topic}`),
        weaknesses: highWeaknesses.map(w => `${w.subject?.name}: ${w.topic} (${w.score}%)`),
        recommendations: [
          "Practice weak topics for 30 minutes daily",
          "Take at least 2 mock exams per week",
          "Review mistakes immediately after each session",
        ],
        predictedGrade: avgScore >= 70 ? "A" : avgScore >= 55 ? "B" : avgScore >= 40 ? "C" : "D",
        encouragement: "Every study session counts. Progress is progress!",
      };
    }

    return res.json({
      success: true,
      data: {
        studentName: user.fullname,
        avgScore,
        examsTaken: user.examsTaken || 0,
        streak: user.streak || 0,
        predictedJambScore: Math.min(Math.round((avgScore / 100) * 400), 400),
        targetScore: user.targetScore || 280,
        report: aiReport,
      },
    });
  } catch (error) {
    console.error("getChildReportCard Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─── 6. Generate Share Token ───
exports.generateShareToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await Users.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Generate a unique token, valid for 30 days
    const token = uuidv4().replace(/-/g, "").substring(0, 16);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    user.parentShareToken = token;
    user.parentShareTokenExpiry = expiry;
    await user.save();

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5000";
    const shareUrl = `${baseUrl}/parent/dashboard/${userId}?token=${token}`;

    return res.json({
      success: true,
      data: { token, expiry, shareUrl },
      message: "Share token generated. Valid for 30 days.",
    });
  } catch (error) {
    console.error("generateShareToken Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─── Connect Parent Email (existing) ───
exports.connectParent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { parentEmail } = req.body;

    if (!parentEmail) {
      return res.status(400).json({ success: false, message: "Parent email is required" });
    }

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    user.parentEmail = parentEmail;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Parent email connected successfully",
      parentEmail: user.parentEmail,
    });
  } catch (error) {
    console.error("Connect Parent Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─── Keep existing HTML Dashboard (backward compat) ───
exports.viewDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).send("<h2>Student not found</h2>");
    }

    const weaknesses = await Weaknesses.findAll({
      where: { userId },
      include: [{ model: Subjects, as: 'subject', attributes: ['name'] }],
      order: [['score', 'ASC']]
    });

    // Fetch progress for real trend data
    const progress = await Progresss.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 8,
    });

    const avgScore = weaknesses.length > 0
      ? Math.round(weaknesses.reduce((sum, w) => sum + w.score, 0) / weaknesses.length)
      : 0;
    const nationalAvg = 58;
    const comparisonMessage = avgScore >= nationalAvg
      ? `<span style="color: var(--success); font-weight: bold;">Above average</span>`
      : `<span style="color: var(--danger); font-weight: bold;">Below average</span>`;

    let weaknessesHtml = "";
    if (weaknesses.length === 0) {
      weaknessesHtml = `
        <div class="empty-state">
          <div>🌟</div>
          <div style="margin-top: 10px; font-size: 1.1rem;">No weaknesses recorded yet!</div>
        </div>`;
    } else {
      weaknessesHtml = weaknesses.map(w => {
        const sevClass = w.severity === "high" ? "high" : w.severity === "moderate" ? "moderate" : "low";
        const width = Math.min(Math.max(w.score, 5), 100);
        const aiInsight = w.aiAnalysis ? `<div class="ai-insight"><strong>AI Diagnostic:</strong> ${w.aiAnalysis}</div>` : '';

        return `
          <div class="card ${sevClass}">
            <div class="card-header">
              <h3 class="subject-title">${w.subject ? w.subject.name : "Subject"}</h3>
              <span class="score-badge ${sevClass}">${w.score}%</span>
            </div>
            <p class="topic">Topic: ${w.topic || 'General Overview'}</p>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill ${sevClass}" style="width: ${width}%"></div>
            </div>
            ${aiInsight}
            <div style="margin-top: 12px; font-size: 0.8rem; color: var(--text-muted);">Attempts: ${w.attempts || 1} • Last seen: ${w.lastAttemptDate ? new Date(w.lastAttemptDate).toLocaleDateString() : 'Today'}</div>
          </div>
        `;
      }).join('');
    }

    // Real trend bars from progress data
    const trendBars = progress.length > 0
      ? progress.reverse().map((p, i) => {
          const height = Math.max(p.score, 10);
          const isLast = i === progress.length - 1;
          return `<div class="trend-bar" style="height: ${height}%; ${isLast ? 'opacity: 1;' : ''}"></div>`;
        }).join('')
      : Array.from({ length: 8 }, (_, i) => `<div class="trend-bar" style="height: ${20 + i * 8}%"></div>`).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PrepGenX - Parent Dashboard for ${user.fullname}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #29a38b;
            --primary-dark: #1a6b5a;
            --primary-light: #e5efea;
            --bg: #faf9f4;
            --card-bg: #ffffff;
            --text: #1a1c23;
            --text-muted: #737a8d;
            --danger: #ef4444;
            --warning: #f59e0b;
            --success: #10b981;
          }
          * { box-sizing: border-box; }
          body { font-family: 'Outfit', sans-serif; background-color: var(--bg); margin: 0; padding: 0; color: var(--text); }
          .container { max-width: 600px; margin: 0 auto; background: var(--bg); min-height: 100vh; overflow: hidden; }
          .top-banner { background: var(--primary); padding: 40px 30px 50px; color: white; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; position: relative; overflow: hidden; }
          .top-banner::before { content: ''; position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.08); }
          .top-banner h1 { margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: -1px; }
          .top-banner p { margin: 10px 0 0 0; opacity: 0.85; font-size: 1rem; }
          .top-banner .badge { display: inline-block; margin-top: 12px; background: rgba(255,255,255,0.15); padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
          .content { padding: 30px; margin-top: -20px; }
          .summary-card { background: white; border-radius: 24px; padding: 25px; box-shadow: 0 8px 30px rgba(0,0,0,0.06); margin-bottom: 30px; border: 1px solid #eef0f2; display: flex; justify-content: space-around; text-align: center; }
          .summary-item h4 { margin: 0; color: var(--text-muted); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
          .summary-item p { margin: 5px 0 0 0; font-size: 1.5rem; font-weight: 700; color: var(--primary); }
          .section-title { font-size: 1.2rem; font-weight: 700; margin: 30px 0 20px 0; display: flex; align-items: center; gap: 10px; text-transform: uppercase; letter-spacing: 1px; font-size: 0.85rem; color: var(--text-muted); }
          .section-title::after { content: ''; flex: 1; height: 1px; background: #eee; }
          .card { background: white; border: 1px solid #eef0f2; border-radius: 20px; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
          .card.high { border-left: 5px solid var(--danger); }
          .card.moderate { border-left: 5px solid var(--warning); }
          .card.low { border-left: 5px solid var(--success); }
          .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .subject-title { margin: 0; font-size: 1.1rem; }
          .topic { margin: 0 0 12px 0; font-size: 0.85rem; color: var(--text-muted); }
          .score-badge { font-weight: 700; font-size: 1.2rem; }
          .score-badge.high { color: var(--danger); }
          .score-badge.moderate { color: var(--warning); }
          .score-badge.low { color: var(--success); }
          .ai-insight { background: var(--primary-light); padding: 14px; border-radius: 12px; margin-top: 14px; font-size: 0.9rem; color: var(--primary-dark); font-style: italic; border-left: 3px solid var(--primary); }
          .progress-bar-bg { width: 100%; height: 8px; background: #f0f2f5; border-radius: 4px; overflow: hidden; }
          .progress-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
          .progress-bar-fill.high { background: var(--danger); }
          .progress-bar-fill.moderate { background: var(--warning); }
          .progress-bar-fill.low { background: var(--success); }
          .trend-chart { height: 100px; width: 100%; background: white; border-radius: 16px; display: flex; align-items: flex-end; gap: 6px; padding: 12px; border: 1px solid #eef0f2; }
          .trend-bar { flex: 1; background: var(--primary); border-top-left-radius: 4px; border-top-right-radius: 4px; opacity: 0.3; transition: height 0.4s ease; }
          .trend-bar:last-child { opacity: 1; }
          .stats-row { display: flex; gap: 12px; margin-bottom: 24px; }
          .stat-box { flex: 1; background: white; border: 1px solid #eef0f2; border-radius: 16px; padding: 16px; text-align: center; }
          .stat-box .value { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
          .stat-box .label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-top: 4px; }
          .footer { text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 0.85rem; }
          .empty-state { text-align: center; padding: 30px; color: var(--text-muted); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="top-banner">
            <h1>PrepGenX</h1>
            <p>Progress report for <strong>${user.fullname}</strong></p>
            <div class="badge">🎓 Parent Dashboard</div>
          </div>
          
          <div class="content">
            <div class="stats-row">
              <div class="stat-box">
                <div class="value">${user.streak || 0}</div>
                <div class="label">🔥 Streak</div>
              </div>
              <div class="stat-box">
                <div class="value">${user.examsTaken || 0}</div>
                <div class="label">📝 Exams</div>
              </div>
              <div class="stat-box">
                <div class="value">${user.points || 0}</div>
                <div class="label">⭐ Points</div>
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-item">
                <h4>Average Score</h4>
                <p>${avgScore}%</p>
              </div>
              <div class="summary-item">
                <h4>National Avg</h4>
                <p>58%</p>
              </div>
              <div class="summary-item">
                <h4>Standing</h4>
                <p style="font-size: 1rem;">${comparisonMessage}</p>
              </div>
            </div>

            <div class="section-title">Subject Mastery</div>
            ${weaknessesHtml}

            <div class="section-title">Performance Trend</div>
            <div class="trend-chart">
               ${trendBars}
            </div>
          </div>
          
          <div class="footer">
            Generated with &hearts; by PrepGenX AI Tutor<br>
            &copy; 2026 PrepGenX Education
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error("View Dashboard Error:", error);
    res.status(500).send("<h2>Internal Server Error</h2>");
  }
};
