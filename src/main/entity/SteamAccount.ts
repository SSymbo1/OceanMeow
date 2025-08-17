import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('steam_account')
export class SteamAccount {
  @PrimaryColumn({ name: 'account_id', type: 'varchar' })
  accountId: string = '';
  @Column({ name: 'steam_id', nullable: false, type: 'varchar' })
  steamId: string = '';
  @Column({ name: 'account_name', type: 'varchar' })
  accountName: string = '';
  @Column({ name: 'persona_name', nullable: false, type: 'varchar' })
  personaName: string = '';
  @Column({ name: 'avator', type: 'varchar' })
  avator: string = '';
  @Column({ name: 'last_login', type: 'varchar' })
  lastLogin: string = '';
}
