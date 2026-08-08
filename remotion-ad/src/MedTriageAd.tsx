import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import {
  HeroScene,
  PromiseScene,
  IntakeScene,
  QueueScene,
  ReviewScene,
  CTAScene,
} from './screens';

const T = 12;

export const MedTriageAd: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={120} name="Hero">
        <HeroScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade({ shouldFadeOutExitingScene: true })}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={90} name="Promise">
        <PromiseScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade({ shouldFadeOutExitingScene: true })}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={180} name="Intake">
        <IntakeScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade({ shouldFadeOutExitingScene: true })}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={180} name="Queue">
        <QueueScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade({ shouldFadeOutExitingScene: true })}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={150} name="Review">
        <ReviewScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade({ shouldFadeOutExitingScene: true })}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={240} name="CTA">
        <CTAScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
