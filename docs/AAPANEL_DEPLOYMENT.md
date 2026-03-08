# aaPanel Deployment Guide

This document provides instructions on how to initially deploy the project to your VPS using aaPanel and how to pull future updates via GitHub.

## Prerequisites
- A VPS running aaPanel.
- Node.js (and PM2) installed via aaPanel App Store.
- Docker & Docker Compose installed via aaPanel App Store (if used for Pretix services).
- Git installed on and SSH keys generated on the VPS to access the private GitHub repository.

## 1. Initial Deployment

### Authentication to GitHub
Since your repository is private, your VPS needs authentication to clone and pull from it.

1. SSH into your VPS (or use aaPanel Terminal).
2. Generate an SSH key if you don't have one:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
3. View and copy the public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
4. Go to your GitHub Repository -> **Settings** -> **Deploy keys** -> **Add deploy key** and paste the key. Alternatively, add the SSH key to your GitHub account settings.

### Cloning the Repository
1. In aaPanel, go to **Files** and navigate to your `www/wwwroot` directory. Alternatively, log in via SSH and run:
   ```bash
   cd /www/wwwroot
   git clone git@github.com:yourusername/yadawi_pretix.git
   cd yadawi_pretix
   ```

### Setting Up Environment Variables
1. Copy the sample environment files (if any) or create them manually. 
   - Ensure the Next.js `frontend/.env` has keys for database, API endpoints, etc.
   - Set up Pretix/Docker environment variables in the root directory.

### Installing Dependencies & Building (Next.js)
If using aaPanel's Node.js project manager:
1. Navigate to **Website** -> **Node project** -> **Add Node project**.
2. Select the `yadawi_pretix/frontend` folder.
3. Configure start command appropriately (e.g., `npm run start`).
4. Ensure pm2 runs `npm run build` initially, or manage manually:
   ```bash
   cd /www/wwwroot/yadawi_pretix/frontend
   npm install
   npm run build
   pm2 start npm --name "yadawi-frontend" -- start
   ```

### Running Backend/Docker Setup (Pretix)
Run the Docker containers:
```bash
cd /www/wwwroot/yadawi_pretix
docker-compose up -d
```

---

## 2. Deploying Updates (Pulling from GitHub)

When new changes are pushed to GitHub, you need to pull the changes onto your VPS and restart the necessary services. 

### Step-by-step Update Guide

1. **SSH into the server (or use aaPanel Terminal)**  
   ```bash
   cd /www/wwwroot/yadawi_pretix
   ```

2. **Pull the latest changes**  
   ```bash
   git fetch origin
   git pull origin main
   ```
   *(Change `main` if your branch name is different, like `master`)*

3. **Update Application Configuration (If changed)**
   If there were changes to `.env` variables or new environment variables were introduced, make sure to add them to your live `.env` files. Ensure you check for new environment vars.

4. **Update the Frontend (Next.js)**  
   If the frontend code has changed:
   ```bash
   cd frontend
   npm install      # run if packages changed
   npm run build    # rebuild the optimized production app
   pm2 restart yadawi-frontend    # restart process 
   ```

5. **Update Docker Containers (Pretix backend)**  
   If `docker-compose.yml` or backend configuration has changed:
   ```bash
   cd /www/wwwroot/yadawi_pretix
   docker-compose pull   # pull any new docker images if applicable
   docker-compose up -d --build
   ```

6. **Reset/Clear aaPanel Node Project Cache**  
   If you have issues where changes aren't reflecting, sometimes aaPanel Node server caches old variables. In aaPanel dashboard:
   - Go to **Website** -> **Node projects**.
   - Stop and Start the Node project completely (restart using pm2 as mentioned is generally enough, but aaPanel's manager may need a hard restart if env file was updated). Wait for port to show up properly again.

---
## Troubleshooting
- **Cannot Pull from Git**: Ensure your SSH Deploy Key hasn't expired or changed. Test the connection with `ssh -T git@github.com`.
- **Failed to Build Next.js**: Check your RAM usage on the VPS. Next.js builds can sometimes crash if you run out of memory. If this is a problem, consider creating a swapfile or upgrading the VPS RAM.
- **502 Bad Gateway / Port Conflicts**: Confirm the Next.js app is bound to the correct port specified in your aaPanel reverse proxy or configurations.
