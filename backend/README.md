# PFM Backend

Simple authentication backend with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running on your local machine, or update the `MONGODB_URI` in `.env` file.

3. Update the `.env` file with your configuration:
```
MONGODB_URI=mongodb://localhost:27017/pfm-auth
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
```

4. Start the server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (protected route)

## Usage

The server will run on `http://localhost:5000` by default.

Make sure your frontend is configured to make requests to this URL.