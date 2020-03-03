const {Timestamp} = require('./types')
const AbstractEntity = require('./AbstractEntity')
const oracledb = require('oracledb')
const {NUMBER, STRING, DATE} = require('oracledb')

class OfficeHistory extends AbstractEntity {
    static get table() {
        return 'PC_OFFICES_ADDRESS_HIST'
    }

    static get columns() {
        const result = {
            ID: {type: NUMBER, required: true, primaryKey: true},
            OFFICE_ADDRESS: {type: STRING, required: true},
            ID_OFFICE: {type: STRING, required: true, parentForeignKey: true},
            DATETIME: {
                type: DATE,
                required: true,
                generator: function (entity){
                    return new Date()
                }
            },
        }
        return result
    }

    constructor() {
        super()
        this.ID = null
        this.OFFICE_ADDRESS = null
        this.ID_OFFICE = null
        this.DATETIME= null
    }
}

module.exports = OfficeHistory
