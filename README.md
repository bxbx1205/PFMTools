# PFM Tools - Personal Finance Manager# PFM Tools - Personal Finance Manager# PFM Tools - Personal Financial Management System



A comprehensive personal financial management system with AI-powered spending predictions, expense tracking, and automated reporting.



## Quick StartA comprehensive personal financial management system with AI-powered spending predictions, expense tracking, and automated reporting.A comprehensive personal financial management application with AI-powered predictions and automated reporting.



**One-Click Launch:**

```

Double-click: run.bat## Quick Start## Features

```



That's it! The script will:

- Check for Node.js and Python**One-Click Launch:**- **Expense Tracking**: Daily expense tracking with multiple categories

- Install any missing dependencies

- Start all three services (Backend, Frontend, ML)```- **AI Predictions**: Machine learning-based weekly spending predictions

- Open the application in your browser

Double-click: run.bat- **Email Reports**: Automated weekly financial reports via email

## Prerequisites (Install Once)

```- **Dashboard Analytics**: Real-time financial insights and visualizations

1. **Node.js v14+** - https://nodejs.org/

2. **Python v3.8+** - https://www.python.org/- **User Authentication**: Secure login with JWT authentication

3. **MongoDB** - https://www.mongodb.com/

That's it! The application will:- **Multi-platform Support**: Web application with responsive design

## Setup (First Time)

- Check and install any missing dependencies

1. Install all prerequisites above

2. Copy `backend\.env.example` to `backend\.env`- Start all three services automatically## System Components

3. (Optional) Update `MONGODB_URI` if using remote database

4. Double-click `run.bat`- Open the frontend in your browser



## Usage (Every Time)### Backend (Node.js/Express)



Simply double-click `run.bat` - that's all!## System Components- RESTful API server running on port 5000



## Access Points- MongoDB database integration



- **Frontend Web App**: http://localhost:30001. **Frontend (Next.js)** - Port 3000- JWT authentication system

- **Backend API**: http://localhost:5000

- **ML Service**: http://localhost:8000   - Web interface for user interactions- Email service integration with Nodemailer



## Features   - Expense tracking and dashboard



✓ Personal Expense Tracking     - Responsive design### Frontend (Next.js/React)

✓ AI-Powered Spending Predictions  

✓ Weekly Email Financial Reports  - Modern web application running on port 3000

✓ Dashboard Analytics  

✓ Debt/Loan Management  2. **Backend API (Node.js/Express)** - Port 5000- Responsive design with gradient themes

✓ User Authentication (JWT)  

✓ Responsive Web Design     - RESTful API- Interactive dashboards and forms



## System Components   - User authentication (JWT)- Real-time data visualization



- **Backend**: Node.js/Express REST API on Port 5000   - Database operations

- **Frontend**: Next.js React Web App on Port 3000

- **ML Service**: Python/Flask Prediction Service on Port 8000   - Email notifications### ML Service (Python/Flask)



## Environment Configuration- Machine learning prediction service on port 8000



Edit `backend\.env`:3. **ML Service (Python/Flask)** - Port 8000- Expense pattern analysis and forecasting



```env   - Expense prediction engine- Category-based spending predictions

PORT=5000

MONGODB_URI=mongodb://localhost:27017/pfm-tools   - Pattern analysis- Data validation and quality checks

JWT_SECRET=your-jwt-secret-key

EMAIL_USER=your-email@gmail.com   - Forecasting

EMAIL_PASS=your-app-password

```## Quick Start



## Troubleshooting## Prerequisites



**"Node is not recognized"****One-Click Start:**

→ Install Node.js with "Add to PATH" checked, then restart Command Prompt

Install once, then just use `run.bat`:

**"Python is not recognized"**

→ Install Python with "Add Python to PATH" checked, then restart Command PromptDouble-click `run.bat` or run in command prompt:



**"Cannot connect to MongoDB"**1. **Node.js** - https://nodejs.org/ (v14+)

→ Ensure MongoDB is running locally OR update MONGODB_URI in backend\.env

2. **Python** - https://www.python.org/ (v3.8+)```batch

**"Port already in use"**

→ Close other applications using ports 3000, 5000, or 80003. **MongoDB** - https://www.mongodb.com/ (local or remote)run.bat



## Stopping Services```



Close any service window to stop that service. Close all windows to stop the entire system.## Setup Instructions



---**What it does:**



**Version**: 1.0.0  ### First-Time Setup1. 🚀 Starts all three services (Backend, Frontend, ML)

**Last Updated**: October 2025

2. 🌐 Opens the application in your browser automatically

