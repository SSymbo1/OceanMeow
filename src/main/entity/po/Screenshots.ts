import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('screenshots')
export class Screenshots {
  @PrimaryColumn({ name: 'app_id', type: 'varchar' })
  appId: string = '';
  @PrimaryColumn({ name: 'user_id', type: 'varchar' })
  userId: string = '';
  @PrimaryColumn({ name: 'screen_index', type: 'int' })
  screenIndex: number = 0;
  @Column({ name: 'type', type: 'varchar' })
  type: string = '';
  @Column({ name: 'file_name', nullable: false, type: 'varchar' })
  fileName: string = '';
  @Column({ name: 'thumb_nail', nullable: false, type: 'varchar' })
  thumbNail: string = '';
  @Column({ name: 'imported', type: 'varchar' })
  imported: string = '';
  @Column({ name: 'width', type: 'varchar' })
  width: string = '';
  @Column({ name: 'height', type: 'varchar' })
  height: string = '';
  @Column({ name: 'game_id', type: 'varchar' })
  gameId: string = '';
  @Column({ name: 'creation', type: 'varchar' })
  creation: string = '';
  @Column({ name: 'permissions', type: 'varchar' })
  permission: string = '';
  @Column({ name: 'hscreenshot', type: 'varchar' })
  screenshot: string = '';
}
