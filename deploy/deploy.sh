#!/bin/bash

#any future command that fails will stop the script
set -e

#public key of the aws instance
eval $(ssh-agent -s)

#disable the host key checking.
# ./deploy/disableHostKeyChecking.sh

#we have already setup the DEPLOY_SERVER in our gitlab settings whiich is a
# comma seperated values of IP addresses.
DEPLOY_SERVERS=$DEPLOY_SERVERS

ALL_SERVERS=(${DEPLOY_SERVERS//,/ })
echo "ALL_SERVERS ${ALL_SERVERS}"

# Once inside the server, run updateAndRestart.sh
for server in "${ALL_SERVERS[@]}"
do
  echo "deploying to ${server}"
  ssh autodeploy@${server} 'bash' < ./deploy/updateAndRestart.sh
done