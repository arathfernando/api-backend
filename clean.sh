#!/bin/sh
for entry in */; do
    if [ -e $entry/nest-cli.json ]; then
        echo "Cleaning build $entry..."
        cd $entry
        rm -rf dist
        rm -rf node_modules
        cd ..
    fi
done