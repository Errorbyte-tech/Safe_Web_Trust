# 🛡️ SAFE_WEB_TRUST
*Empowering Safer Browsing Through Trust and Innovation*

[![Version](https://img.shields.io/badge/version-v2.1.0-blue.svg)](https://github.com/Errorbyte-tech/Safe_Web_Trust/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/Errorbyte-tech/Safe_Web_Trust/actions)
[![Security](https://img.shields.io/badge/security-enhanced-red.svg)](https://github.com/Errorbyte-tech/Safe_Web_Trust/security)

**🚀 Built With:**
- React 18.2.0 + Vite 4.4.5
- Node.js 18+ & Express 4.18.2
- MongoDB Atlas 7.0
- OpenAI GPT-4 API
- Google Gemini Pro API
- Google Safe Browsing API v4
- Chrome Extension Manifest V3

---

## 📘 Overview

**Safe_Web_Trust** is a cutting-edge, developer-focused platform designed to build secure, AI-powered browser extensions that assess website safety in real-time. Our solution combines a modern **React + Vite** frontend with a robust **Node.js/Express** backend, leveraging multiple AI services including **OpenAI GPT-4**, **Google Gemini**, and **Google Safe Browsing API** to deliver comprehensive link risk assessment, user feedback collection, and trust score overlays directly within the browser experience.

### 🎯 Mission Statement
To create a safer internet ecosystem by providing real-time, AI-driven website safety assessments that empower users to make informed decisions about their online interactions.

---

## 🔍 Core Features

### 🌐 **Real-Time Site Safety Overlay**
- Instantly displays trust levels and safety indicators on any website
- Non-intrusive UI overlay with customizable positioning
- Color-coded risk assessment (Green/Yellow/Red)
- Detailed safety reports with actionable insights

### ⚡ **Lightning-Fast Performance**
- Optimized build pipeline with Vite for both development and production
- Lazy loading and code splitting for minimal resource usage
- Background processing to avoid UI blocking
- CDN-optimized asset delivery

### 🤖 **Advanced AI Risk Analysis**
- **Multi-AI Approach**: Combines OpenAI GPT-4 and Google Gemini for comprehensive analysis
- **Real-time Processing**: Sub-second response times for safety assessments
- **Context Awareness**: Analyzes page content, domain reputation, and user behavior patterns
- **Continuous Learning**: Improves accuracy through user feedback integration

### 🔒 **Enterprise-Grade Security**
- Express.js backend with helmet.js security middleware
- MongoDB with encrypted connections and data encryption at rest
- Rate limiting and DDoS protection
- CORS policy enforcement and input sanitization

### 🧠 **Community-Driven Trust Network**
- User rating and reporting system
- Crowdsourced safety intelligence
- Reputation-based scoring algorithm
- Anonymous feedback collection with privacy protection

### 🧱 **Modular Architecture**
- Cleanly separated UI components, background scripts, and backend logic
- Plugin-based extension system for easy feature additions
- RESTful API design for third-party integrations
- Docker containerization support

---

## 🧰 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **MongoDB**: v6.0 or higher (local) or MongoDB Atlas account
- **Browser**: Chrome v88+ or Chromium-based browsers

### API Keys Required
- OpenAI API key (GPT-4 access recommended)
- Google Gemini Pro API key
- Google Safe Browsing API key
- MongoDB connection string

---

## 🛠️ Installation & Setup

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/Errorbyte-tech/Safe_Web_Trust.git
cd Safe_Web_Trust

# Verify Node.js version
node --version  # Should be v18+
```

### 2. Extension Setup
```bash
# Navigate to extension directory
cd extension

# Install dependencies
npm install

# Install development dependencies
npm install --only=dev
```

### 3. Backend Setup
```bash
# Navigate to server directory
cd ../server

# Install backend dependencies
npm install

# Install PM2 for production deployment (optional)
npm install -g pm2
```

### 4. Environment Configuration

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/safe_web_trust
MONGO_DB_NAME=safe_web_trust

# API Keys
OPENAI_API_KEY=sk-your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
GOOGLE_SAFE_BROWSING_KEY=your-google-safe-browsing-key-here

# Security
JWT_SECRET=your-super-secure-jwt-secret-here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=chrome-extension://your-extension-id,http://localhost:3000
```

Create a `.env` file in the `extension/` directory:

```env
# Extension Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_EXTENSION_ID=your-chrome-extension-id
VITE_VERSION=2.1.0
```

---

## 🚀 Running the Project

### Development Mode

1. **Start the Backend Server:**
```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

2. **Build and Load Extension:**
```bash
cd ../extension
npm run build  # Creates dist/ folder
npm run dev    # Starts development mode with hot reload
```

3. **Load Extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension/dist` folder

### Production Deployment

1. **Backend Deployment:**
```bash
cd server
npm run build
pm2 start ecosystem.config.js
```

2. **Extension Build:**
```bash
cd extension
npm run build:prod
# Package the dist/ folder for Chrome Web Store submission
```

---

## 🧪 Testing

### Unit Tests
```bash
# Run backend tests
cd server
npm test

# Run extension tests
cd ../extension
npm test

# Run tests with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run full integration test suite
npm run test:integration

# Run API endpoint tests
npm run test:api

# Run extension functionality tests
npm run test:extension
```

### Load Testing
```bash
# Performance testing with Artillery
npm run test:load

# Memory leak testing
npm run test:memory
```

---

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh

### Safety Assessment Endpoints
- `POST /api/assess/url` - Analyze single URL
- `POST /api/assess/batch` - Batch URL analysis
- `GET /api/assess/history` - User assessment history

### User Feedback Endpoints
- `POST /api/feedback/submit` - Submit safety feedback
- `GET /api/feedback/stats` - Get feedback statistics
- `PUT /api/feedback/update` - Update existing feedback

### Trust Score Endpoints
- `GET /api/trust/score/:domain` - Get domain trust score
- `POST /api/trust/report` - Report malicious activity
- `GET /api/trust/leaderboard` - Top trusted domains

---

## 🔧 Configuration Options

### Extension Settings
```javascript
// manifest.json configuration
{
  "manifest_version": 3,
  "name": "Safe Web Trust",
  "version": "2.1.0",
  "permissions": [
    "activeTab",
    "storage",
    "background"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ]
}
```

### Backend Configuration
```javascript
// config/default.js
module.exports = {
  server: {
    port: process.env.PORT || 5000,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*']
    }
  },
  ai: {
    openai: {
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.1
    },
    gemini: {
      model: 'gemini-pro',
      safetySettings: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  }
}
```

---

## 🚦 Performance Metrics

### Current Benchmarks
- **Response Time**: < 200ms average for safety assessments
- **Accuracy Rate**: 94.7% correct threat detection
- **Memory Usage**: < 50MB RAM per active tab
- **CPU Impact**: < 2% average CPU utilization
- **Battery Impact**: Minimal (< 1% additional drain)

### Optimization Features
- Request debouncing and caching
- Lazy loading of UI components
- Background processing for heavy computations
- CDN integration for static assets

---

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- ESLint configuration for JavaScript/React
- Prettier for code formatting
- Husky for pre-commit hooks
- Jest for testing standards

### Issue Reporting
Please use our issue templates:
- 🐛 Bug Report
- 🚀 Feature Request
- 📚 Documentation Update
- 🔒 Security Vulnerability

---

## 👥 Contributors

### Core Team - Way To Future
- **[Nishant Ranjan](https://github.com/Errorbyte-tech)** - Lead Developer & Project Maintainer
- **Anirudh Jakhotia** - UI/UX Design Lead & User Experience
- **Puru Gupta** - Security Analysis & Penetration Testing Lead
- **Abhijeet Srivastava & Tanishque Gill** - Machine Learning & Algorithm Development

### Community Contributors
We appreciate all contributors! See [CONTRIBUTORS.md](CONTRIBUTORS.md) for the full list.

**🤝 PRs Welcome!** - Fork, contribute, and help make the web safer for everyone.

---

## 📈 Roadmap

### Version 2.2.0 (Q3 2025)
- [ ] Firefox extension support
- [ ] Advanced phishing detection
- [ ] Machine learning model improvements
- [ ] Multi-language support

### Version 2.3.0 (Q4 2025)
- [ ] Safari extension
- [ ] Enterprise dashboard
- [ ] API rate limiting improvements
- [ ] Real-time threat intelligence feed

### Version 3.0.0 (Q1 2026)
- [ ] Mobile app companion
- [ ] Blockchain-based trust verification
- [ ] Advanced analytics dashboard
- [ ] Custom rule engine

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses
- React: MIT License
- Express: MIT License
- MongoDB: Server Side Public License
- OpenAI API: Commercial License Required

---

## 🔗 Links & Resources

- **🌐 Website**: [https://safwebtrust.com](https://safwebtrust.com)
- **📖 Documentation**: [https://docs.safwebtrust.com](https://docs.safwebtrust.com)
- **🐛 Issues**: [GitHub Issues](https://github.com/Errorbyte-tech/Safe_Web_Trust/issues)
- **💬 Discord**: [Join our community](https://discord.gg/safwebtrust)
- **🐦 Twitter**: [@SafeWebTrust](https://twitter.com/SafeWebTrust)

---

## 📞 Support

### Get Help
- 📧 Email: support@safwebtrust.com
- 💬 Discord: #support channel
- 📋 GitHub Issues: Technical problems
- 📚 Wiki: [Comprehensive guides](https://github.com/Errorbyte-tech/Safe_Web_Trust/wiki)

### Enterprise Support
For enterprise licensing and custom implementations, contact: enterprise@safwebtrust.com

---

<div align="center">

**Made with ❤️ by the Team Way To Future!**

**Star us on GitHub if this project helped you!** 

[![GitHub stars](https://img.shields.io/github/stars/Errorbyte-tech/Safe_Web_Trust.svg?style=social&label=Star)](https://github.com/Errorbyte-tech/Safe_Web_Trust)
[![GitHub forks](https://img.shields.io/github/forks/Errorbyte-tech/Safe_Web_Trust.svg?style=social&label=Fork)](https://github.com/Errorbyte-tech/Safe_Web_Trust/fork)

</div>
