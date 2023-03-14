import { QuizQuestionViewModel } from '../../../../super-admin/models/quiz/QuizQuestionViewModel';
import { isoDateExample } from '../common/iso-date-example';

export const questionExample: QuizQuestionViewModel = {
  id: 'string',
  body: 'string',
  correctAnswers: ['string'],
  published: false,
  createdAt: isoDateExample,
  updatedAt: isoDateExample,
};
