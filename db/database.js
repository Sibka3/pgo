// config/database.js
module.exports = {
    'connection': {
        'host': 'localhost',
        'user': 'pgo_user',
        'password': '1'
    },
	'database': 'my_schema',
    'tables':{
    	'users':{
    		'table_name':'users',
    		'id':'user_id',
    		'first_name':'user_first_name',
    		'last_name':'user_last_name',
    		'email':'user_email',
    		'password':'user_pass_hash',
            'user_type':'user_type'
    	},
        'users_to_btcwallets':{
        	'table_name':'users_to_btcwallets',
        	'user_id':'user_id',
        	'btcwallet_id':'btcwallet_id'
        },
        'btcwallets':{
        	'table_name':'btcwallets',
        	'btcwallet_id':'btcwallet_id',
        	'btcwallet_address':'btcwallet_address',
        	'btcwallet_name':'btcwallet_name'
        },
    	'capitalization_factors':{
    		'table_name':'capitalization_factors',
    		'factor_id':'factor_id',
    		'factor_date':'factor_date'
    	},
    	'btctransactions':{
    		'table_name':'btctransactions',
    		'trans_id':'trans_id',
    		'trans_count':'trans_count',
    		'trans_datetime':'trans_datetime'
    	},
    	'users_to_btctrans':{
    		'table_name':'users_to_btctrans',
    		'user_id':'user_is',
    		'trans_id':'trans_id'
    	},
        'key_email_pass':{
            'table_name':'key_email_pass',
            'user_email':'user_email',
            'user_pass_hash':'user_pass_hash',
            'user_key':'user_key'
        },
        'key_email':{
            'table_name':'key_email',
            'user_email':'user_email',
            'user_key':'user_key'
        }
    }
};