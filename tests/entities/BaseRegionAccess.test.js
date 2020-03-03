const {container} = require('../../bottle')
const BaseRegionAccess = require('../../entities/BaseRegionAccess')

describe('BaseRegionAccess', () => {
    it('find', async () => {
        await container.transaction(async (connection) => {
            let entity = await BaseRegionAccess.find(connection, 3430)
            expect(entity).toBeInstanceOf(BaseRegionAccess)
            expect(entity.ID_COMPANY).toBe(380)
            expect(entity.ID_REGION).toBe(212)
        })
    })
    it('list', async () => {
        await container.transaction(async (connection) => {
            let list = await BaseRegionAccess.list(connection)
            expect(list).toBeInstanceOf(Array)
            expect(list.length).toBeGreaterThanOrEqual(1)
        })
    })

    it('create', async () => {
        await container.transaction(async (connection) => {
            let access = new BaseRegionAccess()
            access.ID_COMPANY = 380
            access.ID_REGION = 212
            access.ACCESS_WEIGHT = 1
            access.ID_USER = 1

            await access.create(connection)

            let loadedEntity = await BaseRegionAccess.find(connection, access.primaryKey)
            expect(loadedEntity.ID_COMPANY).toBe(access.ID_COMPANY)
            expect(loadedEntity.ID_REGION).toBe(access.ID_REGION)
            expect(loadedEntity.ACCESS_WEIGHT).toBe(access.ACCESS_WEIGHT)
        })
    })
})
