const express = require('express')
const router = express.Router()

const container = require('../bottle').container

router.get('/async', async function (req, res) {
    res.send('OK')
})

router.get('/json', async function (req, res) {
    res.send({
        message: 'OK'
    })
})

router.get('/echo', async function (req, res) {
    res.send(req.body)
})

router.get('/error', function (req, res) {
    throw new Error('test error')
})

router.get('/asyncError', async function (req, res) {
    throw new Error('test error')
})

module.exports = router;
