const AbstractEntity = require('./AbstractEntity');
const {NUMBER, STRING, BIND_OUT, DATE} = require('oracledb')
const uuid = require('uuid/v4')

class PresenceLocality extends AbstractEntity {
    static get table() {
        return 'PRESENCE_LOCALITY'
    }

    static get columns() {
        const result = {
            ID: {
                type: STRING,
                required: true,
                primaryKey: true,
                generator: function (entity) {
                    return entity.ID || uuid()
                },
            },
            ID_COMPANY: {type: NUMBER},
            ID_OFFICE: {type: STRING},
            ID_LOCALITY: {type: NUMBER},
        }
        return result
    }


    // static async list(connection){
    //     return super.list(connection, {SOVA:1})
    // }


    constructor() {
        super()
        this.ID = null
        this.ID_COMPANY = null
        this.ID_OFFICE = null
        this.ID_LOCALITY = null
    }
}

module.exports = PresenceLocality
