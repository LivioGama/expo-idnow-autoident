# AutoIdent SDK - Expo module

## Getting started

This is a fork of the official [IDnow ReactNative SDK](https://www.npmjs.com/package/@idnow/react-autoident) with some extra features and bug fixes.

### Install from NPM
```sh
bun add github:LivioGama/expo-idnow-autoident
```

## Usage

Configure your `app.json` file with the following:

```json
{
  "expo": {
    "plugins": [
      ["@idnow/react-autoident"]
    ]
  }
}
```

The plugin will set the permissions, add the NFC for iOS and the framework to your main project and pod dependency,

### Android
The `react-autoident` library _android_ module targets the latest Android 15 OS. In order to be compliant with the Google's requirements, please make sure that your `android` module from your host app targets the latest Android API level 35.
In order to ensure full compatibility with our library, you need to add in your _android/gradle.properties_ file the next lines:
```gradle
android.minSdkVersion=24
android.compileSdkVersion=35
android.targetSdkVersion=35
expo.useLegacyPackaging=false
```

### iOS

...

### Launching an identification

```js
import * as idnow from '@idnow/react-autoident';

function launchAutoIdent(token: string) {
    idnow.startIdent(token);
}
```




