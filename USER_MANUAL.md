# User Manual - Route Educational Platform

## Table of Contents

1. [Getting Started](#getting-started)
2. [Server.js - Main Application Server](#serverjs---main-application-server)
3. [Student Features](#student-features)
4. [Instructor Features](#instructor-features)
5. [Document Store System](#document-store-system)
6. [File Upload and Management](#file-upload-and-management)
7. [URL Shortening Service](#url-shortening-service)
8. [Real-time Collaboration](#real-time-collaboration)
9. [State Machine Workflows](#state-machine-workflows)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### What is the Route Platform?

The Route Educational Platform is a comprehensive web application designed for academic environments, specifically for computer science courses. It provides tools for:

- **Document Management**: Store and retrieve JSON documents with powerful querying
- **File Sharing**: Upload and manage files with automatic processing
- **Real-time Collaboration**: Work together using WebSockets and MQTT messaging
- **Student Tracking**: Attendance, project management, and academic workflows
- **URL Management**: Shorten and track URLs for easy sharing

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for cloud features
- GitHub account (for student authentication)

### Accessing the Platform

1. **Web Interface**: Navigate to your institution's deployment URL
2. **Student Dashboard**: Visit `/auth` to access your personalized interface
3. **Attendance**: Use `/attent` for automatic attendance recording

---

## Server.js - Main Application Server

The `server.js` file is the heart of the Route platform, providing all backend functionality through a robust Node.js/Koa.js application.

### Core Server Features

#### 🌐 **Web Server Configuration**
- **HTTP Server**: Default port 8080
- **HTTPS Server**: Default port 8443 with SSL certificate support
- **CORS Support**: Configured for cross-origin requests from frontend applications
- **Static File Serving**: Serves HTML, CSS, JavaScript, and uploaded files

#### 📊 **Database Integration**
- **PostgreSQL Backend**: Primary database with JSONB support for flexible document storage
- **Connection Management**: Automatic connection handling with environment-based configuration
- **Schema Support**: Structured tables for documents, URLs, and user data

#### 🔧 **Middleware Stack**
The server implements several middleware layers:
- **Body Parsing**: JSON and form data handling
- **CORS Configuration**: Cross-origin resource sharing
- **Error Handling**: Comprehensive error responses and logging
- **Static File Serving**: Automatic file serving with proper MIME types

### API Endpoints Reference

#### **Document Store Endpoints**

**GET /data/{path}**
- **Purpose**: Retrieve documents from the database
- **Parameters**:
  - `path`: Document path (e.g., `students/john_doe`, `projects/assignment1`)
  - `q`: JSONPath query for selective data retrieval (optional)
- **Example**:
  ```bash
  GET /data/students/john_doe
  GET /data/projects?q=$.status
  ```
- **Response**: JSON document or filtered data

**POST /data/{path}**
- **Purpose**: Store new documents
- **Body**: JSON data to store
- **Example**:
  ```json
  {
    "student_id": "john_doe",
    "assignment": "project1",
    "status": "completed"
  }
  ```

**PUT /data/{path}**
- **Purpose**: Merge data with existing documents
- **Body**: JSON data to merge
- **Behavior**: Combines new data with existing document

#### **File Upload Endpoints**

**POST /upload**
- **Purpose**: Upload and extract ZIP files
- **Features**:
  - Automatic ZIP extraction
  - File size limit: 1GB
  - Stores extracted files in organized directories
- **Usage**: Upload project submissions, resources, or course materials

**POST /uploads3**
- **Purpose**: Upload files directly to AWS S3
- **Features**:
  - Cloud storage integration
  - Public URL generation
  - Permanent file hosting
- **Returns**: Public S3 URL for uploaded file

**POST /appload**
- **Purpose**: Deploy applications from ZIP files
- **Features**:
  - Extracts ZIP contents
  - Runs `npm install` automatically
  - Sets up ready-to-run applications
- **Use Case**: Deploy student web applications

#### **URL Shortening Endpoints**

**POST /shorten**
- **Purpose**: Create shortened URLs
- **Body**:
  ```json
  {
    "url": "https://example.com/very-long-url",
    "student": "john_doe"
  }
  ```
- **Returns**: Shortened URL code
- **Features**: Student tracking, access counting

**GET /s/{code}**
- **Purpose**: Redirect to original URL
- **Example**: `GET /s/ABC123` redirects to original URL
- **Features**: Access tracking, student parameter passing

#### **Educational Endpoints**

**GET /auth**
- **Purpose**: Generate student authentication dashboard
- **Features**:
  - Personalized student interface
  - GitHub integration
  - Action buttons for common tasks
- **Usage**: Students access their personal dashboard

**GET /attent**
- **Purpose**: Record student attendance
- **Features**:
  - Automatic timestamp recording
  - Student identification
  - Attendance tracking database
- **Usage**: Students visit to mark attendance

#### **Real-time Endpoints**

**GET /ws**
- **Purpose**: WebSocket connection for real-time communication
- **Features**:
  - Bidirectional messaging
  - Real-time updates
  - Event broadcasting
- **Usage**: Live collaboration, instant notifications

### Server Configuration

#### **Environment Variables**
The server requires configuration through environment variables:

```env
# Database Configuration
EDDY_DB_URL=postgresql://user:pass@host:port/db
CLASS_DB_URL=postgresql://user:pass@host:port/class_db

# Server Ports
HTTP_PORT=8080
HTTPS_PORT=8443

# Domain Configuration
BASE_URL=https://your-domain.com

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# MQTT Configuration
MQTT_SERVER=mqtt://localhost:1883
MQTT_USER=mqtt-username
MQTT_PASS=mqtt-password

# SSL Configuration (Production)
SSL_KEY_PATH=/path/to/ssl/private.key
SSL_CERT_PATH=/path/to/ssl/certificate.crt
```

#### **Database Tables**
The server manages several database tables:

1. **document_store**: JSON document storage with paths
2. **short_urls**: URL shortening mappings and access tracking
3. **mqtt_user**: MQTT broker authentication
4. **mqtt_acl**: MQTT access control permissions

#### **Modular Architecture**
The server uses a modular design with separate modules for:
- **Data Module**: Document store operations
- **MQTT Module**: Real-time messaging
- **S3 Module**: File storage operations
- **ShortUrl Module**: URL shortening logic
- **XState Module**: State machine workflows

---

## Student Features

### Personal Dashboard (/auth)

Your personal dashboard is accessible at `/auth` and provides:

#### **Quick Actions**
- **Setup Presentation**: Prepare for class presentations
- **Log Time**: Record time spent on assignments
- **Record Attendance**: Mark your attendance for class
- **View Git Contributions**: See your GitHub activity
- **Vote on Presentations**: Participate in peer evaluations
- **Review Attendance**: Check your attendance history

#### **GitHub Integration**
- Enter your GitHub username to connect your account
- View commit history and contribution statistics
- Track project progress through Git activity

### Attendance System

#### **Recording Attendance**
1. Navigate to `/attent` during class time
2. Your attendance is automatically recorded with timestamp
3. View attendance history in your dashboard

#### **Attendance Tracking**
- Automatic timestamp recording
- Integration with course schedule
- Attendance history and statistics

### Project Management

#### **File Submissions**
1. **Upload Project Files**:
   - Use the file upload interface
   - Supports ZIP files for multiple file submissions
   - Automatic extraction and organization

2. **Application Deployment**:
   - Upload ZIP files containing web applications
   - Automatic `npm install` and setup
   - Live deployment for web projects

#### **Document Collaboration**
- Store project data in the document store
- Share documents with team members
- Real-time collaboration through MQTT messaging

---

## Instructor Features

### Student Management

#### **Student Data Access**
- View all student submissions through the document store
- Track individual student progress
- Monitor attendance patterns

#### **Team Management**
- Organize students into teams
- Track team project progress
- Facilitate team collaboration

### Real-time Classroom Features

#### **Live Sessions**
- Use MQTT messaging for live Q&A
- Broadcast announcements to all students
- Monitor real-time student activity

#### **Presentation Management**
- Students can set up presentations through their dashboard
- Vote collection for student presentations
- Real-time feedback and interaction

### Data Export and Analysis

#### **Document Export**
- Export all course data using `/docs/export`
- Generate reports for grading
- Analyze student engagement patterns

---

## Document Store System

### Overview
The document store provides a flexible JSON database for storing any type of structured data.

### Document Paths
Documents are organized using hierarchical paths:
- `students/john_doe/profile` - Student profile information
- `projects/assignment1/submissions` - Assignment submissions
- `teams/team_alpha/members` - Team membership data

### Operations

#### **Storing Data**
```bash
POST /data/students/john_doe
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "major": "Computer Science"
}
```

#### **Retrieving Data**
```bash
GET /data/students/john_doe
```

#### **Filtering with JSONPath**
```bash
GET /data/students?q=$.name
GET /data/projects?q=$.status[?(@=="completed")]
```

#### **Merging Data**
```bash
PUT /data/students/john_doe
Content-Type: application/json

{
  "year": "Senior",
  "gpa": 3.8
}
```

### Use Cases
- **Student Profiles**: Store and update student information
- **Assignment Tracking**: Monitor project progress and submissions
- **Course Data**: Manage course materials and schedules
- **Collaboration**: Share data between team members

---

## File Upload and Management

### Upload Types

#### **ZIP File Upload (/upload)**
- **Purpose**: Upload and extract compressed project files
- **Process**:
  1. Select ZIP file through web interface
  2. File is uploaded and automatically extracted
  3. Contents are organized in structured directories
  4. Access extracted files through file browser

#### **S3 Cloud Upload (/uploads3)**
- **Purpose**: Upload files to cloud storage
- **Features**:
  - Permanent cloud hosting
  - Public URL generation
  - High availability and performance
- **Use Cases**: Images, documents, large files

#### **Application Deployment (/appload)**
- **Purpose**: Deploy web applications
- **Process**:
  1. Upload ZIP file containing web application
  2. Automatic extraction and npm dependency installation
  3. Application becomes accessible through web interface
- **Supported**: Node.js applications, static sites, React apps

### File Management

#### **File Organization**
- Uploaded files are organized by date and user
- Automatic directory creation and management
- File type detection and proper handling

#### **Access Control**
- Files are associated with uploading user
- Secure access through authentication
- Public URLs for sharing when appropriate

---

## URL Shortening Service

### Creating Short URLs

#### **Basic Shortening**
```bash
POST /shorten
Content-Type: application/json

{
  "url": "https://github.com/student/project-repo"
}
```

#### **Student-Tracked URLs**
```bash
POST /shorten
Content-Type: application/json

{
  "url": "https://example.com/assignment-instructions",
  "student": "john_doe"
}
```

### Using Short URLs

#### **Access Short URL**
- Visit `/s/{code}` to be redirected to the original URL
- Example: `/s/ABC123` redirects to the full URL

#### **Tracking Features**
- Access count tracking
- Student parameter preservation
- Analytics for link usage

### Use Cases
- **Assignment Links**: Shorten long assignment URLs
- **Resource Sharing**: Create easy-to-remember links
- **Student Tracking**: Monitor which students access resources
- **Social Sharing**: Share course materials efficiently

---

## Real-time Collaboration

### WebSocket Communication

#### **Connecting to WebSocket**
```javascript
const ws = new WebSocket('wss://your-domain.com/ws');

ws.onopen = () => {
  console.log('Connected to real-time server');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

#### **Sending Messages**
```javascript
ws.send(JSON.stringify({
  type: 'document_update',
  path: 'projects/team_alpha',
  data: { status: 'in_progress' }
}));
```

### MQTT Messaging

#### **Topic Structure**
- `load/{path}` - Request to load document
- `save/{path}` - Request to save document
- `data/{path}` - Document data updates
- `xstate/chart/{id}/event` - State machine events

#### **Subscribing to Updates**
Students and instructors can subscribe to specific topics to receive real-time updates about:
- Document changes
- Assignment submissions
- Team activity
- Presentation updates

### Collaboration Features

#### **Real-time Document Editing**
- Multiple users can edit documents simultaneously
- Changes are broadcast to all connected users
- Conflict resolution for concurrent edits

#### **Live Q&A Sessions**
- Students can submit questions through MQTT
- Instructors can respond in real-time
- Question queuing and moderation

#### **Team Collaboration**
- Team members receive instant updates
- Shared workspace for project coordination
- Real-time progress tracking

---

## State Machine Workflows

### XState Integration

The platform uses XState v5 for managing complex educational workflows and processes.

#### **State Machine Features**
- **Persistent State**: Machine states are stored in the database
- **Event Processing**: Handle complex educational workflows
- **MQTT Integration**: State changes trigger real-time updates

#### **Common Workflows**
- **Assignment Lifecycle**: Draft → Review → Submission → Grading → Complete
- **Presentation Flow**: Setup → Present → Vote → Results
- **Team Formation**: Individual → Recruitment → Team → Project

### Using State Machines

#### **Sending Events**
```bash
POST /xstate/chart/assignment_123/event
Content-Type: application/json

{
  "type": "SUBMIT",
  "data": {
    "student": "john_doe",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

#### **Monitoring State Changes**
Subscribe to MQTT topic: `xstate/chart/assignment_123/state`

### Educational Use Cases

#### **Assignment Management**
- Track assignment progress through defined states
- Automatic notifications at each stage
- Deadline enforcement and reminders

#### **Grading Workflows**
- Structured grading process
- Peer review integration
- Automated grade distribution

---

## Troubleshooting

### Common Issues

#### **Cannot Access Dashboard**
1. Ensure you're using the correct URL (`/auth`)
2. Check that you have a GitHub username configured
3. Verify your browser allows cookies and JavaScript

#### **File Upload Failures**
1. Check file size (maximum 1GB)
2. Ensure stable internet connection
3. Verify file format is supported (ZIP for multiple files)

#### **Real-time Features Not Working**
1. Check WebSocket connection in browser developer tools
2. Verify firewall settings allow WebSocket connections
3. Ensure MQTT broker is properly configured

#### **Document Store Issues**
1. Verify correct path format (no leading slash)
2. Check JSON syntax for POST/PUT requests
3. Ensure proper Content-Type header for API requests

### Getting Help

#### **For Students**
1. Check with your instructor for course-specific help
2. Review this user manual for detailed instructions
3. Use the platform's built-in help features

#### **For Instructors**
1. Check server logs for detailed error information
2. Verify environment configuration
3. Ensure database and external services are running

#### **Technical Support**
1. Check the application logs for error details
2. Verify all required environment variables are set
3. Ensure database connectivity and permissions

### Performance Tips

#### **Document Store**
- Use specific paths rather than broad queries
- Limit JSONPath query complexity
- Consider document size for large datasets

#### **File Uploads**
- Compress files when possible
- Use appropriate upload endpoint for file type
- Monitor upload progress for large files

#### **Real-time Features**
- Limit subscription to necessary topics only
- Handle connection reconnection gracefully
- Implement proper error handling for WebSocket connections

---

## Best Practices

### For Students
1. **Regular Attendance**: Use the attendance feature consistently
2. **Document Organization**: Use clear, descriptive paths for document storage
3. **File Management**: Organize uploaded files with meaningful names
4. **Collaboration**: Participate actively in real-time sessions

### For Instructors
1. **Data Management**: Regularly export and backup course data
2. **Monitoring**: Use real-time features to track student engagement
3. **Communication**: Leverage MQTT messaging for course announcements
4. **Organization**: Establish clear naming conventions for documents and files

### For Developers
1. **API Usage**: Follow RESTful principles when using the document store
2. **Error Handling**: Implement proper error handling for all API calls
3. **Real-time**: Use appropriate MQTT topics for different types of communication
4. **Security**: Never expose sensitive data through the API endpoints