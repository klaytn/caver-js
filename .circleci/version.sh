#!/bin/bash

#take version from package.json
if [ -f package.json ]; then
    version_package=$(awk '/version/ {gsub("\"",""); print $2}' package.json | tr -d ',')
    echo $version_package
else
    echo "package.json not exist"
fi
