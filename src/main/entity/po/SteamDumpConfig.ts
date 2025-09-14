import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('screen_dump_config')
export class SteamDumpConfig {
  @PrimaryColumn({ name: 'app_id', type: 'varchar' })
  appID: string = '';
  @PrimaryColumn({ name: 'steam_id', type: 'varchar' })
  steamID: string = '';
  @Column({ name: 'dump_path', type: 'varchar' })
  dumpPath: string = '';
  @Column({ name: 'create_folder', type: 'varchar' })
  createFolder: string = '';
  @Column({ name: 'folder_type', type: 'varchar' })
  folderType: string = '';
  @Column({ name: 'custom_folder_name', type: 'varchar' })
  folderName: string = '';
  @Column({ name: 'order_by_date', type: 'varchar' })
  orderByDate: string = '';
  appName: string = '';
  appLocation: string = '';
}
