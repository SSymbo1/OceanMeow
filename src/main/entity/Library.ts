import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('library')
export class Library {
  @PrimaryColumn({ name: 'app_id', type: 'varchar' })
  appId: string = '';
  @Column({ name: 'name', nullable: false, type: 'varchar' })
  name?: string = '';
  @Column({ name: 'name_localized', type: 'varchar' })
  nameLocal: string = '';
  @Column({ name: 'library_pic', type: 'varchar' })
  libraryPic: string = '';
  @Column({ name: 'library_hero', type: 'varchar' })
  libraryHero: string = '';
  @Column({ name: 'library_logo', type: 'varchar' })
  libraryLogo: string = '';
  @Column({ name: 'save_path', type: 'varchar' })
  savePath: string = '';
  @Column({ name: 'save_pattern', type: 'varchar' })
  savePattern: string = '';
  @Column({ name: 'save_root', type: 'varchar' })
  saveRoot: string = '';
  @Column({ name: 'developer', type: 'varchar' })
  developer: string = '';
  @Column({ name: 'app_type', type: 'varchar' })
  appType: string = '';
  @Column({ name: 'del', type: 'varchar', default: '0' })
  del: string = '0';
}
