import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vdf_tracker')
export class VdfTracker {
  @PrimaryGeneratedColumn('increment', { name: 'tracker_id' })
  trackerId: string = '';
  @Column({ name: 'file_name', nullable: false, type: 'varchar' })
  fileName: string = '';
  @Column({ name: 'file_hash', nullable: false, type: 'varchar' })
  fileHash: string = '';
  @Column({ name: 'object_name', nullable: false, type: 'varchar' })
  objectName: string = '';
  @Column({ name: 'object_hash', nullable: false, type: 'varchar' })
  objectHash: string = '';
  @Column({ name: 'update_date', type: 'varchar' })
  updateDate: string = '';
}