1. **Install Prerequisites**3. 📊 Displays all service URLs and status

   - Node.js

   - Python**Prerequisites (install once):**

   - MongoDB- Python 3.8+ (with pip)

- Node.js 14+ (with npm)

2. **Configure Environment**- MongoDB (running locally)

   - Copy `backend/.env.example` to `backend/.env`

   - Update database connection and API keys as needed**First-time setup:**

```bash

3. **Run the Application**# Install Python dependencies

   - Double-click `run.bat`cd ml-services

pip install flask flask-cors requests

### Subsequent Runs

# Install Node.js dependencies

Just double-click `run.bat` - all dependencies will be detected automatically!cd ../backend

npm install

## Environment Configuration

cd ../frontend/my-app

Create or edit `backend/.env`:npm install

```

```env

PORT=5000**That's it!** After first-time setup, just use `run.bat` for instant startup.

MONGODB_URI=mongodb://localhost:27017/pfm-tools

JWT_SECRET=your-secret-key-here## Application URLs

EMAIL_USER=your-email@gmail.com

EMAIL_PASS=your-app-password- **Frontend**: http://localhost:3000

```- **Backend API**: http://localhost:5000  

- **ML Service**: http://localhost:8000

## Access Points

## Prerequisites

- **Frontend**: http://localhost:3000

- **Backend API**: http://localhost:5000- Node.js (v14 or higher)

- **ML Service**: http://localhost:8000- Python (v3.8 or higher)

- MongoDB (running locally or remote connection)

## Features

## Environment Setup

- 📊 Real-time expense tracking

- 🤖 AI-powered spending predictionsCreate `.env` file in the backend directory:

- 💼 Debt management

- 📈 Financial analytics and reports```env

- 📧 Email notificationsPORT=5000

- 🔐 Secure authenticationMONGODB_URI=mongodb://localhost:27017/pfm-tools

- 💾 MongoDB data persistenceJWT_SECRET=your-jwt-secret-key

EMAIL_USER=your-email@gmail.com

## TroubleshootingEMAIL_PASS=your-app-password

```

### Services Won't Start

## Technology Stack

1. **Check Node.js**: `node --version`

2. **Check Python**: `python --version`- **Frontend**: Next.js, React, Tailwind CSS

3. **Check MongoDB**: Ensure it's running- **Backend**: Node.js, Express, MongoDB, Mongoose

4. **Check Ports**: Ensure ports 3000, 5000, 8000 are available- **ML Service**: Python, Flask, Scikit-learn, Pandas

- **Authentication**: JWT tokens

### Dependencies Issues- **Email**: Nodemailer with Gmail SMTP

- **Database**: MongoDB with user profiles, expenses, and predictions

The `run.bat` will auto-install missing packages. If issues persist:

## System Architecture

```bash

# Backend dependencies```

cd backendFrontend (Next.js) ← → Backend (Express) ← → ML Service (Flask)

npm install       ↓                      ↓

   Browser UI            MongoDB Database

# Frontend dependencies```

cd ../frontend/my-app

npm install## Data Models



# Python dependencies- **User**: Authentication and profile information

cd ../../ml-services- **Expense**: Daily expense tracking with categories

pip install -r requirements.txt- **Prediction**: AI-generated spending forecasts

```- **Debt**: Loan and debt management

- **Transaction**: Financial transaction history

### MongoDB Connection

## Security Features

Ensure MongoDB is running:

- **Local**: `mongod` command- JWT-based authentication

- **Remote**: Update `MONGODB_URI` in `.env`- Input validation and sanitization

- CORS protection

## Stopping Services- Environment variable configuration

- Secure email handling

Close any of the three command windows to stop that service. Close all to stop the entire system.

## Development

## Project Structure

The system supports development mode with hot reloading:

```- Frontend: Automatic code reloading

PFMTools/- Backend: Nodemon for server restart

├── backend/           # Node.js/Express API server- ML Service: Flask development server

├── frontend/my-app/   # Next.js web application

├── ml-services/       # Python/Flask ML service## Production Deployment

└── run.bat            # One-click start script

```For production deployment:

1. Set environment variables appropriately

## Support2. Use process managers (PM2 for Node.js)

3. Configure reverse proxy (Nginx)

- Check service logs in their respective windows4. Set up SSL certificates

- Verify all prerequisites are installed5. Configure production database

- Ensure environment variables are correctly configured

## Support

---

For issues or questions, check the logs directory for detailed error information and ensure all prerequisites are properly installed.
**Version**: 1.0.0
**Last Updated**: October 2025
