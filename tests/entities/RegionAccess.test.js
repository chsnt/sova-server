const {container} = require('../../bottle')
const RegionAccess = require('../../entities/RegionAccess')

describe('RegionAccess', () => {
    it('find', async () => {
        await container.transaction(async (connection) => {
            let access = new RegionAccess()
            access.ID_COMPANY = 380
            access.ID_REGION = 212
            access.ACCESS_WEIGHT = 1
            access.ID_USER = 1

            await access.create(connection)

            let loadedEntity = await RegionAccess.find(connection, access.primaryKey)
            expect(loadedEntity.ID_COMPANY).toBe(access.ID_COMPANY)
            expect(loadedEntity.ID_REGION).toBe(access.ID_REGION)
            expect(loadedEntity.ACCESS_WEIGHT).toBe(access.ACCESS_WEIGHT)
        })
    })
    it('list', async () => {
        await container.transaction(async (connection) => {
            let list = await RegionAccess.list(connection)
            expect(list).toBeInstanceOf(Array)
            expect(list.length).toBeGreaterThanOrEqual(1)
        })
    })

    it('create', async () => {
        await container.transaction(async (connection) => {
            let access = new RegionAccess()
            access.ID_COMPANY = 380
            access.ID_REGION = 212
            access.ACCESS_WEIGHT = 1
            access.ID_USER = 1

            await access.create(connection)

            let loadedEntity = await RegionAccess.find(connection, access.primaryKey)
            expect(loadedEntity.ID_COMPANY).toBe(access.ID_COMPANY)
            expect(loadedEntity.ID_REGION).toBe(access.ID_REGION)
            expect(loadedEntity.ACCESS_WEIGHT).toBe(access.ACCESS_WEIGHT)

        })
    })
})
