const BaseRegionAccess = require('./BaseRegionAccess')
const {NUMBER, STRING, BIND_IN, BIND_OUT} = require('./types')


class RegionAccess extends BaseRegionAccess {
    static get table() {
        return 'PC_ACC_BY_REGIONS_ACTUAL_VIEW'
    }
    static get columns() {
        return {
            ID_COMP_REGION: {
                type: NUMBER,
                required: true,
                primaryKey: true,
                generated: true,
            },
            ID_COMPANY:    { type: NUMBER },
            ID_REGION:     { type: NUMBER },
            ACCESS_WEIGHT: { type: NUMBER },
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

    async create(connection) {
        const temp= new BaseRegionAccess()
        temp.merge(this)
        await temp.create(connection)

        this.primaryKey= temp.primaryKey
    }
}

module.exports = RegionAccess
