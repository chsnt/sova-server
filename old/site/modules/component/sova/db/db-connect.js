const oracledb = require('oracledb');
oracledb.autoCommit = true;

class ConnectDB {

    constructor() {
        this.configDb = {
            user: "regpc",
            password: "qazxsw22",	//"zaQ102018za",
            connectString: "urz.open.ru/orz",
            poolMin: 1,
            poolMax: 50,
            poolTimeout: 3
        };

        this.connection = ""
    }


    static async setSql(queryString, bind = [], optionsObj = []) {
        let connection;
        connection = new ConnectDB();
        return new Promise((resolve, reject) => {

            oracledb.getConnection(
                connection.configDb
            ).then(connection => {

                return connection.execute(
                    queryString, bind, optionsObj
                ).then(result => {
                    resolve(result);
                    return connection.close();
                }).catch(err => {
                    reject(err);
                    return connection.close();
                })
            }).catch(err => reject(err));
        });
    }

    static async poolDbFormatObj(statement, params = [], optionsObj = {outFormat: oracledb.OUT_FORMAT_OBJECT}) {
        let connection = new ConnectDB();
        return new Promise((resolve, reject) => {
            oracledb.createPool(
                connection.configDb
            ).then(connection => {
                return connection.getConnection()
            }).then(connection => {

                return connection.execute(
                    statement, params, optionsObj
                ).then(result => {
                    resolve(result);
                    return connection.close();
                }).catch(err => {
                    let param = {
                        err: err instanceof Error,
                        message: err.message
                    };
                    resolve(param);
                    return connection.close();
                })
            }).catch(err => reject(err));
        });
    }

    static async poolDb(string, binds = [], options = []) {
        let connection = new ConnectDB();
        return new Promise((resolve, reject) => {
            oracledb.createPool(
                connection.configDb
            ).then(connection => {
                return connection.getConnection()
            }).then(connection => {
                return connection.execute(
                    string, binds, options
                ).then(result => {
                    resolve(result);
                    return connection.close();
                }).catch(err => {
                    let param = {
                        err: err instanceof Error,
                        message: err.message
                    };
                    resolve(param);
                    return connection.close();
                })
            }).catch(err => reject(err));
        });
    }

    static async poolDbMany(string, binds = [], options = []) {
        let connection = new ConnectDB();
        return new Promise((resolve, reject) => {
            oracledb.createPool(
                connection.configDb
            ).then(connection => {
                return connection.getConnection()
            }).then(connection => {
                return connection.executeMany(
                    string, binds, options
                ).then(result => {
                    resolve(result);
                    return connection.close();
                }).catch(err => {
                    let param = {
                        err: err instanceof Error,
                        message: err.message
                    };
                    resolve(param);
                    return connection.close();
                })
            }).catch(err => reject(err));
        });
    }

}


module.exports = ConnectDB;