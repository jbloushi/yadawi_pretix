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
   git clone git@github.com:jbloushi/yadawi_pretix.git
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
Run the Docker containers and seed the database:
```bash
cd /www/wwwroot/yadawi_pretix
docker-compose up -d
docker exec yadawi-pretix python3 /pretix-config/local_seed.py
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
   git pull origin master
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
   
   # (Optional) Run seeding to ensure latest organisers/tokens are present
   docker exec yadawi-pretix python3 /pretix-config/local_seed.py
   ```

---

## 6. Database Seeding (Pretix)

To populate the Pretix database with organizers, API tokens, and sample workshops, run the following command from the project root:

```bash
docker exec -it yadawi-pretix python3 -m pretix shell -c "exec(open('/pretix-config/local_seed.py').read())"
```
*Note: If that fails, try this simpler one which pipes directly:*
```bash
cat ./pretix-config/local_seed.py | docker exec -i yadawi-pretix pretix shell
```

**Verify the output:** You should see "SEEDING COMPLETED SUCCESSFULLY" and the generated API tokens. Ensure these tokens match your `.env` file (`PRETIX_API_TOKEN` and `PRETIX_SA_API_TOKEN`).

### 7. Create Admin Account

To access the Pretix backend (e.g., `https://pretix.mawthook.io/control/`), you need a superuser account:

```bash
docker exec -it yadawi-pretix pretix createsuperuser
```

Follow the prompts to enter your email and password.

    *Note: This script is idempotent and can be run safely multiple times.*

---

## 8. Reset/Clear aaPanel Node Project Cache  
If you have issues where changes aren't reflecting, sometimes aaPanel Node server caches old variables. In aaPanel dashboard:
- Go to **Website** -> **Node projects**.
- Stop and Start the Node project completely (restart using pm2 as mentioned is generally enough, but aaPanel's manager may need a hard restart if env file was updated). Wait for port to show up properly again.

---

## 3. Handling Port Conflicts (Other Apps on VPS)

If your VPS already has applications running on Port `8000` (Pretix) or `3000` (Next.js), you can change them easily:

### Changing the Pretix Port (Backend)
1. Open your terminal in the root folder.
2. Create or edit a `.env` file in the **root** folder (not the frontend one).
3. Add: `PRETIX_PORT=8080` (or any free port).
4. Restart docker: `docker-compose up -d`.

### Changing the Next.js Port (Frontend)
1. In `frontend/.env.local`, update:
   - `NEXT_PUBLIC_PRETIX_URL=http://127.0.0.1:8080` (Match the backend port above).
   - `NEXT_PUBLIC_APP_URL=http://YOUR_IP:3005` (New frontend port).
   - `NEXTAUTH_URL=http://YOUR_IP:3005`.
2. Rebuild: `npm run build`.
3. Restart PM2 with the new port:
   ```bash
   pm2 delete yadawi-frontend
   pm2 start npm --name "yadawi-frontend" -- start -- -p 3005
   ```
   *(Note: The `-- -p 3005` tells Next.js to listen on port 3005)*

---

## 4. Production Domain Setup (Live VPS)

When moving from IP-based access to your final domains (e.g., `pretix.mawthook.io` and `logstic.mawthook.io`), follow these steps:

### A. Environment Configuration (`frontend/.env.local`)
Update your frontend environment variables to use the final HTTPS domains:
```env
# pretix API URL (Production Domain)
NEXT_PUBLIC_PRETIX_URL=https://pretix.mawthook.io

# Application URLs
NEXT_PUBLIC_APP_URL=https://logstic.mawthook.io
NEXTAUTH_URL=https://logstic.mawthook.io
```

### B. aaPanel Reverse Proxy Configuration
You need two separate Website entries in aaPanel, each with its own Reverse Proxy:

1. **Pretix Backend Website (`pretix.mawthook.io`)**:
   - Go to **Website** -> `pretix.mawthook.io` -> **Reverse Proxy**.
   - **Target URL**: `http://127.0.0.1:8000` (or your chosen `PRETIX_PORT`).
   - *Tip: Ensure you have deleted the default `index.html` from the root folder.*

2. **Frontend Website (`logstic.mawthook.io`)**:
   - Go to **Website** -> `logstic.mawthook.io` -> **Reverse Proxy**.
   - **Target URL**: `http://127.0.0.1:3005` (or your chosen Next.js port).
   - *Tip: Delete the default `index.html` here too.*

### C. Build and Restart
After changing environment variables, you **must** rebuild the Next.js application:
```bash
cd /www/wwwroot/yadawi_pretix/frontend
npm run build
pm2 restart yadawi-frontend
```

---

## 5. Troubleshooting
- **Cannot Pull from Git**: Ensure your SSH Deploy Key hasn't expired or changed. Test the connection with `ssh -T git@github.com`.
- **Failed to Build Next.js**: Check your RAM usage on the VPS. Next.js builds can sometimes crash if you run out of memory. 
- **502 Bad Gateway**: This usually means the Target URL in your Reverse Proxy doesn't match the port the app is actually listening on. Check with `netstat -ano | findstr :3005`.
- **aaPanel Default Page**: If you see "Congratulations, the site is created successfully!", it means you haven't deleted the `index.html` file from the site's directory or the Reverse Proxy isn't enabled.
