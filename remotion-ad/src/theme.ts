import { loadFont as loadInstrument } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';

export const { fontFamily: serifFamily } = loadInstrument('normal', {
  weights: ['400'],
  subsets: ['latin'],
  ignoreTooManyRequestsWarning: true,
});

export const { fontFamily: sansFamily } = loadInter('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
  ignoreTooManyRequestsWarning: true,
});
