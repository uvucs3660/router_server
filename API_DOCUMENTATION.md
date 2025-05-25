# API Documentation - Route Educational Platform

## Overview

The Route platform provides a comprehensive RESTful API for document management, file operations, URL shortening, and real-time communication. This documentation covers all available endpoints, parameters, and usage examples.

## Base URL

```
HTTP:  http://your-domain.com:8080
HTTPS: https://your-domain.com:8443
```

## Authentication

The platform uses multiple authentication methods:
- **Student Authentication**: GitHub username-based authentication
- **MQTT Authentication**: Username/password for real-time messaging
- **Session-based**: Browser session management

## Content Types

All API endpoints support:
- `application/json` for JSON data
- `multipart/form-data` for file uploads
- `text/plain` for simple text responses

---

## Document Store API

The Document Store provides a flexible JSON database with JSONPath query support.

### Get Document

Retrieve documents from the database with optional filtering.

```http
GET /data/{path}
```

#### Parameters

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `path` | string | URL | Document path (e.g., `students/john_doe`) |
| `q` | string | Query | JSONPath query for data filtering |

#### Examples

**Basic Document Retrieval**
```bash
GET /data/students/john_doe
```

**Response:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "major": "Computer Science",
  "year": "Senior"
}
```

**Filtered Data with JSONPath**
```bash
GET /data/students/john_doe?q=$.name
```

**Response:**
```json
"John Doe"
```

**Complex JSONPath Query**
```bash
GET /data/projects?q=$.assignments[?(@.status=="completed")]
```

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | Success - Document found |
| 404 | Document not found |
| 400 | Invalid JSONPath query |
| 500 | Server error |

### Store Document

Store new documents in the database.

```http
POST /data/{path}
Content-Type: application/json
```

#### Parameters

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `path` | string | URL | Document storage path |
| `body` | object | Body | JSON data to store |

#### Example

```bash
POST /data/students/jane_smith
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "major": "Mathematics",
  "year": "Junior",
  "gpa": 3.7
}
```

#### Response Codes

| Code | Description |
|------|-------------|
| 201 | Document created successfully |
| 400 | Invalid JSON data |
| 409 | Document already exists |
| 500 | Server error |

### Merge Document

Merge new data with existing documents.

```http
PUT /data/{path}
Content-Type: application/json
```

#### Parameters

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `path` | string | URL | Document path to merge |
| `body` | object | Body | JSON data to merge |

#### Example

```bash
PUT /data/students/jane_smith
Content-Type: application/json

{
  "gpa": 3.8,
  "graduation_year": 2024
}
```

#### Merge Behavior

- Existing fields are updated with new values
- New fields are added to the document
- Arrays and nested objects are merged recursively

#### Response Codes

| Code | Description |
|------|-------------|
| 200 | Document merged successfully |
| 201 | Document created (if didn't exist) |
| 400 | Invalid JSON data |
| 500 | Server error |

### Export Documents

Export all documents to the filesystem.

```http
GET /docs/export
```

#### Response

- Exports all documents to server filesystem
- Returns confirmation message
- Useful for data backup and analysis

---

## File Upload API

The platform supports multiple file upload methods for different use cases.

### ZIP File Upload

Upload and extract ZIP files with automatic processing.

```http
POST /upload
Content-Type: multipart/form-data
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | file | ZIP file to upload (max 1GB) |

#### Example

```bash
curl -X POST \
  -F "file=@project.zip" \
  https://your-domain.com/upload
```

#### Features

- **Automatic Extraction**: ZIP contents are extracted to organized directories
- **File Organization**: Files are stored with timestamp and user identification
- **Size Limit**: Maximum file size of 1GB
- **Format Support**: All ZIP-compatible formats

#### Response

```json
{
  "success": true,
  "message": "File uploaded and extracted successfully",
  "extractPath": "/uploads/2024/01/15/project_files/",
  "fileCount": 23
}
```

### S3 Cloud Upload

Upload files directly to AWS S3 cloud storage.

```http
POST /uploads3
Content-Type: multipart/form-data
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | file | File to upload to S3 |

#### Example

```bash
curl -X POST \
  -F "file=@document.pdf" \
  https://your-domain.com/uploads3
```

#### Features

- **Cloud Storage**: Files stored in AWS S3 for high availability
- **Public URLs**: Automatic generation of public access URLs
- **Permanent Hosting**: Files remain accessible indefinitely
- **CDN Integration**: Fast global access through AWS CloudFront

#### Response

```json
{
  "success": true,
  "url": "https://your-bucket.s3.amazonaws.com/uploads/document.pdf",
  "key": "uploads/document.pdf",
  "size": 245760
}
```

### Application Deployment

Deploy web applications from ZIP files with automatic setup.

```http
POST /appload
Content-Type: multipart/form-data
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | file | ZIP file containing web application |

