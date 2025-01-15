#!/bin/sh

# Steps to publish to npm:
# - Make sure to have npm installed
# - Execute this sh script from command line
# - In command prompt press enter when asked to continue login in browser
# - After successfully logged in from browser, the command prompt will continue with deploy
# - Another login might be asked in prompt; continue as mentioned in previous step

# Steps to create npm account
# - https://www.npmjs.com/signup
# - Ask for access in idnow

# This script only updated the Android SDK version automatically
# and the React-Native Library
# Example command:
# ./release-public.sh -a ANDROID_VERSION -r REACT_NATIVE_VERSION


# Don't modify theses variables!
current_android_version="5.12.0"

# Read version wanted from input
android_value=""
react_native_value=""

# Process parameters using getopts with clear option handling
while getopts ":a:r:" opt; do
  case $opt in
    a) android_value="$OPTARG" ;;
    r) react_native_value="$OPTARG" ;;
    \?) echo "Invalid option: -$OPTARG" >&2; exit 1 ;;
  esac
done

# Shift remaining arguments after options are processed
shift $((OPTIND - 1))

if [[ ! -n $android_value || ! -n $react_native_value ]]; then
  echo "[Usage]\n$0 -a ANDROID_VERSION -r REACT_NATIVE_VERSION"
fi

# Validate parameter values (optional, adjust validation as needed)
if [[ -n "$android_value" && ! "$android_value" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Invalid value for - ANDROID_VERSION: '$android_value'" >&2
  exit 1
fi

if [[ -n "$react_native_value" && ! "$react_native_value" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Invalid value for - REACT_NATIVE_VERSION: '$react_native_value'" >&2
  exit 1
fi

# Update versions for AutoIdent
sed -i '' "s/idnow-platform:$current_android_version/idnow-platform:$android_value/g" android/build.gradle
#iOS SDK needs to be updated manually here by adding new frameworks
sed -i '' "s/current_android_version=\"$current_android_version/current_android_version=\"$android_value/g" release-public.sh

npm version "$react_native_value"

echo
echo "* * * * * * * Releasing $react_native_value public scoped package * * * * * * *"
echo

# Make sure current user is logged in under organization scope
npm login --registry=https://registry.npmjs.org --scope=@idnow
# Publish
npm publish --access public