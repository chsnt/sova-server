const auth = require('./auth.js');
const senderWithHeaders = require('./senderWithHeaders.js').senderWithHeaders;

const apiAccessControl = (req, res, next) => {
	
	console.log('apiAccessControl')
	
	try {

		let system = 'sova'	// Сейчас одна система, далее распространить на остальные

		let access_token = req.signedCookies.access_token

		if (access_token || req.body.login ){

			auth.checkSession (req, res, access_token)
			.then(session => {
				
				// Если ткоен без сессии - редирект на логин
				if (session){  // Если токен с сессией

					auth.getAccesses ( req, res, { access_token : access_token } )
					.then( accesses =>  { 

						// В противном случае - редирект на логин
						// /sova/account/
						if( accesses[system].ROLES.length ){
							next()  // Разрешуха
						} else {
						// Если нет ролей - ответ - нет допуска 
						//if( req.url !== '/login/' && req.url !== '/login' ) res.redirect('/sova/login') 
						//res.redirect('/sova/login')  
						throw new Error('has no access')                 
						}                            
				
					})
					.catch( err => { console.log('err getAccesses' ); console.dir(err); throw new Error('access error') })

				} else {

					throw new Error('has no session, pls login')

					// Если ткоен без сессии
					// нет допуска
					//if( req.url !== '/login/' && req.url !== '/login' ) res.redirect('/sova/login')
				}    

			})
			.catch(err => { throw new Error('session error') })

		} else {
			throw new Error('has no token, pls login')
		}
		
	} catch (err) {
		
		console.log(err)
		
		senderWithHeaders (res, auth.Tmplt ('error', err.message)) 
		return
		
	}

};   

module.exports = apiAccessControl;