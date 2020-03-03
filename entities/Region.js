const AbstractEntity = require('./AbstractEntity');
const {NUMBER, STRING} = require('./types')

class Region extends AbstractEntity {
    static get table() {
        return 'PUB.SHORT_LIST_REGIONS'
    }

    static get columns() {
        const result = {
            ID: {
                type: NUMBER,
                required: true,
                primaryKey: true,
            },
            STATE: {type: STRING},
        }
        return result
    }


    // static async list(connection){
    //     return super.list(connection, {SOVA:1})
    // }


    constructor() {
        super()
        this.ID = null
        this.STATE = null
    }
}

module.exports = Region
