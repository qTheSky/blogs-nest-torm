import { StatisticsViewModel } from './StatisticsViewModel';

export type TopPlayerViewModel = StatisticsViewModel & {
  player: {
    id: string;
    login: string;
  };
};
