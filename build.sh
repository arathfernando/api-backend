#!/bin/sh
for entry in */; do
    if [ -e $entry/nest-cli.json ]; then
        echo "Building in $entry..."
        cd $entry
        npm run build
        cd ..
    fi
done