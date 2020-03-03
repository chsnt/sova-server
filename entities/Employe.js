const AbstractEntity = require('./AbstractEntity');
const {STRING,DATE,NUMBER,CLOB} = require('oracledb');
class Employe extends AbstractEntity {
  static get table() {
    return 'PC_STAFF'
  }

  static get columns() {
      return{
        ID: {type: NUMBER, required: true, primaryKey: true},
        STATUS:{type:STRING},                //VARCHAR2(128 char),
        FULLNAME:{type:STRING},              //VARCHAR2(2000 char),
        DATEBORN:{type:DATE},              //DATE,
        PLACEBORN:{type:STRING},             //VARCHAR2(2000 char),
        PASSPORT:{type:STRING},              //VARCHAR2(2000 char),
        PASSPORT_ISSUER:{type:STRING},       //VARCHAR2(2000 char),
        PASSPORT_DATE:{type:DATE},         //DATE,
        ADDRESS_REG:{type:STRING},           //VARCHAR2(2000 char),
        EXPERIENCE_IN_COMPANY:{type:NUMBER}, //NUMBER,
        PHONE_NUM:{type:STRING},             //VARCHAR2(20 char),
        EMPL_CONTRACT:{type:STRING},         //VARCHAR2(2000 char),
        DIPLOM:{type:STRING},                //VARCHAR2(2000 char),
        SELFREG_PROOF_DOC:{type:STRING},     //VARCHAR2(2000 char),
        INSURANCE_POLICY:{type:STRING},      //VARCHAR2(2000 char),
        INSURANCE_COMPANY:{type:STRING},     //VARCHAR2(2000 char),
        INSURANCE_AMOUNT:{type:NUMBER},      //NUMBER,
        INSURANCE_START_DATE:{type:DATE},  //DATE,
        INSURANCE_END_DATE:{type:DATE},    //DATE,
        EXPERIENCE_ALL:{type:NUMBER},        //NUMBER,
        ID_COMPANY:{type:NUMBER},            //NUMBER,
        ADDRESS_RESIDENTIAL:{type:STRING},      //VARCHAR2(2000 char),
        LEGACY_CERT_DATA:{type:CLOB},         //CLOB,
        LEGACY_DATE_ADD:{type:STRING},          //VARCHAR2(64 char),
        AUTHOR_ADD:{type:STRING},               //VARCHAR2(64 char),
        POSITION_WEIGHT:{type:NUMBER},          //NUMBER,
        LEGACY_I_COMPANY:{type:STRING},         //VARCHAR2(40 char),
        CERT_DATA_VARCHAR2:{type:STRING},       //VARCHAR2(2000 char),
        ID_SELFREG_ORG:{type:STRING},           //VARCHAR2(40 char),
        DATE_ADD_TS:{type:DATE},              //TIMESTAMP(6)
      }
  }

  constructor() {
    super();
      this.ID = null;
      this.STATUS = null;
      this.FULLNAME = null;
      this.DATEBORN = null;
      this.PLACEBORN = null;
      this.PASSPORT = null;
      this.PASSPORT_ISSUER = null;
      this.PASSPORT_DATE = null;
      this.ADDRESS_REG = null;
      this.EXPERIENCE_IN_COMPANY = null;
      this.PHONE_NUM = null;
      this.EMPL_CONTRACT = null;
      this.DIPLOM = null;
      this.SELFREG_ORG_NAME = null;
      this.SELFREG_PROOF_DOC = null;
      this.INSURANCE_POLICY = null;
      this.INSURANCE_COMPANY = null;
      this.INSURANCE_AMOUNT = null;
      this.INSURANCE_START_DATE = null;
      this.INSURANCE_END_DATE = null;
      this.EXPERIENCE_ALL = null;
      this.ID_COMPANY = null;
      this.ADDRESS_RESIDENTIAL = null;
      this.LEGACY_CERT_DATA = null;
      this.LEGACY_DATE_ADD = null;
      this.AUTHOR_ADD = null;
      this.POSITION_WEIGHT = null;
      this.LEGACY_I_COMPANY = null;
      this.CERT_DATA_VARCHAR2 = null;
      this.ID_SELFREG_ORG = null;
      this.DATE_ADD_TS = null;
  }
}

module.exports = Employe;
