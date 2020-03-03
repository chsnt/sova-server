const Bottle = require("bottlejs");
const oracledb = require('oracledb');
Bottle.config.strict = true;
const bottle = new Bottle();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// oracledb.autoCommit = true;

// bottle.service('db', connection)

bottle.factory('pool', () => {
    let config
    if (process.env.NODE_ENV === 'production') {
        throw new Error('no prod by now')
        config = {
            user: "sova",
            password: "",
            connectString: "*:1521/ORCLCDB.localdomain",
            poolMin: 1,
            poolMax: 50,
            poolTimeout: 3

        }
    } else {
        config = {
            user: "sova",
            password: "sova",
            connectString: "*:1530/ORCLCDB.localdomain",
            poolMin: 1,
            poolMax: 50,
            poolTimeout: 3
        }
    }

    return oracledb.createPool(config)
})

bottle.factory('transaction', () => {
    async function transaction(body) {
        const pool = await bottle.container.pool
        const connection = await pool.getConnection({autoCommit: false})
        try {
            const bodyResult = await body(connection)
            await connection.commit()
            return bodyResult
        } catch (err) {
            await connection.rollback()
            throw err
        } finally {
            await connection.close()
        }
    }

    return transaction
})

bottle.factory('connection', async () => {
    const pool = await bottle.container.pool
    return pool.getConnection()
})

bottle.factory('logger', () => {
})

/**
 * @type {Bottle.IContainer}
 * @property {Promise<Object>} connection
 * @property {Promise<Object>} connectionWin
 * @property {function} transaction
 */
const container = bottle.container

module.exports = {bottle, container}
