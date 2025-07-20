# Application Management System

🔍 *Comprehensive Audit Management System for Enterprise Applications*

A full-stack web application for managing application audits, compliance tracking, and security monitoring. Built with React.js frontend and Node.js backend with MySQL database.

## 🚀 Features

### Application Management
- *Application Master*: Centralized application registry with company, owner, and access type tracking
- *Version Control*: Track application versions, release types, and change history
- *Domain Management*: Monitor web domains, SSL certificates, and DNS configurations
- *Server Management*: Track hosting servers, server types, and infrastructure details

### Audit & Compliance
- *Audit Logs*: Comprehensive audit findings with severity levels and verification status
- *Multi-Finding Audits*: Group multiple findings under single audit reports
- *Compliance Tracking*: Monitor verification status and developer remarks
- *Historical Records*: Complete audit trail with logging and archiving

### Security & Access
- *SSL Certificate Management*: Track certificate expiry dates and renewal schedules
- *Owner Management*: Assign application owners with role-based access
- *Access Control*: Manage different access types and permissions
- *Security Monitoring*: Real-time security status tracking

## 🛠 Technology Stack

### Frontend
- *React.js* - Modern UI framework
- *Tailwind CSS* - Utility-first CSS framework
- *React Router* - Client-side routing
- *Axios* - HTTP client for API calls
- *Vite* - Fast build tool and development server

### Backend
- *Node.js* - Server-side JavaScript runtime
- *Express.js* - Web application framework
- *MySQL* - Relational database
- *Connection Pooling* - Database connection management

### Key Features
- *Responsive Design* - Works on desktop and mobile
- *Real-time Updates* - Live data synchronization
- *Data Validation* - Input validation and error handling
- *Transaction Management* - Atomic database operations
- *Audit Trail* - Complete change logging

## 📋 Use Cases

- *Enterprise Security Audits*: Comprehensive application security assessments
- *Compliance Monitoring*: Track regulatory compliance requirements
- *Risk Management*: Identify and monitor security vulnerabilities
- *Asset Management*: Centralized application and infrastructure tracking
- *Reporting*: Generate detailed audit reports and compliance documentation

##    Target Users

- *Security Auditors*: Conduct application security assessments
- *IT Administrators*: Manage application infrastructure and configurations
- *Compliance Officers*: Monitor regulatory compliance
- *Development Teams*: Track application versions and changes
- *Management*: Generate reports and monitor security posture

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Step 1: Clone the Repository
bash
git clone https://github.com/ankithahv31/ApplicationManagementSystem.git
cd ApplicationManagementSystem


### Step 2: Database Setup
1. Create a MySQL database named audit_db
2. Import the database schema (SQL files will be provided)
3. Update database credentials in server/db.js

### Step 3: Install Dependencies
bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install


### Step 4: Environment Configuration
Create .env files in both server and frontend directories:

*server/.env:*
env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=audit_db
PORT=5000


*frontend/.env:*
env
VITE_API_URL=http://localhost:5000


### Step 5: Start the Application
bash
# Terminal 1: Start backend server
cd server
npm start

# Terminal 2: Start frontend (in a new terminal)
cd frontend
npm start


### Step 6: Access the Application
- *Frontend*: http://localhost:5173
- *Backend API*: http://localhost:5000

## 📊 Database Schema

The system uses a comprehensive MySQL database with the following key tables:

### Core Tables
- application_master - Main application registry
- audit_report - Audit report headers
- audit_findings - Individual audit findings
- company - Company information
- owner_master - Application owners
- hosting_server - Server infrastructure

### Relationship Tables
- app_server - Application-server associations
- application_owner - Application-owner assignments
- domain_mapping - Application domain configurations
- ssl_certificates - SSL certificate tracking
- app_version - Application version history

### Audit Tables
- log_app_master - Application change history
- log_audit_findings - Audit finding change history
- log_hosting_server - Server change history

## 🔐 Security Features

- *Input Validation*: All user inputs are validated
- *SQL Injection Protection*: Parameterized queries
- *XSS Protection*: Content sanitization
- *CSRF Protection*: Cross-site request forgery prevention
- *Audit Logging*: Complete change tracking
- *Role-based Access*: Different permission levels

## 📱 User Interface

### Responsive Design
- *Desktop*: Full-featured interface with all capabilities
- *Tablet*: Optimized layout for medium screens
- *Mobile*: Touch-friendly interface for field audits

### Key Components
- *Dashboard*: Overview of applications and audit status
- *Application Master*: Central application management
- *Audit Management*: Comprehensive audit tools
- *Reports*: Detailed reporting and analytics
- *Settings*: System configuration and user management

## 🚀 Deployment

### Production Setup
1. *Environment Variables*: Configure production environment variables
2. *Database*: Set up production MySQL database
3. *Build*: Run npm run build in frontend directory
4. *Server*: Deploy backend to production server
5. *Reverse Proxy*: Configure nginx or Apache for frontend serving

### Docker Deployment (Optional)
bash
# Build and run with Docker
docker-compose up -d


## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. *Fork* the repository
2. *Create* a feature branch (git checkout -b feature/AmazingFeature)
3. *Commit* your changes (git commit -m 'Add some AmazingFeature')
4. *Push* to the branch (git push origin feature/AmazingFeature)
5. *Open* a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add appropriate comments and documentation
- Write tests for new features
- Update documentation as needed

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- *Description*: Clear description of the problem
- *Steps to Reproduce*: Detailed steps to reproduce the issue
- *Expected Behavior*: What you expected to happen
- *Actual Behavior*: What actually happened
- *Environment*: OS, browser, Node.js version, etc.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##    Acknowledgments

- *React.js* team for the amazing frontend framework
- *Express.js* team for the robust backend framework
- *Tailwind CSS* team for the utility-first CSS framework
- *MySQL* team for the reliable database system
