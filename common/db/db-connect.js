const oracledb = require("oracledb");
const bottle = require("../../bottle");
//const e = require("../utils/errorTemplate.js");
oracledb.autoCommit = true;

class ConnectDB {

  constructor(data) {
    //  this.configDb = {
    // 	user          : "regpc",
    // 	password      : "qazxsw22",	//"zaQ102018za",
    // 	connectString : "urz.open.ru/orz",
    // 	poolMin         : 1,
    // 	poolMax         : 50,
    // 	poolTimeout     : 3
    // };
    this.connection = "";
  }

  static async setSql(queryString, bind = [], optionsObj = []) {
    return new Promise((resolve, reject) => {
      bottle.container.pool
        .then(connection => {
          return connection.execute(
            queryString, bind, optionsObj
          ).then(result => {
            resolve(result);
          }).catch(err => {
            reject(err);
          });
        })
        .catch(err => reject(err))
        .finally(() => {
          return connection.close();
        });
    });


  }

  static async poolDbFormatObj(statement, params = [], optionsObj = { outFormat: oracledb.OUT_FORMAT_OBJECT }) {
    return new Promise((resolve, reject) => {
      bottle.container.pool.then(poll => {
        return poll.getConnection();
      }).then(connection => {
        connection.execute(
          statement, params, optionsObj
        ).then(result => {
          resolve(result);
        }).catch(err => {
          reject(err.message);
        }).finally(() => {
          connection.close();
        });
      });
    });

  }

  static async poolDb(string, binds=[], options=[]){

    return new Promise((resolve, reject) => {
      bottle.container.pool.then(poll => {
        return poll.getConnection();
      }).then(connection => {
        connection.execute(
          string, binds, options
        ).then(result => {
          resolve(result);
        }).catch(err => {
          reject(err.message);
        }).finally(() => {
          connection.close();
        });
      });
    });
  }

  // static async poolDb(string, binds = [], options = []) {
  //   let connection;
  //   try {
  //     connection = await bottle.connection;
  //     return await connection.execute(string, binds, options);
  //   } finally {
  //     await connection.close();
  //   }
  // }

  //
  // static async poolDbMany(string, binds=[], options=[]){
  //
  // 	return new Promise((resolve, reject) => {
  // 		bottle.container.connection.then(connection=>{
  // 			return connection.execute(
  // 				string, binds, options
  // 			).then(result => {
  // 				resolve(result);
  // 				return connection.close();
  // 			}).catch(err => {
  // 				let param = {
  // 					err:err instanceof Error,
  // 					message:err.message
  // 				};
  // 				resolve(param);
  // 				return connection.close();
  // 			})
  // 		}).catch(err => reject(err));
  // 	});
  //
  // }
  //
}


module.exports = ConnectDB;