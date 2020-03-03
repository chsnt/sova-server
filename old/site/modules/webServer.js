const oracledb = require('oracledb');

module.exports = {
	async shutdown (e) {
	  let err = e;
		
	  console.log('Shutting down');
	 
	  try {
		console.log('Closing web server module');	 
		await this.close();
	  } catch (e) {
		console.log('Encountered error', e);
	 
		err = err || e;
	  }
	  
	  try {
		console.log('Closing database module');
	 
		await oracledb.getPool().close();
	  } catch (err) {
		console.log('Encountered error', e);
	 
		err = err || e;
	  }
	 
	  console.log('Exiting process');
	 
	  if (err) {
		process.exit(1); // Non-zero failure code
	  } else {
		process.exit(0);
	  }
	},
	
	close () {
	  return new Promise((resolve, reject) => {
		httpServer.close((err) => {
		  if (err) {
			reject(err);
			return;
		  }
	 
		  resolve();
		});
	  });
	}
	
}