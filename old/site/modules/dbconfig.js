module.exports = {
	
	user : process.env.NODE_ORACLEDB_USER || "system",
	password : process.env.NODE_ORACLEDB_PASSWORD || "zaQ!102018za1",
	connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "localhost/orz",	

	externalAuth : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false,
	salt: 'urz-tech-secret',
	
	hrPool: {
		user : process.env.NODE_ORACLEDB_USER || "system",
		password : process.env.NODE_ORACLEDB_PASSWORD || "zaQ!102018za1",
		connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "localhost/orz",	
		poolMin: 10,
		poolMax: 10,
		poolIncrement: 0
	}

};