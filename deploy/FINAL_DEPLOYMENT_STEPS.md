# 🚀 Final Deployment Steps - Quick Reference

## ✅ What's Already Done

- ✅ Backend is running (`glassshop-backend` service)
- ✅ Database is set up (all tables created)
- ✅ Frontend is built on Windows
- ✅ Frontend files uploaded to EC2

## 📋 What's Left (5 Minutes)

### Step 1: Verify Files Uploaded

```bash
# On EC2 instance
ls -la /tmp/temp-repo/glass-ai-agent-frontend/build/index.html
```

### Step 2: Set Permissions

```bash
sudo chmod -R 755 /tmp/temp-repo/glass-ai-agent-frontend/build
```

### Step 3: Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/glassshop > /dev/null <<'EOF'
server {
    listen 80;
    server_name 13.49.226.76;
    root /tmp/temp-repo/glass-ai-agent-frontend/build;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ { proxy_pass http://localhost:8080; proxy_set_header Host $host; }
    location /auth/ { proxy_pass http://localhost:8080; proxy_set_header Host $host; }
    location ~ ^/(stock|audit|ai|admin)/ { proxy_pass http://localhost:8080; proxy_set_header Host $host; }
}
EOF
```

### Step 4: Enable and Reload

```bash
sudo ln -sf /etc/nginx/sites-available/glassshop /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### Step 5: Access Application

Open browser: **http://13.49.226.76**

---

## 🎯 Quick One-Liner (Copy-Paste All)

```bash
sudo chmod -R 755 /tmp/temp-repo/glass-ai-agent-frontend/build && sudo tee /etc/nginx/sites-available/glassshop > /dev/null <<'EOF'
server {
    listen 80;
    server_name 13.49.226.76;
    root /tmp/temp-repo/glass-ai-agent-frontend/build;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location /api/ { proxy_pass http://localhost:8080; proxy_set_header Host $host; }
    location /auth/ { proxy_pass http://localhost:8080; proxy_set_header Host $host; }
    location ~ ^/(stock|audit|ai|admin)/ { proxy_pass http://localhost:8080; proxy_set_header Host $host; }
}
EOF
sudo ln -sf /etc/nginx/sites-available/glassshop /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx && echo "✅ Deployment Complete! Access: http://13.49.226.76"
```

---

## 🔍 Verify Everything

```bash
# Check services
sudo systemctl status glassshop-backend | head -3
sudo systemctl status nginx | head -3

# Test
curl http://localhost/ | head -20
```

---

## 📝 Important URLs

- **Application**: http://13.49.226.76
- **Backend API**: http://13.49.226.76/api
- **EC2 Instance**: i-0e531262dbb679fdc

---

## 🆘 If Something Doesn't Work

### Check Logs:
```bash
sudo journalctl -u glassshop-backend -n 50
sudo tail -50 /var/log/nginx/error.log
```

### Restart Services:
```bash
sudo systemctl restart glassshop-backend
sudo systemctl restart nginx
```

### Check Files:
```bash
ls -la /tmp/temp-repo/glass-ai-agent-frontend/build/
```

---

**When you're ready, just run the commands above and your application will be live! 🎉**

