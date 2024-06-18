#!/bin/sh
cd ~
cd /home/gru/hubbers/admin
rm -rf build
git fetch
git pull
echo "Git pull completed"
npm install
echo "Dependencies installed"
npm run build
echo "Build completed"
cd ~
cd /var/www/admin-panel
rm -rf *
cd ~
mv /home/gru/hubbers/admin/build/* /var/www/admin-panel
echo "Admin Deployed"