#### Example

```bash
curl -X POST \
  -F "file=@webapp.zip" \
  https://your-domain.com/appload
```

#### Features

- **Automatic Extraction**: ZIP contents extracted to deployment directory
- **Dependency Installation**: Automatic `npm install` for Node.js projects
- **Live Deployment**: Applications become immediately accessible
- **Support**: Node.js, React, static HTML applications

#### Response

```json
{
  "success": true,
  "message": "Application deployed successfully",
  "deployPath": "/apps/webapp_20240115/",
  "url": "https://your-domain.com/apps/webapp_20240115/",
  "dependencies": ["express", "react", "lodash"]
}
```

---

## URL Shortening API

Create and manage shortened URLs with tracking capabilities.

### Create Short URL

Generate shortened URLs with optional student tracking.

```http
POST /shorten
Content-Type: application/json
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Original URL to shorten |
| `student` | string | No | Student ID for tracking |

#### Example

```bash
POST /shorten
Content-Type: application/json

{
  "url": "https://github.com/student/cs3660-project",
  "student": "john_doe"
}
```

#### Response

```json
{
  "success": true,
  "shortUrl": "ABC123",
  "fullUrl": "https://your-domain.com/s/ABC123",
  "originalUrl": "https://github.com/student/cs3660-project",
  "student": "john_doe",
  "created": "2024-01-15T10:30:00Z"
}
```

### Access Short URL

Redirect to the original URL through shortened link.

```http
GET /s/{shortCode}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `shortCode` | string | The generated short code |

#### Example

```bash
GET /s/ABC123
```

#### Behavior

- **Automatic Redirect**: 302 redirect to original URL
- **Access Tracking**: Records access time and frequency
- **Student Parameters**: Preserves student identification in redirect
- **Analytics**: Tracks usage patterns for reporting

#### Response

- **302 Redirect** to original URL
- **Student Parameter**: Added as query parameter if specified

### Domain-Specific Redirects

Access short URLs with specific domain context.

```http
GET /shortdom/{shortCode}/{domain}
```

#### Example

```bash
GET /shortdom/ABC123/github.com
```

#### Use Cases

- Domain-specific analytics
- Context-aware redirects
- Enhanced tracking capabilities

---

## Educational API

Specialized endpoints for educational features and student management.

### Student Authentication Dashboard

Generate personalized student dashboard with authentication.

```http
GET /auth
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `student` | string | GitHub username |
| `github` | string | GitHub username (alternative) |

#### Example

```bash
GET /auth?student=john_doe
```

#### Response

Returns HTML dashboard with:
- **Personal Actions**: Setup presentation, log time, record attendance
- **GitHub Integration**: View contributions and repository activity
- **Collaboration Tools**: Vote on presentations, team activities
- **Attendance History**: View and manage attendance records

#### Features

- **Credential Generation**: Automatic authentication setup
- **GitHub Integration**: Real-time repository data
- **Action Buttons**: Quick access to common student tasks
- **Responsive Design**: Mobile and desktop compatible

### Attendance Recording

Automatically record student attendance with timestamp.

```http
GET /attent
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `student` | string | Student identifier |

#### Example

```bash
GET /attent?student=john_doe
```

#### Response

```json
{
  "success": true,
  "student": "john_doe",
  "timestamp": "2024-01-15T10:30:00Z",
  "session": "lecture_2024_01_15",
  "message": "Attendance recorded successfully"
}
```

#### Features

- **Automatic Timestamping**: Records exact attendance time
- **Session Tracking**: Associates attendance with class sessions
- **Database Storage**: Persistent attendance records
- **Duplicate Prevention**: Prevents multiple entries per session

---

## Real-time Communication API

WebSocket and MQTT endpoints for real-time collaboration.

### WebSocket Connection

Establish real-time bidirectional communication.

```http
GET /ws
```

#### Connection

```javascript
const ws = new WebSocket('wss://your-domain.com/ws');

ws.onopen = function(event) {
  console.log('Connected to WebSocket server');
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received message:', data);
};

ws.onerror = function(error) {
  console.log('WebSocket error:', error);
};

ws.onclose = function(event) {
  console.log('WebSocket connection closed');
};
```

#### Message Format

**Outgoing Messages**
```json
{
  "type": "document_update",
  "path": "projects/team_alpha",
  "data": {
    "status": "in_progress",
    "last_modified": "2024-01-15T10:30:00Z"
  }
}
```

