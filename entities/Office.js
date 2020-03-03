const AbstractHistoryEntity = require('./AbstractHistoryEntity')
const oracledb = require('oracledb')
const uuid = require('uuid/v4')
const {NUMBER, STRING} = require('oracledb')

class Office extends AbstractHistoryEntity {
    static get table() {
        return 'PC_OFFICES'
    }

    static get columns() {
        const result = {
            ID: {
                type: STRING,
                required: true,
                primaryKey: true,
                generator: function(entity){
                    return entity.ID|| uuid()
                },
            },
            ID_COMPANY: {
                type: NUMBER,
                required: true,
            },
            PHONE: {
                type: STRING,
                required: true,
            },
            MOBILE_PHONE: {
                type: STRING,
                required: true,
            },
            FAX: {
                type: STRING,
                required: true,
            },
            EMAIL: {
                type: STRING,
                required: true,
            },
        }
        return result
    }


    constructor() {
        super()
        this.ID = null
        this.PHONE = null
        this.MOBILE_PHONE = null
        this.FAX = null
        this.EMAIL = null
    }

}

module.exports = Office
