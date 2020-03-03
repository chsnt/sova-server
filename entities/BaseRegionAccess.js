const AbstractEntity = require('../entities/AbstractEntity')
const {NUMBER, DATE} = require('./types')

class BaseRegionAccess extends AbstractEntity {
    static get table() {
        return 'PC_ATTR_BY_REGIONS_HIST'
    }
    static get columns() {
        return {
            ID: {
                type: NUMBER,
                required: true,
                primaryKey: true,
                generated: true,
            },
            ID_COMPANY:    { type: NUMBER },
            ID_REGION:     { type: NUMBER },
            ACCESS_WEIGHT: { type: NUMBER },
            DATETIME: {
                type: DATE,
                required: true,
                generator: function (entity){
                    return new Date()
                }
            },
            ID_USER: {
                type: NUMBER
            }
        }
    }

    constructor() {
        super()
        this.ID = null
        this.ID_COMPANY = null
        this.ID_REGION = null
        this.ACCESS_WEIGHT = null
        this.ID_USER = null
    }

}


module.exports = BaseRegionAccess