**Incoming Messages**
```json
{
  "type": "notification",
  "message": "Document updated",
  "path": "projects/team_alpha",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### MQTT Integration

The platform integrates with MQTT for pub/sub messaging.

#### Topic Structure

| Topic Pattern | Purpose | Example |
|---------------|---------|---------|
| `load/{path}` | Request document load | `load/students/john_doe` |
| `save/{path}` | Request document save | `save/projects/assignment1` |
| `data/{path}` | Document data updates | `data/teams/alpha/status` |
| `xstate/chart/{id}/event` | State machine events | `xstate/chart/workflow1/event` |
| `xstate/chart/{id}/state` | State updates | `xstate/chart/workflow1/state` |

#### Publishing Messages

```javascript
// Example: Request document load
mqtt.publish('load/students/john_doe', JSON.stringify({
  query: '$.assignments',
  requestId: 'req_123'
}));
```

#### Subscribing to Updates

```javascript
// Example: Subscribe to project updates
mqtt.subscribe('data/projects/+', function(topic, message) {
  const data = JSON.parse(message.toString());
  console.log('Project update:', data);
});
```

---

## State Machine API

XState integration for workflow management and complex educational processes.

### Send State Machine Event

Trigger events in XState workflows.

```http
POST /xstate/chart/{chartId}/event
Content-Type: application/json
```

#### Parameters

| Parameter | Type | Location | Description |
|-----------|------|----------|-------------|
| `chartId` | string | URL | State machine identifier |
| `type` | string | Body | Event type |
| `data` | object | Body | Event data |

#### Example

```bash
POST /xstate/chart/assignment_workflow/event
Content-Type: application/json

{
  "type": "SUBMIT",
  "data": {
    "student": "john_doe",
    "assignment": "project1",
    "files": ["main.js", "README.md"]
  }
}
```

#### Response

```json
{
  "success": true,
  "chartId": "assignment_workflow",
  "currentState": "submitted",
  "previousState": "in_progress",
  "event": "SUBMIT",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get State Machine Status

Retrieve current state of a workflow.

```http
GET /xstate/chart/{chartId}/state
```

#### Example

```bash
GET /xstate/chart/assignment_workflow/state
```

#### Response

```json
{
  "chartId": "assignment_workflow",
  "currentState": "submitted",
  "context": {
    "student": "john_doe",
    "assignment": "project1",
    "submitTime": "2024-01-15T10:30:00Z"
  },
  "actions": ["notify_instructor", "update_gradebook"],
  "transitions": ["GRADE", "RETURN", "APPROVE"]
}
```

### MQTT State Machine Integration

State machines publish updates to MQTT topics for real-time notifications.

#### State Update Topics

```
xstate/chart/{chartId}/state
```

**Message Format:**
```json
{
  "chartId": "assignment_workflow",
  "state": "submitted",
  "context": {...},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Action Topics

```
xstate/chart/{chartId}/action/{actionName}
```

**Message Format:**
```json
{
  "chartId": "assignment_workflow",
  "action": "notify_instructor",
  "data": {
    "student": "john_doe",
    "assignment": "project1"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Error Handling

### Standard Error Response

All API endpoints return consistent error responses:

```json
{
  "error": true,
  "message": "Detailed error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/endpoint",
  "details": {
    "additional": "context"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 413 | Payload Too Large | File size exceeds limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server maintenance or overload |

### Common Error Codes

| Error Code | Description | Resolution |
|------------|-------------|-----------|
| `INVALID_JSON` | Malformed JSON in request body | Check JSON syntax |
| `MISSING_PARAMETER` | Required parameter not provided | Include all required parameters |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit | Reduce file size or split upload |
| `INVALID_PATH` | Document path format incorrect | Use valid path format |
| `DATABASE_ERROR` | Database connection or query error | Check server status |
| `S3_ERROR` | AWS S3 operation failed | Verify AWS credentials |
| `MQTT_ERROR` | MQTT broker connection failed | Check MQTT configuration |

---

## Rate Limiting

The API implements rate limiting to ensure fair usage and system stability.

### Default Limits

| Endpoint Category | Requests per Minute | Burst Allowance |
|-------------------|-------------------|-----------------|
| Document Store | 100 | 20 |
| File Upload | 10 | 3 |
| URL Shortening | 50 | 10 |
| Real-time (WebSocket) | No limit | - |
| MQTT Publishing | 200 | 50 |

### Rate Limit Headers

Responses include rate limiting information:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642251600
X-RateLimit-Retry-After: 60
```

### Handling Rate Limits

When rate limited (HTTP 429), implement exponential backoff:

```javascript
async function apiCall(url, options, retries = 3) {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      if (retries > 0) {
        const retryAfter = response.headers.get('X-RateLimit-Retry-After');
        await new Promise(resolve => 
          setTimeout(resolve, (retryAfter || 60) * 1000)
        );
        return apiCall(url, options, retries - 1);
      }
    }
    
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

---

## SDK and Client Libraries

### JavaScript/Node.js SDK

```javascript
class RouteAPI {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.options = options;
  }

  async getDocument(path, query = null) {
    const url = `${this.baseUrl}/data/${path}${query ? `?q=${encodeURIComponent(query)}` : ''}`;
    const response = await fetch(url);
    return response.json();
  }

  async storeDocument(path, data) {
    const response = await fetch(`${this.baseUrl}/data/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async uploadFile(file, endpoint = 'upload') {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  async shortenUrl(url, student = null) {
    const response = await fetch(`${this.baseUrl}/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, student })
    });
    return response.json();
  }
}

