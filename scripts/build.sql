-- library definition

DROP TABLE IF EXISTS library;
CREATE TABLE library (
	app_id VARCHAR,
	name VARCHAR NOT NULL,
	name_localized VARCHAR,
	library_pic VARCHAR,
	library_hero VARCHAR,
	library_logo VARCHAR,
	save_path VARCHAR,
	save_pattern VARCHAR,
	save_root VARCHAR,
	developer VARCHAR,
	app_type VARCHAR, del varchar(1) default '0',
	CONSTRAINT LIBRARY_PK PRIMARY KEY (app_id)
);


-- library_time definition

DROP TABLE IF EXISTS library_time;
CREATE TABLE library_time(
	account_id varchar(20),
	app_id varchar(15),
	play_time varchar(12),
	last_play varchar(12),
	primary key(account_id,app_id)
);


-- screen_dump_config definition

DROP TABLE IF EXISTS screen_dump_config;
CREATE TABLE screen_dump_config(
	app_id VARCHAR,
	steam_id VARCHAR,
	dump_path VARCHAR not null,
	create_folder varchar(1) default '0',
	folder_type varchar(1) default '0',
	custom_folder_name VARCHAR,
	order_by_date varchar(1) default '0',
	primary key(app_id,steam_id)
);


-- screenshots definition

DROP TABLE IF EXISTS screenshots;
CREATE TABLE screenshots(
	`app_id` varchar(20),
	`user_id` varchar(25),
	`screen_index` int,
	`type` varchar(2),
	`file_name` varchar(150) not null,
	`thumb_nail` varchar(150) not null,
	`imported` varchar(2),
	`width` varchar(5),
	`height` varchar(5),
	`game_id` varchar(20),
	`creation` varchar(15),
	`permissions` varchar(2),
	`hscreenshot` varchar(30),
	primary key (app_id,user_id,screen_index)
);


-- steam_account definition

DROP TABLE IF EXISTS steam_account;
CREATE TABLE steam_account(
	`account_id` varchar(20) primary key,
	`steam_id` varchar(20) not null,
	`account_name` varchar(25),
	`persona_name` varchar(80) not null,
	`avatar` varchar(200),
	`last_login` varchar(200)
);


-- vdf_tracker definition

DROP TABLE IF EXISTS vdf_tracker;
CREATE TABLE vdf_tracker(
	tracker_id integer primary key autoincrement,
	file_name varchar(50) not null,
	file_hash varchar(32) not null,
	object_name varchar(50) not null,
	object_hash varchar(32) not null,
	update_date varchar(15)
);


-- account_screenshot_view source

DROP VIEW IF EXISTS account_screenshot_view;
CREATE VIEW account_screenshot_view (
	steam_long_id,steam_short_id,login_name,user_name,app_id,app_name,
	app_localized,screen_index,screen_image,screen_thumb,screen_width,
	screen_height,screen_creation,app_del
) AS
	SELECT
		sa.account_id 'steam_long_id',
		sa.steam_id 'steam_short_id',
		sa.account_name 'login_name',
		sa.persona_name 'user_name',
		s.app_id 'app_id',
		l.name 'app_name',
		l.name_localized 'app_localized',
		CAST(s.screen_index AS NUMBER) 'screen_index',
		s.file_name 'screen_image',
		s.thumb_nail 'screen_thumb',
		s.width 'screen_width',
		s.height 'screen_height',
		STRFTIME('%Y-%m-%d %H:%M:%S',s.creation,'unixepoch') 'screen_creation',
		l.del 'app_del'
	FROM screenshots s 
	LEFT JOIN library l ON l.app_id = s.app_id
	LEFT JOIN steam_account sa ON sa.steam_id = s.user_id
	ORDER BY steam_long_id DESC,app_name ASC,screen_index ASC,screen_creation DESC;


-- account_library_view source

DROP VIEW IF EXISTS account_library_view;
CREATE VIEW account_library_view (
	steam_long_id,steam_short_id,login_name,user_name,screen_count,app_id,app_name,app_localized,app_pic,app_hero,app_logo,
	play_time_minute,play_time_hour,last_play,app_type,app_del
) AS
	SELECT
		sa.account_id 'steam_long_id',
		sa.steam_id 'steam_short_id',
		sa.account_name 'login_name',
		sa.persona_name 'user_name',
		IFNULL(sc.screen_count,0),
		l.app_id 'app_id',
		l.name 'app_name',
		l.name_localized 'app_localized',
		l.library_pic 'app_pic',
		l.library_hero 'app_hero',
		l.library_logo 'app_logo', 
		CAST(lt.play_time AS NUMBER) 'play_time_minute',
		ROUND(CAST(lt.play_time AS REAL) / 60.0, 2) 'play_time_hour',
		STRFTIME('%Y-%m-%d',lt.last_play,'unixepoch') 'last_play',
		CASE
			WHEN l.app_type = 'game' OR l.app_type = 'Game' THEN 'Game'
			ELSE l.app_type 
		END 'app_type',
		l.del 'app_del'
	FROM library l 
	LEFT JOIN library_time lt ON l.app_id  = lt.app_id 
	LEFT JOIN steam_account sa ON sa.steam_id = lt.account_id
	LEFT JOIN (
		SELECT
			steam_short_id steam_short_id,
			app_id app_id,
			count(app_id) screen_count
		FROM account_screenshot_view 
		GROUP BY app_id,steam_short_id
	) sc ON sc.app_id = l.app_id and sa.steam_id = sc.steam_short_id
	ORDER BY steam_long_id DESC,play_time_minute DESC;