#!/bin/bash

# if ./build exists, remove it
if [ -d "./build" ]; then
    rm -rf ./build
fi

mkdir ./build

# copy all backend files to ./build
echo "copying all backend files to ./build"
cp ./install.sh ./build
cp ./LICENSE ./build
cp ./server.py ./build
cp ./tcctl.py ./build
cp ./tcctl ./build
cp ./README.md ./build
cp ./start-tcctl.sh ./build
cp ./stop-tcctl.sh ./build

# build frontend
echo "building frontend"
cd ./webui/ && npm run build
cd ../
echo "copying frontend files to ./build"
cp -r ./webui/dist ./build/

echo "done"