// Usage
const api = new RouteAPI('https://your-domain.com');
const document = await api.getDocument('students/john_doe');
```

### Python Client

```python
import requests
import json

class RouteAPI:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def get_document(self, path, query=None):
        url = f"{self.base_url}/data/{path}"
        if query:
            url += f"?q={query}"
        response = requests.get(url)
        return response.json()
    
    def store_document(self, path, data):
        url = f"{self.base_url}/data/{path}"
        response = requests.post(url, json=data)
        return response.json()
    
    def upload_file(self, file_path, endpoint='upload'):
        url = f"{self.base_url}/{endpoint}"
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(url, files=files)
        return response.json()
    
    def shorten_url(self, url, student=None):
        url_endpoint = f"{self.base_url}/shorten"
        data = {'url': url}
        if student:
            data['student'] = student
        response = requests.post(url_endpoint, json=data)
        return response.json()

# Usage
api = RouteAPI('https://your-domain.com')
document = api.get_document('students/john_doe')
```

---

## Testing and Development

### API Testing with curl

#### Document Store Operations

```bash
# Store a document
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "major": "CS"}' \
  https://your-domain.com/data/students/john_doe

# Retrieve a document
curl https://your-domain.com/data/students/john_doe

# Query with JSONPath
curl "https://your-domain.com/data/students/john_doe?q=$.name"

# Merge document data
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"year": "Senior"}' \
  https://your-domain.com/data/students/john_doe
```

#### File Upload Testing

```bash
# Upload ZIP file
curl -X POST \
  -F "file=@project.zip" \
  https://your-domain.com/upload

# Upload to S3
curl -X POST \
  -F "file=@document.pdf" \
  https://your-domain.com/uploads3
```

#### URL Shortening Testing

```bash
# Create short URL
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/user/repo", "student": "john_doe"}' \
  https://your-domain.com/shorten

# Test redirect (will follow redirect)
curl -L https://your-domain.com/s/ABC123
```

### WebSocket Testing

```javascript
// Browser console testing
const ws = new WebSocket('wss://your-domain.com/ws');
ws.onopen = () => console.log('Connected');
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
ws.send(JSON.stringify({type: 'test', data: 'hello'}));
```

### MQTT Testing

```bash
# Subscribe to topics (using mosquitto_sub)
mosquitto_sub -h your-domain.com -t "data/+/+" -u mqtt_user -P mqtt_pass

# Publish test message
mosquitto_pub -h your-domain.com -t "data/test/message" -m '{"test": true}' -u mqtt_user -P mqtt_pass
```

---

## Performance and Optimization

### Best Practices

#### Document Store
- Use specific paths rather than broad queries
- Implement client-side caching for frequently accessed documents
- Use JSONPath queries to retrieve only needed data
- Consider document size and structure for optimal performance

#### File Uploads
- Compress files before uploading when possible
- Use appropriate upload endpoint for file type and use case
- Implement progress tracking for large file uploads
- Handle upload failures gracefully with retry logic

#### Real-time Communication
- Subscribe only to necessary MQTT topics
- Implement proper connection management and reconnection logic
- Use message throttling for high-frequency updates
- Handle WebSocket disconnections gracefully

#### API Usage
- Implement proper error handling and retry logic
- Use appropriate HTTP methods for different operations
- Respect rate limits and implement backoff strategies
- Cache responses when appropriate to reduce API calls

### Monitoring and Analytics

The platform provides built-in monitoring capabilities:

#### Request Metrics
- API endpoint usage statistics
- Response time monitoring
- Error rate tracking
- Rate limiting statistics

#### Real-time Metrics
- WebSocket connection counts
- MQTT message volume
- State machine execution tracking
- Document store operation metrics

#### Educational Analytics
- Student engagement tracking
- Assignment submission patterns
- Attendance analytics
- Collaboration activity monitoring