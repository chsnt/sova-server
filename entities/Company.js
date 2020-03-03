const {Timestamp} = require('./types')
const AbstractHistoryEntity = require('./AbstractHistoryEntity')
const {STRING,DATE,NUMBER,DB_TYPE_NUMBER} = require('oracledb')

class Company extends AbstractHistoryEntity {
    static get table() {
        return 'PC_ATTRIBUTES'
    }
    static get columns() {
        const result = {
            ID: {
                type: DB_TYPE_NUMBER,
                required: true,
                primaryKey: true,
            },
            PSRN:{type: STRING},
            REG_DATE:{type:DATE},
            OKPO:{type: STRING},
            ACCOUNT_DETAILS_BANK_NAME: {type: STRING},
            ACCOUNT_DETAILS_SETTLEMENT_ACC: {type: STRING},
            ACCOUNT_DETAILS_CORR_ACC: {type: STRING},
            ACCOUNT_DETAILS_BIC: {type: STRING},
            CAPITAL_AMOUNT: {type: NUMBER},
            FEDERAL_TAX_SERVICE_CONTACTS: {type: STRING},
            AFFILIATES_INFO: {type: STRING},
            INSURANCE_COMPANIES: {type: STRING},
            APPRAISERS_INV_AVAILABILITY: {type:NUMBER},
            QUANTITY_APPRAISERS: {type:NUMBER},
            AVG_QTY_REPORTS_IN_MOUNTH: {type:NUMBER},
            RVC: {type: STRING},
            SITE:{type: STRING},
            ABBREVIATION: {type: STRING},
            SUBSIDIARIES: {type: STRING},
            QUANTITY_APPRAISERS_DECLARED: {type:NUMBER},
            REG_AGENCY: {type: STRING},
            DATE_OF_START_SD_CONCLUSION: {type: DATE},
            DATE_OF_START_LD_CONCLUSION: {type: DATE},
        }
        return result
    }



    constructor() {
        super()
        this.ID = null
        this.PSRN=null
        this.REG_DATE=null
        this.OKPO=null
        this.SITE=null
        this.ACCOUNT_DETAILS_BANK_NAME=null
        this.ACCOUNT_DETAILS_SETTLEMENT_ACC=null
        this.ACCOUNT_DETAILS_CORR_ACC=null
        this.ACCOUNT_DETAILS_BIC=null
        this.CAPITAL_AMOUNT=null
        this.FEDERAL_TAX_SERVICE_CONTACTS=null
        this.AFFILIATES_INFO=null
        this.INSURANCE_COMPANIES=null
        this.APPRAISERS_INV_AVAILABILITY=null
        this.QUANTITY_APPRAISERS=null
        this.AVG_QTY_REPORTS_IN_MOUNTH=null
        this.RVC=null
        this.ABBREVIATION=null
        this.SUBSIDIARIES=null
        this.QUANTITY_APPRAISERS_DECLARED=null
        this.REG_AGENCY=null
        this.DATE_OF_START_SD_CONCLUSION=null
        this.DATE_OF_START_LD_CONCLUSION=null
    }

}

module.exports = Company
