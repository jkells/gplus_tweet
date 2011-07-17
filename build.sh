#!/bin/bash

# This build script is just for my local machine. Hard coded paths, beware...

rm -rf build
mkdir build

cp -r src/* build
cp .private/secret_keys.js build/lib/secret_keys.js

#/cygdrive/c/Users/jkells/AppData/Local/Google/Chrome/Application/chrome.exe --pack-extension=`cygpath -w pwd`\\build 
