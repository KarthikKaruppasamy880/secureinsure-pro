# 🚀 SecureInsure Pro - Insurance Management System

A comprehensive, enterprise-grade insurance management platform built with modern microservices architecture, featuring TX1 transaction processing, ExamOne lab integration, and voice search capabilities.

## 🌟 Features

### ✨ Core Functionality
- **TX1 Transaction Processing**: Automated policy creation from external data sources
- **ExamOne Integration**: Lab ordering and results management
- **Voice Search**: Natural language search across all case data
- **Multi-Role Access**: Admin, Agent, Underwriter, and Customer roles
- **Real-time Dashboard**: Live monitoring and analytics

### 🏗️ Architecture
- **Frontend**: React.js with TypeScript and modern UI components
- **Backend**: Spring Boot microservices with Java 17
- **Database**: PostgreSQL with Flyway migrations
- **Cache**: Redis for performance optimization
- **Containerization**: Docker and Docker Compose
- **Cloud Ready**: AWS ECS deployment ready

### 🔐 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **MFA Support**: Multi-factor authentication
- **Biometric Authentication**: Face and voice recognition
- **Audit Logging**: Comprehensive activity tracking

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 17 or higher
- Node.js 18 or higher
- PostgreSQL 15
- Redis 7

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/secureinsure-pro.git
   cd secureinsure-pro
   ```

2. **Start the infrastructure**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Start the backend services**
   ```bash
   docker-compose up -d auth-service policy-service
   ```

4. **Start the frontend**
   ```bash
   docker-compose up -d frontend
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8080
   - Auth Service: http://localhost:8081
   - Policy Service: http://localhost:8082

## 🔐 Login Credentials

### Default Users (Password: `Admin123!`)

| Username | Email | Role | Description |
|----------|-------|------|-------------|
| `admin` | admin@secureinsure.com | ADMIN | System Administrator |
| `agent` | agent@secureinsure.com | AGENT | Insurance Agent |
| `underwriter` | underwriter@secureinsure.com | UNDERWRITER | Policy Underwriter |
| `customer` | customer@secureinsure.com | CUSTOMER | Policy Customer |

## 📁 Project Structure

```
secureinsure-pro/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── backend/                  # Spring Boot microservices
│   ├── auth-service/        # Authentication & authorization
│   ├── policy-service/      # Policy management & TX1 processing
│   ├── claims-service/      # Claims processing
│   ├── notification-service/ # Notifications & alerts
│   ├── admin-service/       # Administrative functions
│   ├── search-service/      # Search & analytics
│   └── gateway-service/     # API gateway & routing
├── docker-compose.yml       # Local development orchestration
├── docker-compose.prod.yml  # Production deployment
├── aws/                     # AWS deployment configuration
│   ├── infrastructure/      # Terraform infrastructure code
│   ├── scripts/            # Deployment scripts
│   └── config/             # Environment configuration
├── docs/                    # Documentation
└── scripts/                 # Utility scripts
```

## 🏗️ Backend Services

### Auth Service (Port 8081)
- User authentication and authorization
- JWT token management
- Role-based access control
- MFA and biometric authentication

### Policy Service (Port 8082)
- Policy creation and management
- TX1 transaction processing
- ExamOne lab integration
- Policy lifecycle management

### Gateway Service (Port 8080)
- API routing and load balancing
- Rate limiting and circuit breakers
- Security and authentication middleware
- Service discovery

### Other Services
- **Claims Service**: Claims processing and management
- **Notification Service**: Email, SMS, and push notifications
- **Admin Service**: System administration and monitoring
- **Search Service**: Full-text search and analytics

## 🎨 Frontend Features

### Dashboard
- **Voice Search**: Natural language search across all data
- **Real-time Updates**: Live data refresh and notifications
- **Responsive Design**: Mobile-first, modern UI components
- **Interactive Charts**: Data visualization and analytics

### Application Details
- **TX1 Data Display**: Comprehensive policy information
- **Lab Ordering**: Direct integration with ExamOne
- **Section-based Forms**: Organized data entry and editing
- **Document Management**: File upload and management

