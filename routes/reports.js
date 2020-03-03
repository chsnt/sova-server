const express = require('express')
const router = express.Router()
const registryRoc = require('./reports/registryRoc')

router.get('/registryRoc', async (req, res) => {
    await registryRoc(req, res);

})

module.exports = router;
