#!/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color
shouldDownloadNW=$1
os=$2 # win / linux or osx
type=$3 # sdk or prod

CURRENT_PATH=$(pwd)
PHOENIX_PATH_ROOT="$CURRENT_PATH/node_modules/nwjs-builder-phoenix"
PHOENIX_PATH="$CURRENT_PATH/node_modules/nwjs-builder-phoenix/caches"

downloadNW() {
    if [ ! -d "$PHOENIX_PATH" ]; then
        mkdir -p "PHOENIX_PATH"
    fi

    echo "Retrieving NWJS version from package.json..."
    
    nwver=$(jq -r '.build.nwVersion' ./package.json)
    extSuffix=".tar.gz"
    
    if [[ $type = 'sdk' ]]
    then
        type="-sdk-"
    else
        type="-"
    fi

    if [[ $os == 'win' ]]
    then
        extSuffix=".zip"
    fi

    NW_PACKAGE_NAME="nwjs${type}v$nwver-$os-x64$extSuffix"
    NW_URL="https://r.cnpmjs.org/-/binary/nwjs/v$nwver/$NW_PACKAGE_NAME"
    NW_LOCAL_URL="http://storage.dev.hkg.internal.p2mt.com/storage/nwjs/v$nwver/$NW_PACKAGE_NAME"
    # Extracted directory
    extDir="$PHOENIX_PATH/nwjs${type}v$nwver-$os-x64$extSuffix-extracted"
    echo $os
    if [[ $shouldDownloadNW = "1" ]]; then
        echo "Checking connectivity..."
        wget --spider $NW_LOCAL_URL

        if [[ $? -eq 0 ]]; then
            ACTIVE_URL=$NW_LOCAL_URL
            echo "Check OK, using local URL as nwjs download source..."
        else
            echo "Local URL not accessible, trying remote URL as nwjs download source..."
            wget --spider -q $NW_URL
            if [[ $? -eq 0 ]]; then
                ACTIVE_URL=$NW_URL
            else
                echo "Failed to download NWJS, build failed"
                exit 1
            fi
        fi

        echo "Downloading desired NWJS v$nwver & replacing phoenix version..."
        mkdir -p $PHOENIX_PATH
        wget -O $PHOENIX_PATH/$NW_PACKAGE_NAME $ACTIVE_URL
        mkdir -p $extDir
        echo "Extracting the NWJS files to phoneix directory..."
        if [[ $os == 'win' ]]; then
            cd $PHOENIX_PATH && unzip ./$NW_PACKAGE_NAME -d $extDir && \
            mv nwjs${type}v$nwver-$os-x64$extSuffix nwjs${type}v$nwver-$os-x64$extSuffix-extracted
        else
            tar -xpvf $PHOENIX_PATH/$NW_PACKAGE_NAME -C $PHOENIX_PATH/nwjs${type}v$nwver-$os-x64$extSuffix-extracted --strip-components 1
            echo "Fixing user right ......................................."
            chmod -R +x "$PHOENIX_PATH_ROOT"
        fi
    elif [[ $os == "linux" ]]; then
        echo "Fixing user right ......................................."
        chmod -R +x "$PHOENIX_PATH_ROOT"
    fi
    
    echo -e "${GREEN}NWJS setup completed (NWJS <$os>: v$nwver)" 
}

downloadNW