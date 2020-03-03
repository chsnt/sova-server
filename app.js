let express = require('express')
require('express-async-errors')
let path = require('path')
let cookieParser = require('cookie-parser')
let logger = require('morgan')
// let bodyParser= require('body-parser')
const errorHandler= require('./errorHandler')


let utilsRouter = require('./routes/utils')
let commonRouter = require('./routes/common')
let companyRouter = require('./routes/company')
let reportsRouter = require('./routes/reports')

let app = express()
const cors = require('cors')

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())


app.use('/api/utils', utilsRouter)
app.use('/api/common', commonRouter)
app.use('/api/company', companyRouter)
app.use('/reports', reportsRouter)

// обработчик ошибок должен подключаться последним use() https://expressjs.com/ru/guide/error-handling.html
app.use(errorHandler)

module.exports = app
