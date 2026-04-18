const { Weaknesses, Users, Subjects } = require("../models");
const nodemailer = require("nodemailer");

// A generic function to determine severity based on score
function determineSeverity(score) {
  if (score < 40) return 'high';
  if (score < 60) return 'moderate';
  return 'low';
}

const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY, 
});

exports.reportScore = async (req, res) => {
  try {
    const { userId, subjectId, topic, score } = req.body;
    
    // Check if a weakness record already exists for this subject/topic
    let weakness = await Weaknesses.findOne({
      where: { userId, subjectId, topic }
    });

    const severity = determineSeverity(score);

    if (weakness) {
      // Update existing
      weakness.score = score;
      weakness.severity = severity;
      weakness.attempts += 1;
      weakness.lastAttemptDate = new Date();
      
      // Deep Analysis logic: If failing multiple times, get AI to explain why
      if (weakness.attempts >= 3 && score < 50) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a professional educational psychologist and tutor. Analyze why a student might be struggling with a topic after multiple attempts and give a short, 2-sentence empathetic insight."
            },
            {
              role: "user",
              content: `Student has attempted '${topic}' ${weakness.attempts} times and keeps scoring below 50%. Latest score: ${score}%. Provide a brief diagnostic insight for the parent.`
            }
          ]
        });
        weakness.aiAnalysis = completion.choices[0].message.content;
      }
      
      await weakness.save();
    } else {
      // Create new
      weakness = await Weaknesses.create({
        userId,
        subjectId,
        topic,
        score,
        severity,
        attempts: 1,
        lastAttemptDate: new Date()
      });
    }

    // If severity is high, alert the parent via email
    if (severity === 'high') {
      const user = await Users.findByPk(userId);
      if (user && user.parentEmail) {
        // Send email with Nodemailer
        nodemailer.createTestAccount((err, account) => {
          if (err) {
            console.error('Failed to create a testing account. ' + err.message);
            return;
          }

          let transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: { user: account.user, pass: account.pass }
          });

          // Mock frontend URL
          const dashboardUrl = `http://localhost:5000/parent/dashboard/${userId}`;
          
          const aiInsight = weakness.aiAnalysis ? `<p style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #29a38b; font-style: italic;"><strong>AI Tutor Insight:</strong> ${weakness.aiAnalysis}</p>` : '';

          let message = {
            from: '"PrepGenX Support" <support@prepgenx.com>',
            to: user.parentEmail,
            subject: `PrepGenX Alert: Your child needs practice in ${topic || 'a subject'}`,
            html: `<div style="font-family: sans-serif; color: #333;">
                    <h2 style="color: #29a38b;">PrepGenX Performance Update</h2>
                    <p>Hello parent,</p>
                    <p>Your child <strong>${user.fullname}</strong> recently scored <strong>${score}%</strong> in <strong>${topic || 'a specific topic'}</strong> after <strong>${weakness.attempts}</strong> attempts.</p>
                    ${aiInsight}
                    <p>This is flagged as a high severity weakness. PrepGenX will prioritize practicing this subject to improve their score.</p>
                    <p>You can view their full weakness report and progress on your Parent Dashboard:</p>
                    <p><a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #29a38b; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Parent Dashboard</a></p>
                    <p>Best,<br>PrepGenX AI Tutor</p>
                   </div>`
          };

          transporter.sendMail(message, (err, info) => {
            if (err) {
               console.log('Error occurred. ' + err.message);
               return;
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          });
        });
      }
    }

    res.json({ success: true, weakness });
  } catch (error) {
    console.error("Report Score Error:", error);
    res.status(500).json({ error: "Failed to report score." });
  }
};

exports.getWeaknesses = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const weaknesses = await Weaknesses.findAll({
      where: { userId },
      include: [
        { model: Subjects, as: 'subject', attributes: ['name'] }
      ],
      order: [['score', 'ASC']]
    });

    res.json({ success: true, weaknesses });
  } catch (error) {
    console.error("Get Weaknesses Error:", error);
    res.status(500).json({ error: "Failed to fetch weaknesses." });
  }
};
