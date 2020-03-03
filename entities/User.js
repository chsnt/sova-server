const AbstractEntity = require("./AbstractEntity")
const {NUMBER, STRING, BIND_OUT} = require('oracledb')


class User extends AbstractEntity {
    static get table() {
        return 'PUB.AUTH_USERS'
    }
    static get columns() {
        return {
            ID: {
                type: NUMBER,
                required: true,
                primaryKey: true,
                generated: true,
            },
            FULLNAME: {
                type: STRING
            },
            PASSHASH: {
                type: STRING,
                notSending: true
            },
            EMAIL: {
                type: STRING
            },
        }
    }

    constructor() {
        super()
        this.ID = null
        this.FULLNAME = null
        this.PASSHASH = null
        this.EMAIL = null
    }

}

const {
    container
} = require('./../bottle')
/* let f = (async () => 
{ let r = await User.find(
    (await container.connection), 23) 
  console.log(r)
})()
 */

/* let f = (async () => {
    const user = await container.transaction(async function body(connection) {
        const user = await User.find(connection, 23)
        return user
    })
    console.log(user)
})(); */


module.exports = User