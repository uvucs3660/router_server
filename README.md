# Route Project - Educational Platform

A comprehensive full-stack web application designed for educational environments, featuring real-time collaboration, document management, file sharing, and student workflow automation.

## 🚀 Features

- **Document Store**: JSON-based document storage with PostgreSQL backend
- **File Management**: Upload, process, and store files with AWS S3 integration
- **URL Shortening**: Custom URL shortening service with tracking
- **Real-time Communication**: WebSocket and MQTT messaging
- **State Management**: XState workflows for complex educational processes
- **Student Management**: Authentication, attendance tracking, and project coordination
- **React Frontend**: Modern React application with Vite build system

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Docker Deployment](#docker-deployment)

## ⚡ Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- AWS S3 account (for file storage)
- MQTT broker (optional, for real-time features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd route
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../react-route
   npm install
   ```

3. **Database Setup**
   ```bash
   # Run the database creation script
   psql -d your_database -f server/create_db.sql
   ```

4. **Environment Configuration**
   ```bash
   # Create environment file
   cp server/.env.example server/.env
   # Edit with your configuration
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start
   
   # Terminal 2 - Frontend
   cd react-route
   npm run dev
   ```

## 🔧 Configuration

Create a `.env` file in the `/server/` directory:

```env
# Database Configuration
EDDY_DB_URL=postgresql://username:password@localhost:5432/database_name
CLASS_DB_URL=postgresql://username:password@localhost:5432/class_database

# Server Configuration
HTTP_PORT=8080
HTTPS_PORT=8443
BASE_URL=https://your-domain.com
NODE_ENV=development

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# MQTT Configuration (Optional)
MQTT_SERVER=mqtt://localhost:1883
MQTT_USER=mqtt_username
MQTT_PASS=mqtt_password

# SSL Configuration (Production)
SSL_KEY_PATH=/path/to/ssl/private.key
SSL_CERT_PATH=/path/to/ssl/certificate.crt
```

## 🚀 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📖 Usage

### For Students

1. **Access Your Dashboard**
   - Navigate to `/auth` to generate your personalized dashboard
   - Use your GitHub username for authentication

2. **Track Attendance**
   - Visit `/attent` to automatically record attendance
   - View attendance history in your dashboard

3. **Project Management**
   - Upload project files through the file upload interface
   - Access shared documents via the document store
   - Participate in real-time collaboration sessions

### For Instructors

1. **Student Management**
   - Monitor student activity through the document store
   - Track attendance and participation
   - Manage team assignments and projects

2. **Real-time Collaboration**
   - Use MQTT messaging for live sessions
   - Monitor state machine workflows
   - Facilitate group activities and presentations

## 📚 API Documentation

### Document Store API

**Get Document**
```http
GET /data/{path}?q={jsonpath_query}
```

**Store Document**
```http
POST /data/{path}
Content-Type: application/json

{
  "key": "value",
  "data": {...}
}
```

**Merge Document**
```http
PUT /data/{path}
Content-Type: application/json

{
  "additional": "data"
}
```

### File Upload API

**Upload ZIP File**
```http
POST /upload
Content-Type: multipart/form-data

file: <zip_file>
```

**Upload to S3**
```http
POST /uploads3
Content-Type: multipart/form-data

file: <file>
```

### URL Shortening API

**Create Short URL**
```http
POST /shorten
Content-Type: application/json

{
  "url": "https://example.com/long-url",
  "student": "optional_student_id"
}
```

**Access Short URL**
```http
GET /s/{short_code}
```

### Real-time Communication

**WebSocket Connection**
```javascript
const ws = new WebSocket('wss://your-domain.com/ws');
ws.onmessage = (event) => {
  console.log('Received:', event.data);
};
```

**MQTT Topics**
- `load/{path}` - Load document requests
- `save/{path}` - Save document requests
- `data/{path}` - Document data updates
- `xstate/chart/{id}/event` - State machine events

## 🛠 Development

### Backend Development

```bash
cd server
npm start  # Start the server with nodemon
```

### Frontend Development

```bash
cd react-route
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd react-route
npm test
```

## 🏗 Architecture

### Backend Structure
```
server/
├── config/          # Configuration modules
├── middleware/      # Koa middleware
├── modules/         # Core feature modules
│   ├── data/        # Document store
│   ├── mqtt/        # MQTT integration
│   ├── s3/          # AWS S3 operations
│   ├── shortUrl/    # URL shortening
│   └── xstate/      # State machine workflows
├── routes/          # API routes
└── utils/           # Utility functions
```

### Frontend Structure
```
react-route/
├── src/
│   ├── components/  # React components
│   ├── assets/      # Static assets
│   └── App.jsx      # Main application
└── public/          # Public assets
```

## 🔒 Security Features

- CORS configuration for cross-origin requests
- SSL/HTTPS support for production
- Environment-based configuration
- Input validation and sanitization
- Rate limiting middleware support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [User Manual](USER_MANUAL.md) for detailed usage instructions
- Review the [API Documentation](API_DOCUMENTATION.md) for technical details
- Create an issue in the repository for bugs or feature requests