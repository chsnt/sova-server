const requestDBPromisePool = require('./requestDBPromisePool.js').requestDBPromise;
const sessionConfig = require('./sessionConfig.js');
const requestDBArr = require('./requestDBArr2.js').requestDBPromise;

const divTwo = require('./divTwo.js').divTwo;
const mdJSON = require('./mdjson.js').mdJSON;

const crypto = require('crypto')
const ARRAY  = require('oracledb').ARRAY;
const OBJECT = require('oracledb').OBJECT;
const STRING = require('oracledb').STRING;

// Выключаем консоль
//console.log = () => {}
//console.dir = () => {}

module.exports = {

    getUserID (req, res, data) {

        return new Promise (( resolve, reject ) => {
            try {
    
                requestDBPromisePool('user_id', `SELECT
                                                id
                                              FROM AUTH_USERS
                                              WHERE ID =
                                                    (SELECT DISTINCT 
                                                    ID_USER 
                                                    FROM "SYSTEM".AUTH_SESSIONS 
                                                    WHERE ID = '${data.ACCESS_TOKEN}')`,
                                                    {},
                                                    { outFormat: ARRAY }
                                                    // ,
                                                    // undefined,
                                                    // r => r[0]
                )
                .then ( result => {
    
                    resolve({ id: result.id, response : JSON.parse(result.response)[0] })
               
                })
                .catch ( err => {
                    reject(err)
                })
    
            } catch (err) {
                reject(err)
            }        
    
        })
    },
    
    getUserData (req, res, data) {
    
        return new Promise (( resolve, reject ) => {
            try {
    
                requestDBPromisePool('userdata', `SELECT
                                                email,
                                                fullname
                                              FROM AUTH_USERS
                                              WHERE ID =
                                                    (SELECT DISTINCT 
                                                    ID_USER 
                                                    FROM "SYSTEM".AUTH_SESSIONS 
                                                    WHERE ID = '${data.ACCESS_TOKEN}')`,
                                                    {},
                                                    { outFormat: OBJECT }
                                                    // ,
                                                    // undefined,
                                                    // r => r[0]
                )
                .then ( result => {    
                    resolve({ id: result.id, response : JSON.parse(result.response) })

                })
                .catch ( err => {
                    reject(err)
                })
    
            } catch (err) {
                reject(err)
            }        
    
        })
    },
    
    // Есть ли сессия (возвращает количество сессий)
    checkSession (req, res, access_token) {
        return new Promise ((resolve, reject) => {
            requestDBPromisePool ('sessions', `SELECT COUNT(*) sessions FROM "SYSTEM".AUTH_SESSIONS 
                                            WHERE ID = '${access_token}'
                                           `,    
                                          {},
                           { outFormat: ARRAY }
            )
           .then( result => {
                resolve(JSON.parse(result.response)[0])
           })
           .catch( err => {
               reject(err)
            })
        })
    },
    
    // Создание новой сессии
    makeNewSession (req, res, access_token) {
        
        return new Promise ((resolve, reject ) => {
            requestDBPromisePool('access_token', `INSERT INTO "SYSTEM".AUTH_SESSIONS ( ID, ID_USER, DATE_BORN, DATE_EXPIRATION )
                                            VALUES ( :id, (SELECT ID FROM "SYSTEM".AUTH_USERS WHERE email = :lgn ), 
                                                    SYSTIMESTAMP, SYSTIMESTAMP + interval '${sessionConfig.cookieLifeTime.inMinutes}' minute 
                                            )`,                            
                                            {   
                                             id:   { val: access_token,   type: STRING , maxSize: 64*2  },  // username                
                                             lgn:  { val: req.body.login, type: STRING , maxSize: 128*2 }
                                            },  // login (email)    
                                            {  autoCommit: true }                 
            )
            .then ( result => {
    
                try {

                    if (result.response){
        
                        return new Promise (( resolve, reject ) => {
        
                            this.getAccessesAndUserData (req, res, access_token)        
                            .then(result => 
                                resolve({ body   : this.Tmplt("ok", "token in cookies"), 
                                          cookie : this.prepareCookieArr( result, access_token )                
                                })
                            )
                            .catch(err => reject(err))
        
                        })
        
                    } else {
                        reject(`Can't make new session`) 
                    }
                    
    
                } catch (err) {
    
                    reject(err) 
                }
    
            })
            .then( result => resolve(result) )
            .catch ( err => {
                reject( err )
            })  
    
        }) 
    
    },
    
    // Старую сессию убивает - и создает новую
    replaceCurSession (req, res, access_token) {
        
        return new Promise (( resolve, reject ) => {
            requestDBPromisePool('access_token', `UPDATE "SYSTEM".AUTH_SESSIONS 
                                              SET ID = :id, 
                                                  DATE_BORN = SYSTIMESTAMP,
                                                  DATE_EXPIRATION = SYSTIMESTAMP + interval '${sessionConfig.cookieLifeTime.inMinutes}' minute 
                                              WHERE ID_USER = (SELECT ID FROM "SYSTEM".AUTH_USERS WHERE email = :lgn)
                                              `,                                                      

                                {  id:  access_token,    // username                
                                    lgn: req.body.login  // login (email)                     
                                })
            .then ( result => {
    
                if (result.response){
    
                    return new Promise (( resolve, reject ) => {
    
                        this.getAccessesAndUserData (req, res, access_token)        
                        .then(result => 
                            resolve({ body : this.Tmplt("ok", "token in cookies"), 
                                      cookie : this.prepareCookieArr( result, access_token )                
                            })
                        )
                        .catch(err => reject(err))
    
                    })
    
                } else {
                    reject(result) 
                }
    
            })
            .then( result => resolve(result))
            .catch ( err => {
                reject( err )
            })   
    
        }) 
    
    },
    
    // Сохраняет текущую сессию и обновляет дату истечения
    updateCurSession (req, res, access_token) {
        try {
    
            return new Promise (( resolve, reject ) => {
                requestDBPromisePool('access_token', `UPDATE "SYSTEM".AUTH_SESSIONS 
                                                    SET DATE_EXPIRATION = SYSTIMESTAMP + interval '${sessionConfig.cookieLifeTime.inMinutes}' minute 
                                                    WHERE ID = :id
                                                    `,
                                        {   id:  access_token },
                                        {  autoCommit: true }
                                )
                .then ( result => {
    
                    if (result.response){
    
                        return new Promise (( resolve, reject ) => {
    
                            this.getAccessesAndUserData (req, res, access_token) 
                            .then( result =>  this.prepareCookieArr( result, access_token ))
                            .then( result => {
                                resolve({ body : this.Tmplt("ok", "token in cookies"), 
                                          cookie :  result 
                                })
                            })
                            .catch(err => {
                                
                                reject(err)
                            })
    
                        })
    
                    } else {
                        reject(result) 
                    }
    
                })
                .then(result => resolve (result))
                .catch ( err => {
                    console.log(err)
                    reject( err )
                })   
    
            }) 
        } catch (err){
            console.log(err)
        }
    
    },
    
    
    // getTokenByLogin
    getTokenByLogin (login) {
        return new Promise (( resolve, reject ) => {
            requestDBPromisePool('access_token', `SELECT 
                                                    ID
                                                FROM  "SYSTEM".AUTH_SESSIONS 
                                                WHERE ID_USER = (SELECT ID FROM "SYSTEM".AUTH_USERS WHERE email = '${login}')
                                                `,
                                                {},
                                                { outFormat: ARRAY }
            )
            .then ( result => {
                resolve(JSON.parse(result.response)[0])
            })
            .catch ( err => {
                console.log('getTokenByLogin err')
                console.log(err)
                reject( err )
            })
        })
    },
    
    
    // getAccessesAndUserData
    getAccessesAndUserData (req, res, access_token) {
    
        try{
    
            return new Promise ( async (resolve,reject) => {
    
               // accesses
                   let accesses
    
                   this.getAccesses ( req, res, { access_token : access_token} )
                   .then( async (result) => {
    
                      try {
    
                        accesses = { "id" : "accesses", "response" : result }
                        userdata = await this.getUserData ( req, res, { "ACCESS_TOKEN" : access_token } )
      
                        resolve( [accesses, userdata] ) 
    
                      } catch (err) {
                        console.dir(err)
                        reject(err)
                      }
    
    
                      
                   }) 
                   .catch( err => { console.log('err getAccesses' ); console.dir(err); reject(err) })    
     
            })
    
       
           } catch (err) {
               console.log(err)
               reject(err)
           }
    
    },
    
    prepareCookieArr(data, access_token) {
    
        let accesses = data.find(e => e.id === 'accesses').response
        let userdata = data.find(e => e.id === 'userdata').response
    
        let formatUserData = JSON.stringify(userdata)
        let formatAccesses = JSON.stringify( accesses.sova )

    
        // !!!(доработка) - присваивать куки для всех систем, а не только для совы
        return [
            ['access_token', access_token, {
                path: '/',
                expires: new Date( Date.now() + sessionConfig.cookieLifeTime.inMiliseconds ), // cookie will be removed after 7 days
                httpOnly: true,
                signed: true,
                domain: 'urz.open.ru'
                //domain: req.headers.host
            }],
           ['userdata', formatUserData, {
                path: '/',
                expires: new Date( Date.now() + sessionConfig.cookieLifeTime.inMiliseconds ), // cookie will be removed after 7 days
                httpOnly: false,
                signed: true,
                domain: 'urz.open.ru'
                //domain: req.headers.host
            }], 
            ['accesses.sova',  formatAccesses, {
                path: '/sova',					
                expires: new Date( Date.now() + sessionConfig.cookieLifeTime.inMiliseconds ), // cookie will be removed after 7 days
                httpOnly: false,
                signed: true,
                domain: 'urz.open.ru'
                //domain: req.headers.host
            }]
        ]
    
    },    
    
    //  уровни доступа и куки
    // Set Accesses And Cookies
    // setAccessesAndCookies
    
    getAccesses ( req, res, data ) {
    
        return new Promise( async (resolve, reject) => {
    
            this.tokenRoleWeights (req, res, { "ACCESS_TOKEN" : data.access_token })  
            .then( (result) => {
    
                //console.log('Roles by array of weight')
    
                return new Promise ( async (resolve, reject) => {
    
                    this.roleNamesAndFuncWeights (req, res, result)
                    .then( (result) => {
                        resolve(result) 
                    })
                    .catch( err => {
                        // make new session
                        console.log('role catch')
                        reject (err)
                    }) 
    
                })    
    
                // senderWithHeaders (res, result) 
            })
            .then( (data) => {
    
                return new Promise (async (resolve, reject) => {
    
                    try {
    
                        // Расшифровываем веса функций всех ролей
                        /* massReqestFuncByRoles ( req, res, result, 
                            funcNamesByWeights )
                        .then( (result) => {
                            //console.log('after massReqestFuncByRoles')
                            //console.dir(result)
                            // Вернулся массив
    
                            resolve(result) 
                        })
                        .catch( err => {
                            console.log('massReqestFuncByRoles catch')
                            reject (err)
                        })  */
    
                        // 
                        let arrReqFunc = []

    
                        for (role of data.ROLES) {
                             arrReqFunc.push([
                                role.ROLE_NAME ,  
                                `SELECT funcname FROM AUTH_FUNCTIONS WHERE weight IN ( ${role.WEIGHT_FUNC.join()} ) AND SYSTEM = '${data.SYSTEM}'`,
                                {},
                                { outFormat: ARRAY }
                                
                             ])
                            // reqFuncNames.push( request(req, res, data, role) )
                        }
    

    
                        //console.log(arrReqFunc)
    
                        requestDBArr (arrReqFunc)
                        .then( result => {
                                
                                let obj = []
                                data.ROLE_FUNC = []
    
                                for (role of result) {
    
                                    role.response = JSON.parse( role.response )                                        
                                    // Получим список ролей 
                                    // Переведем в массив - возвращает массив весов ролей     
                                    
                                    data.ROLE_FUNC.push ({ "ROLE_NAME" : role.id, "FUNCTIONS" : role.response })                                        
                                    obj.push({ "SYSTEM"    : data.SYSTEM, 
                                               "ROLE_NAME" : role.id, 
                                               "ROLE_DESC" : data.ROLES.find( r => r.ROLE_NAME === role.id ).ROLE_DESC , 
                                               "FUNCTIONS" : role.response 
                                    })
                                }
    
                                result = mdJSON( obj, { arrMaxLvl: false, keepLastKeys: 2 })
    
                                let resultMod = {}
                                for (SYSTEM in result) {
                                    let sumFunc = []
                                    resultMod[SYSTEM] = { ROLES : [], FUNCTIONS : []}
                                    if ( result.hasOwnProperty(SYSTEM) ) {                            
                                        result[SYSTEM].forEach( role => {     
                                            sumFunc = sumFunc.concat( role.FUNCTIONS )
                                            resultMod[SYSTEM].ROLES.push({ "ROLE_NAME" : role.ROLE_NAME, "ROLE_DESC" : role.ROLE_DESC })
                                            return role  
                                        });
                                                                    
                                    }
                                    resultMod[SYSTEM].FUNCTIONS = [...new Set (sumFunc)]
                                }
                                
                                resolve(resultMod)                       
    
                        })                        
                        .catch(err => reject(err))
    
    
                    } catch ( err ){
                        console.log(err)
                    }
    
                })
    
            })
            .then( (result) => {
                resolve(result)
            })
            .catch( err => {
                reject(err) 
            })
    
        })
    
    },
    
    
    // Список ролей пользователя (по токену) в укаазанной системе
    // Список весов ролей пользователя в системе (число) --(строка)
    
    tokenRoleWeights (req, res, data) {   
    
        data.SYSTEM =  "sova"   // !!!(доработка) Система не должна присваиваться, а итерироваться
        
        return new Promise (( resolve, reject ) => {
    
            /// !!! Тут - проверить наличие токена
            
            requestDBPromisePool('weight_role', `SELECT
                                                weight_role
                                                -- divtwo(weight_role, 'exp')
                                              FROM AUTH_USERS_AND_THEIR_ROLES
                                              WHERE ID_USER =
                                                    (SELECT DISTINCT 
                                                    ID_USER 
                                                    FROM "SYSTEM".AUTH_SESSIONS 
                                                    WHERE ID = '${data.ACCESS_TOKEN}')
                                              AND SYSTEM = '${data.SYSTEM}'
                                              `,
                            {},
                            { outFormat: ARRAY })
            .then ( result => {
    
                    //console.log( result )
                    let weight_role = JSON.parse(result.response)[0]
    
                    if ( weight_role ){
                        // Получим список ролей 
                        // Переведем в массив - возвращает массив весов ролей
                        resolve(Object.assign(data, { "WEIGHT_ROLE" : divTwo(weight_role) } ))      // resolve({ "system" : data.system, "weight_role" : divTwo(weight_role) })
                        
                    } else {
                    reject(result)
                    }
    
            })
            .catch ( err =>{
                reject(err)
                //return Promise.reject(err)
            })   
    
        }) 
    
    },
    
    
    // Список ролей и весов функций по массиву весов ролей и названию системы
    roleNamesAndFuncWeights (req, res, data) {
    
        // data { system, [weight_role] }
    
        let acceses = {}
    
        // divTwo(data.weight_role).join()
        
        return new Promise (( resolve, reject ) => {
            
            requestDBPromisePool('roles_and_weigth_func',  `SELECT
                                                            ROLE role_name,
                                                            role_desc,
                                                            --divtwo(weight_func, 'exp') weight_func_in_str
                                                            weight_func
                                                        FROM AUTH_ROLES 
                                                        WHERE weight_role IN ( ${data.WEIGHT_ROLE.join()} ) -- формировать такую строку из массива
                                                        AND SYSTEM = '${data.SYSTEM}'
                                                        `,
                                                        {},
                            { outFormat: OBJECT })
            .then ( result => {
    
                    result = JSON.parse(result.response)
                    //console.dir( result)
    
                    if ( result ){
    
                        result.forEach( role => role.WEIGHT_FUNC = divTwo( role.WEIGHT_FUNC ) );
                        
                        // Получим список ролей 
                        // Переведем в массив - возвращает массив весов ролей
                        resolve(Object.assign(data, { "ROLES" : result } ))
    
    
                    } else {
                        reject(result)
                    }
            })
            .catch ( err =>{
                reject(err)
                //return Promise.reject(err)
            })
    
        })
    
    },
    
    
    
    // Список функций по ролям и названию системы
    // data - накапливаемый объект
    // role - итерируемый объект
    funcNamesByWeights (req, res, data, role) {
    
        return new Promise (async ( resolve, reject ) => {
    
            try {
    
                requestDBPromisePool( role.ROLE_NAME ,  `SELECT funcname
                                                        FROM AUTH_FUNCTIONS
                                                        WHERE weight IN ( ${role.WEIGHT_FUNC.join()} )
                                                        AND SYSTEM = '${data.SYSTEM}'                                                
                                                    `,
                                                    {},
                                { outFormat: ARRAY })
                .then ( result => {
                        
                        if ( JSON.parse( result.response ) ){
    
                            result.response = JSON.parse(result.response)                                        
                            // Получим список ролей 
                            // Переведем в массив - возвращает массив весов ролей                    
    
                            data.ROLE_FUNC.push({ "ROLE_NAME" : result.id, "FUNCTIONS" : result.response })
                                  
                            resolve( { "SYSTEM" : data.SYSTEM , "ROLE_NAME" : result.id, "ROLE_DESC" : role.ROLE_DESC, "FUNCTIONS" : result.response } )           
    
                        } else {
                            reject(result)
                        }
                })
                .catch ( err =>{
                    reject(err)
                })   
                
            } catch ( err ){
                console.log(err)
            }
    
        });    
    
    },
    
    
    // Список функций по ролям и названию системы
    massReqestFuncByRoles (req, res, data, request) {
    
        // data { system, [weight_role] }
    
        let reqFuncNames = []
    
        data.ROLE_FUNC = []
    
        for (let role of data.ROLES) {
            reqFuncNames.push( request(req, res, data, role) )
        }
    
        return new Promise ( async (resolve, reject) => {
    
            try{
    
                mkArr = async (reqFuncNames) => {
                    let resFuncNames = []
                    for ( req of reqFuncNames ){
                        resFuncNames.push( await req )
                    }                
                    return resFuncNames
                }
    
                let resFuncNames = await mkArr(reqFuncNames)    
                resFuncNames = await mdJSON(result, { arrMaxLvl: false, keepLastKeys: 2 })
    
                let resultMod = {}
                for (system in resFuncNames) {        // Перебираем системы???
                    let sumFunc = []
                    resultMod[system] = { ROLES : [], FUNCTIONS : []}
                    if ( result.hasOwnProperty(system) ) { 
    
                        for (role of result[system]){
                            sumFunc = sumFunc.concat( role.FUNCTIONS )
                            resultMod[system].ROLES.push({ "ROLE_NAME" : role.ROLE_NAME, "ROLE_DESC" : role.ROLE_DESC })
                        }
                                                    
                    }
                    resultMod[system].FUNCTIONS = [...new Set (sumFunc)]
                }
    
                resolve( resultMod )   
    
                /* Promise.all( reqFuncNames )
                .then((result)=>{
                        // Постобработка 
                        // Преобразование массива
    
                        result = mdJSON(result, { arrMaxLvl: false, keepLastKeys: 2 })
                        return Promise.resolve( result )
    
                })
                .then((result)=>{
    
                    // Cоединим все функции и удалим дубликаты
    
                    let resultMod = {}
                    for (system in result) {
                        let sumFunc = []
                        resultMod[system] = { ROLES : [], FUNCTIONS : []}
                        if ( result.hasOwnProperty(system) ) {                            
                            result[system].forEach( role => {     
                                sumFunc = sumFunc.concat( role.FUNCTIONS )
                                resultMod[system].ROLES.push({ "ROLE_NAME" : role.ROLE_NAME, "ROLE_DESC" : role.ROLE_DESC })
                                return role  
                            });
                                                        
                        }
                        resultMod[system].FUNCTIONS = [...new Set (sumFunc)]
                    }
    
                    //console.log('resultMod')
                    //console.log(resultMod)
    
                    resolve( resultMod )                
    
                })
                .catch((err)=>{
                    reject(err)
                }) */
    
            } catch ( err ){
                console.log(err)
            }
    
        })    
    
    },

    login (req, res) {

    return new Promise ((resolve, reject) => {

        let login = req.body.login

        let passhash = this.generateHash(req.body.password)
		console.log(passhash)

        // Запрос с логином и паролем
        requestDBPromisePool ('login_pass', `SELECT COUNT(*) users FROM "SYSTEM".AUTH_USERS 
                                        WHERE email = '${login}' AND passhash = '${passhash}' `, 
                {},
                { outFormat: ARRAY })
        .then( result => {
			console.log(result)
            let users = JSON.parse(result.response)[0]

            if( !users )        // Пользователь НЕ аутентифицирован 
                //reject('wrong user or password');
                return Promise.reject('wrong user or password');

        })      
        .then(() => {
                // Есть ли куки?
                // Есть ли сессия?
                return new Promise ((resolve, reject) => {
                    requestDBPromisePool ('sessions', `SELECT COUNT(*) sessions FROM "SYSTEM".AUTH_SESSIONS 
                                                     WHERE ID_USER = (SELECT ID FROM "SYSTEM".AUTH_USERS WHERE email = '${login}') `,  
                                    {},                     
                                    { outFormat: ARRAY })
                    .then( result => {
                        //console.log('after SELECT COUNT(*) sessions')

                        // console.log( JSON.parse(result.response)[0] )
                        // this.
                        let access_token_new = this.makeToken(req)
                        let sessions = JSON.parse(result.response)[0]
            
                        if( sessions )  {   
                            // Есть сессия - обновляем ее  (еще как вариант можно просто продлять срок жизни куки)              
                            return new Promise ((resolve, reject) =>  {
                                this.getTokenByLogin(login)
                                .then(access_token => {

                                    return new Promise ((resolve, reject) =>  {                                    
                                        try{ 
                                            this.updateCurSession (req, res, access_token) 
                                            .then( result => {

                                                resolve (result)
                                            })
                                            .catch ( err =>{
                                                console.log('catch after sessions')
                                                console.log(err)
                                                reject (err);
                                            })

                                        } catch (err){
                                            console.log(err)
                                            reject(err) 
                                        }

                                    })

                                })
                                .then(result => resolve(result))
                                .catch(err=> { console.log('getTokenByLogin err '+err); reject(err)})
                            })

                        } else {
                            // Если нет сессии - создаем ее
                            return this.makeNewSession (req, res, access_token_new)  
                        }

                    })   
                    .then( result => {
                        resolve (result) 
                    })                    
                    .catch ( err =>{
                        reject(err);
                    })

                })

        }) 
        .then( (result) => {
            console.log('in login Endless then')
            console.dir(result)            
            resolve ( result)
        })
        .catch( err => {
            console.log(' login catch')
            reject (err) 
        })

    }) 

  },

  makeToken (req) {
    //console.log(new Date() + req.body.login + req.body.password)
    return this.generateHash( (new Date() + req.body.login + req.body.password), 
                        'hex' )
  },

  generateHash (pass, digest) {

    if(digest){
        return crypto.createHmac('sha256', sessionConfig.salt)
        .update(pass)
        .digest(digest);

    } else {
        return crypto.createHmac('sha256', sessionConfig.salt)
        .update(pass)
        .digest('base64');

    }
    
  },

  Tmplt (response, comment) { 
    return {
      "response" : response || "error",
      "comment"  : comment  || "unhandled error"
    }
} 
    
}