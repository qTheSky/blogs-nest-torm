import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuizQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  body: string;
  @Column({
    type: 'simple-array',
    transformer: {
      to: (value: string[]) => JSON.stringify(value),
      from: (value: string) => JSON.parse(value),
    },
  })
  // @Column('simple-array')
  correctAnswers: string[];
  @Column()
  published: boolean;
  @Column()
  createdAt: Date;
  @Column({ nullable: true })
  updatedAt: Date;

  public static create(body: string, correctAnswers: string[]): QuizQuestion {
    const question = new QuizQuestion();

    question.body = body;
    question.correctAnswers = correctAnswers;

    question.published = false;
    question.createdAt = new Date();
    question.updatedAt = null;
    return question;
  }
}
