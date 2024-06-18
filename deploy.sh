#!/bin/sh
cd /home/hubbers

for d in */ ; do
    echo "Pulling source in: $d"
    cd $d
    git fetch
    git reset --hard origin/main
    git pull
    echo "Git pull completed"

    echo "Running npm install in: $d"
    npm install

    if [ -e "$d" === "api" ]; then
        pm2 stop all
        pm2 delete all
        for entry in */; do
            if [ -e $entry/nest-cli.json ]; then
                echo "Building Service $entry..."
                cd $entry
                npm install
                npm run build
                npm run pm2-start
                cd ..
            fi
        done
        echo "API build completed"
    fi
    cd ..
done
