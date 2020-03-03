const {salt} = require('../../../sessionConfig.js');
const {senderWithHeaders} = require('../utils/senderWithHeaders.js');
const crypto = require('crypto')


// 
class Others {

	static async getHashForPass(response, data){

        console.log(data)

        let generateHash = (pass, digest) => {
            if(digest){
                return crypto.createHmac('sha256', salt)
                .update(pass)
                .digest(digest);        
            } else {
                return crypto.createHmac('sha256', salt)
                .update(pass)
                .digest('base64');        
            }        
        }
        
		senderWithHeaders (response, generateHash(data.pass))
	}

}

module.exports = Others
//PcAttributes.insert()