# PFM Tools - Personal Financial Management System

A comprehensive personal financial management application with AI-powered predictions and automated reporting.

## Features

- **Expense Tracking**: Daily expense tracking with multiple categories
- **AI Predictions**: Machine learning-based weekly spending predictions
- **Email Reports**: Automated weekly financial reports via email
- **Dashboard Analytics**: Real-time financial insights and visualizations
- **User Authentication**: Secure login with JWT authentication
- **Multi-platform Support**: Web application with responsive design

## System Components

### Backend (Node.js/Express)
- RESTful API server running on port 5000
- MongoDB database integration
- JWT authentication system
- Email service integration with Nodemailer

### Frontend (Next.js/React)
- Modern web application running on port 3000
- Responsive design with gradient themes
- Interactive dashboards and forms
- Real-time data visualization

### ML Service (Python/Flask)
- Machine learning prediction service on port 8000
- Expense pattern analysis and forecasting
- Category-based spending predictions
- Data validation and quality checks

## Quick Start

**One-Click Start:**

Double-click `run.bat` or run in command prompt:

```batch
run.bat
```

**What it does:**
1. 🚀 Starts all three services (Backend, Frontend, ML)
2. 🌐 Opens the application in your browser automatically
3. 📊 Displays all service URLs and status

**Prerequisites (install once):**
- Python 3.8+ (with pip)
- Node.js 14+ (with npm)
- MongoDB (running locally)

**First-time setup:**
```bash
# Install Python dependencies
cd ml-services
pip install flask flask-cors requests

# Install Node.js dependencies
cd ../backend
npm install

cd ../frontend/my-app
npm install
```

**That's it!** After first-time setup, just use `run.bat` for instant startup.

## Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000  
- **ML Service**: http://localhost:8000

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB (running locally or remote connection)

## Environment Setup

Create `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pfm-tools
JWT_SECRET=your-jwt-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **ML Service**: Python, Flask, Scikit-learn, Pandas
- **Authentication**: JWT tokens
- **Email**: Nodemailer with Gmail SMTP
- **Database**: MongoDB with user profiles, expenses, and predictions

## System Architecture

```
Frontend (Next.js) ← → Backend (Express) ← → ML Service (Flask)
       ↓                      ↓
   Browser UI            MongoDB Database
```

## Data Models

- **User**: Authentication and profile information
- **Expense**: Daily expense tracking with categories
- **Prediction**: AI-generated spending forecasts
- **Debt**: Loan and debt management
- **Transaction**: Financial transaction history

## Security Features

- JWT-based authentication
- Input validation and sanitization
- CORS protection
- Environment variable configuration
- Secure email handling

## Development

The system supports development mode with hot reloading:
- Frontend: Automatic code reloading
- Backend: Nodemon for server restart
- ML Service: Flask development server

## Production Deployment

For production deployment:
1. Set environment variables appropriately
2. Use process managers (PM2 for Node.js)
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates
5. Configure production database

## Support

For issues or questions, check the logs directory for detailed error information and ensure all prerequisites are properly installed.