var LocalStrategy   = require('passport-local').Strategy;
const crypto = require('crypto');
const oracledb = require('oracledb');
var db = require("./oracledb.js");
var requestDBPromise = require('./requestDBPromise.js').requestDBPromise;
var dbConfig = require('./dbconfig.js');

process.env.UV_THREADPOOL_SIZE = 100;

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {   
        
        console.log('serializeUser user')
        console.dir(user)      

	    done(null, user);
    });

    // id = token 
    passport.deserializeUser(function(id, done) {     
        
            console.log('deserializeUser id')
            console.dir(id)

		    // let queryString = `SELECT ID, USERNAME, PASSWORD, FULLNAME FROM "SYSTEM".USERS WHERE id =:id`;
            let queryString = `SELECT ID, USERNAME, PASSWORD, FULLNAME FROM "SYSTEM".AUTH_USERS WHERE USERNAME =:username AND PASSWORD =:password`;

            optionsObj = {                        
                outFormat: oracledb.OBJECT,
                bindDefs: {    
                     username: { val: '', type: oracledb.STRING , maxSize: 128*2, }  // username                
                    ,password: { val: '', type: oracledb.NUMBER , maxSize: 128*2  }  // password                     
                }   
            }

            requestDBPromise ( 'user', queryString, optionsObj )
            .then( res => {
                console.log(res.rowsAffected)
                console.dir(res.rows)
                // res 
                // Ответ 
                done(null, res.rows[0]);
            })

            /* requestDBPromise(connection, selectSQL, [id], function(err, result) {
					if ( err ) {
						db.doRelease(connection);
						done(err,null);
					} else {
						console.log('GOT RESULT');
						db.doRelease(connection);
						done(null,result.rows[0]);
                    }                    
			}); */		

    });
    
    // Логин
    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true 
        },
			function(req, username, password, done) { 

                console.log('username')
                console.log(username)
                console.log("password")
                console.log(password)
                
                queryString = `Select username, password, fullname 
                               from "SYSTEM".AUTH_USERS 
                               where username = '${username}' AND password = '${password}' `

                optionsObj = {                        
                    outFormat: oracledb.OBJECT 
                }                
        
                let result = requestDBPromise( 'user', queryString, optionsObj )
                .then( res => {
                    console.log('res:')
                    console.log(res)
                    if ( Object.keys(res.response).length == 0 ) {
                        // Ничего нет
                        done( null, false )
                    } else {
                        // Сгенерировать токен (пока без токена - только ID из базы)
                        // Старый удалить ( можно перезаписать поверх - как продолжение сессии )                   

                       done( null, JSON.parse(res.response)[0].USERNAME ) 
                    }
        
                })
                .catch( err => {
                    console.log(err)
                     done( null, false )
                })                

			}
		)
    );    
    
    /* passport.use(
        'local-signup',
        new LocalStrategy({            
            usernameField : 'user_name',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, user_name, password, done) {
			console.log('SIGNUP IS CALLED');
            var selectSQL = "SELECT * FROM USER WHERE user_name =:user_name";
            var param = [];
            param.push(user_name.toUpperCase());
            db.doConnect(function(err, connection){  
				if (err) {
					return done(err);
				}
				db.doExecute(connection, selectSQL,param,function(err, result) {
					if (err) {
						db.doRelease(connection);
						return done(err);
					} 
					else {
						if (result.rows.length) {
							db.doRelease(connection);
							LOGGER.error('USER FOUND');
							return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
						} else {
							console.log('USER NOT FOUND AND GOING TO INSERT');
                            var newUserOracle = {
                                username: user_name.toUpperCase(),
                                password: generateHash(password)
                            };
                            var bindParam = [];
							bindParam.push(user_name.toUpperCase());
							bindParam.push(generateHash(password));
                            var insertQuery = "INSERT INTO USER (user_name,password) values(:user_name,:password)";
                            db.doExecute(connection,insertQuery,bindParam,function(err, insResult) {
                                if (err) {
                                    db.doRelease(connection);
                                    return done(err);
                                } else {
                                    console.log('INSERTION RESULT:'+JSON.stringify(insResult));
                                    return done(null,false, req.flash('signupMessage', 'Signed up Successfully!'));
                                }
                            });
                        }
					}
				});
			
			});            
        })
    ); */




    const generateHash = (pass) => {
        return crypto.createHmac('sha256', dbConfig.salt)
          .update(pass)
          .digest('base64');
    }
      
};


