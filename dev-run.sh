#!/bin/sh
pm2 stop all
pm2 delete all
for entry in */; do
    if [ -e $entry/nest-cli.json ]; then
        echo "Service:===> $entry..."
        cd $entry
        echo "Pulling new code for:===> $entry..."
        git fetch
        git reset --hard
        git pull origin main
        echo "Running build for:===> $entry..."
        npm run build
        echo "Starting service:===> $entry..."
        npm run pm2-start
        cd ..
    fi
done
echo "Services are started"