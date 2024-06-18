#!/bin/sh
cd /home/gru/hubbers/api
git fetch
git reset --hard origin/main
git pull
echo "Git pull completed"
pm2 stop all
pm2 delete all
for entry in /home/gru/hubbers/api/*/; do
    if [ -e "$entry/nest-cli.json" ]; then
        echo "Building Service $entry..."
        cd "$entry"
        npm install || exit 1
        npm run build || exit 1
        npm run pm2-start || exit 1
        cd ..
    fi
done
echo "Deployment completed"