INSERT INTO tempdb.dbo.func_events (id,time_stamp,process_name,coming_from_id,process_instanceid,func,func_type,next_retry_at,source_topic,message_key,correlation_state,retry_count,kafka_message) VALUES
	 (N'6ff34a48-e436-11ed-b5ea-0242ac120002',NULL,N'Item Order',NULL,N'84949b14-e436-11ed-b5ea-0242ac120002',N'Get Customer',N'WORKFLOW',NULL,NULL,NULL,NULL,NULL,N'{"person": "234dfasd"}'),
	 (N'9286af4c-e741-11ed-a05b-0242ac120003',NULL,N'Item Order',N'6ff34a48-e436-11ed-b5ea-0242ac120002',N'84949b14-e436-11ed-b5ea-0242ac120002',N'Ship item',N'WORKFLOW',NULL,NULL,NULL,NULL,NULL,N'{"person": "234dfasd"}'),
	 (N'9286af4c-e741-11ed-a05b-02654c120632',NULL,N'Item Order',NULL,N'84949b14-e436-11ed-b5ea-0242ac120222',N'Send Email',N'WORKFLOW',NULL,NULL,NULL,NULL,NULL,N'{"person": "234dfasd"}');
