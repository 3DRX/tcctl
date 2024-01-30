#!/bin/bash

# if ./build exists, remove it
if [ -d "./build" ]; then
    rm -rf ./build
fi

mkdir ./build

# copy all backend files to ./build
echo "building backend"
cd ./server && go build -o ../build/tcctl -ldflags="-s -w"
cd ..

# build frontend
echo "building frontend"
cd ./webui/ && npm run build
cd ../
echo "copying frontend files to ./build"
cp -r ./webui/dist ./build/

echo "done"
