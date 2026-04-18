async function testWeaknessAlert() {
  try {
    const loginRes = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "testkid@example.com", password: "password123" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    const userId = loginData.user.id;
    console.log("Logged in:", loginData.user.email);

    const examsRes = await fetch("http://localhost:5000/exams", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const examsData = await examsRes.json();
    const subjectId = examsData.exams[0].subjectId;
    console.log("Fetched Subject ID:", subjectId);

    const reportRes = await fetch("http://localhost:5000/weakness/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, subjectId, topic: "Calculus", score: 35 })
    });
    const reportData = await reportRes.json();
    console.log("Report Response:", reportData);
    console.log("Check the backend console for the Nodemailer Ethereal URL!");
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testWeaknessAlert();
