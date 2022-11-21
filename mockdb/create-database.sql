CREATE TABLE func_events (
	id varchar(255) COLLATE Latin1_General_CI_AI NULL,
	time_stamp bigint NULL,
	process_name varchar(255) COLLATE Latin1_General_CI_AI NULL,
	coming_from_id varchar(255) COLLATE Latin1_General_CI_AI NULL,
	process_instanceid varchar(255) COLLATE Latin1_General_CI_AI NULL,
	func varchar(255) COLLATE Latin1_General_CI_AI NULL,
	func_type varchar(11) COLLATE Latin1_General_CI_AI NULL,
	next_retry_at bigint NULL,
	source_topic varchar(255) COLLATE Latin1_General_CI_AI NULL,
	message_key varchar(45) COLLATE Latin1_General_CI_AI NULL,
	correlation_state varchar(255) COLLATE Latin1_General_CI_AI NULL,
	retry_count int NULL,
	kafka_message varchar(MAX) COLLATE Latin1_General_CI_AI NULL
);