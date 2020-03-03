const {container} = require('../../bottle')
const Region = require('../../entities/Region')
const {Company, CompanyHistory} = require('../../entities')

describe('Region', () => {
    it('find', async () => {
        await container.transaction(async (connection) => {
            let entity = await Region.find(connection, 1)
            expect(entity).toBeInstanceOf(Region)
            expect(entity.ID).toBe(1)
            expect(entity.STATE).toBe('Алтайский край')
        })
    })
    it('list', async () => {
        await container.transaction(async (connection) => {
            let list = await Region.list(connection)
            expect(list).toBeInstanceOf(Array)
            expect(list[0]).toBeInstanceOf(Region)
        })
    })
})
