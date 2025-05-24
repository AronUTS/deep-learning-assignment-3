#!/bin/bash
# This script is to be copied to the deploy script of EC2 instance to start application
set -e

LOG_FILE="/var/log/user-data.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "===== [STARTING EC2 SETUP] ====="

echo "Updating package list and upgrading..."
apt-get update && apt-get upgrade -y

echo "Installing prerequisites for Docker..."
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

echo "Setting up Docker GPG key and repository..."
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "Adding Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

echo "Installing Docker and Docker Compose..."
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Enabling and starting Docker..."
systemctl enable docker
systemctl start docker

echo "Adding ubuntu user to docker group..."
usermod -aG docker ubuntu

echo "Cloning your app repository..."
cd /home/ubuntu
# Replace with your actual GitHub repo
git clone https://github.com/AronUTS/deep-learning-assignment-3.git app

echo "Navigating to app directory..."
cd app

echo "Running docker compose..."
sudo docker compose up -d

echo "===== [SETUP COMPLETE] ====="
