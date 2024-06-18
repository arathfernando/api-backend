#!/bin/sh
cd ~
cd /home/hubbers/front
rm -rf build
git fetch
git pull
echo "Git pull completed"
npm install
echo "Dependencies installed"
npm run build
echo "Build completed"
cd ~
cd /var/www/user-panel
rm -rf *
cd ~
mv /home/hubbers/front/build/* /var/www/user-panel