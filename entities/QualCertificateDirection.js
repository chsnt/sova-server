const AbstractEntity = require('./AbstractEntity');
const {STRING, NUMBER} = require('oracledb');
const uuid = require('uuid/v4');

class QualCertificateDirection extends AbstractEntity {
  static get table() {
    return 'QUAL_CERT_DIR_LIST'
  }

  static get columns() {
    return{
      ID: {
        type: NUMBER,
        required: true,
        primaryKey: true
      },
      DIRECTION:{type:STRING},
      ABBREVIATION:{type:STRING},
      COM_ACCESS_LEV_ID:{type:STRING},
    }
  }

  constructor() {
    super();
    this.ID=null;
    this.DIRECTION=null;
    this.ABBREVIATION=null;
    this.COM_ACCESS_LEV_ID=null;
  }
}

module.exports = QualCertificateDirection;
