const AbstractEntity = require('./AbstractEntity');
const {STRING,DATE,NUMBER} = require('oracledb');
const uuid = require('uuid/v4');

class QualCertificate extends AbstractEntity {
  static get table() {
    return 'QUAL_CERT'
  }

  static get columns() {
    return{
      ID_STAFF:{type:NUMBER},         //NUMBER
      NUM:{type:STRING},              //VARCHAR2(128 char),
      DATE_START:{type:DATE},         //DATE,
      DATE_END:{type:DATE},           //DATE,
      LEGACY_DIRECTION:{type:STRING},
      ID: {
        type: STRING,
        required: true,
        primaryKey: true,
        generator: function(entity){
          return entity.ID|| uuid()
        },
      },                           //VARCHAR2(40 char),
      DIRECTION_ID:{type:NUMBER},     //NUMBER
    }
  }

  constructor() {
    super();
    this.ID_STAFF=null;           //NUMBER
    this.LEGACY_DIRECTION=null;   //VARCHAR2(128 char),
    this.NUM=null;                //VARCHAR2(128 char),
    this.DATE_START=null;         //DATE,
    this.DATE_END=null;           //DATE,
    this.ID=null;                 //VARCHAR2(40 char),
    this.DIRECTION_ID=null;       //NUMBER
  }
}

module.exports = QualCertificate;
