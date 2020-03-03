// ////////////////////////////////////////
// Constants

const PORT = 80;
const PORT_HTTPS = 440;

// ////////////////////////////////////////
// Constants


/* const PORT = 8088;
const PORT_HTTPS = 4443; */

// const PORT = 80;
// const PORT_HTTPS = 443;

///////////////////////////////////////////

// const TABLE_TO_INSERT = 'QUIZ_URZ_2018'

const TABLE_ATTR = 'PC_ATTRIBUTES'
const TABLE_ATTR_STAFF = 'PC_STAFF'

var SCHEMA_SOVA = 'regpc'

///////////////////////////////////////

const fs = require('fs');
const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const https = require('https');
const dbConfig = require('./site/modules/dbconfig.js');
const webServer = require('./site/modules/webServer.js');
const appConfig = require('./site/modules/appConfig.js');
const sessionConfig = require('./site/modules/sessionConfig.js');
const getColumnsArray = require('./site/modules/getColumnsArray.js').getColumnsArray;
const requestDBwoPromise = require('./site/modules/requestDBwoPromise.js').requestDBwoPromise;
const requestDBPromise = require('./site/modules/requestDBPromise.js').requestDBPromise;
const requestDBPromisePool = require('./site/modules/requestDBPromisePool.js').requestDBPromise;

const component = require('./site/modules/component/sova/router.js')
const utils = require('./site/modules/component/utils/router.js')

const addCompamy = require('../routes/utils/addCompamy.js')
const addOffice  = require('../routes/utils/addOffice.js')
const delCross   = require('./site/modules/delCross.js')

const binder = require('../routes/utils/binder.js')
const {bindObjMaker} = require('./site/modules/bindObjMaker.js')

const senderWithHeaders = require('./site/modules/senderWithHeaders.js').senderWithHeaders;

//const corsHeaders = require('./site/modules/corsHeaders.js');
const cors = require('cors')
const apiAccessControl = require('./site/modules/apiAccessControl.js')

const mdJSON = require('./site/modules/mdjson.js').mdJSON;
const auth = require('./site/modules/auth.js');


const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cookie = require('cookie');
const helmet = require('helmet')
const compression = require('compression');
//const serveStatic = require('serve-static')

const uuid = require('uuid/v4');
const iconv = require("iconv-lite");
// const json2xls = require('json2xls');
const moment = require('moment');
//const morgan = require('morgan'); 
//const winston = require('winston');   // logger
const read = require('read');
const Seq = require('seq');


const oracledb = require('oracledb');
//const SimpleOracleDB = require('simple-oracledb');


const privateKey  = fs.readFileSync( __dirname + '/site/cert/key.pem', 'utf8').toString();
const certificate = fs.readFileSync( __dirname + '/site/cert/server.crt', 'utf8').toString();

const credentials = {key: privateKey, cert: certificate, passphrase: ''};
const httpsServer = https.createServer(credentials, app);


const typesCRE = [      // Types of commercial real estate (in lower case)
    'offices_business_center',
    'offices_other',
    'retail_shopping_center',
    'retail_street',
    'retail_other',
    'warehouse_complex',    
    'warehouse_other',
    'land_living',
    'land_commercial',
    'land_industrial'];

const ISO8601_template = `'YYYY-MM-DD"T"HH24:MI:SS.ff3"Z"'`
const ISO8601_regexp = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/g

const errorWrongRequestTemplate = { "response"  : "error",
                                    "errorText" : "invalid http-request format",
                                    "code"      : 400
                                  }

const errorWrongDataTemplate  = { "response"  : "error",
                                  "errorText" : "invalid received data",
                                  "code"      : 400
                                }                                  

const errorEmptyRequestTemplate = { "response"  : "error",
                                  "errorText" : "empty body",
                                  "code"      : 400
                                  }              
                                  

var errorRequest;

// Выключаем консоль
//console.log = () => {}
//console.dir = () => {}

process.env.UV_THREADPOOL_SIZE = dbConfig.hrPool.poolMax + appConfig.defaultThreadPoolSize;

async function initPool() {
    const pool = await oracledb.createPool(dbConfig.hrPool);
}


// send file page
const sendFilePage = (res, systemName)=> {

    try {
                
        if ( PORT === 80 ) {            
            res.sendFile(path.join(`${__dirname}/site/${systemName}/main/index.html`));
            
        } else if (PORT === 8888){           
            res.sendFile(path.join(`${__dirname}/site/${systemName}-dev-${PORT}/main/index.html`))        
        } else {           
            res.sendFile(path.join(`${__dirname}/site/${systemName}-dev/main/index.html`))
        };
                
    } catch (err) {

        try {
    
            if ( PORT === 80 ) {            
                res.sendFile(path.join(`${__dirname}/site/${systemName}/main/index.html`));
            } else if (PORT === 8888){           
                res.sendFile(path.join(`${__dirname}/site/${systemName}-dev-${PORT}/main/index.html`))        
            } else {           
                res.sendFile(path.join(`${__dirname}/site/${systemName}-dev/main/index.html`))
            };
                    
        } catch (err) {    
            console.error(err);            
        }           

    } 

}

const sendFilePageBaudit = (res)=> {

    try {
                
        if ( PORT === 80 ) {            
            res.sendFile(path.join(`${__dirname}/site/baudit-prod/index.html`));
        } else {           
            res.sendFile(path.join(`${__dirname}/site/baudit-8889/index.html`))
        };
                
    } catch (err) {

        try {
    
            if ( PORT === 80 ) {                
                res.sendFile(path.join(`${__dirname}/site/baudit-prod/index.html`));
            } else {                
                res.sendFile(path.join(`${__dirname}/site/baudit-8889/index.html`))
            };
                    
        } catch (err) {    
            console.error(err);            
        }           

    } 

}

//
const dateOptions = {
    year:   'numeric',
    month:  'long',
    day:    'numeric',
    hour:   'numeric',
    minute: 'numeric',
    second: 'numeric'
};    

var allVisits     = 0;
var ctVisits      = 0;
var creVisits     = 0;
var rreVisits     = 0;
var landrreVisits = 0;

var homeVisits    = 0;
var userAgent;
var userIP;
var usersCount    = 0;
//var arrUserAgent = [];
var userStats = {};


try {

moment.locale('ru');

// SimpleOracleDB.extend(oracledb);
// SimpleOracleDB.autoCommit = true;

//////////////////////////////////////

app.use(compression());

app.use( bodyParser.urlencoded( { extended: true }) )
app.use( bodyParser.json() );

app.use(cookieParser('urz-tech-secret'))
//app.use(helmet())=




app.use(express.static(__dirname + '/site'));

//app.use( corsHeaders );
app.use(cors ({ 
  origin:[`http://localhost:${PORT}`,`http://urz.open.ru:${PORT}`],
  credentials: true, 
}))

app.use('*', function(req, res, next) {
    console.log('Cookies: ', req.cookies )
    console.log('Signed Cookies: ', req.signedCookies )
    next()
});

//app.use('/api/sova', function(req, res, next) {
//    console.log('Cookies: ', req.cookies )
//    console.log('Signed Cookies: ', req.signedCookies )
//    next()
//});

app.post('/api/utils/:service', utils.API);

app.post('/api/sova', apiAccessControl);  

//app.get('*', (req, res) => {
//	res.cookie("test","test").send('ok')
//	next()
//})

app.get('/', function(req, res) {
     
    res.sendFile(path.join(__dirname + '/site/cre/cre.html'));
    
    // Collect statictics
    // allVisits++;
    creVisits++;
 
    // identification('cre', req);

});

/************** Pages & statistics */

app.post('/api/auth',
  function(req, res) {
	      
    // Принудительно выдаем новый токен
    //console.dir(req.path)

    // Логин
    if ( req.body.login && req.body.password ){

        // Стратегия Авторизация
        auth.login (req, res)
        .then( (result) => {
            //console.log('after login Endless then')
            //console.dir(result)		
            
            senderWithHeaders ( res, result.body, result.cookie)

        })
        .catch( err => {
            //console.log(' mega catch login')
            //console.log(err)
            senderWithHeaders (res, auth.Tmplt ('error', err)) 
        })

        return
    } 

    // Action'ы

    // Переход со страницы /login в систему
    if ( req.body.action === 'comein' ){
        //////////////////////////////////////
        
       // try {

            let system  
            let ref = req.headers.Referer? req.headers.Referer.split('/') : undefined

            if( req.body.system ){    // Система указана в явном виде
                system = req.body.system                
            } else if ( ref ){
                if ( ref[ref.length-1] === `login` ) system = ref[ref.length-2]
            } else {
                senderWithHeaders (res, auth.Tmplt ('error', 'need system name')) 
                return
            }

            if ( req.signedCookies.access_token ){


                auth.checkSession (req, res, req.signedCookies.access_token)
                .then( session => {

                    console.log('session')
                    console.log( session )
                    
                    // Если ткоен без сессии - редирект на логин
                    if (session > 0){  // Если токен с сессией

                        return new Promise ((resolve, reject) => {

                            auth.getAccesses ( req, res, { access_token : req.signedCookies.access_token} )
                            .then( accesses =>  { 
                    
                                console.dir('accesses--------')
                                console.dir(accesses)
                    
                                if( accesses[system].ROLES ){  
                                    resolve('account')

                                } else {            
                                    reject( 'forbidden' ) 
                                }                            
                        
                            })
                            .catch( err => { console.dir(err); reject (err) })
                        })

                    } else {
                        throw new Error ('your session experied, please, log in')                      
                    }

                })
                .then( result => { if( req.url !== `/${result}/` && req.url !== `/${result}` ) res.redirect(`/${system}/${result}`) } )
                .catch( err => { 
                    if ( err instanceof Error) {
                        senderWithHeaders (res, auth.Tmplt ('error', err.message)) 
                    } else {
                        senderWithHeaders (res, auth.Tmplt ('error', err)) 
                    } 
                })
                                

            } else {
                senderWithHeaders (res, auth.Tmplt ('error', 'has no token, please, log in')) 
                return
            }

    }

    // Вылогинивание
    if ( req.body.action === 'logout' ){

        senderWithHeaders (res, auth.Tmplt ('error', 'later')) 
        return
    }    

  });
 

app.get('/appraisal', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/appraisal/index.html'));
});

app.get('/questurz', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/questurz.html'));
});

//
app.get('/test', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/test.html'));
});

app.get('/error', function(req, res) {
    res.sendFile(path.join(__dirname + '/err.html'));
});

app.get('/regpc/', function(req, res) {
    //console.log('there norm');
    res.sendFile(path.join(__dirname + '/site/regpc-dev/index.html'));
});

app.get('/baudit/', function(req, res) {
    sendFilePageBaudit (res)      
});

// Сквозная проверка токена 
app.use('/sova/', function(req, res) {

    console.dir( req.params )
    console.dir( req.url )
    console.dir( req.path )

    if( req.url !== '/login' ){ //&& req.body.system !== 'comein' ){

        let access_token = req.signedCookies.access_token

        auth.checkSession (req, res, access_token)
        .then(session => {
            
            // Если ткоен без сессии - редирект на логин
            if (session){  // Если токен с сессией
    
                auth.getAccesses ( req, res, { access_token : access_token } )
                .then( accesses =>  { 

                    // В противном случае - редирект на логин
                    // /sova/account/
                    if( accesses.sova.ROLES.length ){

                        console.log( 'sendFilePage (res, sova) - inner req.url !== login' )
                        console.dir( req.url )
                        sendFilePage (res, 'sova')

                    } else {
                       // Если нет ролей - редирект на логин
                       //if( req.url !== '/' ) res.redirect('/') 
                       if( req.url !== '/login/' && req.url !== '/login' ) res.redirect('/sova/login') 
                    }                            
            
                })
                .catch( err => { console.log('err getAccesses' ); console.dir(err); throw new Error(err) })
    
            } else {
                // Если ткоен без сессии
                // редирект на логин

                if( req.url !== '/login/' && req.url !== '/login' ) res.redirect('/sova/login') 
    
            }    

        })
        .catch(err => console.dir(err))


    } else {    // Если страница '/login' - пускаем всех
        sendFilePage (res, 'sova') 
    }
	
    // Получить уровни доступа

});




app.get('/sova/add', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/sova/add-form/index.html'));
});

app.get('/sova/trouble-signal', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/sova/trouble-signal/index.html'));
});

app.get('/1', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/cre/cre.html'));
});

app.get('/2', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/2.html'));
});

app.get('/3', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/3.html'));
});

app.get('/4', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/4.html'));
});

/************** Statistics */

app.get('/ct', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/ct.html'));
    // allVisits++;
    ctVisits++;
    // identification('ct', req);
});

app.get('/cre', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/cre/cre.html'));
    // allVisits++;
    creVisits++;
    // identification('cre', req);
});

app.get('/rre', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/rre.html'));
    // allVisits++;
    rreVisits++;
    // identification('rre', req);
});

app.get('/landrre', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/landrre.html'));
    // allVisits++;
    rreVisits++;
    // identification('landrre', req);
});

app.get('/th', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/th.html'));
    // allVisits++;
    rreVisits++;
    // identification('th', req);
});

app.get('/~', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/portal.html'));
    // allVisits++;
    homeVisits++;
    // identification('~', req);
});

app.get('/liq', function(req, res) {
    res.sendFile(path.join(__dirname + '/site/liq.html'));
    /*
    // allVisits++;
    liqVisits++; */
    //// identification('liq', req);
});

/***************** API *********/

app.param('level1', function(req, res, next, level1) {
    req.level1 = level1;
    next();
});

app.param('level2', function(req, res, next, level2) {
    req.level2 = level2;
    next();
});

app.param('level3', function(req, res, next, level3) {
    req.level3 = level3;
    next();
});


app.post('/api/:level1', function(req, res) {
    insertIntoDB(req, res);     
})

app.post('/api/:level1/:level2', function(req, res) {
    console.dir(req.body)
    insertIntoDB(req, res);  
})

app.post('/api/:level1/:level2/:level3', function(req, res) {
    insertIntoDB(req, res);  
})

//
app.get('/api/', function(req, res) {

        let userIP = req.ip;                    // IP

        if (userIP.substr(0, 7) == "::ffff:") {
            userIP = userIP.substr(7)
        };    
 
        console.log(userIP + ' interested in REST API!');
        res.redirect('/');
})


app.get('/api/:level1', function(req, res) {
    getFromDB(req, res);     
})

app.get('/api/:level1/:level2', function(req, res) {
    getFromDB(req, res)
})

app.get('/api/:level1/:level2/:level3', function(req, res) {
    getFromDB(req, res)
})

app.get('*',function (req, res) {

    errorRequest = Object.assign( errorWrongRequestTemplate,
        { 
          url : req.originalUrl,  
          methods: req.route.methods
        }
      ) 
    res.status(400).json(errorRequest);
})

app.use(function(err, req, res, next) {
    console.error(err.stack)
    res.status(500).json(err.stack)
})

} catch (err) {
    console.log(err)
}

// Инициализация пула БД
(async () => {
    try {
        await initPool(); 
    } catch (err) {
        console.error(err);    
        process.exit(1); // Non-zero failure code
    }
})()


app.listen(PORT)


console.log('Rabotaet on ' + PORT + ' port')
httpsServer.listen(PORT_HTTPS, () => console.log('HTTPS on ' + PORT_HTTPS))

Seq()
.seq(function () {
read({ prompt : 'Do you wanna abort? (y): ' }, this.into('answer'))
})
.seq(function (answer) {
    if ( this.vars.answer === 'y' || this.vars.answer === 'н'  ) { process.exit(-1); }
})

// завершение
process.on('SIGTERM', () => {
    console.log('Received SIGTERM')
    webServer.shutdown()
})

process.on('SIGINT', () => {
    console.log('Received SIGINT')
    webServer.shutdown()
})

process.on('uncaughtException', err => {
    console.log('Uncaught exception')
    console.error(err)
    webServer.shutdown(err)
})


////////////////////////////////////

// Дополнение строки пробелами до указанного количества
// 255.255.255.255 - 16 символов
function fillSpaces(string, count, center){

    string = String(string)

    for (var i = string.length; i < count-1; i++) {
        if (center==1 && i%2==0){
            string = " " + string
        } else {
            string = string + " ";
        };
    };   

    return string;
};


