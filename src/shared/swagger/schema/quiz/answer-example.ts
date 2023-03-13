import { AnswerViewModel } from '../../../../quiz/models/GameModels';
import { isoDateExample } from '../common/iso-date-example';

export const answerExample: AnswerViewModel = {
  questionId: 'string',
  answerStatus: 'Correct',
  addedAt: isoDateExample,
};
