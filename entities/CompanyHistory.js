const {Timestamp} = require('./types');
const AbstractEntity = require('./AbstractEntity')
const {STRING,DATE,NUMBER,DB_TYPE_NUMBER} = require('oracledb')
const uuid = require('uuid/v4')

class CompanyHistory extends AbstractEntity {
    static get table() {
        return 'PC_ATTRIBUTES_HIST'
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
            ID_COMPANY:{type:NUMBER, required: true, parentForeignKey: true},
            ID_TYPE_OF_COMPANY:{type:STRING},
            NAME:{type:STRING},
            TIN:{type:STRING},
            REG_PLACE: {type:STRING},
            SUM_INSURED:{type:NUMBER},
            DATE_OF_START_INSURANCE_POLICY:{type:DATE},
            DATE_OF_END_INSURANCE_POLICY:{type:DATE}
        }
        return result
    }

    constructor() {
        super();
        this.ID = null;
        this.COMPANY_ID = null
        this.STATUS_ROC = null;
        this.TYPE_OF_COMPANY = null;
        this.NAME = null;
        this.TIN = null;
        this.REG_PLACE = null;
        this.SUM_INSURED = null;
        this.DATE_OF_START_INSURANCE_POLICY = null;
        this.DATE_OF_END_INSURANCE_POLICY = null;
    }

}

module.exports = CompanyHistory
