#!/bin/bash

# if ./build exists, remove it
if [ -d "./build" ]; then
    rm -rf ./build
fi

mkdir ./build

# copy all backend files to ./build
echo "building backend"
cd ./server
# if architecture is specified in command argument, use it
if [ -z "$1" ]; then
    echo "building for current architecture"
    go build -o ../build/tcctl -ldflags="-s -w"
else
    echo "building for $1"
    GOOS=linux GOARCH=$1 go build -o ../build/tcctl -ldflags="-s -w"
fi
cd ..

# build frontend
echo "building frontend"
cd ./webui/ && npm run build
cd ../
echo "copying frontend files to ./build"
cp -r ./webui/dist ./build/

echo "copy scripts to ./build"
cp ./install.sh ./build/
cp ./start-tcctl.sh ./build/
cp ./stop-tcctl.sh ./build/
# cp ./upgrade.sh ./build/
cp ./tcctld ./build/

echo "done"
