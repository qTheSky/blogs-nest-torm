import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { PlayerEntity } from './player.entity';

@Entity('PlayerStatistics')
export class PlayerStatisticsEntity {
  @PrimaryColumn()
  userId: number;

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @OneToMany(() => PlayerEntity, (p) => p.statistics)
  gameParticipatingAsPlayer: PlayerEntity;

  @Column()
  sumScore: number;
  @Column()
  gamesCount: number;
  @Column()
  winsCount: number;
  @Column()
  lossesCount: number;
  @Column()
  drawsCount: number;
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  avgScores: string;

  static create(user: UserEntity): PlayerStatisticsEntity {
    const statistics = new PlayerStatisticsEntity();
    statistics.user = user;

    statistics.sumScore = 0;
    statistics.gamesCount = 0;
    statistics.avgScores = '0';
    statistics.winsCount = 0;
    statistics.lossesCount = 0;
    statistics.drawsCount = 0;
    return statistics;
  }
}
