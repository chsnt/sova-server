const request = require('supertest')
const app = require('../../../app')
const body = require('./putStaff.data.js')

describe('/api/company', () => {
    it('/:id/putStaff', async () => {
        const res = await request(app).put('/api/company/563/putStaff')
            .send(body)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toBeInstanceOf(Array)
        expect(res.body[0]).not.toBeUndefined()
    })
})
