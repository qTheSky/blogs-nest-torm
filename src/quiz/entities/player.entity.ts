import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AnswerStatuses } from '../models/GameModels';
import { Game } from './game.entity';
import { User } from '../../users/entities/user.entity';
import { maxQuestionsCount } from '../constants/maxQuestionsCount';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE', cascade: true })
  user: User;
  @Column()
  userId: number;
  @ManyToOne(() => Game, { onDelete: 'CASCADE' })
  game: Game;
  @Column()
  gameId: number;

  @Column({
    nullable: true,
    type: 'json',
    transformer: {
      to: (value: object[]) => JSON.stringify(value),
      from: (value: string) => {
        // because i want to date was date not string
        const answers = JSON.parse(value);
        return answers.map((answer) => ({
          ...answer,
          addedAt: new Date(answer.addedAt),
        }));
      },
    },
  })
  answers: Answer[];

  @Column()
  score: number;
  @Column()
  isFirstFinished: boolean;

  addScore(count: number) {
    this.score += count;
  }

  isAtLeastOneAnswerIsRight(): boolean {
    return this.answers.some((a) => a.answerStatus === 'Correct');
  }

  makeFirstFinished() {
    this.isFirstFinished = true;
  }

  isFinishedAnsweringAllQuestions(): boolean {
    return this.answers.length === maxQuestionsCount;
  }
}

export type Answer = {
  questionId: number;
  answerStatus: AnswerStatuses;
  addedAt: Date;
};
