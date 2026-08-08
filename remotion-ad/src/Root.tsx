import React from 'react';
import { Composition } from 'remotion';
import { MedTriageAd } from './MedTriageAd';

export const Root: React.FC = () => {
  return (
    <Composition
      id="MedTriageAd"
      component={MedTriageAd}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
