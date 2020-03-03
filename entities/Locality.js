const AbstractEntity = require('./AbstractEntity');
const {NUMBER, STRING, BIND_OUT,DATE} = require('oracledb')
class Locality extends AbstractEntity{
  constructor() {
    super()
    this.ID=null
    this.STATE=null
    this.LOCALITY=null
    this.RRE=null
    this.CRE=null
    this.LANDRRE=null
    this.PMD=null
    this.SOVA=null
    this.FEDERAL_DISTRICT=null
  }

  static get table() {
    return 'PUB.SHORT_LIST_LOCATIONS'
  }

  static get columns() {
    const result = {
      ID: {
        type: NUMBER,
        required: true,
        primaryKey: true,
        parentForeignKey: true  // для поля CompanyHistory.columns.ID_COMPANY
      },
      STATE:{type: STRING},
      LOCALITY:{type: STRING},
      RRE:{type:NUMBER},
      CRE:{type:NUMBER},
      LANDRRE:{type:NUMBER},
      PMD: {type:NUMBER},
      SOVA: {type:NUMBER},
      FEDERAL_DISTRICT:{type: STRING}
    };
    return result
  }

}

/*const {container} = require('./../bottle')
let f = (async () =>
{ await  Locality.find((await container.connection), 22)
})()*/


module.exports = Locality;
