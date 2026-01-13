#!/bin/bash

# AWS EC2 Quick Deployment Script
# This script is optimized for AWS EC2 deployment
# Run this ON your EC2 instance

set -e

echo "=========================================="
echo "AWS EC2 - Glass Shop Application Deployment"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with: sudo ./aws-quick-deploy.sh"
    exit 1
fi

# Get EC2 metadata
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me)
EC2_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region 2>/dev/null || echo "us-east-1")

echo "Detected EC2 IP: $EC2_IP"
echo "Detected Region: $EC2_REGION"
echo ""

# Configuration
APP_DIR="/opt/glassshop"
BACKEND_DIR="$APP_DIR/GlassShop"
FRONTEND_DIR="$APP_DIR/glass-ai-agent-frontend"

# Check if application exists
if [ ! -d "$APP_DIR" ]; then
    echo "ERROR: Application not found at $APP_DIR"
    echo ""
    echo "Please upload your application files first:"
    echo "1. Zip your application folder"
    echo "2. Upload to S3 or use EC2 Instance Connect file transfer"
    echo "3. Extract to $APP_DIR"
    echo ""
    echo "Or use Git:"
    echo "  cd /opt && sudo git clone <your-repo-url> glassshop"
    exit 1
fi

if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$FRONTEND_DIR" ]; then
    echo "ERROR: Backend or Frontend directory not found!"
    echo "Expected:"
    echo "  - $BACKEND_DIR"
    echo "  - $FRONTEND_DIR"
    exit 1
fi

# Step 1: Install dependencies
echo "[1/6] Installing dependencies..."
apt update -qq
apt install -y openjdk-17-jdk nodejs npm postgresql postgresql-contrib nginx maven > /dev/null 2>&1

# Install Node.js 18 if not already installed
if ! node --version | grep -q "v18"; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - > /dev/null 2>&1
    apt install -y nodejs > /dev/null 2>&1
fi

# Install PM2 and serve
npm install -g pm2 serve > /dev/null 2>&1

# Start PostgreSQL
systemctl start postgresql > /dev/null 2>&1
systemctl enable postgresql > /dev/null 2>&1

echo "✓ Dependencies installed"

# Step 2: Setup database
echo "[2/6] Setting up database..."
read -sp "Enter database password for 'glassshop_user': " DB_PASSWORD
echo ""

# Create database and user
sudo -u postgres psql <<EOF > /dev/null 2>&1
CREATE DATABASE glassshop;
CREATE USER glassshop_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE glassshop TO glassshop_user;
ALTER USER glassshop_user CREATEDB;
\q
EOF

sudo -u postgres psql -d glassshop <<EOF > /dev/null 2>&1
GRANT ALL ON SCHEMA public TO glassshop_user;
\q
EOF

echo "✓ Database configured"

# Step 3: Configure backend
echo "[3/6] Configuring backend..."
cd $BACKEND_DIR

# Create production properties
if [ ! -f "src/main/resources/application-prod.properties" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    cat > src/main/resources/application-prod.properties <<EOF
spring.datasource.url=jdbc:postgresql://localhost:5432/glassshop
spring.datasource.username=glassshop_user
spring.datasource.password=$DB_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

server.port=8080
server.address=0.0.0.0

jwt.secret=$JWT_SECRET

spring.web.cors.allowed-origins=http://$EC2_IP,http://localhost:3000

logging.level.com.glassshop.ai=INFO
logging.level.org.springframework.security=WARN
EOF
fi

# Build backend
echo "  Building backend (this may take a few minutes)..."
if [ -f "mvnw" ]; then
    ./mvnw clean package -DskipTests -q
else
    mvn clean package -DskipTests -q
fi

if [ ! -f "target/GlassShop-0.0.1-SNAPSHOT.jar" ]; then
    echo "ERROR: Backend build failed!"
    exit 1
fi

echo "✓ Backend built successfully"

# Step 4: Configure frontend
echo "[4/6] Configuring frontend..."
cd $FRONTEND_DIR

# Create .env.production
if [ ! -f ".env.production" ]; then
    cat > .env.production <<EOF
REACT_APP_API_URL=http://$EC2_IP:8080
EOF
fi

# Build frontend
echo "  Building frontend (this may take a few minutes)..."
npm install --silent
npm run build --silent

if [ ! -d "build" ]; then
    echo "ERROR: Frontend build failed!"
    exit 1
fi

echo "✓ Frontend built successfully"

# Step 5: Setup services
echo "[5/6] Setting up services..."

# Systemd service for backend
cat > /etc/systemd/system/glassshop-backend.service <<EOF
[Unit]
Description=Glass Shop Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=$SUDO_USER
WorkingDirectory=$BACKEND_DIR
Environment="SPRING_PROFILES_ACTIVE=prod"
Environment="JAVA_OPTS=-Xms512m -Xmx1024m"
ExecStart=/usr/bin/java -jar $BACKEND_DIR/target/GlassShop-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=glassshop-backend

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable glassshop-backend > /dev/null 2>&1
systemctl restart glassshop-backend

# PM2 for frontend
cd $FRONTEND_DIR
pm2 delete glassshop-frontend 2>/dev/null || true
pm2 serve build 3000 --name glassshop-frontend --spa --silent
pm2 save > /dev/null 2>&1

echo "✓ Services configured"

# Step 6: Configure Nginx
echo "[6/6] Configuring Nginx..."

cat > /etc/nginx/sites-available/glassshop <<EOF
upstream backend {
    server localhost:8080;
}

server {
    listen 80;
    server_name $EC2_IP;

    location / {
        root $FRONTEND_DIR/build;
        try_files \$uri \$uri/ /index.html;
        index index.html;
    }

    location ~ ^/(auth|stock|audit|ai|admin) {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/glassshop /etc/nginx/sites-enabled/
nginx -t > /dev/null 2>&1
systemctl reload nginx

# Configure firewall
ufw --force enable > /dev/null 2>&1
ufw allow 22/tcp > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
ufw allow 8080/tcp > /dev/null 2>&1

echo "✓ Nginx configured"

# Wait for services
echo ""
echo "Waiting for services to start..."
sleep 5

# Final status
echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Your application is available at:"
echo "  🌐 http://$EC2_IP"
echo ""
echo "Service Status:"
systemctl is-active glassshop-backend > /dev/null && echo "  ✓ Backend: Running" || echo "  ✗ Backend: Not Running"
pm2 list | grep -q glassshop-frontend && echo "  ✓ Frontend: Running" || echo "  ✗ Frontend: Not Running"
systemctl is-active nginx > /dev/null && echo "  ✓ Nginx: Running" || echo "  ✗ Nginx: Not Running"
echo ""
echo "Next Steps:"
echo "1. Configure Security Groups in AWS Console:"
echo "   - Allow HTTP (port 80) from 0.0.0.0/0"
echo "   - Allow HTTPS (port 443) from 0.0.0.0/0 (optional)"
echo ""
echo "2. Open in browser: http://$EC2_IP"
echo ""
echo "3. Register your shop and create admin account"
echo ""
echo "View logs:"
echo "  Backend: sudo journalctl -u glassshop-backend -f"
echo "  Frontend: pm2 logs glassshop-frontend"
echo ""

