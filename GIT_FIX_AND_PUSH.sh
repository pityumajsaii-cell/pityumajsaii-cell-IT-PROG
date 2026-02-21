#!/bin/bash

echo "======================================"
echo " GIT AUTO FIX & PUSH SCRIPT"
echo "======================================"

# ---- ADATOK ----
GIT_NAME="pityumajsaii"
GIT_EMAIL="pityumajsaii@gmail.com"
REPO_URL="https://github.com/pityumajsaii-cell/pityumajsaii-cell-IT-PROG.git"
# ----------------

echo "Cleaning old git..."
rm -rf .git

echo "Initializing git..."
git init

echo "Setting local git identity..."
git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

echo "Adding files..."
git add .

echo "Creating commit..."
git commit -m "Production agency system"

echo "Setting main branch..."
git branch -M main

echo "Adding remote..."
git remote add origin $REPO_URL

echo "Pushing to GitHub..."
git push -u origin main

echo "======================================"
echo " DONE"
echo "======================================"
