import {ExpoConfig} from "@expo/config-types";

const withIdNowPermissions = (config: ExpoConfig) => {
  const androidPermissions = [
    'android.permissions.ACCESS_NETWORK_STATE',
    'android.permissions.INTERNET',
    'android.permissions.WRITE_EXTERNAL_STORAGE',
    'android.permissions.CAMERA',
    'android.permissions.FLASHLIGHT',
    'android.permissions.MODIFY_AUDIO_SETTINGS',
    'android.permissions.RECORD_AUDIO',
    'android.permissions.BLUETOOTH',
    'android.permissions.BLUETOOTH_ADMIN',
    'android.permissions.BLUETOOTH_CONNECT'
  ];

  if (!config.ios) {
    config.ios = {};
  }

  if (!config.android) {
    config.android = {};
  }

  // iOS Configuration
  config.ios.infoPlist = {
    ...config.ios.infoPlist,
    CFBundleDevelopmentRegion: 'de',
    NSCameraUsageDescription: 'Allow Camera Access for Video Identification',
    NSMicrophoneUsageDescription: 'Allow Microphone Access for Video Identification'
  };

  // Android Configuration
  if (!config.android.permissions) {
    config.android.permissions = [];
  }

  // Add permissions if they don't exist
  androidPermissions.forEach(permission => {
    if (!config.android!.permissions!.includes(permission)) {
      config.android!.permissions!.push(permission);
    }
  });

  return config;
};

export default withIdNowPermissions;
