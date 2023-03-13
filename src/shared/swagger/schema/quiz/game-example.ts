import { GamePairViewModel, GamePlayerProgressViewModel, GameStatuses } from '../../../../quiz/models/GameModels';
import { isoDateExample } from '../common/iso-date-example';

const playerProgress: GamePlayerProgressViewModel = {
  answers: [{ questionId: 'string', answerStatus: 'Correct', addedAt: isoDateExample }],
  player: { id: 'string', login: 'string' },
  score: 0,
};

export const gameExample: GamePairViewModel = {
  id: 'string',
  firstPlayerProgress: playerProgress,
  secondPlayerProgress: playerProgress,
  questions: [{ id: 'string', body: 'string' }],
  status: GameStatuses.PENDING,
  pairCreatedDate: isoDateExample,
  startGameDate: isoDateExample,
  finishGameDate: isoDateExample,
};
