# Deployment Files

This directory contains all deployment scripts and configuration files for EC2 deployment.

## Files

- **install-dependencies.sh** - Install all required software (Java, Node.js, PostgreSQL, Nginx, PM2)
- **deploy.sh** - Complete deployment script (builds and configures everything)
- **setup-database.sh** - Setup PostgreSQL database and user
- **quick-deploy.sh** - Quick rebuild and restart (for updates)
- **glassshop-backend.service** - Systemd service file for backend
- **ecosystem.config.js** - PM2 configuration for frontend
- **nginx.conf** - Nginx reverse proxy configuration

## Quick Start

### 1. Initial Setup (First Time)

```bash
# On your EC2 instance
cd /opt
sudo git clone <your-repo-url> glassshop
# Or upload files manually

cd glassshop
sudo chmod +x deploy/*.sh

# Install dependencies
sudo ./deploy/install-dependencies.sh

# Setup database
sudo -u postgres ./deploy/setup-database.sh

# Configure application properties
sudo nano GlassShop/src/main/resources/application-prod.properties
# Add database credentials, JWT secret, etc.

# Run full deployment
sudo ./deploy/deploy.sh
```

### 2. Update Application (Subsequent Deployments)

```bash
cd /opt/glassshop
git pull  # or upload new files
./deploy/quick-deploy.sh
```

## Manual Steps

### Configure Backend

Edit `GlassShop/src/main/resources/application-prod.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/glassshop
spring.datasource.username=glassshop_user
spring.datasource.password=your_password
jwt.secret=your-jwt-secret-key
```

### Configure Frontend

Edit `glass-ai-agent-frontend/.env.production`:

```env
REACT_APP_API_URL=http://your-ec2-ip:8080
```

### Configure Nginx

Edit `deploy/nginx.conf` and update:
- `server_name` with your domain or IP
- Paths if different from default

Then:
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/glassshop
sudo ln -s /etc/nginx/sites-available/glassshop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Service Management

### Backend
```bash
sudo systemctl start glassshop-backend
sudo systemctl stop glassshop-backend
sudo systemctl restart glassshop-backend
sudo systemctl status glassshop-backend
sudo journalctl -u glassshop-backend -f
```

### Frontend
```bash
pm2 start glassshop-frontend
pm2 stop glassshop-frontend
pm2 restart glassshop-frontend
pm2 status
pm2 logs glassshop-frontend
```

### Nginx
```bash
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl status nginx
sudo nginx -t  # Test configuration
```

## Troubleshooting

See main DEPLOYMENT_GUIDE.md for detailed troubleshooting steps.

