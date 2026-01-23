#!/bin/bash

# ============================================
# Complete Deployment Script
# Fixes all issues and completes deployment
# ============================================

set -e

echo "=========================================="
echo "Glass Shop - Complete Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run with: sudo ./complete-deployment.sh${NC}"
    exit 1
fi

APP_DIR="/tmp/temp-repo"
FRONTEND_DIR="$APP_DIR/glass-ai-agent-frontend"
BACKEND_DIR="$APP_DIR/GlassShop"
EC2_IP="13.49.226.76"

echo -e "${YELLOW}[Step 1/8] Fixing Frontend Build...${NC}"
cd "$FRONTEND_DIR"

# Set environment
echo "REACT_APP_API_URL=http://$EC2_IP" > .env.production

# Clean build
rm -rf build node_modules/.cache

# Build with output redirected to avoid terminal issues
echo "Building frontend (this takes 2-5 minutes)..."
npm run build > /tmp/frontend-build.log 2>&1

# Check if build succeeded
if [ ! -f "build/index.html" ]; then
    echo -e "${RED}Build failed! Check /tmp/frontend-build.log${NC}"
    tail -50 /tmp/frontend-build.log
    exit 1
fi

echo -e "${GREEN}✓ Frontend build completed${NC}"
ls -lh build/index.html

echo ""
echo -e "${YELLOW}[Step 2/8] Stopping PM2 (using Nginx instead)...${NC}"
pm2 delete glassshop-frontend 2>/dev/null || true
echo -e "${GREEN}✓ PM2 stopped${NC}"

echo ""
echo -e "${YELLOW}[Step 3/8] Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/glassshop <<EOF
server {
    listen 80;
    server_name $EC2_IP;

    # Frontend - serve static files
    root $FRONTEND_DIR/build;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Auth endpoints
    location /auth/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Other backend endpoints
    location ~ ^/(stock|audit|ai|admin)/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/glassshop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t && systemctl reload nginx
echo -e "${GREEN}✓ Nginx configured${NC}"

echo ""
echo -e "${YELLOW}[Step 4/8] Verifying Backend...${NC}"
if systemctl is-active --quiet glassshop-backend; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running. Starting...${NC}"
    systemctl start glassshop-backend
    sleep 5
    if systemctl is-active --quiet glassshop-backend; then
        echo -e "${GREEN}✓ Backend started${NC}"
    else
        echo -e "${RED}✗ Backend failed to start. Check logs:${NC}"
        journalctl -u glassshop-backend -n 50 --no-pager
        exit 1
    fi
fi

echo ""
echo -e "${YELLOW}[Step 5/8] Verifying Database...${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL is not running. Starting...${NC}"
    systemctl start postgresql
    systemctl enable postgresql
fi

# Test database connection
PGPASSWORD='GlassShop2024Secure' psql -h localhost -U glassshop_user -d glassshop -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection working${NC}"
else
    echo -e "${YELLOW}⚠ Database connection issue (may need password reset)${NC}"
fi

echo ""
echo -e "${YELLOW}[Step 6/8] Verifying Services...${NC}"
echo "Backend: $(systemctl is-active glassshop-backend)"
echo "Nginx: $(systemctl is-active nginx)"
echo "PostgreSQL: $(systemctl is-active postgresql)"

echo ""
echo -e "${YELLOW}[Step 7/8] Testing Endpoints...${NC}"
# Test backend
BACKEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/auth/login)
echo "Backend (8080): HTTP $BACKEND_TEST"

# Test frontend via Nginx
FRONTEND_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
echo "Frontend (via Nginx): HTTP $FRONTEND_TEST"

if [ "$FRONTEND_TEST" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Frontend returned $FRONTEND_TEST (check Nginx config)${NC}"
fi

echo ""
echo -e "${YELLOW}[Step 8/8] Setting Permissions...${NC}"
# Ensure Nginx can read the build directory
chmod -R 755 "$FRONTEND_DIR/build"
chown -R ubuntu:ubuntu "$FRONTEND_DIR/build"
echo -e "${GREEN}✓ Permissions set${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}Application URL:${NC}"
echo "  http://$EC2_IP"
echo ""
echo -e "${YELLOW}Service Status:${NC}"
systemctl is-active glassshop-backend > /dev/null && echo -e "  ${GREEN}✓ Backend: Running${NC}" || echo -e "  ${RED}✗ Backend: Not Running${NC}"
systemctl is-active nginx > /dev/null && echo -e "  ${GREEN}✓ Nginx: Running${NC}" || echo -e "  ${RED}✗ Nginx: Not Running${NC}"
systemctl is-active postgresql > /dev/null && echo -e "  ${GREEN}✓ PostgreSQL: Running${NC}" || echo -e "  ${RED}✗ PostgreSQL: Not Running${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Open http://$EC2_IP in your browser"
echo "  2. Register a new shop (first user becomes admin)"
echo "  3. Start using the application!"
echo ""
echo "=========================================="

