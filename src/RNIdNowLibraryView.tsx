import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { RNIdNowLibraryViewProps } from './RNIdNowLibrary.types';

const NativeView: React.ComponentType<RNIdNowLibraryViewProps> =
  requireNativeViewManager('RNIdNowLibrary');

export default function RNIdNowLibraryView(props: RNIdNowLibraryViewProps) {
  return <NativeView {...props} />;
}
