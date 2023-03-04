import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GameStatuses } from '../models/GameModels';
import { UserEntity } from '../../users/entities/user.entity';
import { Answer, PlayerEntity } from './player.entity';
import { maxQuestionsCount } from '../constants/maxQuestionsCount';

@Entity({ orderBy: { pairCreatedDate: 'DESC' }, name: 'Games' })
export class GameEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => PlayerEntity, (p) => p.game, { eager: true, cascade: true, onDelete: 'CASCADE' })
  players: PlayerEntity[];

  @Column({ nullable: true })
  winnerId: number;

  @Column()
  status: GameStatuses;
  @Column()
  pairCreatedDate: Date;
  @Column({ nullable: true })
  startGameDate: Date | null;
  @Column({ nullable: true })
  finishGameDate: Date | null;
  @Column({
    nullable: true,
    type: 'json',
    transformer: {
      to: (value: object[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value),
    },
  })
  questions: QuestionInGame[] | null;

  public static create(user: UserEntity): GameEntity {
    const game = new GameEntity();
    game.players = [];
    game.addPlayer(user);

    game.status = GameStatuses.PENDING;
    game.pairCreatedDate = new Date();
    game.finishGameDate = null;
    game.startGameDate = null;
    game.questions = null;
    game.winnerId = null;

    return game;
  }

  startGame(user: UserEntity, questions: QuestionInGame[]) {
    this.addPlayer(user);

    this.status = GameStatuses.ACTIVE;
    this.startGameDate = new Date();
    this.questions = questions;
  }

  finishGame() {
    if (!this.isBothPlayersAnsweredAllQuestions()) {
      throw new Error('Both players should answer to questions');
    }
    const firstFinishedPlayer = this.findFirstFinishedPlayer();
    if (firstFinishedPlayer.isAtLeastOneAnswerIsRight()) {
      firstFinishedPlayer.addScore(1);
    }
    this.declareWinnerOrDraw();
    this.status = GameStatuses.FINISHED;
    this.finishGameDate = new Date();
  }

  declareWinnerOrDraw() {
    const winner = this.getPlayerIdWithHighestScore();
    if (!winner) {
      return;
    }
    this.winnerId = winner;
  }

  getPlayerIdWithHighestScore(): number | null {
    let maxScore = -Infinity;
    let maxScorePlayer: PlayerEntity | null = null;

    for (const player of this.players) {
      if (player.score > maxScore) {
        maxScore = player.score;
        maxScorePlayer = player;
      }
    }

    // Check if there are multiple players with the same max score
    for (const player of this.players) {
      if (player.score === maxScore && player !== maxScorePlayer) {
        return null;
      }
    }

    return maxScorePlayer ? maxScorePlayer.userId : null;
  }

  canBeFinished(): boolean {
    return this.isBothPlayersAnsweredAllQuestions();
  }

  findFirstFinishedPlayer(): PlayerEntity {
    return this.players.find((p) => p.isFirstFinished === true);
  }

  addPlayer(user: UserEntity) {
    const player = new PlayerEntity();
    player.connectedAt = new Date();
    player.score = 0;
    player.answers = [];
    player.user = user;
    player.game = this;
    player.isFirstFinished = false;

    this.players.push(player);
  }

  findPlayerById(userId: number): PlayerEntity {
    return this.players.find((p) => p.userId === userId);
  }

  isPlayerParticipant(playerId: number): boolean {
    return this.players.some((p) => p.userId === playerId);
  }

  isPlayerAnsweredAllQuestions(playerId: number): boolean {
    const player = this.findPlayerById(playerId);
    return player.answers.length === maxQuestionsCount;
  }

  isBothPlayersAnsweredAllQuestions(): boolean {
    const playersAnsweredAllQuestions: boolean[] = [];
    this.players.forEach((p) => playersAnsweredAllQuestions.push(p.answers.length === maxQuestionsCount));
    return playersAnsweredAllQuestions.every((hasAnsweredAllQuestions) => hasAnsweredAllQuestions === true);
  }

  handleAnswer(playerId: number, possibleAnswer: string): Answer {
    const player = this.findPlayerById(playerId);
    const currentQuestionIndex = player.answers.length;
    const currentPlayerQuestion = this.questions[currentQuestionIndex];
    const answer = { addedAt: new Date(), questionId: currentPlayerQuestion.id } as Answer;
    if (this.isAnswerCorrect(currentPlayerQuestion, possibleAnswer)) {
      answer.answerStatus = 'Correct';
      player.answers.push(answer);
      player.addScore(1);
    } else {
      answer.answerStatus = 'Incorrect';
      player.answers.push(answer);
    }
    return answer;
  }

  isAnswerCorrect(question: QuestionInGame, possibleAnswer: string): boolean {
    return question.correctAnswers.some((answer) => answer.toLowerCase() === possibleAnswer.toLowerCase());
  }

  isActive(): boolean {
    return this.status === 'Active';
  }
}

export type QuestionInGame = {
  id: number;
  body: string;
  correctAnswers: string[];
};
