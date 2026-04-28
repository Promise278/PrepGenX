# PrepGenyx

PrepGenyx is an AI-powered study assistant designed to help students prepare for exams and tests more effectively. By leveraging cutting-edge AI technologies and providing a seamless mobile and backend infrastructure, PrepGenyx offers personalized tutoring, study management, and social features to enhance the learning experience.

## 🚀 Key Features

-   **🤖 AI Tutor**: Advanced integration with OpenAI (GPT-4o mini, Whisper, TTS) for personalized tutoring and voice-enabled interactions.
-   **📚 Study Management**: Organized topics and student profiles to track progress and focus on key areas.
-   **🤝 Social connectivity**: Friendships and collaborative features to study together.
-   **📱 Cross-Platform Mobile App**: Built with Expo for iOS, Android, and Web, featuring a modern and intuitive UI with NativeWind styling.
-   **🔒 Secure Backend**: A robust Express.js server with JWT authentication and Sequelize ORM for reliable data management.
-   **📞 Communication**: Support for features like video calls and real-time notifications.

## 🛠️ Tech Stack

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL / SQLite (via Sequelize ORM)
-   **Authentication**: JWT, bcrypt
-   **Cloud Integration**: OpenAI API, Nodemailer

### Mobile
-   **Framework**: React Native (via Expo)
-   **Router**: Expo Router
-   **Styling**: NativeWind (Tailwind CSS)
-   **Icons**: Lucide React Native, Expo Vector Icons
-   **Animations**: React Native Reanimated

## 🛠️ Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18+ recommended)
-   [Expo Go](https://expo.dev/expo-go) app (for mobile testing)
-   [PostgreSQL](https://www.postgresql.org/) (if using the production database)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd PrepGenyx
    ```

2.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    # Copy .env.example to .env and configure your variables
    cp .env.example .env 
    ```

3.  **Setup Mobile**:
    ```bash
    cd ../mobile
    npm install
    ```

## 🏃 Running the Project

### Start Backend
```bash
cd backend
# Database will sync automatically on start
npm run start 
```

### Start Mobile App
```bash
cd mobile
npx expo start
```

## 📄 License
This project is licensed under the ISC License.

---
Developed by PromotexDev