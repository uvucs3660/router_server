# Installation Guide - Route Educational Platform

## Overview

This guide provides step-by-step instructions for installing and configuring the Route Educational Platform. The platform is designed for educational environments and supports multiple deployment options.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation Methods](#installation-methods)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [External Services](#external-services)
7. [Development Setup](#development-setup)
8. [Production Deployment](#production-deployment)
9. [Docker Deployment](#docker-deployment)
10. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 10 GB available space
- **Network**: Broadband internet connection

### Recommended Requirements

- **CPU**: 4 cores, 2.5 GHz or higher
- **RAM**: 8 GB or more
- **Storage**: 50 GB SSD storage
- **Network**: High-speed internet with low latency

### Supported Operating Systems

- **Linux**: Ubuntu 18.04+, CentOS 7+, Debian 9+
- **macOS**: 10.14 (Mojave) or later
- **Windows**: Windows 10, Windows Server 2019+

## Prerequisites

### Required Software

1. **Node.js** (v14 or higher)
   ```bash
   # Install Node.js using NodeSource repository (Linux)
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # macOS using Homebrew
   brew install node
   
   # Windows - Download from nodejs.org
   ```

2. **PostgreSQL** (v12 or higher)
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # macOS using Homebrew
   brew install postgresql
   brew services start postgresql
   
   # CentOS/RHEL
   sudo dnf install postgresql postgresql-server
   sudo postgresql-setup --initdb
   sudo systemctl start postgresql
   ```

3. **Git** (for source code management)
   ```bash
   # Ubuntu/Debian
   sudo apt install git
   
   # macOS (usually pre-installed)
   git --version
   
   # CentOS/RHEL
   sudo dnf install git
   ```

### Optional Software

1. **MQTT Broker** (Mosquitto recommended)
   ```bash
   # Ubuntu/Debian
   sudo apt install mosquitto mosquitto-clients
   
   # macOS using Homebrew
   brew install mosquitto
   
   # Start Mosquitto service
   sudo systemctl start mosquitto
   ```

2. **Docker & Docker Compose** (for containerized deployment)
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Nginx** (for reverse proxy in production)
   ```bash
   # Ubuntu/Debian
   sudo apt install nginx
   
   # macOS using Homebrew
   brew install nginx
   ```

## Installation Methods

### Method 1: Source Code Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/route-platform.git
   cd route-platform
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../react-route
   npm install
   ```

4. **Return to Project Root**
   ```bash
   cd ..
   ```

### Method 2: Docker Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/route-platform.git
   cd route-platform
   ```

2. **Build and Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Method 3: npm Installation (if packaged)

```bash
# Install globally
npm install -g route-platform

# Or install locally
npm install route-platform
```

## Configuration

### Environment Configuration

Create a `.env` file in the `/server/` directory:

```bash
cd server
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
EDDY_DB_URL=postgresql://username:password@localhost:5432/route_db
CLASS_DB_URL=postgresql://username:password@localhost:5432/route_class_db

# Alternative database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=route_db
DB_USER=route_user
DB_PASSWORD=secure_password

# Server Configuration
HTTP_PORT=8080
HTTPS_PORT=8443
BASE_URL=https://your-domain.com
NODE_ENV=production

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name

# MQTT Configuration
MQTT_SERVER=mqtt://localhost:1883
MQTT_USER=mqtt_username
MQTT_PASS=mqtt_password

# SSL/TLS Configuration (Production)
SSL_KEY_PATH=/path/to/ssl/private.key
SSL_CERT_PATH=/path/to/ssl/certificate.crt

# Optional: Custom Upload Directory
UPLOAD_DIR=/path/to/uploads

# Optional: Session Configuration
SESSION_SECRET=your_session_secret_key
```

### Configuration Options

#### Database Options

**Option 1: Full Database URL**
```env
EDDY_DB_URL=postgresql://user:pass@host:port/database
```

**Option 2: Individual Parameters**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=route_db
DB_USER=route_user
DB_PASSWORD=password
```

#### Server Options

```env
# Development
NODE_ENV=development
HTTP_PORT=8080

# Production
NODE_ENV=production
HTTP_PORT=80
HTTPS_PORT=443
```

#### AWS S3 Options

```env
# Required for file uploads
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# Optional: Custom bucket
S3_BUCKET=my-route-platform-bucket
```

## Database Setup

### PostgreSQL Installation and Configuration

1. **Install PostgreSQL** (if not already installed)
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # Start PostgreSQL service
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create Database User**
   ```bash
   sudo -u postgres psql
   ```
   
   In the PostgreSQL prompt:
   ```sql
   CREATE USER route_user WITH PASSWORD 'secure_password';
   CREATE DATABASE route_db OWNER route_user;
   CREATE DATABASE route_class_db OWNER route_user;
   GRANT ALL PRIVILEGES ON DATABASE route_db TO route_user;
   GRANT ALL PRIVILEGES ON DATABASE route_class_db TO route_user;
   \q
   ```

3. **Configure PostgreSQL Access**
   
   Edit `/etc/postgresql/13/main/pg_hba.conf` (adjust version number):
   ```
   # Add this line for local development
   local   all             route_user                              md5
   host    all             route_user      127.0.0.1/32            md5
   ```
   
   Restart PostgreSQL:
   ```bash
   sudo systemctl restart postgresql
   ```

4. **Run Database Schema**
   ```bash
   cd server
   psql -U route_user -d route_db -f create_db.sql
   ```

### Database Schema Details

The `create_db.sql` file creates the following tables:

- **document_store**: JSON document storage with JSONB
- **short_urls**: URL shortening mappings
- **blob_store**: Binary data storage
- **mqtt_user**: MQTT authentication
- **mqtt_acl**: MQTT access control

### Database Verification

Test the database connection:

```bash
# Test connection
psql -U route_user -d route_db -c "SELECT version();"

# Check tables
psql -U route_user -d route_db -c "\dt"
```

## External Services

### AWS S3 Setup

1. **Create AWS Account** (if needed)
   - Visit https://aws.amazon.com/
   - Create account and verify identity

2. **Create S3 Bucket**
   ```bash
   # Using AWS CLI
   aws s3 mb s3://your-route-platform-bucket
   
   # Set public read policy (optional)
   aws s3api put-bucket-policy --bucket your-route-platform-bucket --policy file://bucket-policy.json
   ```

3. **Create IAM User**
   - Go to AWS IAM Console
   - Create new user with programmatic access
   - Attach S3 permissions policy
   - Save access key and secret key

4. **Sample Bucket Policy** (`bucket-policy.json`)
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-route-platform-bucket/*"
       }
     ]
   }
   ```

### MQTT Broker Setup

1. **Install Mosquitto**
   ```bash
   # Ubuntu/Debian
   sudo apt install mosquitto mosquitto-clients
   
   # Start service
   sudo systemctl start mosquitto
   sudo systemctl enable mosquitto
   ```

2. **Configure Mosquitto**
   
   Edit `/etc/mosquitto/mosquitto.conf`:
   ```
   # Basic configuration
   listener 1883
   allow_anonymous false
   password_file /etc/mosquitto/passwd
   
   # WebSocket support (optional)
   listener 9001
   protocol websockets
   ```

3. **Create MQTT Users**
   ```bash
   # Create password file
   sudo mosquitto_passwd -c /etc/mosquitto/passwd mqtt_user
   
   # Restart Mosquitto
   sudo systemctl restart mosquitto
   ```

4. **Test MQTT Connection**
   ```bash
   # Subscribe to test topic
   mosquitto_sub -h localhost -t "test/topic" -u mqtt_user -P mqtt_password
   
   # Publish test message (in another terminal)
   mosquitto_pub -h localhost -t "test/topic" -m "Hello MQTT" -u mqtt_user -P mqtt_password
   ```

## Development Setup

### Local Development Environment

1. **Start Database**
   ```bash
   sudo systemctl start postgresql
   ```

2. **Start MQTT Broker** (if using)
   ```bash
   sudo systemctl start mosquitto
   ```

3. **Start Backend Server**
   ```bash
   cd server
   npm start
   # or for development with auto-reload
   npm run dev
   ```

4. **Start Frontend Development Server**
   ```bash
   cd react-route
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - WebSocket: ws://localhost:8080/ws

### Development Tools

1. **Install Development Dependencies**
   ```bash
   # In server directory
   cd server
   npm install --include=dev
   
   # In react-route directory
   cd ../react-route
   npm install --include=dev
   ```

2. **Available Scripts**
   
   **Backend** (`server/package.json`):
   ```bash
   npm start          # Start production server
   npm run dev        # Start with nodemon for development
   npm test           # Run tests
   npm run lint       # Run ESLint
   ```
   
   **Frontend** (`react-route/package.json`):
   ```bash
   npm run dev        # Start Vite development server
   npm run build      # Build for production
   npm run preview    # Preview production build
   npm run lint       # Run ESLint
   ```

### IDE Configuration

**VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "eslint.workingDirectories": ["server", "react-route"],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

## Production Deployment

### Server Preparation

1. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js (Production)**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Create Application User**
   ```bash
   sudo adduser --system --group --home /opt/route route
   ```

4. **Install Application**
   ```bash
   sudo -u route git clone https://github.com/your-org/route-platform.git /opt/route/app
   cd /opt/route/app
   sudo -u route npm install --production
   ```

### Process Management (PM2)

1. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

2. **Create PM2 Configuration**
   
   Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [
       {
         name: 'route-server',
         script: 'server.js',
         cwd: '/opt/route/app/server',
         user: 'route',
         env: {
           NODE_ENV: 'production',
           PORT: 8080
         },
         error_file: '/var/log/route/error.log',
         out_file: '/var/log/route/out.log',
         log_file: '/var/log/route/combined.log',
         time: true
       }
     ]
   };
   ```

3. **Start Application**
   ```bash
   cd /opt/route/app
   sudo -u route pm2 start ecosystem.config.js
   sudo pm2 startup
   sudo pm2 save
   ```

### Nginx Reverse Proxy

1. **Install Nginx**
   ```bash
   sudo apt install nginx
   ```

2. **Configure Nginx**
   
   Create `/etc/nginx/sites-available/route`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
   
       ssl_certificate /path/to/ssl/certificate.crt;
       ssl_certificate_key /path/to/ssl/private.key;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers HIGH:!aNULL:!MD5;
   
       # Main application
       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   
       # WebSocket support
       location /ws {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   
       # Static files
       location /uploads {
           alias /opt/route/app/uploads;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/route /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### SSL Certificate (Let's Encrypt)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain Certificate**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal**
   ```bash
   sudo crontab -e
   # Add this line:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Firewall Configuration

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow MQTT (if external access needed)
sudo ufw allow 1883

# Check status
sudo ufw status
```

## Docker Deployment

### Docker Compose Setup

1. **Review Docker Compose File**
   
   The included `docker-compose.yml`:
   ```yaml
   version: '3.8'
   
   services:
     postgres:
       image: postgres:13
       environment:
         POSTGRES_DB: route_db
         POSTGRES_USER: route_user
         POSTGRES_PASSWORD: secure_password
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./server/create_db.sql:/docker-entrypoint-initdb.d/create_db.sql
       ports:
         - "5432:5432"
   
     mosquitto:
       image: eclipse-mosquitto:latest
       ports:
         - "1883:1883"
         - "9001:9001"
       volumes:
         - ./mosquitto.conf:/mosquitto/config/mosquitto.conf
   
     route-server:
       build:
         context: ./server
         dockerfile: Dockerfile
       ports:
         - "8080:8080"
         - "8443:8443"
       environment:
         - NODE_ENV=production
         - DB_HOST=postgres
         - MQTT_SERVER=mqtt://mosquitto:1883
       depends_on:
         - postgres
         - mosquitto
       volumes:
         - ./uploads:/app/uploads
   
     route-frontend:
       build:
         context: ./react-route
         dockerfile: Dockerfile
       ports:
         - "80:80"
       depends_on:
         - route-server
   
   volumes:
     postgres_data:
   ```

2. **Create Docker Environment File**
   
   Create `.env` in project root:
   ```env
   POSTGRES_DB=route_db
   POSTGRES_USER=route_user
   POSTGRES_PASSWORD=secure_password
   
   NODE_ENV=production
   BASE_URL=https://your-domain.com
   
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   ```

3. **Build and Deploy**
   ```bash
   # Build images
   docker-compose build
   
   # Start services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Check status
   docker-compose ps
   ```

4. **Docker Management Commands**
   ```bash
   # Stop services
   docker-compose down
   
   # Restart specific service
   docker-compose restart route-server
   
   # Update and rebuild
   docker-compose build --no-cache
   docker-compose up -d
   
   # View service logs
   docker-compose logs route-server
   
   # Execute commands in container
   docker-compose exec route-server bash
   ```

### Dockerfile Configuration

**Backend Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose ports
EXPOSE 8080 8443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["npm", "start"]
```

**Frontend Dockerfile** (`react-route/Dockerfile`):
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### Common Installation Issues

#### Node.js Version Issues

**Problem**: "Node.js version not supported"
```bash
# Check Node.js version
node --version

# Install correct version using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### PostgreSQL Connection Issues

**Problem**: "Connection refused" or "Authentication failed"

**Solutions**:
1. **Check PostgreSQL Status**
   ```bash
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. **Verify User and Database**
   ```bash
   sudo -u postgres psql -c "\du"
   sudo -u postgres psql -c "\l"
   ```

3. **Check Connection Configuration**
   ```bash
   # Test connection
   psql -U route_user -d route_db -h localhost
   ```

4. **Update pg_hba.conf**
   ```bash
   sudo nano /etc/postgresql/13/main/pg_hba.conf
   # Add: local all route_user md5
   sudo systemctl restart postgresql
   ```

#### Permission Issues

**Problem**: "Permission denied" errors

**Solutions**:
```bash
# Fix file permissions
sudo chown -R route:route /opt/route/app
sudo chmod -R 755 /opt/route/app

# Fix upload directory
sudo mkdir -p /opt/route/app/uploads
sudo chown route:route /opt/route/app/uploads
```

#### SSL Certificate Issues

**Problem**: SSL/TLS errors in production

**Solutions**:
1. **Check Certificate Files**
   ```bash
   sudo ls -la /path/to/ssl/
   openssl x509 -in certificate.crt -text -noout
   ```

2. **Test SSL Configuration**
   ```bash
   openssl s_client -connect your-domain.com:443
   ```

3. **Renew Let's Encrypt Certificate**
   ```bash
   sudo certbot renew
   sudo systemctl restart nginx
   ```

### Docker Troubleshooting

#### Container Won't Start

**Check Logs**:
```bash
docker-compose logs route-server
docker-compose logs postgres
```

**Common Solutions**:
```bash
# Remove and recreate containers
docker-compose down -v
docker-compose up -d

# Rebuild images
docker-compose build --no-cache

# Check disk space
df -h
```

#### Database Connection in Docker

**Problem**: "Could not connect to database"

**Solutions**:
1. **Check Container Network**
   ```bash
   docker-compose exec route-server ping postgres
   ```

2. **Verify Environment Variables**
   ```bash
   docker-compose exec route-server env | grep DB
   ```

3. **Check Database Logs**
   ```bash
   docker-compose logs postgres
   ```

### Performance Issues

#### High Memory Usage

**Solutions**:
1. **Optimize Node.js Memory**
   ```bash
   # Add to environment
   NODE_OPTIONS=--max-old-space-size=2048
   ```

2. **Monitor Resource Usage**
   ```bash
   # System resources
   htop
   
   # Docker resources
   docker stats
   
   # PM2 monitoring
   pm2 monit
   ```

#### Slow Database Queries

**Solutions**:
1. **Optimize PostgreSQL Configuration**
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

2. **Add Database Indexes**
   ```sql
   -- Example indexes for common queries
   CREATE INDEX idx_document_store_path ON document_store(path);
   CREATE INDEX idx_short_urls_code ON short_urls(short_code);
   ```

### Log Analysis

#### Application Logs

**PM2 Logs**:
```bash
pm2 logs route-server
pm2 logs --lines 100
```

**Docker Logs**:
```bash
docker-compose logs -f route-server
docker-compose logs --tail=100 route-server
```

#### System Logs

```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log

# System logs
sudo journalctl -u route-server -f
```

### Monitoring and Maintenance

#### Health Checks

**Application Health**:
```bash
# API health check
curl -f http://localhost:8080/health

# Database health
psql -U route_user -d route_db -c "SELECT 1;"

# MQTT health
mosquitto_pub -h localhost -t "health/check" -m "test" -u mqtt_user -P mqtt_pass
```

#### Backup Procedures

**Database Backup**:
```bash
# Create backup
pg_dump -U route_user -d route_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U route_user -d route_db < backup_20240115_120000.sql
```

**File Backup**:
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /opt/route/app/uploads

# Backup configuration
cp /opt/route/app/server/.env /backup/env_$(date +%Y%m%d)
```

#### Update Procedures

**Application Updates**:
```bash
# Backup current version
sudo -u route cp -r /opt/route/app /opt/route/app_backup_$(date +%Y%m%d)

# Pull updates
sudo -u route git pull origin main

# Install dependencies
sudo -u route npm install --production

# Restart application
pm2 restart route-server
```

**Docker Updates**:
```bash
# Backup
docker-compose down
docker commit route_route-server_1 route-backup:$(date +%Y%m%d)

# Update
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

For additional support, consult the [User Manual](USER_MANUAL.md) and [API Documentation](API_DOCUMENTATION.md).