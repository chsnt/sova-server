const AbstractEntity = require("./AbstractEntity")
const {STRING} = require('./types')

class CompanyType extends AbstractEntity {
    static get table() {
        return 'LISTS'
    }
    static get columns() {
        return {
            ID: {
                type: STRING,
                required: true,
                primaryKey: true,
                generator: function(entity){
                    return entity.ID || uuid()
                },
            },
            TYPE_OF_COMPANY: {
                type: STRING
            },
        }
    }

    constructor() {
        super()
        this.ID = null
        this.TYPE_OF_COMPANY = null
    }

}

module.exports = CompanyType