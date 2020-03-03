const AbstractEntity = require("./AbstractEntity")
const {STRING} = require('./types')

class SelfRegOrg extends AbstractEntity {
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
                    return entity.ID|| uuid()
                },
            },
            SELFREG_ORG: {
                type: STRING
            },
        }
    }

    constructor() {
        super()
        this.ID = null
        this.SELFREG_ORG = null
    }

}

module.exports = SelfRegOrg