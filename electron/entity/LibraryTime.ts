import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity('library_time')
export class LibraryTime {
    @PrimaryColumn({ name: 'account_id', type: "varchar" })
    accountId: string = "";
    @PrimaryColumn({ name: 'app_id', type: "varchar" })
    appId: string = "";
    @Column({ name: 'play_time', type: "varchar" })
    playTime: string = "";
    @Column({ name: 'last_play', type: "varchar" })
    lastPlay: string = "";
}