import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;
  @Column('simple-array')
  correctAnswers: string[];
  @Column()
  published: boolean;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;

  public static create(body: string, correctAnswers: string[]): QuizQuestion {
    const question = new QuizQuestion();

    question.body = body;
    question.correctAnswers = correctAnswers;

    question.published = false;
    question.createdAt = new Date();
    question.updatedAt = new Date();
    return question;
  }
}
