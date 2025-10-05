# 🚀 How to Upload HireFlow to GitHub

## Prerequisites
- ✅ GitHub account ([Sign up here](https://github.com/join))
- ✅ Git installed on your machine

---

## Step-by-Step Guide

### 1️⃣ Create New Repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Fill in the details:
   - **Repository name:** `HireFlow`
   - **Description:** `AI-Powered Job Recruitment Platform with Smart Matching`
   - **Visibility:** Public (or Private)
   - ⚠️ **Important:** Do NOT check "Initialize with README" (we already have one)
3. Click **"Create repository"**
4. **Copy the repository URL** (should look like: `https://github.com/YOUR_USERNAME/HireFlow.git`)

---

### 2️⃣ Configure Git (First Time Only)

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"
```

---

### 3️⃣ Add All Files to Git

```bash
# Add all files
git add .

# Check what will be committed
git status
```

---

### 4️⃣ Create Your First Commit

```bash
# Commit with a message
git commit -m "Initial commit: HireFlow - AI-Powered Recruitment Platform"
```

---

### 5️⃣ Connect to GitHub Repository

```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/HireFlow.git

# Verify the remote
git remote -v
```

---

### 6️⃣ Push to GitHub

```bash
# Set branch name to main
git branch -M main

# Push to GitHub
git push -u origin main
```

If prompted for credentials:
- **Username:** Your GitHub username
- **Password:** Use a **Personal Access Token** (not your password)
  - Create token at: [github.com/settings/tokens](https://github.com/settings/tokens)
  - Click "Generate new token (classic)"
  - Select scope: `repo` (full control of private repositories)
  - Copy the token and use it as your password

---

### 7️⃣ Verify Upload

Go to `https://github.com/YOUR_USERNAME/HireFlow` and you should see all your files!

---

## 🔄 Future Updates

After making changes to your code:

```bash
# 1. Check changes
git status

# 2. Add changed files
git add .

# 3. Commit changes
git commit -m "Description of what you changed"

# 4. Push to GitHub
git push
```

---

## 🆘 Common Issues

### Issue: Permission Denied
**Solution:** Make sure you're using a Personal Access Token instead of password

### Issue: Remote Already Exists
**Solution:** Remove and re-add
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/HireFlow.git
```

### Issue: Branch Name
**Solution:** Rename branch to main
```bash
git branch -M main
```

---

## 🎉 That's It!

Your HireFlow project is now on GitHub! 

Share it with: `https://github.com/YOUR_USERNAME/HireFlow`
