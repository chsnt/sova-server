const AbstractEntity = require('./AbstractEntity')
const {Region, User} = require('./index')
const {NUMBER, STRING, BIND_OUT, DATE} = require('oracledb')

class Curator extends AbstractEntity {
    static get table() {
        return 'CURATORS'
    }

    static get columns() {
        return {
            ID: {
                type: STRING,
                required: true,
                primaryKey: true,
            },
            ID_REGION: {type: NUMBER, entity: Region, field: 'REGION'},
            ID_USER: {type: NUMBER, entity: User, field: 'USER'},
        }
    }

    constructor() {
        super()
        this.REGION = null
        this.USER = null
    }
}

module.exports = Curator
