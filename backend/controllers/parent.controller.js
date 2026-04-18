const { Users, Weaknesses, Subjects } = require("../models");

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

    // Calculate Average Score and Comparison
    const avgScore = weaknesses.length > 0 
      ? Math.round(weaknesses.reduce((sum, w) => sum + w.score, 0) / weaknesses.length) 
      : 0;
    const nationalAvg = 58; // Const for demo
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

    const initials = user.fullname.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PrepGenX - Premium Parent Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #29a38b;
            --primary-dark: #1a6b5a;
            --primary-light: #e5efea;
            --bg: #0d1f1a;
            --card-bg: #ffffff;
            --text: #1a1c23;
            --text-muted: #737a8d;
            --danger: #ef4444;
            --warning: #f59e0b;
            --success: #10b981;
          }
          body { font-family: 'Outfit', sans-serif; background-color: var(--bg); margin: 0; padding: 0; color: var(--text); }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; min-height: 100vh; overflow: hidden; position: relative; }
          .top-banner { background: var(--primary); padding: 40px 30px; color: white; border-bottom-left-radius: 40px; border-bottom-right-radius: 40px; }
          .top-banner h1 { margin: 0; font-size: 2.5rem; font-weight: 700; }
          .top-banner p { margin: 10px 0 0 0; opacity: 0.8; font-size: 1.1rem; }
          
          .content { padding: 30px; margin-top: -20px; }
          .summary-card { background: white; border-radius: 24px; padding: 25px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); margin-bottom: 30px; border: 1px solid #eee; display: flex; justify-content: space-around; text-align: center; }
          .summary-item h4 { margin: 0; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; }
          .summary-item p { margin: 5px 0 0 0; font-size: 1.5rem; font-weight: 700; color: var(--primary); }
          
          .section-title { font-size: 1.4rem; font-weight: 700; margin: 30px 0 20px 0; display: flex; align-items: center; gap: 10px; }
          .section-title::after { content: ''; flex: 1; height: 1px; background: #eee; }
          
          .card { background: white; border: 1px solid #eef0f2; border-radius: 20px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); position: relative; }
          .card.high { border-left: 5px solid var(--danger); }
          .card.moderate { border-left: 5px solid var(--warning); }
          .card.low { border-left: 5px solid var(--success); }
          
          .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
          .subject-title { margin: 0; font-size: 1.2rem; }
          .score-badge { font-weight: 700; font-size: 1.3rem; }
          .score-badge.high { color: var(--danger); }
          .score-badge.moderate { color: var(--warning); }
          .score-badge.low { color: var(--success); }

          .ai-insight { background: var(--primary-light); padding: 15px; border-radius: 12px; margin-top: 15px; font-size: 0.95rem; color: var(--primary-dark); font-style: italic; border-left: 3px solid var(--primary); }
          
          .progress-bar-bg { width: 100%; height: 10px; background: #f0f2f5; border-radius: 5px; overflow: hidden; }
          .progress-bar-fill { height: 100%; border-radius: 5px; }
          .progress-bar-fill.high { background: var(--danger); }
          .progress-bar-fill.moderate { background: var(--warning); }
          .progress-bar-fill.low { background: var(--success); }

          .trend-chart { height: 100px; width: 100%; background: linear-gradient(to right, transparent, var(--primary-light)); border-radius: 12px; margin-top: 20px; display: flex; align-items: flex-end; gap: 5px; padding: 10px; }
          .trend-bar { flex: 1; background: var(--primary); border-top-left-radius: 4px; border-top-right-radius: 4px; opacity: 0.3; }
          .trend-bar:last-child { opacity: 1; height: 80% !important; }

          .footer { text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 0.9rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="top-banner">
            <h1>PrepGenX</h1>
            <p>Empowering <strong>${user.fullname}</strong> to succeed</p>
          </div>
          
          <div class="content">
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

            <div class="section-title">Knowledge Mastery</div>
            ${weaknessesHtml}

            <div class="section-title">30-Day Trend</div>
            <div class="trend-chart">
               <div class="trend-bar" style="height: 30%"></div>
               <div class="trend-bar" style="height: 45%"></div>
               <div class="trend-bar" style="height: 40%"></div>
               <div class="trend-bar" style="height: 55%"></div>
               <div class="trend-bar" style="height: 60%"></div>
               <div class="trend-bar" style="height: 52%"></div>
               <div class="trend-bar" style="height: 70%"></div>
               <div class="trend-bar" style="height: 80%"></div>
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
      parentEmail: user.parentEmail 
    });
  } catch (error) {
    console.error("Connect Parent Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
