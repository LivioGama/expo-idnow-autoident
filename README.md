# AutoIdent SDK - ReactNative module

## Getting started

### Install from NPM
```sh
// with npm
npm install @idnow/react-autoident

// with yarn
yarn add @idnow/react-autoident
```

## Usage
You will have access to the following methods to communicate with the sdk.

```js
    /**
 * Starts the native IDnow AI SDK for an identification session
 *
 * @param token - A string paramter representing the IdentificationToken
 */
export function startIdent(token: string): string {
    return RNIdNowLibraryModule.startIdent(token);
}
```

### Android
The `react-autoident` library _android_ module targets the latest Android 15 OS. In order to be compliant with the Google's requirements, please make sure that your `android` module from your host app targets the latest Android API level 35.
In order to ensure full compatibility with our library, you need to add in your _android/gradle.properties_ file the next lines:
```gradle
android.minSdkVersion=24
android.compileSdkVersion=35
android.targetSdkVersion=35
expo.useLegacyPackaging=false
```
Tested with the following Gradle Versions:
```gradle
classpath('com.android.tools.build:gradle:8.5.2') in project\'s build.gradle
distributionUrl=https://services.gradle.org/distributions/gradle-8.7-bin.zip in gradle/wrapper/gradle-wrapper.properties
```

**Note:** Since IDnow Android SDK targets Android 15 (API Level 35), when building your application, you might get a build error from `expo-modules-core` dependency:
```gradle
node_modules/expo-modules-core/android/src/main/java/expo/modules/adapters/react/permissions/PermissionsService.kt:166:36 Only safe (?.) or non-null asserted (!!.) calls are allowed on a nullable receiver of type Array<(out) String!>?
```
In order to fix this, from your local `node-modules` dependencies open the `PermissionsService.kt` class and update the line 166 to the following:
```
return requestedPermissions?.contains(permission) == true
```

### iOS
The `react-autoident` library _ios_ module requires to run the following command
```shell
npx pod-intall
```

### Launching an identification

```js
    import * as idnow from '@idnow/react-autoident';

function launchAutoIdent(token: string) {
    idnow.startIdent(token);
}
```




