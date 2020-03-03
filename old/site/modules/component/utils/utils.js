const sessionConfig = require('../../sessionConfig.js');
const {senderWithHeaders} = require('../../senderWithHeaders.js');

const crypto = require('crypto')

class Utils{

	constructor(){
	}		
		
	static async getHashForPass(request, response){
			
		let data = String(request.body.pass)
		console.log(data)
		
        let generateHash = (pass, digest) => {
            if(digest){
                return crypto.createHmac('sha256', sessionConfig.salt)
                .update(pass)
                .digest(digest);        
            } else {
                return crypto.createHmac('sha256', sessionConfig.salt)
                .update(pass)
                .digest('base64');        
            }        
        }
        
		senderWithHeaders (response, generateHash(data))
	}

}

module.exports = Utils