### Navigation
- **Role-based Menus**: Context-aware navigation
- **Breadcrumb Navigation**: Clear location awareness
- **Quick Actions**: Frequently used functions
- **Search History**: Recent searches and favorites

## 🚀 Deployment

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### AWS Deployment

1. **Infrastructure Setup**
   ```bash
   cd aws/infrastructure
   terraform init
   terraform plan
   terraform apply
   ```

2. **Application Deployment**
   ```bash
   # Using PowerShell (Windows)
   .\aws\scripts\deploy.ps1
   
   # Using Bash (Linux/macOS)
   ./aws/scripts/deploy.sh
   ```

3. **Environment Configuration**
   ```bash
   cp aws/config/env.production .env.production
   # Edit .env.production with your values
   ```

## 🔧 Configuration

### Environment Variables
- **Database**: Connection strings and credentials
- **Redis**: Cache configuration
- **JWT**: Secret keys and expiration times
- **AWS**: Service endpoints and credentials
- **Security**: Encryption keys and policies

### Service Configuration
- **Ports**: Service-specific port assignments
- **Logging**: Log levels and output formats
- **Monitoring**: Health checks and metrics
- **Performance**: Connection pools and timeouts

## 📊 Monitoring & Logging

### Health Checks
- Service health endpoints
- Database connectivity monitoring
- External service status
- Performance metrics

### Logging
- Structured logging (JSON format)
- Log aggregation and search
- Retention policies
- Error tracking and alerting

### Metrics
- Application performance metrics
- Business metrics and KPIs
- Infrastructure monitoring
- Custom dashboards

## 🔒 Security

### Authentication
- JWT-based authentication
- Secure password policies
- Session management
- Account lockout protection

### Authorization
- Role-based access control
- Permission-based authorization
- API endpoint security
- Data access controls

### Data Protection
- Encryption at rest and in transit
- Secure communication protocols
- Data backup and recovery
- Compliance with regulations

## 🧪 Testing

### Unit Tests
- Service layer testing
- Repository layer testing
- Utility function testing
- Mock data and fixtures

### Integration Tests
- API endpoint testing
- Database integration testing
- Service communication testing
- End-to-end workflows

### Performance Testing
- Load testing scenarios
- Stress testing
- Performance benchmarking
- Resource utilization monitoring

## 📚 API Documentation

### Swagger/OpenAPI
- Interactive API documentation
- Request/response examples
- Authentication requirements
- Error code documentation

### Postman Collections
- Pre-configured API requests
- Environment templates
- Test scripts and assertions
- Documentation examples

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

### Code Standards
- Java: Google Java Style Guide
- TypeScript: ESLint with Prettier
- Git: Conventional Commits
- Documentation: Markdown format

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment-guide.md)
- [Troubleshooting](docs/troubleshooting.md)

### Getting Help
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Wiki**: Project wiki for detailed information
- **Email**: support@secureinsure.com

### Community
- **Slack**: Join our community workspace
- **Discord**: Real-time chat and support
- **Meetups**: Local user groups
- **Conferences**: Industry events and presentations

## 🎯 Roadmap

### Short Term (Next 3 months)
- [ ] Enhanced voice search capabilities
- [ ] Mobile application development
- [ ] Advanced analytics dashboard
- [ ] Performance optimization

### Medium Term (Next 6 months)
- [ ] AI-powered risk assessment
- [ ] Blockchain integration
- [ ] Multi-tenant architecture
- [ ] Advanced reporting engine

### Long Term (Next 12 months)
- [ ] Machine learning integration
- [ ] Predictive analytics
- [ ] Global deployment support
- [ ] Enterprise features

## 🙏 Acknowledgments

- **Spring Boot Team**: Excellent framework and documentation
- **React Team**: Powerful frontend library
- **Docker Team**: Containerization platform
- **AWS Team**: Cloud infrastructure services
- **Open Source Community**: Libraries and tools

---

**Made with ❤️ by the SecureInsure Pro Team**

*For questions, support, or contributions, please reach out to us!* 