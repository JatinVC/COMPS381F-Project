#!/bin/bash

# any future command that fails will exit the script
set -e

DEPLOY_DIR="/var/www/comps381f"
GIT_URL=git@gitlab.jatinc.io:comps381f-project/restaurant-backend.git
RESTART_ARGS=

echo "Deploying to $DEPLOY_DIR"
# Pull latest code
if [[ -e $DEPLOY_DIR ]]; then
  echo "Found the directory, checking if it has been cloned to before"
  cd $DEPLOY_DIR
  if [[ -e ".git" ]]; then
    echo ".git directory exists, we can do a pull"
    git pull
  else
    echo ".git directory does not exist, run git clone"
    git clone $GIT_URL $DEPLOY_DIR
  fi
else
  echo "Directory does not exist, run a git clone and create it"
  git clone $GIT_URL $DEPLOY_DIR
  cd $DEPLOY_DIR
fi

# Install dependencies
npm ci --production
npm prune --production

pm2 start ./config/pm2.config.js --name="comps381f-server" --env production
