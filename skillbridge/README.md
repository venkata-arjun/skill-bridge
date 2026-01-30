# SkillBridge 🎓

A comprehensive educational platform connecting students, speakers, and faculty members for skill development and knowledge sharing.

![SkillBridge](https://skillbridge-1a913.web.app)

## 🌟 Live Demo

**Visit the live application:** [https://skillbridge-1a913.web.app](https://skillbridge-1a913.web.app)

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## ✨ Features

### 🔐 Authentication & Authorization

- **Multi-role Authentication**: Support for Student, Speaker, and Faculty roles
- **Secure Login/Signup**: Firebase Authentication with email/password
- **Faculty Approval System**: Admin-controlled faculty account approval
- **Protected Routes**: Role-based access control for different sections

### 👥 User Management

- **Profile Management**: Complete user profiles with bio, skills, and social links
- **Role-based Dashboards**: Customized interfaces for each user type
- **User Verification**: Faculty accounts require admin approval before access

### 📚 Session Management

- **Session Creation**: Faculty can create and manage skill development sessions
- **Session Approval**: Multi-level approval process for session publishing
- **Attendee Management**: Track session participants and engagement
- **Session History**: Complete history of approved and completed sessions

### 🎤 Speaker Proposals

- **Proposal Submission**: Students can propose themselves as speakers
- **Faculty Review**: Multi-stage approval process for speaker proposals
- **Interview Scheduling**: Automated interview coordination system
- **Final Approval**: Complete workflow from proposal to speaker status

### 📊 Dashboard Analytics

- **Performance Metrics**: Comprehensive analytics for faculty members
- **Session Statistics**: Track approval rates, attendance, and engagement
- **User Activity**: Monitor platform usage and participation
- **Real-time Updates**: Live data synchronization across all dashboards

### 📧 Notification System

- **Email Notifications**: Automated emails for faculty registration approvals
- **Admin Alerts**: Instant notifications for new faculty account requests
- **Status Updates**: Email confirmations for various approval stages

## 🛠 Technology Stack

### Frontend

- **React 19.1.1** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **React Router DOM** - Declarative routing for React applications
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Beautiful & consistent icon toolkit

### Backend & Database

- **Firebase** - Comprehensive backend-as-a-service platform
  - **Firebase Authentication** - User authentication and authorization
  - **Cloud Firestore** - NoSQL cloud database
  - **Firebase Hosting** - Fast, secure web hosting
  - **Firebase Security Rules** - Database access control

### Additional Libraries

- **EmailJS** - Send emails directly from client-side JavaScript
- **Date-fns** - Modern JavaScript date utility library
- **Stripe** - Payment processing (integrated for future features)

### Development Tools

- **ESLint** - JavaScript linting utility
- **PostCSS** - CSS processing tool
- **Autoprefixer** - CSS vendor prefixing automation

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 16.0.0 or higher)
- **npm** or **yarn** package manager
- **Firebase CLI** for deployment
- **Git** for version control

## 🚀 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/skillbridge.git
   cd skillbridge
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to view the application.

## ⚙️ Configuration

### Firebase Setup

1. **Create a Firebase project** at [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Enable Authentication:**

   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication

3. **Set up Firestore Database:**

   - Create a Firestore database
   - Configure security rules (see `firebase.rules`)

4. **Configure Firebase Hosting:**
   - Enable Firebase Hosting in your project

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS Configuration (for notifications)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Firebase Security Rules

The application uses comprehensive security rules defined in `firebase.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User authentication and authorization rules
    // Session management rules
    // Speaker proposal rules
    // Faculty approval rules
  }
}
```

## 📖 Usage

### For Students

1. **Sign Up**: Create an account with student role
2. **Browse Sessions**: View available skill development sessions
3. **Register for Sessions**: Join sessions that interest you
4. **Submit Speaker Proposals**: Apply to become a speaker
5. **Track Progress**: Monitor your learning journey

### For Speakers

1. **Apply as Speaker**: Submit proposal through the platform
2. **Interview Process**: Complete faculty interview
3. **Get Approved**: Receive final approval from faculty
4. **Host Sessions**: Create and manage your own sessions
5. **Engage Audience**: Interact with session participants

### For Faculty

1. **Admin Approval**: Wait for admin approval after registration
2. **Create Sessions**: Design and publish skill development sessions
3. **Review Proposals**: Evaluate student speaker proposals
4. **Manage Approvals**: Oversee session and speaker approvals
5. **Monitor Analytics**: Track platform performance and engagement

### For Administrators

1. **Faculty Approval**: Review and approve faculty account requests
2. **System Monitoring**: Oversee all platform activities
3. **User Management**: Manage user accounts and permissions
4. **Content Moderation**: Ensure quality of sessions and proposals

## 📁 Project Structure

```
skillbridge/
├── public/
│   ├── favicon.ico
│   ├── favicon.png
│   └── vite.svg
├── src/
│   ├── assets/
│   │   ├── hero.jpg
│   │   ├── heroo.jpg
│   │   └── logo.png
│   ├── components/
│   │   ├── AlertModal.jsx
│   │   ├── AttendeesDisplay.jsx
│   │   ├── ConfirmationModal.jsx
│   │   ├── FacultyApprovalModal.jsx
│   │   ├── FeedbackModal.jsx
│   │   ├── FinalApprovalModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProposeForm.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── RatingsDisplay.jsx
│   │   ├── RejectionModal.jsx
│   │   └── SessionCard.jsx
│   ├── contexts/
│   │   ├── AlertContext.jsx
│   │   ├── AuthContext.jsx
│   │   └── ConfirmationContext.jsx
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── SessionDetails.jsx
│   │   ├── Sessions.jsx
│   │   ├── Signup.jsx
│   │   └── dashboards/
│   │       ├── FacultyDashboard.jsx
│   │       ├── SpeakerDashboard.jsx
│   │       └── StudentDashboard.jsx
│   ├── shared/
│   │   └── SessionCard.jsx
│   ├── App.jsx
│   ├── firebase.js
│   ├── index.css
│   └── main.jsx
├── firebase.json
├── firebase.rules
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🔌 API Reference

### Authentication Endpoints

- `signup(userData)` - Create new user account
- `login(credentials)` - Authenticate user
- `logout()` - Sign out current user
- `resetPassword(email)` - Send password reset email

### Session Management

- `createSession(sessionData)` - Create new session
- `updateSession(sessionId, updates)` - Update session details
- `approveSession(sessionId)` - Approve session for publishing
- `rejectSession(sessionId, reason)` - Reject session with reason

### User Management

- `updateProfile(userId, profileData)` - Update user profile
- `approveFaculty(userId)` - Approve faculty account (admin only)
- `promoteToSpeaker(userId)` - Promote user to speaker role

## 🚀 Deployment

### Firebase Hosting Deployment

1. **Install Firebase CLI:**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**

   ```bash
   firebase login
   ```

3. **Initialize Firebase (if not done):**

   ```bash
   firebase init
   ```

4. **Build the application:**

   ```bash
   npm run build
   ```

5. **Deploy to Firebase:**
   ```bash
   firebase deploy --only hosting
   ```

### Environment Setup for Production

Ensure all environment variables are properly configured in your production environment:

- Firebase configuration variables
- EmailJS service credentials
- Any other service integrations

## 🤝 Contributing

We welcome contributions to SkillBridge! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and structure
- Write clear, concise commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**SkillBridge Team**

- **Email:** skillbridge.portal@gmail.com
- **Website:** [https://skillbridge-1a913.web.app](https://skillbridge-1a913.web.app)
- **GitHub:** [https://github.com/your-username/skillbridge](https://github.com/your-username/skillbridge)

### Support

For support, feature requests, or bug reports, please:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Contact us at skillbridge.portal@gmail.com

---

**Built with ❤️ for the educational community**

_Empowering students, connecting speakers, and fostering faculty collaboration for a brighter future in education._
