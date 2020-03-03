const AbstractEntity = require("./AbstractEntity")
const {STRING} = require('./types')

class StatusRoc extends AbstractEntity {
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
            STATUS_ROC: {
                type: STRING
            },
        }
    }

    constructor() {
        super()
        this.ID = null
        this.STATUS_ROC = null
    }

}

module.exports = StatusRoc