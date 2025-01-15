import * as React from 'react';

import { RNIdNowLibraryViewProps } from './RNIdNowLibrary.types';

export default function RNIdNowLibraryView(props: RNIdNowLibraryViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