async function getFromDB( request, response ) {

    try {

        var js = ''
        let params = request.query
        
        let argsCount = Object.keys(params).length;

        let queryString = '';
        let bindObj = {};
        let optionsObj = {};
        let bindsArr = [];
        let returnArr

        let excelFlag = false;

        let callback = undefined;

        // Type to lower case  
        if (params.type) { params.type = params.type.toLowerCase() };

        // String with types
        typesCREstr = typesCRE.join(', ');

        caseStatement  = ``;    // Case conditions
        typesCRE.forEach(function(item, i, arr) {
            caseStatement += `WHEN '${item}' THEN ${item} \n`;           
        });

        // 
        if ( request.level1 == 'locations' && (argsCount == 0 || (argsCount == 1 && params.excel) )) {
            queryString = ` SELECT 
                                state, locality 
                            FROM  SHORT_LIST_LOCATIONS `;
            optionsObj = { outFormat: oracledb.OBJECT };
            excelFlag  = ( params.excel )? true : false;            

        } else if ( request.level1 == 'locations' && params.service == 'cre' ) {
            //console.log('come into locations cre');
            queryString = ` SELECT 
                                state, locality 
                            FROM  SHORT_LIST_LOCATIONS 
                            WHERE cre = 1 `;
            optionsObj = { outFormat: oracledb.OBJECT };
            excelFlag  = (params.excel)? true : false;   

        } else if ( request.level1 == 'locations' && params.service == 'rre' )  {
            
            queryString = ` SELECT 
                                state, locality 
                            FROM  SHORT_LIST_LOCATIONS 
                            WHERE rre = 1 `;
            optionsObj = { outFormat: oracledb.OBJECT };
            excelFlag  = (params.excel)? true : false; 

        } else if ( request.level1 == 'locations' && params.service == 'landrre' )  {
            
            queryString = ` SELECT
                                ll.id, ll.state, ll.locality 
                            FROM  SHORT_LIST_LOCATIONS ll
                            JOIN  RRE_AVG_PRICE_CURRENT pr
                            ON    ll.state = pr.state AND pr.locality = ll.locality
                            WHERE ll.landrre = 1 
                            ORDER BY pr.price DESC `;

            optionsObj = { outFormat: oracledb.OBJECT };
            excelFlag  = (params.excel)? true : false; 

        } else if ( request.level1 == 'locations' && params.service )  {

                await selectLocations (response, params)
                return           


        } else if ( request.level1 == 'sova' && request.level2 == 'get' && params.service == 'lists' )  {
            
            
            SCHEMA = 'regpc'
            TABLE = 'LISTS'

            // Запишем кучу queryString в queryStringArr
            colunms = await getColumnsArray(SCHEMA, TABLE)
            colunms= JSON.parse(colunms)
            console.dir(colunms)

            var returnObj = {}

            optionsObj = { outFormat: oracledb.ARRAY }; 

            // Нужно все это переписать с промисами и параллельным выполнением
            var permission; 

            for (const elem of colunms) {

                    queryString = `SELECT DISTINCT
                                    ${elem}
                                FROM ${SCHEMA}.${TABLE} 
                                WHERE ${elem} IS NOT NULL
                                ORDER BY ${elem}`;

                    
                    r = await requestDBPromisePool(elem, queryString, {}, optionsObj)
                    if (r.response !== 'error'){
                        returnObj[elem] = JSON.parse(r.response)
                    } else {
                        console.dir(r)
                    }
                    console.dir(returnObj[elem])


            }
            
            console.dir(returnObj)
            senderWithHeaders (response, returnObj)
            return returnObj;

           // breabreak;       
           
        } else if ( request.level1 == 'sova' && request.level2 == 'get' && params.service == 'company-attributes'  )  {

            var returnObj = {}

            optionsObj = { outFormat: oracledb.OBJECT }; 

            var permission; 

            whereId = (id) => {
                return id? ` WHERE ID = ${id}\n`:``;
            }

            queryString = `SELECT *
                            FROM regpc.PC_ATTRIBUTES_ACTUAL_VIEW
                            ${whereId(params.id)}
                            `;

            const unique = (arr) => {

                let result = [];                
                for (let str of arr) {
                    if (!result.includes(str)) {
                    result.push(str);
                    }
                }                
                return result;
            }

            /* callback = (res) =>  
                res.map((company, i) => {
                    let processed = res
                    processed.CURATORS = unique(company.CURATORS.split(','))
                    return processed
                });    */             
           
            
            r = await requestDBPromisePool('company-attributes', queryString, {}, optionsObj)   // callback - map curators split, удалить дубликаты

            console.dir(r.fullResult.rows)

            senderWithHeaders ( response,
				r.fullResult.rows.map(company => {
					let processed = company
					processed.CURATORS = company.CURATORS? unique(company.CURATORS.split(',')): [];
					return processed
				})	
            )
            // fullResult
            return r;     
            
        } else if ( request.level1 == 'sova' && request.level2 == 'get' && params.service == 'company-region-accesses'  )  {

            var returnObj = {}

            optionsObj = { outFormat: oracledb.OBJECT }; 

            var permission; 

            whereId = (id) => {
                return id? ` WHERE ID_COMPANY = ${id}\n`:``;
            }

            queryString = `SELECT *
                           FROM regpc.ACCESES_COMPANY_REGION_VIEW
                           ${whereId(params.id)}
                          `;

            callback = (result) => ( result.map( comreg => {
                return { 'ID'		  : comreg.ID,
                         'ID_COMPANY' : comreg.ID_COMPANY, 
                         'STATE'      : comreg.STATE, 
                         'ENG_NAME'   : function() { 
												   let arr = []
												   if (comreg.ENG_NAME != null ) arr = comreg.ENG_NAME.split(', ')										   
                                                   let obj = {}
                                                   arr.forEach(level => {
                                                        obj[level] = 1; 
                                                   })
                                                   return obj
                                                  }(), 
                         'ABBREVIATION' : comreg.ENG_NAME != null? comreg.ABBREVIATION.split(', ') : [] }
            }))
                    
            r = await requestDBPromisePool('company-region-accesses', queryString, {}, optionsObj, callback)

            senderWithHeaders ( response, ( Object.keys(r.response).length !== 0 )? JSON.parse(r.response ):
						{'ID'		  : '',
                         'ID_COMPANY' : '', 
                         'STATE'      : '', 
                         'ENG_NAME'   : {}, 
                         'ABBREVIATION' :[] }
			)

            // fullResult
            return r;         
            
        } else if ( request.level1 == 'sova' && request.level2 == 'get' && params.service == 'office-attributes' && params.id )  {

            var returnObj = {}

            optionsObj = { outFormat: oracledb.OBJECT };

            var permission;


            queryStringAtributes = `
                SELECT *
                FROM regpc.OFFICES_ATTR_VIEW
                WHERE ID_company = ${params.id}
                `;

            queryStringLocalities = (cross) => { console.dir(cross) ; return `
                SELECT
                    pl.id,
                    l.id id_locality,
                    l.state,
                    l.locality 
                FROM regpc.PRESENCE_LOCALITY pl
                LEFT JOIN "SYSTEM".SHORT_LIST_LOCATIONS l
                ON pl.id_locality = l.ID
                WHERE pl.ID_OFFICE = '${cross.ID_OFFICE}'
                `
                };                           
                    
            requestDBPromisePool('office-attributes', queryStringAtributes, {}, optionsObj)
            .then( r => JSON.parse( r.response ) )
            .then( async offices => {

                let i = 0
                PRESENCE_LOCALITY = {}
                for ( off of offices) {                    
                    //PRESENCE_LOCALITY[off.ID_OFFICE] = JSON.parse((await requestDBPromisePool ( off.ID_OFFICE, queryStringLocalities( off ), {}, optionsObj )).response)
                    offices.find ( o => off.ID_OFFICE === o.ID_OFFICE ).PRESENCE_LOCALITY  = JSON.parse(( await requestDBPromisePool ( off.ID_OFFICE, queryStringLocalities( off ), {}, optionsObj )).response )

                    i++              
                }

                return offices

            })            
            .then( offices => senderWithHeaders ( response, offices) )
            .catch( err  => senderWithHeaders ( response, auth.Tmplt ('error', err)) )

            return;
			


        } else if ( argsCount == 4 && request.level1 == 'catalog' && request.level2 == 'avgprice' && params.service == 'cre' && typesCRE.indexOf(params.type)>-1 && params.region && params.location ) {
        
            // /api/catalog/avgprice?service=cre&type=offices_other&region=Москва&location=ЦАО 
            queryString = `  SELECT 
                                CASE :type 
                                    ${caseStatement} 
                                END
                            FROM CRE_AVG_PRICE_CURRENT
                            WHERE (state = :region AND locality = :location)
                        `;

            bindObj = {
                    region:   params.region
                    , location: params.location
                    , type:     params.type  
                    , price:  { dir: oracledb.BIND_OUT, type: oracledb.STRING }
            };

            //optionsObj = { outFormat: oracledb.OBJECT };


        } else if ( argsCount == 3 && request.level1 == 'catalog' && request.level2 == 'avgprice' && params.service == 'cre' && typesCRE.indexOf(params.type)>-1 && params.region ) {
            // /api/catalog/avgprice?service=cre&type=offices_other&region=Москва    
            console.log('come into catalog avgprice cre (region)');

            queryString =  `SELECT 
                                locality
                                ,CASE :type 
                                    ${caseStatement} 
                                END
                            FROM CRE_AVG_PRICE_CURRENT
                            WHERE state = :region
                            `;
            bindObj = {
                    region: params.region                
                    , type:   params.type  
            };

        } else if ( argsCount == 1 && request.level1 == 'catalog' && request.level2 == 'avgprice' && params.service == 'landrre') {
            queryString = ` 
                            SELECT pr.state, pr.locality, pr.price 
                            FROM RRE_AVG_PRICE_CURRENT pr
                            JOIN (select * from SHORT_LIST_LOCATIONS WHERE LANDRRE=1) ll        
                            ON pr.state = ll.state AND pr.locality = ll.locality 
                            ORDER BY pr.price DESC
                        `;
            
            optionsObj = { outFormat: oracledb.OBJECT };    
    

        } else if ( argsCount == 2 && params.service == 'cre' && params.type == 'avgprice' ) {
            queryString = ' SELECT * FROM CRE_AVG_PRICE_CURRENT ';

        } else if ( argsCount == 2 && params.service == 'cre' && params.type == 'avgprice' ) {
            queryString = ' SELECT * FROM CRE_AVG_PRICE_CURRENT ';

        } else if ( argsCount == 3 && request.level1 == 'catalog' && request.level2 == 'avgprice' && params.service == 'rre' && params.region && params.location) {

            queryString = ` 
                            SELECT PRICE 
                            FROM RRE_AVG_PRICE_CURRENT 
                            WHERE STATE = :region AND LOCALITY = :location         
                        `; 

            bindObj = {
                region:   params.region
                , location: params.location
            };                      
            optionsObj = { outFormat: oracledb.OBJECT };

        } else if ( argsCount == 3 && request.level1 == 'catalog' && request.level2 == 'avgprice' && params.service == 'landrre' && params.region && params.location) {
            queryString = ` 
                            SELECT price 
                            FROM RRE_AVG_PRICE_CURRENT 
                            WHERE (state = :region AND locality = :location)         
                        `;

            bindObj = {
                region:   params.region
                , location: params.location
            };                            
            optionsObj = { outFormat: oracledb.OBJECT };

            // *********** REGPC ***************** // 
        } else if ( request.level1 == 'regpc' && params.list == 'loсations' && params.subj == 'state')  {

            queryString = ` 
            SELECT DISTINCT STATE
            FROM SHORT_LIST_LOCATIONS 
            ORDER BY STATE ASC         
            `;
                            
            optionsObj = { outFormat: oracledb.OBJECT };          
            
        } else if ( request.level1 == 'regpc' && params.list == 'loсations' && params.subj == 'loc')  {

            queryString = ` 
            SELECT DISTINCT LOCALITY
            FROM SHORT_LIST_LOCATIONS 
            WHERE LOCALITY != 'Прочие населенные пункты' AND STATE != 'Москва' AND STATE != 'Санкт-Петербург'
            ORDER BY LOCALITY ASC         
            `;
                            
            optionsObj = { outFormat: oracledb.OBJECT };              

            // toc - types of company
        } else if ( request.level1 == 'regpc' && params.list == 'toc' )  {

            // Запилить здесь SELECT Distinct TYPE_COMPANY FROM PC_ATTRIBUTES ORDER BY TYPE ASC
            queryString = ` 
            SELECT id, TYPE 
            FROM ${ SCHEMA_SOVA}.TYPE_OF_COMPANY 
            ORDER BY TYPE ASC         
            `;
                            
            optionsObj = { outFormat: oracledb.OBJECT };   

        // Свободная форма
        // && argsCount == 1 && params.add === '1' 
        } else if ( request.level1 == 'regpc' && params.field_out && params.table && params.field_where && params.value && params.valtype )  {

            console.log('params.valtype = ' + params.valtype)

            if( params.valtype == 'string' ){
                val = `'${params.value}'`
            } else if ( params.valtype == 'number' ) {
                val = params.value
            }
            
            queryString = ` 
            SELECT ${params.field_out} response
            FROM   ${ SCHEMA_SOVA}.${params.table}  
            WHERE  ${params.field_where} = ${val}          
            `;
                            
            optionsObj = { outFormat: oracledb.OBJECT };   


        /// !!! GET_COMPANIES_DATA 
        } else if ( argsCount == 2 && request.level1 == 'sova'   && request.level2 == 'get' && params.service == 'companies_data' && params.v ) {

            // Parse version
            v = params.v.split('.')

            switch (v[0]) {
                case '0':
                case '1':
                        // /api/sova/get?service=COMPANIES_data&v=1.0
                        queryString = `  SELECT 
                                                id,
                                                TYPE_OF_COMPANY type,
                                                name,
                                                ABBREVIATION abbr,
                                                TIN,
                                                REG_PLACE place,
                                                ${ function() {
                                                        switch (v[1]) {
                                                            case '0': return `TO_CHAR (PRESENCE_LOCALITY) LOCALITY`
                                                            case '1': return `JSON_QUERY(PRESENCE_LOCALITY, '$.region' WITH  WRAPPER) AS region,
                                                                            JSON_QUERY(PRESENCE_LOCALITY, '$.city'   WITH  WRAPPER) AS city`
                                                        }
                                                    }()
                                                }
                                            
                                            FROM ${ SCHEMA_SOVA}.PC_ATTRIBUTES 
                                            ORDER BY ID ASC  
                                        `;
                        break;

            }
        
            console.log(queryString)

            optionsObj = { outFormat: oracledb.OBJECT };   

        // Таблица с названиями уровней допуска
        } else if ( argsCount == 2 && request.level1 == 'sova' && request.level2 == 'get' && params.service == 'access_levels' && params.v ) {
            
        SCHEMA = 'regpc'
            TABLE = 'ACCESS_LEVEL_WEIGHTS'

            // Parse version
            v = params.v.split('.')

            //setTimeout( async()=>{

                switch (v[0]) {
                    case '0':
                    case '1':

                    // x.Y
                    switch (v[1]) {
                        case '0':

                            // /api/baudit/get?service=classifications&v=1.0                
                            queryString = `SELECT
                                                ID,
                                                ENG_NAME,
                                                ABBREVIATION,
                                                NAME FULLNAME,
                                                WEIGHT
                                            FROM ${SCHEMA}.${TABLE}
                                            `

                            optionsObj = { outFormat: oracledb.OBJECT }; 

                            var returnObj = {}

                            returnObj = await requestDBwoPromise(queryString, optionsObj)                        

                            senderWithHeaders(response, returnObj)                                    

                            return returnObj;

                            break;  

                    case '1':
                        
                            break;              
        
                    }

                    break;

                }

            //}, 20)


            // JSON_OBJECT ('deptId' IS department_id, 'name' IS department_name)

        } else if ( argsCount == 2 && request.level1 == 'sova' && request.level2 == 'get' && params.service == 'pc_registry' && params.v ) {
            
            SCHEMA = 'regpc'
            TABLE = 'OFFICES_ACTUAL_HUM_VIEW'

            Array.prototype.replacer = function( params = { data : false, nulls : false } ) { return this.map( row => {

                    //console.dir( row )

                    for (key in row) {                             
                        if( params.data )  row[key] = ( moment( row[key], moment.ISO_8601).isValid() && key.substring(0,5) === 'DATE_' )? moment(row[key]).format('L') : row[key] 
                        if( params.nulls ) row[key] = (  row[key] === null )? 0 : row[key] 
                    }

                    return row

                }) 
            } 

            // Parse version
            v = params.v.split('.')

            switch (v[0]) {
                case '0':
                case '1':

                // x.Y
                switch (v[1]) {
                    case '0':

                        // /api/baudit/get?service=classifications&v=1.0                
                        queryString = `SELECT *
                                        FROM ${SCHEMA}.${TABLE} 
                                        ORDER BY ID_COMPANY desc                
                                        FETCH NEXT 40 ROWS ONLY                                        
                                        `

                        optionsObj = { outFormat: oracledb.OBJECT }; 

                        returnArr = await requestDBPromise('pc_registry', queryString, optionsObj)

                        result  = JSON.parse(returnArr.response).replacer( { data : true, nulls : true } )
                        senderWithHeaders(response, result)                                    

                        return returnArr;

                        break;  

                case '1':                    
                                   
                     queryString = `SELECT *
                                    FROM ${SCHEMA}.${TABLE}
                                    `

                    optionsObj = { outFormat: oracledb.OBJECT }; 

                    returnArr = await requestDBPromise('pc_registry', queryString, optionsObj)

                    result  = JSON.parse(returnArr.response).replacer( { data : true, nulls : true } )
                    senderWithHeaders(response, result)                                    

                    return returnArr;

                    break;
    
                }

                break;

            }

            // JSON_OBJECT ('deptId' IS department_id, 'name' IS department_name)
			
		} else if ( request.level1 == 'sova' )  {
            await component.API(request, response)
			return		

        } else if ( argsCount == 2 && request.level1 == 'baudit' && request.level2 == 'get' && params.service == 'classifications' && params.v ) {

            let SCHEMA = 'BAUDIT'
            let TABLE  = 'CLASSIFICATIONS'

            const realty_cl = ["TYPE_REALTY", "TYPE_BUILD", "INDUSTRY", "SUBINDUSTRY", "TYPE_STOCK", "SUBTYPE_STOCK"]

            
            // Parse version
            v = params.v.split('.')
            // X.y
            switch (v[0]) {
                case '0':
                case '1':

                // x.Y
                switch (v[1]) {
                    case '0':
                        // /api/baudit/get?service=classifications&v=1.0
                        cicle = 1   // Циклический запрос
                        queryString = `  SELECT 
                                            *                                        
                                        FROM ${SCHEMA}.${TABLE} 
                                        ORDER BY ID ASC  
                                        `;
                        optionsObj = { outFormat: oracledb.OBJECT }; 
                        break;
                        
                    case '6':
                        // Запишем кучу queryString в queryStringArr
                        colunms = await getColumnsArray(SCHEMA, TABLE)
                        colunms= JSON.parse(colunms)
                        console.dir(colunms)
                        //queryStringArr = []
                        var returnObj = {}

                        optionsObj = { outFormat: oracledb.OBJECT }; 

                        // Нужно все это переписать с промисами и параллельным выполнением
                        
                        //exception
                        //const stuffing = `id, `
                        //var inject = ``
                        var permission; 

                        for (const elem of colunms) {
                        
                            permission = !(realty_cl.indexOf(elem) > -1)    // Не входит ли в связный список с типами недвижимости

                            if ( permission ){

                                queryString = `SELECT DISTINCT
                                                id,
                                                ${elem} VALUE
                                            FROM ${SCHEMA}.${TABLE} 
                                            WHERE ${elem} IS NOT NULL`;

                                
                                r = await requestDBwoPromise(queryString, optionsObj)
                                if (r.response !== 'error'){
                                    //{ "response": "error", "comment" : err, "queryString" : queryString }
                                    returnObj[elem] = r
                                } else {
                                    console.dir(r)
                                }
                                console.dir(returnObj[elem])
                                
                                returnObj[elem] = JSON.parse(returnObj[elem])
                            }

                        }

                        // Добавим Типы складов
                        queryString = `SELECT min("ID") "ID", TYPE_STOCK VALUE
                                    FROM ${SCHEMA}.${TABLE} 
                                    WHERE TYPE_STOCK IS NOT NULL
                                    GROUP BY TYPE_STOCK, SUBTYPE_STOCK
                                    having SUBTYPE_STOCK is null
                                    ORDER BY (CASE TYPE_STOCK
                                                WHEN 'Ангар' THEN 1
                                                WHEN 'Склад' THEN 2
                                                ELSE 3
                                            END),
                                            TYPE_STOCK`
                                    
                        returnObj['TYPE_STOCK'] = await requestDBwoPromise(queryString, optionsObj)
                        returnObj['TYPE_STOCK'] = JSON.parse(returnObj['TYPE_STOCK']) 
                        returnObj = JSON.stringify(returnObj)
                        
                        console.dir(returnObj)
                        //response.send(returnObj)
                        senderWithHeaders (response, returnObj, 'send')
                        return returnObj;

                        break;  
                        
                case '7':
                        // Запишем кучу queryString в queryStringArr
                        colunms = await getColumnsArray(SCHEMA, TABLE)
                        colunms= JSON.parse(colunms)
                        //console.dir(colunms)
                        //queryStringArr = []
                        var returnObj = {}

                        optionsObj = { outFormat: oracledb.OBJECT }; 

                        // Нужно все это переписать с промисами и параллельным выполнением
                        
                        //exception
                        //const stuffing = `id, `
                        //var inject = ``
                        var permission; 
                        var promiseArr = []

                        for (const elem of colunms) {
                        
                            permission = !(realty_cl.indexOf(elem) > -1)    // Не входит ли в связный список с типами недвижимости

                            if ( permission ){

                                queryString = `Select * from (SELECT DISTINCT
                                                id,
                                                ${elem} VALUE
                                            FROM ${SCHEMA}.${TABLE} 
                                            WHERE ${elem} IS NOT NULL)
                                            Order by VALUE`;
                                
                                promiseArr.push( await requestDBPromise(elem, queryString, optionsObj) )
        
                            }

                        }

                        // Добавим Типы складов
                        queryString = `SELECT min("ID") "ID", TYPE_STOCK VALUE
                                    FROM ${SCHEMA}.${TABLE} 
                                    WHERE TYPE_STOCK IS NOT NULL
                                    GROUP BY TYPE_STOCK, SUBTYPE_STOCK
                                    having SUBTYPE_STOCK is null
                                    ORDER BY (CASE TYPE_STOCK
                                                WHEN 'Ангар' THEN 1
                                                WHEN 'Склад' THEN 2
                                                ELSE 3
                                            END),
                                            TYPE_STOCK`

                        promiseArr.push( await requestDBPromise('TYPE_STOCK', queryString, optionsObj))     
                        
                        await Promise.all( promiseArr )
                                        .then( values => {
                                            values.map( (e) => {
                                            
                                                    if ( e.response !== 'error' ) {                                             
                                                        returnObj[e["id"]] = JSON.parse( e.response )

                                                    } else{
                                                        console.log('---------else-------------'); 
                                                        console.dir(e.response)

                                                    }
                                                }); 

                                            /* console.dir( returnObj ) */
                                            return returnObj
                                        })   
                                        .catch( rej => {
                                            console.log('-------reject----------'); 
                                            
                                            console.dir(rej)
                                            return rej
                                        })                                        
                        
                        senderWithHeaders (response, returnObj)

                        //response.json(returnObj)
                        
                        return returnObj
                        break;                          

                }

            }
        
            console.log(queryString)

        

        } else if ( ( argsCount == 2 || argsCount == 3 )  && request.level1 == 'baudit' && request.level2 == 'get' && params.service == 'data' && params.v ) {

            // if (params.id) 
            // if (params.type_) 


            let SCHEMA = 'BAUDIT'
            

            const realty_cl = ["TYPE_REALTY", "TYPE_BUILD", "INDUSTRY", "SUBINDUSTRY", "TYPE_STOCK", "SUBTYPE_STOCK"]

            
            // Parse version
            v = params.v.split('.')
            // X.y
            switch (v[0]) {
                case '0':
                case '1':

                // x.Y
                switch (v[1]) { 
                        
                case '0':
                        // Запишем кучу queryString в queryStringArr
                        //colunms = await getColumnsArray(SCHEMA, TABLE)
                        //colunms= JSON.parse(colunms)
                        //console.dir(colunms)
                        //queryStringArr = []
                        var returnObj = { "commercial" : [] , "living" : [] }

                        optionsObj = { outFormat: oracledb.OBJECT }; 
                        
                        //exception
                        //const stuffing = `id, `
                        //var inject = ``
        
                        var promiseArr = []

                        queryString = `SELECT *
                                        FROM ${SCHEMA}.VIEW_COMMERCIAL 
                                        ORDER BY ID DESC`;
                        
                        promiseArr.push( await requestDBPromise( "commercial", queryString, optionsObj ) )

                        queryString = `SELECT *
                                        FROM ${SCHEMA}.VIEW_LIVING 
                                        ORDER BY ID DESC`;
                        
                        promiseArr.push( await requestDBPromise( "living", queryString, optionsObj ) )                    

                        console.log(1)
                        
                        await Promise.all( promiseArr )
                                        .then( values => {
                                            values.map( (e) => {
                                            
                                                    if ( e.response !== 'error' ) {                                             
                                                        returnObj[e["id"]] = JSON.parse( e.response )

                                                    } else{
                                                        console.log('---------else-------------'); 
                                                        /* console.dir(e.response) */

                                                    }
                                                }); 

                                            /* console.dir( returnObj ) */
                                            return returnObj
                                        })   
                                        .then(()=>{ response.json(returnObj) })
                                        .catch( rej => {
                                            console.log('-------reject----------');                                             
                                            console.dir(rej)
                                            return rej
                                        })                                        
                        
                        // response.json(returnObj)
                        
                        return returnObj

                        break;       
                        
                case '1':
                        // Запишем кучу queryString в queryStringArr
                        //colunms = await getColumnsArray(SCHEMA, TABLE)
                        //colunms= JSON.parse(colunms)
                        //console.dir(colunms)
                        //queryStringArr = []
                        var returnObj = { "summary" : []  , "lengthy" : { "all" : [] }}

                        optionsObj = { outFormat: oracledb.OBJECT }; 

                        Array.prototype.replacer = function( params = { data : false, nulls : false } ) { return this.map( row => {

                                console.dir( row )

                                for (key in row) {                             
                                    if( params.data )  row[key] = ( moment( row[key], moment.ISO_8601).isValid() && key.substring(0,5) === 'DATE_' )? moment(row[key]).format('L') : row[key] 
                                    if( params.nulls ) row[key] = (  row[key] === null )? '' : row[key] 
                                }

                                return row

                            }) 
                        } 
        
                        var promiseArr = []

                        queryString = `SELECT *
                                        FROM ${SCHEMA}.VIEW_COMMERCIAL `;
                        
                        promiseArr.push( await requestDBPromise( { 0 : "lengthy", 1 : "commercial" }, queryString, optionsObj) )

                        queryString = `SELECT *
                                        FROM ${SCHEMA}.VIEW_LIVING `;
                        
                        promiseArr.push( await requestDBPromise( { 0 : "lengthy", 1 : "living" }, queryString, optionsObj ) )       
                        

                        queryString = `SELECT 
                                        ID,
                                        TYPE_REALTY,             
                                        STATUS,                  
                                        DOCUMENTS,               
                                        null LEADER,                  
                                        
                                        BUILDER_COMPANY,         
                                        REGION,                  
                                        DATE_USE,                
                                        BUILD_VOL,            
                                        TOTAL_AREA,           
                                        BEARING_CONSTR,          
                                        FENCE_STRUCT,            
                                        WITHOUT_ZU_TOTAL_AREA,   
                                        WITHOUT_ZU_BUILDING_VOL, 
                                        DATE_BUDG,               
                                        BUDG_ALL  
                                    FROM ${SCHEMA}.VIEW_LIVING
                                    
                                    UNION ALL
                                    
                                    SELECT 
                                        ID,
                                        TYPE_REALTY,             
                                        STATUS,                  
                                        DOCUMENTS,               
                                        null LEADER,                  
                                        
                                        BUILDER_COMPANY,         
                                        REGION,                  
                                        DATE_USE,                
                                        BUILD_VOL,            
                                        TOTAL_AREA,           
                                        BEARING_CONSTR,          
                                        FENCE_STRUCT,            
                                        WITHOUT_ZU_TOTAL_AREA,   
                                        WITHOUT_ZU_BUILDING_VOL, 
                                        DATE_BUDG,               
                                        BUDG_ALL  
                                    FROM ${SCHEMA}.VIEW_COMMERCIAL`;
        
                        promiseArr.push( await requestDBPromise( { 0 : "summary" }, queryString, optionsObj ) )                      


                        await Promise.all( promiseArr )

                                        .then( values => {
                                            values.map( (e) => {
                                            
                                                    if ( e.response !== 'error' ) {                                                     
                                                    
                                                        if ( e.id[0] === "lengthy") {
                                                        
                                                            returnObj[e.id[0]][e.id[1]] = JSON.parse( e.response ).replacer( { data : true, nulls : true } )
                                                            returnObj[e.id[0]].all = returnObj.lengthy.all.concat( JSON.parse( e.response ).replacer( { data : true, nulls : true } ) )

                                                        } else {

                                                            console.log('---------summary-------------'); 
                                                            console.log( e.response )
                                                            returnObj[e.id[0]] = JSON.parse( e.response ).replacer( { data : true, nulls : true } )
                                                        }                                                              

                                                    } else{
                                                        console.log('---------error-------------'); 
                                                        console.dir(e.response)
                                                    }
                                                }); 

                                        // console.dir( returnObj )
                                            return returnObj
                                        })   
                                        .catch( rej => {
                                            console.log('-------reject----------'); 
                                            
                                            console.dir(rej)
                                            return rej
                                        })                                        
                        
                        response.json(returnObj)                     

                        break;            
                        
                case '2':

                        var returnObj = []

                        optionsObj = { outFormat: oracledb.OBJECT }; 

                        Array.prototype.replacer = function( params = { data : false, nulls : false } ) { return this.map( row => {

                                //console.dir( row )
                                for (key in row) {                             
                                    if( params.data )  row[key] = ( moment( row[key], moment.ISO_8601).isValid() && key.substring(0,5) === 'DATE_' )? moment(row[key]).format('L') : row[key] 
                                    if( params.nulls ) row[key] = ( row[key] === null )? '' : row[key] 
                                }
                                return row

                            }) 
                        } 
        
                        var promiseArr = []

                        queryString = `SELECT *
                                        FROM ${SCHEMA}.VIEW_COMMERCIAL 
                                        ORDER BY ID DESC`;
                        
                        promiseArr.push( await requestDBPromise( { }, queryString, optionsObj) )

                        queryString = `SELECT *
                                        FROM ${SCHEMA}.VIEW_LIVING 
                                        ORDER BY ID DESC`;
                        
                        promiseArr.push( await requestDBPromise( { }, queryString, optionsObj ) ) 


                        await Promise.all( promiseArr )

                                        .then( values => {
                                            values.map( (e) => {
                                            
                                                    if ( e.response !== 'error' ) {                                                          
                                                            //returnObj.push( JSON.parse( e.response ).replacer( { data : true, nulls : true } ) )  
															console.log('e.response')
															console.log(e.response)
															if(Object.keys(e.response).length === 0 && e.response.constructor === Object){
																returnObj = []
															} else {	
																returnObj = returnObj.concat( JSON.parse( e.response ).replacer( { data : true, nulls : true } ) )
															}
															
                                                            

                                                    } else{
                                                        console.log('---------error-------------'); 
                                                        console.dir(e.response)
                                                    }
                                                }); 

                                            return returnObj
                                        })
                                        .then(()=>{ senderWithHeaders(response, returnObj)  })   
                                        .catch( rej => {
                                            console.log('-------reject----------'); 
                                            
                                            console.dir(rej)
                                            return rej
                                        })
                        
                        //senderWithHeaders(response, returnObj)                                    
                        
                        //response.json( returnObj )               
                        return returnObj
                        break;  

                }

            }
        
            /* console.log(queryString)   */      

            // JSON_OBJECT ('deptId' IS department_id, 'name' IS department_name)
            
        } else if ( argsCount == 2 && request.level1 == 'baudit' && request.level2 == 'get' && params.service == 'realty_classification' && params.v ) {
            
            SCHEMA = 'baudit'
            TABLE = 'classifications'

            const caseTypeBuild =
            `CASE TYPE_BUILD
                WHEN 'Жилые здания' THEN 1
                WHEN 'Общественные здания' THEN 2
                WHEN 'Промышленные здания' THEN 3
                WHEN 'Складские здания' THEN 4
                ELSE 5
            END`

            // Parse version
            v = params.v.split('.')
            //v = 
            // X.y
            switch (v[0]) {
                case '0':
                case '1':

                // x.Y
                switch (v[1]) {
                    case '0':

                        // /api/baudit/get?service=classifications&v=1.0                
                        queryString = `SELECT
                                        TYPE_REALTY, TYPE_BUILD, INDUSTRY, SUBINDUSTRY
                                        FROM ${SCHEMA}.${TABLE} 
                                    WHERE TYPE_REALTY IS NOT NULL
                                    ORDER BY (${caseTypeBuild}),
                                            TYPE_BUILD, INDUSTRY, SUBINDUSTRY`

                    /*  console.log(queryString) */

                        optionsObj = { outFormat: oracledb.OBJECT }; 
                        //break;

                        // Запишем кучу queryString в queryStringArr
                        // colunms = await getColumnsArray(SCHEMA, TABLE)
                        // colunms= JSON.parse(colunms)
                        //queryStringArr = []
                        var returnObj = {}

                    // optionsObj = { outFormat: oracledb.ARRAY }; 

                        // Нужно все это переписать с промисами и параллельным выполнением
                    /*
                        for (const elem of colunms) {
                            queryString = `SELECT DISTINCT
                                                    ${elem}
                                                FROM ${SCHEMA}.${TABLE} 
                                                WHERE ${elem} IS NOT NULL`; 
                        */

                        returnObj = await requestDBwoPromise(queryString, optionsObj)                        
                        //  returnObj = JSON.parse(returnObj)

                        //returnObj = JSON.stringify(returnObj)
                        
                        /* console.dir(returnObj) */
                        // response.send(returnObj)
                        senderWithHeaders(response, returnObj)                                    

                        return returnObj;

                        break;  

                case '1':
                    
                    optionsObj = { outFormat: oracledb.ARRAY }; 
                    //break;
                    ////////////////////////////////////////////
                        // Запишем кучу queryString в queryStringArr
                    colunms = await getColumnsArray(SCHEMA, TABLE)
                    colunms= JSON.parse(colunms)
                    //queryStringArr = []
                    var returnObj = {}

                    //optionsObj = { outFormat: oracledb.ARRAY }; 

                    // Нужно все это переписать с промисами и параллельным выполнением
                    for (const elem of colunms) {
                        queryString = `SELECT
                                    TYPE_REALTY, TYPE_BUILD, SUBINDUSTRY
                                    FROM ${SCHEMA}.${TABLE} 
                                    WHERE TYPE_REALTY IS NOT NULL 
                                ORDER BY (${caseTypeBuild}),
                            TYPE_BUILD, SUBINDUSTRY`

                        console.log(queryString)

                        returnObj[elem] = await  requestDBwoPromise(queryString, optionsObj)

                        returnObj[elem] = JSON.parse(returnObj[elem])
                    }

                    returnObj = JSON.stringify(returnObj)


                    //console.dir(returnObj)
                    senderWithHeaders(response, returnObj, 'send')                                    
                    //response.send(returnObj)
                    return returnObj;

                    break;              
    
                }

                break;

                case '2':

                        // /api/baudit/get?service=classifications&v=2.0     
                        // (having SUBINDUSTRY is null) - отбираем ссылки на строки с отраслью (с неопределенной подотраслью)     
                        if (v[1] === '2') {     
                        queryString = ` SELECT type_realty, TYPE_BUILD, min("ID") ID, INDUSTRY VALUE
                                        FROM baudit.classifications
                                        WHERE type_realty IS NOT NULL
                                        GROUP BY type_realty, TYPE_BUILD, INDUSTRY, SUBINDUSTRY
                                        having SUBINDUSTRY is null
                                        ORDER BY (${caseTypeBuild}),
                                                TYPE_BUILD, INDUSTRY, SUBINDUSTRY `

                        } else {
                            queryString = ` SELECT type_realty, TYPE_BUILD, INDUSTRY VALUE, min("ID") ID
                            FROM baudit.classifications
                            WHERE type_realty IS NOT NULL
                            GROUP BY type_realty, TYPE_BUILD, INDUSTRY, SUBINDUSTRY
                            having SUBINDUSTRY is null
                            ORDER BY (${caseTypeBuild}),
                                    TYPE_BUILD, INDUSTRY, SUBINDUSTRY `
                        }


                        //console.log(queryString)

                        optionsObj = { outFormat: oracledb.OBJECT }; 
                    
                        var returnObj = {}

                        //console.log(mdJSON ('help'))
                        

                        if (v[1] === '0') {
                            callback = (data)=> mdJSON(data, { arrMaxLvl: false, keepLastKeys: 0 }) 
                        } else if (v[1] === '1') {
                            callback = (data)=> mdJSON(data, { arrMaxLvl: false, keepLastKeys: 1 })        
                        } else {
                            callback = (data)=> mdJSON(data, { arrMaxLvl: false, keepLastKeys: 1 })  
                        }

                        returnObj = await requestDBwoPromise(queryString, optionsObj, undefined, callback)      
                        
                        //console.dir(returnObj)
                        senderWithHeaders (response, returnObj, 'send')

                        // response.send(returnObj)
                        return returnObj;        

                break;

            }
        
            console.log(queryString)

            // JSON_OBJECT ('deptId' IS department_id, 'name' IS department_name)

        } else if ( argsCount == 2 && request.level1 == 'baudit' && request.level2 == 'get' && params.service == 'regions' && params.v ) {

            
            /* let SCHEMA = 'URZ' */
            let TABLE = 'REGIONS_RF'

            // Parse version
            v = params.v.split('.')
            // X.y
            switch (v[0]) {
                case '0':
                case '1':

                // x.Y
                switch (v[1]) {
                    case '0':
                        // /api/baudit/get?service=classifications&v=1.0
                    
                        queryString = `SELECT
                                        *
                                        FROM ${TABLE}                                    
                                    ORDER BY region`

                        //console.dir(request)

                        optionsObj = { outFormat: oracledb.OBJECT }; 
                        break;

                    case '1':
                        // /api/baudit/get?service=classifications&v=1.0
                    
                        queryString = `SELECT
                                        region
                                        FROM ${TABLE}                                    
                                    ORDER BY region`

                        //console.log(queryString)

                        optionsObj = { outFormat: oracledb.ARRAY }; 
                        break;
    
                }

            }
        
            console.log(queryString)

            // JSON_OBJECT ('deptId' IS department_id, 'name' IS department_name)

        } else if ( request.level1 == 'baudit' && params.service == 'test' )  {
        
            queryString = ` 
                        SELECT dt, dt2, dt3
                        FROM test                             
                        `;
                            
            optionsObj = { outFormat: oracledb.ARRAY };   
        
            callback = (arr) => arr.map( e => {
                console.dir( moment(e[0]).format('L') )
                console.dir( e )
                return e.map(a => moment(a).format('L'))
            })  // работает только для массивов
            

            //moment().format('L');

        // Свободная форма
        // && argsCount == 1 && params.add === '1' 
    } else if ( argsCount == 2 && request.level1 == 'sova' && request.level2 == 'get' && params.service == 'company-data' && params.v ) {

            
        /* let SCHEMA = 'URZ' */
        //let TABLE = 'REGIONS_RF'

        // Parse version
        v = params.v.split('.')
        // X.y
        switch (v[0]) {
            case '0':
            case '1':

            // x.Y
            switch (v[1]) {
                case '0':
                    // /api/baudit/get?service=classifications&v=1.0
                
                    queryString = `SELECT
                                    *
                                    FROM ${TABLE}                                    
                                ORDER BY region`

                    //console.dir(request)

                    optionsObj = { outFormat: oracledb.OBJECT }; 
                    break;

                case '1':
                    // /api/baudit/get?service=classifications&v=1.0
                
                    queryString = `SELECT
                                    region
                                    FROM ${TABLE}                                    
                                ORDER BY region`

                    //console.log(queryString)

                    optionsObj = { outFormat: oracledb.ARRAY }; 
                    break;

            }

        }
    
        console.log( queryString )

        // JSON_OBJECT ('deptId' IS department_id, 'name' IS department_name)

    } else {

            errorRequest = Object.assign(errorWrongRequestTemplate, 
                                        { comment: "not found get-request url",
                                        url : request.originalUrl,  
                                        methods: request.route.methods
                                        })     

            //if (request["_body"]) errorRequest = Object.assign(errorRequest, { requestBody : request.body })

            response.status(400).json(errorRequest)
            return errorRequest;

        };

        // Добавить send куда надо
        t = await  requestDBwoPromise(queryString, optionsObj, undefined, callback)
        console.log(t)

        senderWithHeaders(response, t, 'send')
        // response.send(t)
        return t;

    } catch (err) {
        
        console.error(err);            
    } 


  
};


  /// http://urz.open.ru:88/api/questurz?newrecord=1

  async function insertIntoDB ( request, response ) {

/*     response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');     */
  
    var js = '';    

    let params = request.query;
    
    let argsCount = Object.keys(params).length;

    let queryString = '';
    let bindObj = {};
    let optionsObj = {};

    let excelFlag = false;

    let multiInsert = false;

    var ip  = request.ip;

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    };     

    // Type to lower case  
    if (params.type) { params.type = params.type.toLowerCase() };

    // String with types
    typesCREstr = typesCRE.join(', ');

    caseStatement  = ``;    // Case conditions
    typesCRE.forEach(function(item, i, arr) {
        caseStatement += `WHEN '${item}' THEN ${item} \n`;           
    });    

    let bindsArr = []

    console.log( "request.level1  = " + request.level1  )
    console.log( "request.level2  = " + request.level2  )
    console.log( "params.service  = " + params.service  )
    console.log( "argsCount  = " + argsCount  )
    console.log( "params.v  = " + params.v  )


    if ( request.level1 == 'questurz' && argsCount == '1' && params.newrecord ) {

    } else if (request.level1 == 'regpc' && argsCount == 1 && params.add === '1' ){        
        
        multiInsert = false

        console.log("request.body");
        console.dir(request.body);
        let objInput = request.body;
        
        console.log("objInput:");
        console.dir(objInput);

        bindsObj = await bindObjMaker(objInput, { ip: ip } , "pc_attributes")
        
        console.log("bindsObj:")
        console.dir ( bindsObj );


    queryString = `INSERT INTO ${ SCHEMA_SOVA}.${TABLE_ATTR} (
                name, ABBREVIATION, TIN, PSRN, REG_DATE, OKPO, LEGAL_ADDRESS_COUNTRY, LEGAL_ADDRESS, ACTUAL_ADDRESS_REGION, ACTUAL_ADDRESS, PHONE, MOBILE_PHONE, FAX, EMAIL, SITE, 
                ACCOUNT_DETAILS_BANK_NAME, ACCOUNT_DETAILS_SETTLEMENT_ACC, ACCOUNT_DETAILS_CORR_ACC, ACCOUNT_DETAILS_BIC, TIME_OF_ACTIVITY, CAPITAL_AMOUNT, FEDERAL_TAX_SERVICE_CONTACTS, AFFILIATES_INFO, 
                INSURANCE_COMPANIES, APPRAISERS_NUMBER, APPRAISERS_INV_AVAILABILITY, QUANTITY_APPRAISERS, 
                AVG_QTY_REPORTS_IN_MOUNTH, INV_EXTERNAL_MAX, MAX_REPORTS, PARTNER_BANKS, WORKS_INFO, RVC, ID_TYPE, ACTUAL_ADDRESS_LOCALITY, SUBSIDIARIES, SUM_INSURED, DATE_OF_START_INSURANCE_POLICY, 
                DATE_OF_END_INSURANCE_POLICY, QUANTITY_APPRAISERS_DECLARED, REG_PLACE, REG_AGENCY, PRESENCE_LOCALITY, TYPE_OF_COMPANY, DATE_ADD, AUTHOR_ADD )

                VALUES ( :nm, :abr, :tin, :psrn, to_date(:rd, 'DD.MM.YYYY'), :okpo, :lac, :lad, :aar, :aad, :pho, :mpho, :fax, :email, :site, 
                         :adbn, :adsett, :adcorr, :adb, :toa, :capa, :ftsc, :afi, 
                         :inscom, :appnum, :appiav, :qtyapp, 
                         :avgrepm, :extmax, :maxrep, :partnb, :wrkinf, :rvc, :idty, :actaddr, :subs, :sumins, to_date(:dtst, 'DD.MM.YYYY'), 
                         to_date(:dten, 'DD.MM.YYYY'), :qtydc, :regpl, :regag, :pres, :tyco, :dadd, :auth )`;
        

        optionsObj = {
            
              autoCommit: true,
              bindDefs: { 

                     nm:    { type: oracledb.STRING ,   maxSize: 1000*2 }  //name
                    ,abr:   { type: oracledb.STRING ,   maxSize: 1000*2 }  //ABBREVIATION                    
                    ,tin:   { type: oracledb.STRING ,   maxSize: 1000*2 }  //TIN 
                    ,psrn:  { type: oracledb.STRING ,   maxSize: 20*2   }  //PSRN
                    ,rd:	{ type:oracledb.DATE }                       //REG_DATE                    
                    ,okpo:  { type: oracledb.STRING ,   maxSize: 50*2   }  //OKPO
                    ,lac:   { type: oracledb.STRING ,   maxSize: 30*2   }  //LEGAL_ADDRESS_COUNTRY              
                    ,lad:   { type: oracledb.STRING ,   maxSize: 500*2  }  //LEGAL_ADDRESS        
                    ,aar:   { type: oracledb.STRING ,   maxSize: 50*2   }  //ACTUAL_ADDRESS_REGION
                    ,aad:   { type: oracledb.STRING ,   maxSize: 1000*2 }  //ACTUAL_ADDRESS
                    ,pho:   { type: oracledb.STRING ,   maxSize: 20*2   }  //PHONE        
                    ,mpho:  { type: oracledb.STRING ,   maxSize: 20*2 }    //MOBILE_PHONE
                    ,fax:   { type: oracledb.STRING ,   maxSize: 20*2 }    //FAX
                    ,email: { type: oracledb.STRING ,   maxSize: 20*2 }    //EMAIL        
                    ,site:  { type: oracledb.STRING ,   maxSize: 30*2 }    //SITE
                    ,adbn:  { type: oracledb.STRING ,   maxSize: 50*2 }    //ACCOUNT_DETAILS_BANK_NAME        
                    ,adsett:  { type: oracledb.STRING , maxSize: 30*2 }  //ACCOUNT_DETAILS_SETTLEMENT_ACC              	
                    ,adcorr:  { type: oracledb.STRING , maxSize: 30*2 }  //ACCOUNT_DETAILS_CORR_ACC    
                    ,adb:   { type: oracledb.STRING , maxSize: 20*2   }  //ACCOUNT_DETAILS_BIC
                    ,toa:   { type:oracledb.DATE }                     //TIME_OF_ACTIVITY                        
                    ,capa:  { type: oracledb.NUMBER }                  //CAPITAL_AMOUNT
                    ,ftsc:  { type: oracledb.STRING , maxSize: 1000*2  }  //FEDERAL_TAX_SERVICE_CONTACTS                    
                    ,afi:   { type: oracledb.STRING , maxSize: 1500*2  }  //AFFILIATES_INFO
                    //,ofo:    { type: oracledb.STRING , maxSize: 1500 }  //ORGANIZATION_FOUNDERS
                    ,appnum:  { type: oracledb.NUMBER }                  //APPRAISERS_NUMBER                  
                    /*  ,head:    { type: oracledb.STRING , maxSize: 1500   }  //HEAD_OF_ORGANIZATION        
                    ,chacc:   { type: oracledb.STRING , maxSize: 1500 }  //CHIEF_ACCOUNTANT */                   
                    ,inscom:  { type: oracledb.STRING , maxSize: 2000*2 }  //INSURANCE_COMPANIES        
                    ,appiav:  { type: oracledb.NUMBER }                  //APPRAISERS_INV_AVAILABILITY                    
                    ,qtyapp:  { type: oracledb.NUMBER }                  //QUANTITY_APPRAISERS            
                    ,avgrepm: { type: oracledb.NUMBER }                  //AVG_QTY_REPORTS_IN_MOUNTH            
                    ,extmax:  { type: oracledb.NUMBER }                  //INV_EXTERNAL_MAX  
                    ,maxrep:  { type: oracledb.NUMBER }	                 //MAX_REPORTS
                    ,partnb:  { type: oracledb.STRING , maxSize: 1500*2 }  //PARTNER_BANKS
                    ,wrkinf:  { type: oracledb.STRING , maxSize: 2000*2 }  //WORKS_INFO
                    ,rvc:     { type: oracledb.NUMBER }	                 //RVC
                    ,idty:    { type: oracledb.NUMBER }                  //ID_TYPE        
                    ,actaddr: { type: oracledb.STRING , maxSize: 1000*2 }  //ACTUAL_ADDRESS_LOCALITY
                    ,subs:    { type: oracledb.STRING , maxSize: 2000*2 }  //SUBSIDIARIES
                    ,sumins:  { type: oracledb.NUMBER }                  //SUM_INSURED        
                    ,dtst:    { type: oracledb.DATE }                    //DATE_OF_START_INSURANCE_POLICY
                    ,dten:    { type: oracledb.DATE }                    //DATE_OF_END_INSURANCE_POLICY        
                    ,qtydc:   { type: oracledb.NUMBER }                  //QUANTITY_APPRAISERS_DECLARED	        
                    ,regpl:   { type: oracledb.STRING , maxSize: 2000*2 }  // REG_PLACE
                    ,regag:   { type: oracledb.STRING , maxSize: 2000*2 }  // REG_AGENCY
                    ,pres:    { type: oracledb.STRING , maxSize: 64000*2 } // PRESENCE_LOCALITY  
                    ,dadd:    { type: oracledb.STRING , maxSize: 32*2 }    // DATE_ADD
                    ,auth:    { type: oracledb.STRING , maxSize: 32*2 }    // AUTHOR_ADD
   
              }                          

        }
        
        //
    // If the request has matured
    if (queryString != '') {
        
            try {

                connection = await oracledb.getConnection(
                { 
                    user: dbConfig.user, 
                    password: dbConfig.password, 
                    connectString: dbConfig.connectString
                });
                
                result = await connection.execute(
                    queryString
                    ,bindsObj
                    ,optionsObj
                ); 
                  
                console.log( result.rowsAffected )          

                // 
                if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
                    

                    try {

                        connection2 = await oracledb.getConnection(
                        { 
                            user: dbConfig.user, 
                            password: dbConfig.password, 
                            connectString: dbConfig.connectString
                        });
                        
                        let id_company = await connection2.execute("SELECT max(id) from regpc.pc_attributes");
                          
                        console.log( id_company )        

                        result.id_company = id_company.rows[0][0];
                        console.dir(result)
             
                        response.send(result);

                
                    } catch (err) {
                        console.error(err);
                        response.send(err);
                    
                    } finally {
                        if (connection2) {
                            try {
                        await connection2.close();
                            } catch (err) {
                        console.error(err);
                            }
                        }
                
                    }
                    

                };
        
            } catch (err) {
                console.error(err);
                response.send(err);
            
            } finally {
                if (connection) {
                    try {
                await connection.close();
                    } catch (err) {
                console.error(err);
                    }
                }
        
            }

        } else {   

        response.send('Request not processed');        

        };


    } else if ( request.level1 == 'regpc'   && argsCount == 1 && params.add === '2' ){
       
        multiInsert = true
        console.log('params.add = 2')
        console.log("request.body");
        console.dir(request.body);
        let objInput = request.body;
        //let objInput = JSON.parse(request.body)
        console.log(objInput);

         /* for (var key in o) {
            console.log(key, ':', o[key]);
        } */
        //objInput = request.body;
        //console.dir ( bindsObj );

        //bindsArr = prepareArrawToDB( objInput )
        bindsArr = await bindArrMakerMany( objInput, ip, 'staff' )

        console.log("bindsArr:")
        console.dir ( bindsArr );

        //
        queryString = `INSERT INTO ${ SCHEMA_SOVA}.${TABLE_ATTR_STAFF} (
                            POSITION_WEIGHT, FULLNAME, DATEBORN, PLACEBORN, PASSPORT, PASSPORT_ISSUER, PASSPORT_DATE, 
                            ADDRESS_REG, EXPERIENCE_IN_COMPANY, PHONE_NUM, EMPL_CONTRACT,DIPLOM, SELFREG_ORG_NAME, SELFREG_PROOF_DOC, 
                            INSURANCE_POLICY, INSURANCE_COMPANY, INSURANCE_AMOUNT, INSURANCE_START_DATE, INSURANCE_END_DATE,
                            EXPERIENCE_ALL, ID_COMPANY, ADDRESS_RESIDENTIAL, CERT_DATA, DATE_ADD, AUTHOR_ADD )

                    VALUES ( :pos, :fulln , to_date(:dtb, 'DD.MM.YYYY'), :plb , :passp , :passpi, to_date(:passpd, 'DD.MM.YYYY'), 
                                :addrr , :expc , :phn , :empc , :dipl , :orgn , :prfd , 
                                :insp , :insc , :insa , to_date(:inds, 'DD.MM.YYYY'), to_date(:inde, 'DD.MM.YYYY'), 
                                :expa , :idc , :addr, :cert, :dadd, :auth )`;    
    
                    
        // STATUS, FULLNAME, DATEBORN, PLACEBORN, PASSPORT, PASSPORT_ISSUER, PASSPORT_DATE, ADDRESS_REG, EXPERIENCE_IN_COMPANY, PHONE_NUM, EMPL_CONTRACT,DIPLOM,SELFREG_ORG_NAME,SELFREG_PROOF_DOC,INSURANCE_POLICY,INSURANCE_COMPANY,INSURANCE_AMOUNT,INSURANCE_START_DATE,INSURANCE_END_DATE,EXPERIENCE_ALL,QUAL_CERT_DIRECTION,QUAL_CERT_NUM,QUAL_CERT_DATE_START,QUAL_CERT_DATE_END,ID_COMPANY,ADDRESS_RESIDENTIAL

        optionsObj = {
            
             autoCommit: true,
              bindDefs: {    

                 pos:    { type: oracledb.STRING , maxSize: 128*2 }    // status
                ,fulln:  { type: oracledb.STRING , maxSize: 2000*2 }    // fullname
                
                /////  dtb:    { type: oracledb.DATE }          // dateborn

                ,dtb:    { type: oracledb.STRING, maxSize: 20*2 }

                ,plb:    { type: oracledb.STRING , maxSize: 2000*2 }   // placeborn
                ,passp:  { type: oracledb.STRING , maxSize: 2000*2 }   // passport
                ,passpi: { type: oracledb.STRING , maxSize: 2000*2 }   // passport_issuer
                ,passpd: { type: oracledb.STRING , maxSize: 20*2 }     // passport_date
                ,addrr:  { type: oracledb.STRING , maxSize: 2000*2 }   // address_reg
                ,expc:   { type: oracledb.STRING , maxSize: 2000*2 }   // experience_in_company

                ,phn:    { type: oracledb.STRING , maxSize: 20*2 }     // phone_num
                ,empc:   { type: oracledb.STRING , maxSize: 2000*2 }    // empl_contract
                ,dipl:   { type: oracledb.STRING , maxSize: 2000*2 }    // diplom
                ,orgn:   { type: oracledb.STRING , maxSize: 2000*2 }    // selfreg_org_name
                ,prfd:   { type: oracledb.STRING , maxSize: 2000*2 }    // selfreg_proof_doc
                ,insp:   { type: oracledb.STRING , maxSize: 2000*2 }    // insurance_policy
                ,insc:   { type: oracledb.STRING , maxSize: 2000*2 }    // insurance_company
                ,insa:   { type: oracledb.STRING , maxSize: 256*2 }    // insurance_amount
                ,inds:   { type: oracledb.STRING , maxSize: 20*2  }    // insurance_start_date
                ,inde:   { type: oracledb.STRING , maxSize: 20*2  }    // insurance_end_date
                ,expa:   { type: oracledb.STRING , maxSize: 236*2 }    // experience_all
                               
                ,idc:    { type: oracledb.STRING , maxSize: 256*2 }    // id_company
                ,addr:   { type: oracledb.STRING , maxSize: 2000*2 }    // address_residential

                ,cert:   { type: oracledb.STRING , maxSize: 64000*2 }    // cert

                ,dadd:   { type: oracledb.STRING , maxSize: 64*2 }    // DATE_ADD
                ,auth:   { type: oracledb.STRING , maxSize: 64*2 }    // AUTHOR_ADD      
                
                
                //              
                                
              } 
        }   
        
        
        // If the request has matured
        if (queryString != '' && objInput != {}) {
                
            try {

                connection3 = await oracledb.getConnection(
                { 
                    user: dbConfig.user, 
                    password: dbConfig.password, 
                    connectString: dbConfig.connectString
                });
                            
                //result = await connection.batchInsert(  
                result = await connection3.executeMany(  
                     queryString
                    ,bindsArr
                    ,optionsObj
                );                        

                console.log( result.rowsAffected )          

                // 
                if ( result.rowsAffected > 0 ) {   // If result there is ( !!! check result consist and find success result )
                    
                    //let id_company = await connection.execute("SELECT max(id) from regpc.pc_attributes");    // Здесь нужно возвращать значение ID с помощью BIND_OUT еще при вызове execute, тогда будет корректно 
                    console.dir(result)
                    
                    // result.id_company = id_company.rows[0][0];
                    console.dir(result)
                    
                    response.send(result);
                };

            } catch (err) {
                console.error(err);
                response.send(err);
            
            } finally {
                if (connection3) {
                    try {
                await connection3.close();
                    } catch (err) {
                console.error(err);
                    }
                }
            }

        } else {   
            response.send('Request not processed');    
        };        

    // Удалить компанию
    } else if ( request.level1 == 'regpc'   && argsCount == 1 && params.del === '1' && (typeof params.id == "number")  ){   
        
        // Delete 
        queryString = `DELETE FROM ${ SCHEMA_SOVA}.${TABLE_ATTR} WHERE ID=${params.id}`

        if (queryString != '') {
                
            try {

                connection3 = await oracledb.getConnection(
                { 
                    user: dbConfig.user, 
                    password: dbConfig.password, 
                    connectString: dbConfig.connectString
                });
                            
                //result = await connection.batchInsert(  
                result = await connection3.executeMany(  
                     queryString
                );
                
                console.log( 'Удалены: ' + result.rowsAffected )          

                // 
                if ( result.rowsAffected > 0 ) {   // If result there is ( !!! check result consist and find success result )
                    
                    //let id_company = await connection.execute("SELECT max(id) from regpc.pc_attributes");    // Здесь нужно возвращать значение ID с помощью BIND_OUT еще при вызове execute, тогда будет корректно 
                    console.dir(result)
                    // result.id_company = id_company.rows[0][0];
                    console.dir(result)
                  
                    response.send(result);
                };

            } catch (err) {
                console.error(err);
                response.send(err);
            
            } finally {
                if (connection3) {
                    try {
                await connection3.close();
                    } catch (err) {
                console.error(err);
                    }
                }
            }

        } else {   
            response.send('Request not processed');    
        };        

    // trouble-signal
    } else if ( request.level1 == 'sova' && request.level2 == 'post' && argsCount == 2 && params.service == 'trouble-signal' && params.v  ){        
        
        multiInsert = false

        // Костыль для обработки криво получаемого объекта
        console.log("request.body по ключам");


        let objInput = request.body;
        
        console.log("objInput:");
        console.dir(objInput);

        bindsObj = await bindObjMaker(objInput, { ip: ip }, "trouble_signal")
        
        console.log("bindsObj:")
        console.dir ( bindsObj );

        v = params.v.split('.')

        switch (v[0]) {
            case '0':
                console.log('case 0')
                console.dir(objInput)      
  
                response.send(JSON.stringify(objInput))
                break;
            case '1':
                queryString = `INSERT INTO ${ SCHEMA_SOVA}.TROUBLE_SIGNAL (
                                    USERNAME,
                                    DEPARTMENT,
                                    ID_COMPANY,
                                    STATE,
                                    TYPE_OF_TROUBLE,
                                    DESCRIPTION,
                                    AUTHOR_IP,
                                    DATE_ADD,
                                    NUM_REPORT,
                                    DEVIATION
                    )

                    VALUES ( :usn, :depa, :idc, :stat, :totr, :descr, :auth, SYSTIMESTAMP, :numr, :devi )`;
                                            

                    optionsObj = {
                        
                        autoCommit: true,
                        bindDefs: {            
                        }                          

                    }

                     
                    //
                // If the request has matured
                if (queryString != '') {
                    
                        try {

                            connection = await oracledb.getConnection(
                            { 
                                user: dbConfig.user, 
                                password: dbConfig.password, 
                                connectString: dbConfig.connectString
                            });
                            
                            result = await connection.execute(
                                queryString
                                ,bindsObj
                                ,optionsObj
                            ); 
                            
                            console.log( result.rowsAffected )          

                            // 
                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )

                                response.send(result);
                                
                            };
                    
                        } catch (err) {
                            console.error(err);
                            response.send(err);
                        
                        } finally {
                            if (connection) {
                                try {
                            await connection.close();
                                } catch (err) {
                            console.error(err);
                                }
                            }
                    
                        }

                    } else {   

                        response.send('Request not processed');        

                    };

                    break;  

                    case '2':
                            console.log('case 2')
                            // /api/sova/get?service=COMPANIES_data&v=1.0
                            queryString = `INSERT INTO ${ SCHEMA_SOVA}.TROUBLE_SIGNAL (
                                                USERNAME,
                                                DEPARTMENT,
                                                ID_COMPANY,
                                                STATE,
                                                TYPE_OF_TROUBLE,
                                                DESCRIPTION,
                                                AUTHOR_IP,
                                                DATE_ADD,
                                                NUM_REPORT,
                                                DEVIATION
                                )
            
                                VALUES ( :usn, :depa, :idc, :stat, :totr, :descr, :auth, SYSTIMESTAMP, :numr, :devi )`;
                                                        
            
                                optionsObj = {
                                    
                                    autoCommit: true,
                                    bindDefs: {    
            
                                             usn:    { type: oracledb.STRING , maxSize: 1000*2 }  //username
                                            ,depa:   { type: oracledb.STRING , maxSize: 1000*2 }  //department                    
                                            ,idc:    { type: oracledb.NUMBER }                  //id_company 
                                            ,stat:   { type: oracledb.STRING , maxSize: 128*2  }  //state     
                                            ,totr:   { type: oracledb.STRING , maxSize: 128*2  }  //type_of_trouble                    
                                            ,descr:  { type: oracledb.STRING , maxSize: 4000*2 }  //description
            
                                            ,auth:  { type: oracledb.STRING , maxSize: 32*2 }    // AUTHOR_ADD
                                            //,dadd:  { type: oracledb.STRING , maxSize: 32*2 }    // DATE_ADD
            
                                            ,numr:  { type: oracledb.STRING , maxSize: 256*2 }    // NUM_REPORT
            
                                            ,devi:  { type: oracledb.NUMBER }    // DEVIATION
                        
                                    }                          
            
                                }
            
                                 
                                //
                            // If the request has matured
                            if (queryString != '') {
                                
                                    try {
            
                                        connection = await oracledb.getConnection(
                                        { 
                                            user: dbConfig.user, 
                                            password: dbConfig.password, 
                                            connectString: dbConfig.connectString
                                        });
                                        
                                        result = await connection.execute(
                                            queryString
                                            ,bindsObj
                                            ,optionsObj
                                        ); 
                                        
                                        console.log( result.rowsAffected )          
            
                                        // 
                                        if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
            
                                            response.send(result);
                                            
                                        };
                                
                                    } catch (err) {
                                        console.error(err);
                                        response.send(err);
                                    
                                    } finally {
                                        if (connection) {
                                            try {
                                        await connection.close();
                                            } catch (err) {
                                        console.error(err);
                                            }
                                        }
                                
                                    }
            
                                } else {   
            
                                    response.send('Request not processed');        
            
                                };
            
                                break; 

        default:
            response.send('Request not processed');      

      }

    } else if ( request.level1 == 'baudit'  && request.level2 == 'post' && argsCount == 2 && params.service == 'add-new-row'  && params.v  ){        
        
        let objInput = request.body;
        
        console.log("objInput:");
        console.dir(objInput);        

        v = params.v.split('.')

        switch (v[0]) {
            case '0':
                console.log('case 0')
                console.dir(objInput)     

                if(v[1] === '1') response.send( JSON.stringify(objInput) )
                if(v[1] === '2') response.json( objInput )

                break;

            case '1':
                if( !Object.keys(objInput).length ) {                      
                    
                    errorRequest = Object.assign( errorEmptyRequestTemplate,
                                                  { 
                                                    url : request.originalUrl,  
                                                    methods: request.route.methods,
                                                    requestBody : request.body
                                                  }
                                                ) 
                                             
                    response.json(errorRequest);  
                    return errorRequest
                } 
                bindsObj = await bindObjMaker(objInput, { ip: ip }, "baudit-add-new-row-budget")
                console.dir(bindsObj)
                // /api/baudit/post?service=add-new-row&v=1.0
                if(1){

                    queryString = `INSERT INTO baudit.BUDGET (
                                    ${ (()=> {
                                        switch ( objInput.type ) {
                                            case 'living':
                                                return `ID_LIV,`
                                            case 'commercial':
                                                return `ID_COM,`            
                                            default:
                                                return ``
                                                break;
                                        }
                                    })() }

                        BUILDER_COMPANY,
                        ID_REGION,
                        DATE_BUDG,
                        DATE_USE,
                        BUDG_RENT,
                        BUDG_PIR,
                        BUDG_PREPAR_CONSTR_AREA,
                        BUDG_SMR_ZERO_CIRCLE,
                        BUDG_SMR_BUILD,
                        BUDG_FACADE,
                        BUDG_ROOF,
                        BUDG_INT_FIN_WORK,
                        BUDG_HEATING,
                        BUDG_VENTILATION,
                        BUDG_PLUMBING,
                        BUDG_SEWERAGE,
                        BUDG_ELEC_LIGHTING,
                        BUDG_GAS,
                        BUDG_FURNITURE_INVEN,
                        BUDG_TECHN_EQUIP,
                        BUDG_WATER_OUT,
                        BUDG_VEN_OUT,
                        BUDG_ELEC_SUPPLY_OUT,
                        BUDG_GAS_OUT,
                        BUDG_TELEPHONE_OUT,
                        BUDG_WATER_EXT,
                        BUDG_SEWERAGE_EXT,
                        BUDG_ELEC_EXT,
                        BUDG_HEAT_EXT,
                        BUDG_COST_OF_CUSTOMER,
                        BUDG_BUILD_CONTROL,
                        BUDG_TEMP_BUILDINGS,
                        BUDG_OTHER_COSTS,
                        BUDG_UNEXP_COSTS,
                        BUDG_RENT_CURVAL,
                        BUDG_PIR_CURVAL,
                        BUDG_PREPAR_CONSTR_AREA_CURVAL,
                        BUDG_SMR_ZERO_CIRCLE_CURVAL,
                        BUDG_SMR_BUILD_CURVAL,
                        BUDG_FACADE_CURVAL,
                        BUDG_ROOF_CURVAL,
                        BUDG_INT_FIN_WORK_CURVAL,
                        BUDG_HEATING_CURVAL,
                        BUDG_VENTILATION_CURVAL,
                        BUDG_PLUMBING_CURVAL,
                        BUDG_SEWERAGE_CURVAL,
                        BUDG_ELEC_LIGHTING_CURVAL,
                        BUDG_GAS_CURVAL,
                        BUDG_FURNITURE_INVEN_CURVAL,
                        BUDG_TECHN_EQUIP_CURVAL,
                        BUDG_WATER_OUT_CURVAL,
                        BUDG_VEN_OUT_CURVAL,
                        BUDG_ELEC_SUPPLY_OUT_CURVAL,
                        BUDG_GAS_OUT_CURVAL,
                        BUDG_TELEPHONE_OUT_CURVAL,
                        BUDG_WATER_EXT_CURVAL,
                        BUDG_SEWERAGE_EXT_CURVAL,
                        BUDG_ELEC_EXT_CURVAL,
                        BUDG_HEAT_EXT_CURVAL,
                        BUDG_COST_OF_CUSTOMER_CURVAL,
                        BUDG_BUILD_CONTROL_CURVAL,
                        BUDG_TEMP_BUILDINGS_CURVAL,

                        ID_TYPE_REALTY,

                        DOCUMENTS,

                        AUTHOR_IP,
                        DATE_ADD
                        )
                        
                        VALUES (:id_returned,
                                :builder_company,
                                :id_region,
                                to_timestamp( :date_budg, ${ISO8601_template}),
                                to_timestamp( :date_use,  ${ISO8601_template}),
                                :budg_rent,
                                :budg_pir,
                                :budg_prepar_constr_area,
                                :budg_smr_zero_circle,
                                :budg_smr_build,
                                :budg_facade,
                                :budg_roof,
                                :budg_int_fin_work,
                                :budg_heating,
                                :budg_ventilation,
                                :budg_plumbing,
                                :budg_sewerage,
                                :budg_elec_lighting,
                                :budg_gas,
                                :budg_furniture_inven,
                                :budg_techn_equip,
                                :budg_water_out,
                                :budg_ven_out,
                                :budg_elec_supply_out,
                                :budg_gas_out,
                                :budg_telephone_out,
                                :budg_water_ext,
                                :budg_sewerage_ext,
                                :budg_elec_ext,
                                :budg_heat_ext,
                                :budg_cost_of_customer,
                                :budg_build_control,
                                :budg_temp_buildings,
                                :budg_other_costs,
                                :budg_unexp_costs,

                                :budg_rent_curval,
                                :budg_pir_curval,
                                :budg_prepar_constr_area_curval,
                                :budg_smr_zero_circle_curval,
                                :budg_smr_build_curval,
                                :budg_facade_curval,
                                :budg_roof_curval,
                                :budg_int_fin_work_curval,
                                :budg_heating_curval,
                                :budg_ventilation_curval,
                                :budg_plumbing_curval,
                                :budg_sewerage_curval,
                                :budg_elec_lighting_curval,
                                :budg_gas_curval,
                                :budg_furniture_inven_curval,
                                :budg_techn_equip_curval,
                                :budg_water_out_curval,
                                :budg_ven_out_curval,
                                :budg_elec_supply_out_curval,
                                :budg_gas_out_curval,
                                :budg_telephone_out_curval,
                                :budg_water_ext_curval,
                                :budg_sewerage_ext_curval,
                                :budg_elec_ext_curval,
                                :budg_heat_ext_curval,
                                :budg_cost_of_customer_curval,
                                :budg_build_control_curval,
                                :budg_temp_buildings_curval,
                                
                                :id_type_realty,

                                :documents,

                                :author_ip,
                                to_timestamp( :date_add, ${ISO8601_template})                    
                        )
                    
                    RETURNING "ID" INTO :id `;    // RETURNING seq.nextval

                }

                //console.log( queryString)
                optionsObj = { autoCommit: true }                 


                // If the request has matured
                if (queryString != '') {
                    
                        try {

                            connection = await oracledb.getConnection(
                            { 
                                user: dbConfig.user, 
                                password: dbConfig.password, 
                                connectString: dbConfig.connectString
                            });
                            
                            result = await connection.execute(
                                queryString
                                ,bindsObj                               
                                ,optionsObj
                            ); 
                            
                            console.log( result.rowsAffected )          

                            // 
                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )

                                response.json(result);
                                
                            };
                    
                        } catch (err) {
                            console.error(err);

                            response.json( Object.assign( errorWrongDataTemplate, { "comment": err.message } ));

                        } finally {
                            if (connection) {
                                try {
                            await connection.close();
                                } catch (err) {
                            console.error(err);
                                }
                            }

                        }

                    } else {   

                        response.send('Request not processed');        

                    };

                    break;  

                case '2':
                if( !Object.keys(objInput).length ) {                      
                    
                    errorRequest = Object.assign( errorEmptyRequestTemplate,
                                                  { 
                                                    url : request.originalUrl,  
                                                    methods: request.route.methods,
                                                    requestBody : request.body
                                                  }
                                                ) 
                                               
                    response.json(errorRequest);  
                    return errorRequest
                } 

                if ( objInput.type === 'living'){

                        bindsObj = await bindObjMaker( objInput, { ip: ip }, "baudit-add-new-row-living" )
                        /* console.dir(bindsObj) */
                        // /api/baudit/post?service=add-new-row&v=1.0
                        if(1){

                            queryString = `INSERT INTO baudit.LIVING (
                                            TOTAL_AREA,
                                            TOT_FLAT_AREA,
                                            AREA_APART,
                                            NUM_PARKING,
                                            UNDERGR_PARKING_EXIST,
                                            UNDERGR_PARKING_EXPL,
                                            NUM_FLOORS,
                                            BUILD_VOL,
                                            ID_BEARING_CONSTR,
                                            ID_FENCE_STRUCT,
                                            ID_CLASS_QUAL_LIV,
                                            ID_ELEVATOR,
                                            CONDITION,
                                            ID_STATUS
                                )
                                
                                VALUES (
                                    :total_area,
                                    :tot_flat_area,
                                    :area_apart,
                                    :num_parking,
                                    :undergr_parking_exist,
                                    :undergr_parking_expl,
                                    :num_floors,
                                    :build_vol,
                                    :id_bearing_constr,
                                    :id_fence_struct,
                                    :id_class_qual_liv,
                                    :id_elevator,
                                    :condition,
                                    :id_status                   
                                )
                            
                            RETURNING "ID" INTO :id_returning `;    // 

                        }

                        //console.log( queryString)
                        optionsObj = { autoCommit: true }    

                    } else if ( objInput.type === 'commercial'){
                           
                        bindsObj = await bindObjMaker( objInput, { ip: ip }, "baudit-add-new-row-commercial" )
                        /* console.dir(bindsObj) */
                        // /api/baudit/post?service=add-new-row&v=1.0
                        if(1){

                            queryString = `INSERT INTO baudit.COMERCIAL (
                                    TOTAL_AREA,
                                    BUILD_VOL,
                                    ENG_EQUIP_EXIST,
                                    UNDERGR_EXIST,
                                    ENG_EQUIP_EXPL,
                                    UNDERGR_EXPL,
                                    NUM_FLOORS,
                                    ID_VIDEO_SURV,
                                    ID_BEARING_CONSTR,
                                    ID_FENCE_STRUCT,
                                    ID_CLASS_QUAL_COM,
                                    ID_TYPE_BUILD,
                                    ID_INDUSTRY,
                                    ID_SUBINDUSTRY,
                                    ID_ROOF,
                                    ID_WIN_GATE,
                                    ID_ELEVATOR,
                                    ID_PROJ_SOL,
                                    CONDITION,
                                    ID_STATUS,
                                    ID_TYPE_STOCK
                                )
                                
                                VALUES (
                                    :total_area,
                                    :build_vol,
                                    :eng_equip_exist,
                                    :undergr_exist,
                                    :eng_equip_expl,
                                    :undergr_expl,
                                    :num_floors,
                                    :id_video_surv,
                                    :id_bearing_constr,
                                    :id_fence_struct,
                                    :id_class_qual_com,
                                    :id_type_build,
                                    :id_industry,
                                    :id_subindustry,
                                    :id_roof,
                                    :id_win_gate,
                                    :id_elevator,
                                    :id_proj_sol,
                                    :condition,
                                    :id_status,
                                    :id_type_stock
                                )
                            
                            RETURNING "ID" INTO :id_returning `;    // 

                        }

                        //console.log( queryString)
                        optionsObj = { autoCommit: true }   
                                                
                    }

                // If the request has matured
                if (queryString != '') {
                    
                        try {

                            connection = await oracledb.getConnection(
                            { 
                                user: dbConfig.user, 
                                password: dbConfig.password, 
                                connectString: dbConfig.connectString
                            });
                            
                            console.log( '---=' )
                            /* console.log( queryString )
                            console.dir( bindsObj )
                            console.dir( optionsObj ) */

                            result = await connection.execute(
                                queryString
                                ,bindsObj                               
                                ,optionsObj
                            );      

                            // 
                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )

                                let id = result.outBinds.id_returning

                                //bindObjMaker.id = parseInt(id);

                                // Продолжаем

                                bindsObj = await bindObjMaker(objInput, { ip: ip, id: parseInt(id) }, "baudit-add-new-row-budget")
                                /* console.dir(bindsObj) */
                                // /api/baudit/post?service=add-new-row&v=1.0
                                if(1){
                
                                    queryString = `INSERT INTO baudit.BUDGET (
                                                    ${ (()=> {
                                                        switch ( objInput.type ) {
                                                            case 'living':
                                                                return `ID_LIV,`
                                                            case 'commercial':
                                                                return `ID_COM,`            
                                                            default:
                                                                return ``
                                                                break;
                                                        }
                                                    })() }
                
                                        BUILDER_COMPANY,
                                        ID_REGION,
                                        DATE_BUDG,
                                        DATE_USE,
                                        BUDG_RENT,
                                        BUDG_PIR,
                                        BUDG_PREPAR_CONSTR_AREA,
                                        BUDG_SMR_ZERO_CIRCLE,
                                        BUDG_SMR_BUILD,
                                        BUDG_FACADE,
                                        BUDG_ROOF,
                                        BUDG_INT_FIN_WORK,
                                        BUDG_HEATING,
                                        BUDG_VENTILATION,
                                        BUDG_PLUMBING,
                                        BUDG_SEWERAGE,
                                        BUDG_ELEC_LIGHTING,
                                        BUDG_GAS,
                                        BUDG_FURNITURE_INVEN,
                                        BUDG_TECHN_EQUIP,
                                        BUDG_COMMUNICATION_NET,
                                        BUDG_WATER_OUT,
                                        BUDG_VEN_OUT,
                                        BUDG_ELEC_SUPPLY_OUT,
                                        BUDG_GAS_OUT,
                                        BUDG_TELEPHONE_OUT,
                                        BUDG_WATER_EXT,
                                        BUDG_SEWERAGE_EXT,
                                        BUDG_ELEC_EXT,
                                        BUDG_HEAT_EXT,
                                        BUDG_COST_OF_CUSTOMER,
                                        BUDG_BUILD_CONTROL,
                                        BUDG_TEMP_BUILDINGS,
                                        BUDG_OTHER_COSTS,
                                        BUDG_UNEXP_COSTS,
                                        BUDG_RENT_CURVAL,
                                        BUDG_PIR_CURVAL,
                                        BUDG_PREPAR_CONSTR_AREA_CURVAL,
                                        BUDG_SMR_ZERO_CIRCLE_CURVAL,
                                        BUDG_SMR_BUILD_CURVAL,
                                        BUDG_FACADE_CURVAL,
                                        BUDG_ROOF_CURVAL,
                                        BUDG_INT_FIN_WORK_CURVAL,
                                        BUDG_HEATING_CURVAL,
                                        BUDG_VENTILATION_CURVAL,
                                        BUDG_PLUMBING_CURVAL,
                                        BUDG_SEWERAGE_CURVAL,
                                        BUDG_ELEC_LIGHTING_CURVAL,
                                        BUDG_GAS_CURVAL,
                                        BUDG_FURNITURE_INVEN_CURVAL,
                                        BUDG_TECHN_EQUIP_CURVAL,
                                        BUDG_WATER_OUT_CURVAL,
                                        BUDG_VEN_OUT_CURVAL,
                                        BUDG_ELEC_SUPPLY_OUT_CURVAL,
                                        BUDG_GAS_OUT_CURVAL,
                                        BUDG_TELEPHONE_OUT_CURVAL,
                                        BUDG_WATER_EXT_CURVAL,
                                        BUDG_SEWERAGE_EXT_CURVAL,
                                        BUDG_ELEC_EXT_CURVAL,
                                        BUDG_HEAT_EXT_CURVAL,
                                        BUDG_COST_OF_CUSTOMER_CURVAL,
                                        BUDG_BUILD_CONTROL_CURVAL,
                                        BUDG_TEMP_BUILDINGS_CURVAL,

                                        OBJECTS_AUXILIARY,
                                        BUDG_ACCOMPLISHMENT,                                        
                
                                        ID_TYPE_REALTY,

                                        DOCUMENTS,
                
                                        AUTHOR_IP,
                                        DATE_ADD
                                        )
                                        
                                        VALUES (:id_returned,
                                                :builder_company,
                                                :id_region,
                                                to_timestamp( :date_budg, ${ISO8601_template}),
                                                to_timestamp( :date_use,  ${ISO8601_template}),
                                                :budg_rent,
                                                :budg_pir,
                                                :budg_prepar_constr_area,
                                                :budg_smr_zero_circle,
                                                :budg_smr_build,
                                                :budg_facade,
                                                :budg_roof,
                                                :budg_int_fin_work,
                                                :budg_heating,
                                                :budg_ventilation,
                                                :budg_plumbing,
                                                :budg_sewerage,
                                                :budg_elec_lighting,
                                                :budg_gas,
                                                :budg_furniture_inven,
                                                :budg_techn_equip,
                                                :budg_communication_net,
                                                :budg_water_out,
                                                :budg_ven_out,
                                                :budg_elec_supply_out,
                                                :budg_gas_out,
                                                :budg_telephone_out,
                                                :budg_water_ext,
                                                :budg_sewerage_ext,
                                                :budg_elec_ext,
                                                :budg_heat_ext,
                                                :budg_cost_of_customer,
                                                :budg_build_control,
                                                :budg_temp_buildings,
                                                :budg_other_costs,
                                                :budg_unexp_costs,
                
                                                :budg_rent_curval,
                                                :budg_pir_curval,
                                                :budg_prepar_constr_area_curval,
                                                :budg_smr_zero_circle_curval,
                                                :budg_smr_build_curval,
                                                :budg_facade_curval,
                                                :budg_roof_curval,
                                                :budg_int_fin_work_curval,
                                                :budg_heating_curval,
                                                :budg_ventilation_curval,
                                                :budg_plumbing_curval,
                                                :budg_sewerage_curval,
                                                :budg_elec_lighting_curval,
                                                :budg_gas_curval,
                                                :budg_furniture_inven_curval,
                                                :budg_techn_equip_curval,
                                                :budg_water_out_curval,
                                                :budg_ven_out_curval,
                                                :budg_elec_supply_out_curval,
                                                :budg_gas_out_curval,
                                                :budg_telephone_out_curval,
                                                :budg_water_ext_curval,
                                                :budg_sewerage_ext_curval,
                                                :budg_elec_ext_curval,
                                                :budg_heat_ext_curval,
                                                :budg_cost_of_customer_curval,
                                                :budg_build_control_curval,
                                                :budg_temp_buildings_curval,

                                                :objects_auxiliary,   
                                                :budg_accomplishment,  
                                                
                                                :id_type_realty,

                                                :documents,                                                
                
                                                :author_ip,
                                                to_timestamp( :date_add, ${ISO8601_template})                    
                                        )
                                    
                                    RETURNING "ID" INTO :id `;    // RETURNING seq.nextval
                
                                }
                
                                //console.log( queryString)
                                optionsObj = { autoCommit: true }                 
                
                
                                // If the request has matured
                                if (queryString != '') {
                                    
                                        try {
                
                                            connection = await oracledb.getConnection(
                                            { 
                                                user: dbConfig.user, 
                                                password: dbConfig.password, 
                                                connectString: dbConfig.connectString
                                            });
                                            
                                            result = await connection.execute(
                                                queryString
                                                ,bindsObj                               
                                                ,optionsObj
                                            ); 

                                            /* console.log( 'ok2' )   
                                            console.dir( result )   
                                            
                                            console.log( result.rowsAffected ) */          
                
                                            // 
                                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
                                                //

                                                response.json(result);
                                                
                                            };
                                    
                                        } catch (err) {
                                            //console.error(err);
                                            //console.dir( err.message );
                                            // console.dir( Object.assign(errorWrongDataTemplate, { "comment": err.message } ) );

                                            response.json( Object.assign( errorWrongDataTemplate, { "comment": err.message } ));
                
                                        } finally {
                                            if (connection) {
                                                try {
                                            await connection.close();
                                                } catch (err) {
                                            console.error(err);
                                                }
                                            }
                
                                        }
                
                                    } else {   
                
                                        response.send('Request not processed');        
                
                                    };
                                
                            };
                    
                        } catch (err) {
                            //console.error(err);
                            //console.dir( err.message );
                             console.dir( Object.assign(errorWrongDataTemplate, { "comment": err.message } ) );
                            response.json( Object.assign( errorWrongDataTemplate, { "comment": err.message } ));

                        } finally {
                            if (connection) {
                                try {
                            await connection.close();
                                } catch (err) {
                            console.error(err);
                                }
                            }

                        }

                    } else {   

                        response.send('Request not processed');        

                    };
    
                        break;                      
        default:
            response.send('Request not processed');      

      }

    } else if ( request.level1 == 'baudit'  && request.level2 == 'post' && argsCount == 2 && params.service == 'action' && params.v ) {

        let objInput = request.body;
        
        console.log("objInput:");
        console.dir(objInput);        

        v = params.v.split('.')

        switch (v[0]) {
            case '0':
                 response.json( objInput )
                break;

            case '1':

                switch (v[1]) {
                    case '0':

                        if( !Object.keys(objInput).length ) {                      
                            
                            errorRequest = Object.assign( errorEmptyRequestTemplate,
                                                        { 
                                                            url : request.originalUrl,  
                                                            methods: request.route.methods,
                                                            requestBody : request.body
                                                        }
                                                        ) 
                                                    
                            response.json(errorRequest);  
                            return errorRequest
                        } 

                        bindsObj = await bindObjMaker(objInput, { ip: ip }, "baudit-action")
                        console.dir(bindsObj)
                        // /api/baudit/post?service=add-new-row&v=1.0
                        if(1){

                            queryString = `UPDATE BAUDIT.BUDGET SET
                            APPROVER_1  = (CASE WHEN APPROVER_1  IS NULL THEN (Select id from BAUDIT.USERS where username = :username)  ELSE APPROVER_1  END),
                            TS_ACTION_1 = (CASE WHEN TS_ACTION_1 IS NULL THEN SYSTIMESTAMP     ELSE TS_ACTION_1 END),
                            STATUS_1    = (CASE WHEN STATUS_1    IS NULL THEN :id_action    ELSE STATUS_1    END),
                            --
                            APPROVER_2  = (CASE WHEN APPROVER_1  IS NOT NULL THEN (Select id from BAUDIT.USERS where username = :username)  ELSE APPROVER_2  END),
                            TS_ACTION_2 = (CASE WHEN TS_ACTION_1 IS NOT NULL THEN SYSTIMESTAMP  ELSE TS_ACTION_2 END),
                            STATUS_2    = (CASE WHEN STATUS_1    IS NOT NULL THEN :id_action    ELSE STATUS_2    END)
                        
                            WHERE ID = :id_row`;    // RETURNING seq.nextval

                        }

                        console.log( queryString)
                        optionsObj = { autoCommit: true }                 


                        // If the request has matured
                        if (queryString != '') {
                            
                                try {

                                    connection = await oracledb.getConnection(
                                    { 
                                        user: dbConfig.user, 
                                        password: dbConfig.password, 
                                        connectString: dbConfig.connectString
                                    });
                                    
                                    result = await connection.execute(
                                        queryString
                                        ,bindsObj                               
                                        ,optionsObj
                                    ); 
                                    
                                    console.log( result.rowsAffected )          

                                    // 
                                    if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )

                                        response.json(result);
                                        
                                    };
                            
                                } catch (err) {
                                    console.error(err);

                                    response.json( Object.assign( errorWrongDataTemplate, { "comment": err.message } ));

                                } finally {
                                    if (connection) {
                                        try {
                                    await connection.close();
                                        } catch (err) {
                                    console.error(err);
                                        }
                                    }

                                }

                            } else {   

                                response.send('Request not processed');        

                            };

                        break; 

                    case '1':

                                if( !Object.keys(objInput).length ) {                      
                                    
                                    errorRequest = Object.assign( errorEmptyRequestTemplate,
                                                                { 
                                                                    url : request.originalUrl,  
                                                                    methods: request.route.methods,
                                                                    requestBody : request.body
                                                                }
                                                                ) 
                                                            
                                    response.json(errorRequest);  
                                    return errorRequest
                                } 
        
        
                                bindsObj = await bindObjMaker(objInput, { ip: ip }, "baudit-action")
                                console.dir(bindsObj)
                                // /api/baudit/post?service=add-new-row&v=1.0
                                if(1){
        
                                    queryString = `UPDATE BAUDIT.BUDGET SET
                                    APPROVER_1        = (CASE WHEN APPROVER_1       IS NULL THEN ( Select id from BAUDIT.USERS where username = :username )  ELSE APPROVER_1  END),
                                    TS_ACTION_1       = (CASE WHEN TS_ACTION_1      IS NULL THEN SYSTIMESTAMP ELSE TS_ACTION_1      END),
                                    STATUS_1          = (CASE WHEN STATUS_1         IS NULL THEN :id_action      ELSE STATUS_1         END),
                                    STATUS_COMMENT_1  = (CASE WHEN STATUS_COMMENT_1 IS NULL THEN :status_comment ELSE STATUS_COMMENT_1 END),
                                    --
                                    APPROVER_2        = (CASE WHEN APPROVER_1  IS NOT NULL THEN ( Select id from BAUDIT.USERS where username = :username )  ELSE APPROVER_2  END),
                                    TS_ACTION_2       = (CASE WHEN TS_ACTION_1 IS NOT NULL THEN SYSTIMESTAMP  ELSE TS_ACTION_2 END),
                                    STATUS_2          = (CASE WHEN STATUS_1    IS NOT NULL THEN :id_action    ELSE STATUS_2    END),
                                    STATUS_COMMENT_2  = (CASE WHEN STATUS_COMMENT_2 IS NULL THEN :status_comment ELSE STATUS_COMMENT_2 END)
                                
                                    WHERE ID = :id_row`;    // RETURNING seq.nextval
        
                                }
        
                                console.log( queryString)
                                optionsObj = { autoCommit: true }                 
        
        
                                // If the request has matured
                                if (queryString != '') {
                                    
                                        try {
        
                                            connection = await oracledb.getConnection(
                                            { 
                                                user: dbConfig.user, 
                                                password: dbConfig.password, 
                                                connectString: dbConfig.connectString
                                            });
                                            
                                            result = await connection.execute(
                                                queryString
                                                ,bindsObj                               
                                                ,optionsObj
                                            ); 
                                            
                                            console.log( result.rowsAffected )          
        
                                            // 
                                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
        
                                                response.json(result);
                                                
                                            };
                                    
                                        } catch (err) {
                                            console.error(err);
        
                                            response.json( Object.assign( errorWrongDataTemplate, { "comment": err.message } ));
        
                                        } finally {
                                            if (connection) {
                                                try {
                                            await connection.close();
                                                } catch (err) {
                                            console.error(err);
                                                }
                                            }
        
                                        }
        
                                    } else {   
        
                                        response.send('Request not processed');        
        
                                    };
        
                                break; 

                        case '2':

                                        if( !Object.keys(objInput).length ) {                      
                                            
                                            errorRequest = Object.assign( errorEmptyRequestTemplate,
                                                                        { 
                                                                            url : request.originalUrl,  
                                                                            methods: request.route.methods,
                                                                            requestBody : request.body
                                                                        }
                                                                        ) 
                                                                    
                                            response.json(errorRequest);  
                                            return errorRequest
                                        } 
                
                
                                        bindsObj = await bindObjMaker(objInput, { ip: ip }, "baudit-action")
                                        console.dir(bindsObj)
                                        // /api/baudit/post?service=add-new-row&v=1.0
                                        if(1){
                
                                            queryString = `UPDATE BAUDIT.BUDGET SET
                                            -- WHEN APPROVER_1 IS NULL
                                            APPROVER_1        = (CASE WHEN APPROVER_1       IS NULL THEN ( Select id from BAUDIT.USERS where username = :username )  ELSE APPROVER_1  END),
                                            TS_ACTION_1       = (CASE WHEN TS_ACTION_1      IS NULL THEN SYSTIMESTAMP ELSE TS_ACTION_1      END),
                                            STATUS_1          = (CASE WHEN STATUS_1         IS NULL THEN :id_action      ELSE STATUS_1         END),
                                            STATUS_COMMENT_1  = (CASE WHEN STATUS_COMMENT_1 IS NULL THEN :status_comment ELSE STATUS_COMMENT_1 END),
                                            --
                                            APPROVER_2        = (CASE WHEN APPROVER_1  IS NOT NULL THEN ( Select id from BAUDIT.USERS where username = :username )  ELSE APPROVER_2  END),
                                            TS_ACTION_2       = (CASE WHEN TS_ACTION_1 IS NOT NULL THEN SYSTIMESTAMP  ELSE TS_ACTION_2 END),
                                            STATUS_2          = (CASE WHEN STATUS_1    IS NOT NULL THEN :id_action    ELSE STATUS_2    END),
                                            STATUS_COMMENT_2  = (CASE WHEN STATUS_COMMENT_2 IS NOT NULL THEN :status_comment ELSE STATUS_COMMENT_2 END)
                                        
                                            WHERE ID = :id_row`;    // RETURNING seq.nextval
                
                                        }
                
                                        console.log( queryString)
                                        optionsObj = { autoCommit: true }                 
                
                
                                        // If the request has matured
                                        if (queryString != '') {
                                            
                                                try {
                
                                                    connection = await oracledb.getConnection(
                                                    { 
                                                        user: dbConfig.user, 
                                                        password: dbConfig.password, 
                                                        connectString: dbConfig.connectString
                                                    });
                                                    
                                                    result = await connection.execute(
                                                        queryString
                                                        ,bindsObj                               
                                                        ,optionsObj
                                                    ); 
                                                    
                                                    console.log( result.rowsAffected )          
                
                                                    // 
                                                    if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
                
                                                        response.json( Object.assign( result, { "response"  : "success" } ));
                                                    } else {
                                                        response.json( Object.assign( errorWrongDataTemplate, { "comment": "No data updated" } ));                                                        
                                                    };
                                            
                                                } catch (err) {
                                                    console.error(err);
                
                                                    response.json( Object.assign( errorWrongDataTemplate, { "comment": err.message } ));
                
                                                } finally {
                                                    if (connection) {
                                                        try {
                                                    await connection.close();
                                                        } catch (err) {
                                                    console.error(err);
                                                        }
                                                    }
                
                                                }
                
                                            } else {   
                
                                                response.send('Request not processed');        
                
                                            };
                
                                        break;        
                                        
                            case '3':

                                                if( !Object.keys(objInput).length ) {                      
                                                    
                                                    errorRequest = Object.assign( errorEmptyRequestTemplate,
                                                                                { 
                                                                                    url : request.originalUrl,  
                                                                                    methods: request.route.methods,
                                                                                    requestBody : request.body
                                                                                }
                                                                                ) 
                                                                            
                                                    response.json(errorRequest);  
                                                    return errorRequest
                                                } 

                                                
                        
                        
                                                bindsObj = await bindObjMaker(objInput, { ip: ip }, "baudit-action")
                                                console.dir(bindsObj)
                                                // /api/baudit/post?service=add-new-row&v=1.0
                                                if(1){
                        
                                                    queryString = ` UPDATE BAUDIT.BUDGET bud SET
                                                    --
                                                    APPROVER_1        = (CASE 
                                                                            WHEN APPROVER_1 IS NULL THEN ( Select id from BAUDIT.USERS where username = :username )    -- Если еще никто ничего не делал - пишем
                                                                            WHEN :username = ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_1 FROM BAUDIT.BUDGET WHERE id = :id_row ) ) THEN APPROVER_1  -- Если тот же  - оставляем
                                                                            ELSE APPROVER_1  
                                                                         END),
                                                    TS_ACTION_1       = (CASE 
                                                                            WHEN APPROVER_1 IS NULL THEN SYSTIMESTAMP  
                                                                            WHEN :username = ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_1 FROM BAUDIT.BUDGET WHERE id = :id_row ) ) 
                                                                                AND NVL(STATUS_1, 0 ) <> 230 AND NVL(STATUS_2, 0 ) <> 230 THEN SYSTIMESTAMP    -- Не архив
                                                                            ELSE TS_ACTION_1      
                                                                         END),
                                                    STATUS_1          = (CASE 
                                                                            WHEN APPROVER_1 IS NULL THEN :id_action      
                                                                            WHEN :username = ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_1 FROM BAUDIT.BUDGET WHERE id = :id_row ) ) 
                                                                                AND NVL(STATUS_1, 0 ) <> 230 AND NVL(STATUS_2, 0 ) <> 230 THEN :id_action
                                                                            ELSE STATUS_1         
                                                                         END),
                                                    STATUS_COMMENT_1  = (CASE 
                                                                            WHEN APPROVER_1 IS NULL THEN :status_comment 
                                                                            WHEN :username = ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_1 FROM BAUDIT.BUDGET WHERE id = :id_row ) ) 
                                                                                AND NVL(STATUS_1, 0 ) <> 230 AND NVL(STATUS_2, 0 ) <> 230 THEN :status_comment
                                                                            ELSE STATUS_COMMENT_1 
                                                                         END),
                                                    --
                                                    -- Второе поле    
                                                    --                                         
                                                    APPROVER_2        = (CASE 
                                                                            WHEN APPROVER_2 IS NULL AND NVL(STATUS_1, 0 ) <> 230 
                                                                                AND :username <> ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_1 FROM BAUDIT.BUDGET WHERE id = :id_row ) )
                                                                                THEN ( SELECT ID FROM BAUDIT.USERS WHERE username = :username )  -- Записываем если не в архиве и его нет в первом
                                                                            
                                                                            WHEN  ( SELECT id_role FROM BAUDIT.USERS WHERE username = :username ) = 1 AND :id_action = 230
                                                                                THEN ( SELECT ID FROM BAUDIT.USERS WHERE username = :username )  -- Если админ пытается перевести в архив - пишем
                                                                            WHEN :username = ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_2 FROM BAUDIT.BUDGET WHERE id = :id_row ) ) THEN APPROVER_2  -- Если тот же  - оставляем
                                                                            ELSE APPROVER_2  
                                                                        END),
                                                    TS_ACTION_2       = (CASE 
                                                                            WHEN APPROVER_2 IS NULL AND NVL(STATUS_1, 0 ) <> 230 
                                                                                AND :username <> ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_1 FROM BAUDIT.BUDGET WHERE id = :id_row ) )
                                                                                THEN SYSTIMESTAMP  
                                                                            WHEN :username = ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_2 FROM BAUDIT.BUDGET WHERE id = :id_row ) ) 
                                                                            AND NVL(STATUS_1, 0 ) <> 230 AND NVL(STATUS_2, 0 ) <> 230 THEN SYSTIMESTAMP    -- Не архив 
                                                                            WHEN  ( SELECT id_role FROM BAUDIT.USERS WHERE username = :username ) = 1 AND :id_action = 230
                                                                                THEN SYSTIMESTAMP  -- Если админ пытается перевести в архив - пишем                                      
                                                                            ELSE TS_ACTION_2 
                                                                        END),
                                                    STATUS_2          = (CASE 
                                                                            WHEN APPROVER_2 IS NULL AND NVL(STATUS_1, 0 ) <> 230 
                                                                                AND :username <> ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_1 FROM BAUDIT.BUDGET WHERE id = :id_row ) )
                                                                                THEN :id_action    
                                                                            WHEN :username = ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_2 FROM BAUDIT.BUDGET WHERE id = :id_row ) ) 
                                                                                AND NVL(STATUS_1, 0 ) <> 230 AND NVL(STATUS_2, 0 ) <> 230  THEN :id_action   
                                                                            WHEN  ( SELECT id_role FROM BAUDIT.USERS WHERE username = :username ) = 1 AND :id_action = 230
                                                                                THEN :id_action  -- Если админ пытается перевести в архив - пишем                                             
                                                                            ELSE STATUS_2    
                                                                        END),
                                                    STATUS_COMMENT_2  = (CASE 
                                                                            WHEN APPROVER_2 IS NULL AND NVL(STATUS_1, 0 ) <> 230 
                                                                                AND :username <> ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_1 FROM BAUDIT.BUDGET WHERE id = :id_row ) )
                                                                                THEN :status_comment 
                                                                            WHEN :username = ( Select username from BAUDIT.USERS where id = ( SELECT APPROVER_2 FROM BAUDIT.BUDGET WHERE id = :id_row ) ) 
                                                                                AND NVL(STATUS_1, 0 ) <> 230 AND NVL(STATUS_2, 0 ) <> 230 THEN :status_comment 
                                                                            WHEN  ( SELECT id_role FROM BAUDIT.USERS WHERE username = :username ) = 1 AND :id_action = 230
                                                                                THEN :status_comment   -- Если админ пытается перевести в архив - пишем                                                         
                                                                            ELSE STATUS_COMMENT_2 
                                                                        END)
                                                
                                                    WHERE ID = :id_row`;    // RETURNING seq.nextval
                        
                                                }
                        
                                                console.log( queryString)
                                                optionsObj = { autoCommit: true }                 
                        
                        
                                                // If the request has matured
                                                if (queryString != '') {
                                                    
                                                        try {
                        
                                                            connection = await oracledb.getConnection(
                                                            { 
                                                                user: dbConfig.user, 
                                                                password: dbConfig.password, 
                                                                connectString: dbConfig.connectString
                                                            });
                                                            
                                                            result = await connection.execute(
                                                                queryString
                                                                ,bindsObj                               
                                                                ,optionsObj
                                                            ); 
                                                            
                                                            console.log( result.rowsAffected )          
                        
                                                            // 
                                                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
                        
                                                                response.json( Object.assign( result, { "response"  : "success" } ));

                                                            } else {
                                                                console.dir( result )

                                                                response.json( Object.assign( errorWrongDataTemplate, { "comment": "No data updated" } ));                                                        
                                                            };
                                                    
                                                        } catch (err) {
                                                            console.error(err);
                        
                                                            response.json( Object.assign( errorWrongDataTemplate, { "comment": err.message } ));
                        
                                                        } finally {
                                                            if (connection) {
                                                                try {
                                                            await connection.close();
                                                                } catch (err) {
                                                            console.error(err);
                                                                }
                                                            }
                        
                                                        }
                        
                                                    } else {   
                        
                                                        response.send('Request not processed');        
                        
                                                    };
                        
                                                break;                                               

                    }

                    break;  

                case '2':
                if( !Object.keys(objInput).length ) {                      
                    
                    errorRequest = Object.assign( errorEmptyRequestTemplate,
                                                  { 
                                                    url : request.originalUrl,  
                                                    methods: request.route.methods,
                                                    requestBody : request.body
                                                  }
                                                ) 
                                               
                    response.json(errorRequest);  
                    return errorRequest
                } 

                if ( objInput.type === 'living'){


                        try {
                            bindsObj = await bindObjMaker( objInput, { ip: ip }, "baudit-add-new-row-living" )
                        } catch (err) {
                            throw new Error(err)
                        }

                        
                        console.dir(bindsObj)
                        // /api/baudit/post?service=add-new-row&v=1.0
                        if(1){

                            queryString = `INSERT INTO baudit.LIVING (
                                            TOTAL_AREA,
                                            TOT_FLAT_AREA,
                                            AREA_APART,
                                            NUM_PARKING,
                                            UNDERGR_PARKING_EXIST,
                                            UNDERGR_PARKING_EXPL,
                                            NUM_FLOORS,
                                            BUILD_VOL,
                                            ID_BEARING_CONSTR,
                                            ID_FENCE_STRUCT,
                                            ID_CLASS_QUAL_LIV,
                                            CONDITION,
                                            ID_STATUS
                                )
                                
                                VALUES (
                                    :total_area,
                                    :tot_flat_area,
                                    :area_apart,
                                    :num_parking,
                                    :undergr_parking_exist,
                                    :undergr_parking_expl,
                                    :num_floors,
                                    :build_vol,
                                    :id_bearing_constr,
                                    :id_fence_struct,
                                    :id_class_qual_liv,
                                    :condition,
                                    :id_status                   
                                )
                            
                            RETURNING "ID" INTO :id_returning `;    // 

                        }

                        //console.log( queryString)
                        optionsObj = { autoCommit: true }    

                    } else if ( objInput.type === 'commercial'){
                           
                        bindsObj = await bindObjMaker( objInput, { ip: ip }, "baudit-add-new-row-commercial" )
                        console.dir(bindsObj)
                        // /api/baudit/post?service=add-new-row&v=1.0
                        if(1){

                            queryString = `INSERT INTO baudit.COMERCIAL (
                                    TOTAL_AREA,
                                    BUILD_VOL,
                                    ENG_EQUIP_EXIST,
                                    UNDERGR_EXIST,
                                    ENG_EQUIP_EXPL,
                                    UNDERGR_EXPL,
                                    NUM_FLOORS,
                                    ID_VIDEO_SURV,
                                    ID_BEARING_CONSTR,
                                    ID_FENCE_STRUCT,
                                    ID_CLASS_QUAL_COM,
                                    ID_TYPE_BUILD,
                                    ID_INDUSTRY,
                                    ID_SUBINDUSTRY,
                                    ID_ROOF,
                                    ID_WIN_GATE,
                                    ID_ELEVATOR,
                                    ID_PROJ_SOL,
                                    CONDITION,
                                    ID_STATUS,
                                    ID_TYPE_STOCK
                                )
                                
                                VALUES (
                                    :total_area,
                                    :build_vol,
                                    :eng_equip_exist,
                                    :undergr_exist,
                                    :eng_equip_expl,
                                    :undergr_expl,
                                    :num_floors,
                                    :id_video_surv,
                                    :id_bearing_constr,
                                    :id_fence_struct,
                                    :id_class_qual_com,
                                    :id_type_build,
                                    :id_industry,
                                    :id_subindustry,
                                    :id_roof,
                                    :id_win_gate,
                                    :id_elevator,
                                    :id_proj_sol,
                                    :condition,
                                    :id_status,
                                    :id_type_stock
                                )
                            
                            RETURNING "ID" INTO :id_returning `;    // 

                        }

                        //console.log( queryString)
                        optionsObj = { autoCommit: true }   
                                                
                    }

                // If the request has matured
                if (queryString != '') {
                    
                        try {

                            connection = await oracledb.getConnection(
                            { 
                                user: dbConfig.user, 
                                password: dbConfig.password, 
                                connectString: dbConfig.connectString
                            });
                            
                            console.log( '---=' )
                            console.log( queryString )
                            console.dir( bindsObj )
                            console.dir( optionsObj )

                            result = await connection.execute(
                                queryString
                                ,bindsObj                               
                                ,optionsObj
                            );      

                            // 
                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )

                                let id = result.outBinds.id_returning

                                //bindObjMaker.id = parseInt(id);

                                // Продолжаем

                                bindsObj = await bindObjMaker(objInput, { ip: ip, id: parseInt(id) }, "baudit-add-new-row-budget")
                                console.dir(bindsObj)
                                // /api/baudit/post?service=add-new-row&v=1.0
                                if(1){
                
                                    queryString = `INSERT INTO baudit.BUDGET (
                                                    ${ (()=> {
                                                        switch ( objInput.type ) {
                                                            case 'living':
                                                                return `ID_LIV,`
                                                            case 'commercial':
                                                                return `ID_COM,`            
                                                            default:
                                                                return ``
                                                                break;
                                                        }
                                                    })() }
                
                                        BUILDER_COMPANY,
                                        ID_REGION,
                                        DATE_BUDG,
                                        DATE_USE,
                                        BUDG_RENT,
                                        BUDG_PIR,
                                        BUDG_PREPAR_CONSTR_AREA,
                                        BUDG_SMR_ZERO_CIRCLE,
                                        BUDG_SMR_BUILD,
                                        BUDG_FACADE,
                                        BUDG_ROOF,
                                        BUDG_INT_FIN_WORK,
                                        BUDG_HEATING,
                                        BUDG_VENTILATION,
                                        BUDG_PLUMBING,
                                        BUDG_SEWERAGE,
                                        BUDG_ELEC_LIGHTING,
                                        BUDG_GAS,
                                        BUDG_FURNITURE_INVEN,
                                        BUDG_TECHN_EQUIP,
                                        BUDG_WATER_OUT,
                                        BUDG_VEN_OUT,
                                        BUDG_ELEC_SUPPLY_OUT,
                                        BUDG_GAS_OUT,
                                        BUDG_TELEPHONE_OUT,
                                        BUDG_WATER_EXT,
                                        BUDG_SEWERAGE_EXT,
                                        BUDG_ELEC_EXT,
                                        BUDG_HEAT_EXT,
                                        BUDG_COST_OF_CUSTOMER,
                                        BUDG_BUILD_CONTROL,
                                        BUDG_TEMP_BUILDINGS,
                                        BUDG_OTHER_COSTS,
                                        BUDG_UNEXP_COSTS,
                                        BUDG_RENT_CURVAL,
                                        BUDG_PIR_CURVAL,
                                        BUDG_PREPAR_CONSTR_AREA_CURVAL,
                                        BUDG_SMR_ZERO_CIRCLE_CURVAL,
                                        BUDG_SMR_BUILD_CURVAL,
                                        BUDG_FACADE_CURVAL,
                                        BUDG_ROOF_CURVAL,
                                        BUDG_INT_FIN_WORK_CURVAL,
                                        BUDG_HEATING_CURVAL,
                                        BUDG_VENTILATION_CURVAL,
                                        BUDG_PLUMBING_CURVAL,
                                        BUDG_SEWERAGE_CURVAL,
                                        BUDG_ELEC_LIGHTING_CURVAL,
                                        BUDG_GAS_CURVAL,
                                        BUDG_FURNITURE_INVEN_CURVAL,
                                        BUDG_TECHN_EQUIP_CURVAL,
                                        BUDG_WATER_OUT_CURVAL,
                                        BUDG_VEN_OUT_CURVAL,
                                        BUDG_ELEC_SUPPLY_OUT_CURVAL,
                                        BUDG_GAS_OUT_CURVAL,
                                        BUDG_TELEPHONE_OUT_CURVAL,
                                        BUDG_WATER_EXT_CURVAL,
                                        BUDG_SEWERAGE_EXT_CURVAL,
                                        BUDG_ELEC_EXT_CURVAL,
                                        BUDG_HEAT_EXT_CURVAL,
                                        BUDG_COST_OF_CUSTOMER_CURVAL,
                                        BUDG_BUILD_CONTROL_CURVAL,
                                        BUDG_TEMP_BUILDINGS_CURVAL,

                                        OBJECTS_AUXILIARY,
                                        BUDG_ACCOMPLISHMENT,                                        
                
                                        ID_TYPE_REALTY,

                                        DOCUMENTS,
                
                                        AUTHOR_IP,
                                        DATE_ADD
                                        )
                                        
                                        VALUES (:id_returned,
                                                :builder_company,
                                                :id_region,
                                                to_timestamp( :date_budg, ${ISO8601_template}),
                                                to_timestamp( :date_use,  ${ISO8601_template}),
                                                :budg_rent,
                                                :budg_pir,
                                                :budg_prepar_constr_area,
                                                :budg_smr_zero_circle,
                                                :budg_smr_build,
                                                :budg_facade,
                                                :budg_roof,
                                                :budg_int_fin_work,
                                                :budg_heating,
                                                :budg_ventilation,
                                                :budg_plumbing,
                                                :budg_sewerage,
                                                :budg_elec_lighting,
                                                :budg_gas,
                                                :budg_furniture_inven,
                                                :budg_techn_equip,
                                                :budg_water_out,
                                                :budg_ven_out,
                                                :budg_elec_supply_out,
                                                :budg_gas_out,
                                                :budg_telephone_out,
                                                :budg_water_ext,
                                                :budg_sewerage_ext,
                                                :budg_elec_ext,
                                                :budg_heat_ext,
                                                :budg_cost_of_customer,
                                                :budg_build_control,
                                                :budg_temp_buildings,
                                                :budg_other_costs,
                                                :budg_unexp_costs,
                
                                                :budg_rent_curval,
                                                :budg_pir_curval,
                                                :budg_prepar_constr_area_curval,
                                                :budg_smr_zero_circle_curval,
                                                :budg_smr_build_curval,
                                                :budg_facade_curval,
                                                :budg_roof_curval,
                                                :budg_int_fin_work_curval,
                                                :budg_heating_curval,
                                                :budg_ventilation_curval,
                                                :budg_plumbing_curval,
                                                :budg_sewerage_curval,
                                                :budg_elec_lighting_curval,
                                                :budg_gas_curval,
                                                :budg_furniture_inven_curval,
                                                :budg_techn_equip_curval,
                                                :budg_water_out_curval,
                                                :budg_ven_out_curval,
                                                :budg_elec_supply_out_curval,
                                                :budg_gas_out_curval,
                                                :budg_telephone_out_curval,
                                                :budg_water_ext_curval,
                                                :budg_sewerage_ext_curval,
                                                :budg_elec_ext_curval,
                                                :budg_heat_ext_curval,
                                                :budg_cost_of_customer_curval,
                                                :budg_build_control_curval,
                                                :budg_temp_buildings_curval,

                                                :objects_auxiliary,   
                                                :budg_accomplishment,  
                                                
                                                :id_type_realty,

                                                :documents,                                                
                
                                                :author_ip,
                                                to_timestamp( :date_add, ${ISO8601_template})                    
                                        )
                                    
                                    RETURNING "ID" INTO :id `;    // RETURNING seq.nextval
                
                                }
                
                                //console.log( queryString)
                                optionsObj = { autoCommit: true }                 
                
                
                                // If the request has matured
                                if (queryString != '') {
                                    
                                        try {
                
                                            connection = await oracledb.getConnection(
                                            { 
                                                user: dbConfig.user, 
                                                password: dbConfig.password, 
                                                connectString: dbConfig.connectString
                                            });
                                            
                                            result = await connection.execute(
                                                queryString
                                                ,bindsObj                               
                                                ,optionsObj
                                            ); 

                                            console.log( 'ok2' )   
                                            console.dir( result )   
                                            
                                            console.log( result.rowsAffected )          
                
                                            // 
                                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
                                                //

                                                response.json(result);
                                                
                                            };
                                    
                                        } catch (err) {
                                            //console.error(err);
                                            //console.dir( err.message );
                                            // console.dir( Object.assign(errorWrongDataTemplate, { "comment": err.message } ) );

                                            response.json( Object.assign( errorWrongDataTemplate, { "comment": err.message } ));
                
                                        } finally {
                                            if (connection) {
                                                try {
                                            await connection.close();
                                                } catch (err) {
                                            console.error(err);
                                                }
                                            }
                
                                        }
                
                                    } else {   
                
                                        response.send('Request not processed');        
                
                                    };
                                
                            };
                    
                        } catch (err) {
                            //console.error(err);
                            //console.dir( err.message );
                             console.dir( Object.assign(errorWrongDataTemplate, { "comment": err.message } ) );
                            response.json( Object.assign( errorWrongDataTemplate, { "comment": err.message } ));

                        } finally {
                            if (connection) {
                                try {
                            await connection.close();
                                } catch (err) {
                            console.error(err);
                                }
                            }

                        }

                    } else {   

                        response.send('Request not processed');        

                    };
    
                        break;                      
        default:
            response.send('Request not processed');      

      }
    

    } else if ( request.level1 == 'sova'  && request.level2 == 'post' && argsCount == 2 && params.service == 'add-new-company'  && params.v  ){        
        
        let objInput = request.body;
        
        console.log("objInput:");
        console.dir(objInput);        

        v = params.v.split('.')

        class SQLExecuteError extends Error {
            constructor(message, cross) {
              super(message); 
              this.name = "SQLExecuteError"; 
              this.cross = cross;
            }
          }

        try {

            switch (v[0]) {
                case '0':
                    console.dir(objInput)  
                    if(v[1] === '1') response.json( objInput )
                    // if(v[1] === '2') response.send( JSON.stringify(objInput) )

                    break;

                case '1':

                    if ( !request.signedCookies.access_token ) throw new Error ( 'Need access token' )

                    let isArrInArr = (arr) => { 
                        const reducer = (accumulator, currentValue) => accumulator && Array.isArray(currentValue.presenceLocality);
                        return arr.reduce(reducer, true)
                    }

                    if( !Object.keys(objInput).length ) {                      
                        
                        errorRequest = Object.assign( 
                            errorEmptyRequestTemplate, 
                            { 
                                url : request.originalUrl,  
                                methods: request.route.methods,
                                requestBody : request.body
                        })
                                                
                        response.json(errorRequest);  
                        throw new Error ('Request has empty body')
                        //return errorRequest
                    } else if ( !Array.isArray( objInput.offices ) ){
                        throw new Error ('offices - must be an array')                        
                    // } else if ( !Array.isArray( objInput.offices.presenceLocality ) ){
                    } else if ( !isArrInArr( objInput.offices ) ){
                        throw new Error ('offices.presenceLocality - must be an array')     
                    } 
					
					// Если ли поле с регионами и уровнями допуска (обычно нету)
                    // Если нет - собираем из офисов
                    if(!objInput.company.accessLevels){

                        objInput.company.accessLevels = []
                        let offices = objInput.offices
                        offices.forEach(({presenceLocality}) => 
                            presenceLocality.forEach(({STATE}) => {
                                let region = { 'REGION': STATE, 'ACCESS_WEIGHT': 0 }
                                let regionStr = JSON.stringify(region)
                                // Смотрим есть ли такой регион 
                                // (при изменении компании, но добавлении офиса еще смотреть и есть ли такой регион в списке регионов (если есть - добавляем))                                
                                let addedRegionsStr = objInput.company.accessLevels.map(reg => JSON.stringify(reg))   
                                if(!addedRegionsStr.includes(regionStr)) objInput.company.accessLevels.push(region)
                            })
                        )                        
                    }					
                

                ///// другая структура
                reqObj = {
                        company: {
                            attributes : [],
                            historyAttributes : [],
                            accessLevels : []
                        },
                        offices : []
                }

                    reqObj.company.attributes.push (`
                        INSERT INTO REGPC.pc_attributes (
                            PSRN,
                            REG_DATE,
                            OKPO,
                            SITE,
                            ACCOUNT_DETAILS_BANK_NAME,
                            ACCOUNT_DETAILS_SETTLEMENT_ACC,
                            ACCOUNT_DETAILS_CORR_ACC,
                            ACCOUNT_DETAILS_BIC,
                            CAPITAL_AMOUNT,
                            FEDERAL_TAX_SERVICE_CONTACTS,
                            AFFILIATES_INFO,
                            INSURANCE_COMPANIES,
                            APPRAISERS_INV_AVAILABILITY,
                            QUANTITY_APPRAISERS,
                            AVG_QTY_REPORTS_IN_MOUNTH,
                            RVC,
                            ABBREVIATION,
                            SUBSIDIARIES,
                            QUANTITY_APPRAISERS_DECLARED,
                            REG_AGENCY,
                            DATE_OF_START_SD_CONCLUSION,
                            DATE_OF_START_LD_CONCLUSION                              
                        )
                        VALUES (
                            :psrn , to_date(:rgd, 'DD.MM.YYYY')  , :okpo , :st   , :adbn , :adsa , :adca , :adb  , :ca   , 
                            :ftsc , :afi  , :insc , :aia  , :qapp , :aqr  , :rvc  , :abr  , :sbs  , 
                            :qad  , :rga  , to_date(:dssd, 'DD.MM.YYYY') , to_date(:dslc, 'DD.MM.YYYY')                         
                        )
                        RETURNING "ID" INTO :id_company                    
                    `)

                    reqObj.company.attributes.push ( binder.sova( objInput.company.attributes, undefined, "add-new-company-attributes" ) )
                    reqObj.company.attributes.push ( { autoCommit: true } )

                    // Запустить
                    // try {                      
                    requestDBPromisePool( 'company.attributes', ...reqObj.company.attributes)
                    .then( comp_attr => {   // Получение userID

                        console.dir('comp_attr')
                        console.dir( comp_attr )

                        if ( comp_attr.response > 0 ){

                            return new Promise (( resolve, reject ) => {

                                auth.getUserID( request, response, { "ACCESS_TOKEN" : request.signedCookies.access_token })
                                .then( id_user => {    
                                    if ( id_user.response ){
                                        resolve( { id_user: id_user.response, id_company : comp_attr.fullResult.outBinds.id_company[0] } )
                                    } else {
                                        reject ( 'cant find user by token' )
                                    }                                        
                                })
                                .catch( err => {
                                    reject( err )
                                })
                                    
                            })

                        } else {
                            throw new Error ( 'cant add company attributes' )
                        }

                    })
                    .then( cross => {  // historyAttributes

                        cross = Object.assign( cross, { id_hist : uuid() } )
                        
                        return new Promise (( resolve, reject ) => {

                            addCompamy.historyAttributes( objInput, cross )
                            .then( result => {
                                if ( result === 'ok' ){                                    
                                    resolve ( cross )
                                } else {
                                    reject('cant add company history attributes')
                                }
                            })
                            .catch( err => { console.dir(err); reject(err) } )

                        })

                    })
                    .then( cross => {   // accessLevels

                        return new Promise (( resolve, reject ) => {

                            addCompamy.accessLevels( objInput, cross )
                            .then( comp_acc => {  
                                //if ( comp_acc === 'ok' ){                                    
                                    resolve ( Object.assign( cross, { id_acc_lev :  comp_acc.fullResult.outBinds.map( id => id["id_acc_lev"][0] ) }) )
                                //} else {
                                    //reject('cant add company access levels')
                                //}                               
                                
                            })
                            .catch( err => { console.dir(err); reject(err) } )

                        })
                    })
                    .then( cross => {   // office-attributes

                        let id_off = objInput.offices.map( office => uuid() )

                        console.dir('%%% id_off %%%')
                        console.dir(id_off)

                        cross = Object.assign( cross, { id_off : id_off } )

                        return new Promise (( resolve, reject ) => {

                            addOffice.attributes( objInput, cross )
                            .then( off_atr => {  
                               if ( off_atr === 'ok' ){                                    
                                    resolve ( cross )
                                } else {
                                    reject('cant add office attributes')
                                }                               
                                
                            })
                            .catch( err => { console.dir(err); reject(err) } )

                        })
                    })
                    .then( cross => {   // office-historyAttributes

                        // cross = Object.assign( cross, { id_off : id_off } )

                        return new Promise (( resolve, reject ) => {

                            addOffice.historyAttributes( objInput, cross )
                            .then( off_atr_hist => {                 
                                resolve ( Object.assign( cross, { id_off_adr : off_atr_hist.fullResult.outBinds.map( id => id["id_off_adr"][0] ) }) )
                                
                            })
                            .catch( err => { console.dir(err); reject(err, cross) } )

                        })
                    })
                    .then( cross => {   // office-presenceLocality

                        let id_off_pl = objInput.offices.map( office => 
                            office.presenceLocality.map( () => uuid() )
                        )

                        cross = Object.assign( cross, { id_off_pl : id_off_pl } )

                        return new Promise (( resolve, reject ) => {

                            addOffice.presenceLocality( objInput, cross )
                            .then( off_atr_hist => {   
                                if ( off_atr_hist === 'ok' ){                                    
                                    resolve ( cross )
                                } else {
                                    reject('cant add office attributes', cross)
                                }   
                                
                            })
                            .catch( (err, cross) => { console.dir(err); reject(err, cross) } )

                        })
                    })                    
                    .then( cross => { 
                            senderWithHeaders (response, { "response" : "ok", "id_company" : cross.id_company } )                          
                    })
                    .catch( (err, cross) => { 
                        console.dir(err); 
                        throw new SQLExecuteError (err, cross) 
                    })
       
                    break;                      
            default:
                response.send('Request not processed');      

            }

        } catch ( err ) {

            if ( err instanceof Error) {
                console.dir(err)
                senderWithHeaders (response, auth.Tmplt ('error', err.message)) 
            } else if( err instanceof SQLExecuteError ) {
               // (пока не надо) Попробовать еще раз  
               console.log('SQLExecuteError')               
               delCross(cross) // Функция удаления записей по cross
               .then( () => senderWithHeaders (response, auth.Tmplt ('error', `${err.message} Staging tables successfull deleted.`)) )   //.then( () => senderWithHeaders (response, auth.Tmplt ('ok', cross)) )                                           
               .catch( err => { console.dir (err); senderWithHeaders ( response, auth.Tmplt ('error', `${err} Some staging tables stay undeleted.`))  } ) 
               
            } else {
                senderWithHeaders (response, auth.Tmplt ('error', err)) 
            } 
        }

    } else if (request.level1 == 'sova' && request.level2 == 'post' && argsCount == 2 && params.service == 'test' && params.v  ){        
        
        multiInsert = false

        //console.dir(request);
        //console.log(JSON.stringify(request.body))
        /* console.log(JSON.parse(request.body));
        console.log(JSON.stringify(request.body)); */

        // Костыль для обработки криво получаемого объекта
        console.log("Тестовый запрос");

        /* for (key in request.body) {   
            console.log(key)         
            console.log(request.body[key])    
            //objInput = JSON.parse(JSON.parse(key))
            objInput = JSON.parse(key)
          } */

        let objInput = request.body;
        
        console.log("objInput:");
        console.dir(objInput);

        bindsObj = await bindObjMaker(objInput, { ip: ip }, "test")
        
        console.log("bindsObj:")
        console.dir ( bindsObj );

        v = params.v.split('.')

        switch (v[0]) {
            case '0':
                console.log('case 0')
                console.dir(objInput)  
            
                response.send(JSON.stringify(objInput))
                break;
            case '1':
                console.log('case 1')
                // /api/sova/get?service=COMPANIES_data&v=1.0               
                queryString = `INSERT INTO test ( dt ) 
                               VALUES ( to_timestamp( :dt, ${ISO8601_template}) )`;
                                            
                    optionsObj = {
                        
                        autoCommit: true,
                        bindDefs: {
                             dt: { type: oracledb.STRING, MAXSIZE: 24*2 } //date            
                        }
                    }

                     
                    //
                // If the request has matured
                if (queryString != '') {
                    
                        try {

                            connection = await oracledb.getConnection(
                            { 
                                user: dbConfig.user, 
                                password: dbConfig.password, 
                                connectString: dbConfig.connectString
                            });
                            
                            result = await connection.execute(
                                queryString
                                ,bindsObj
                                ,optionsObj
                            ); 
                            
                            console.log( result.rowsAffected )          

                            // 
                            if (result.rowsAffected === 1) {   // If result there is ( !!! check result consist and find success result )
                                //

                                response.send(result);
                                
                            };
                    
                        } catch (err) {
                            console.error(err);
                            response.send(err);
                        
                        } finally {
                            if (connection) {
                                try {
                            await connection.close();
                                } catch (err) {
                            console.error(err);
                                }
                            }                    
                        }

                    } else {   

                        response.send('Request not processed');        

                    };

                    break;  
        default:
            response.send('Request not processed');      

      } 

      return
	  
    } else if ( request.level1 == 'sova' && (request.level2 == 'post' || request.level2 == 'del') )  {
		console.log('component handle')
        await component.API(request, response)
        return		  	  

    } else {
        errorRequest = Object.assign(errorWrongRequestTemplate, 
            { comment: "not found post-request url",
              url : request.originalUrl,  
              methods: request.route.methods
            })     

        if (request["_body"]) errorRequest = Object.assign(errorRequest, { requestBody : request.body })

        response.status(400).json(errorRequest)
        return errorRequest;
    }

  };


  // 
  


  //
  let bindArrMakerMany = (objInput, ip, type) => {

    // { val: '0' }
    let i = 0

    var now = new Date()

    var bindsArr = [];

    switch(type) {
        
        case 'staff': 

            for (var key in objInput) {

                bindsArr[i] = {}    //
        
                bindsArr[i].pos    =  objInput[key].status   
                bindsArr[i].fulln  =  objInput[key].fullname    
        
                bindsArr[i].dtb    =  objInput[key].dateborn   // { val: '29.06.2019' }
        
                bindsArr[i].plb    =  objInput[key].placeborn
                bindsArr[i].passp  =  objInput[key].passport
                bindsArr[i].passpi =  objInput[key].passport_issuer
                bindsArr[i].passpd =  objInput[key].passport_date
                bindsArr[i].addrr  =  objInput[key].address_reg
                bindsArr[i].expc   =  objInput[key].experience_in_company == undefined? '' : objInput[key].experience_in_company
                bindsArr[i].phn    =  objInput[key].phone_num             == undefined? '' : objInput[key].phone_num
                bindsArr[i].empc   =  objInput[key].empl_contract         == undefined? '' : objInput[key].empl_contract
                bindsArr[i].dipl   =  objInput[key].diplom                == undefined? '' : objInput[key].diplom
                bindsArr[i].orgn   =  objInput[key].selfreg_org_name      == undefined? '' : objInput[key].selfreg_org_name
                bindsArr[i].prfd   =  objInput[key].selfreg_proof_doc     == undefined? '' : objInput[key].selfreg_proof_doc
        
                bindsArr[i].insp   =  objInput[key].insurance_policy      == undefined? '' : objInput[key].insurance_policy
                bindsArr[i].insc   =  objInput[key].insurance_company     == undefined? '' : objInput[key].insurance_company
                bindsArr[i].insa   =  objInput[key].insurance_amount      == undefined? '' : objInput[key].insurance_amount
        
                bindsArr[i].inds   =  objInput[key].insurance_start_date
                bindsArr[i].inde   =  objInput[key].insurance_end_date
        
                bindsArr[i].expa   =  objInput[key].experience_all        == undefined? '' : objInput[key].experience_all 
        
                /* 
                bindsArr[i].qcd    =  objInput[key].qual_cert_direction
                bindsArr[i].qcn    =  objInput[key].qual_cert_num
                bindsArr[i].qcds   =  objInput[key].qual_cert_date_start 
                */
        
                bindsArr[i].idc    =  objInput[key].id_company
                bindsArr[i].addr   =  objInput[key].address_residential 
        
                bindsArr[i].cert   = JSON.stringify(objInput[key].cert_data)
        
                bindsArr[i].dadd   = now.toLocaleString("en-US", dateOptions) 
                bindsArr[i].auth   = ip        
                
                i++;
        
            }

            break;

    }

    return bindsArr

  }


  function prepareArrayToDB( objInput ){

    //console.dir(objInput)
    var binds = [];

    binds[0] = objInput.fullname
    let i = 0

    /* for(key in objInput){                
        binds[i] = objInput[key];
        i++;
    } */

    console.dir(binds);

    return binds;

  }


  const selectLocations = async (response, params) => {

    return new Promise ((resolve, reject) => {
                    
        setTimeout(async () => {						

            let queryString = ` 
            SELECT 
				${params.format === '2'? 'id,': ''}
                state, locality 
            FROM  SHORT_LIST_LOCATIONS 
            WHERE ${ params.service } = 1 
            ORDER BY state, 
                    CASE locality
                        WHEN 'Прочие населенные пункты' THEN 2
                        ELSE 1
                    END   `;
    
            // format
            callback = (data) => data
            if ( params.format === '1') {
            callback = (data) => mdJSON(data, { arrMaxLvl: false, keepLastKeys: 0 }) 
            } 
    
            optionsObj = { outFormat: oracledb.OBJECT };
            excelFlag  = (params.excel)? true : false;     
    
            /* requestDBPromisePool('locations', queryString, {}, optionsObj, callback)
            .then( result => senderWithHeaders(response, JSON.parse(result.response)) )
            .catch( err => console.log(err) )  */
                           
            // result = await requestDBPromisePool('locations', queryString, {}, optionsObj, callback)
            result = await requestDBPromisePool('locations', queryString, {}, optionsObj, callback)
            //result = await requestDBPromise('locations', queryString, {}, optionsObj, callback)
            //console.dir(result)
            if (result.response) reject(result)
            senderWithHeaders(response, JSON.parse(result.response))
            
            resolve()

        }, 10);  
                
    })            

  }


//}
