const request = require('supertest')
const app = require('../../../app')
const body = require('./putOffices.data.js')

describe('/api/company', () => {
    it('/:id/putOffice', async () => {
        const res = await request(app).put('/api/company/563/putOffices')
            .send(body)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toBeInstanceOf(Array)
        expect(res.body[0]).not.toBeUndefined()
    })
})
