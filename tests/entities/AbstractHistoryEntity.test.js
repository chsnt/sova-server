const {container} = require('../../bottle')
const OfficeHistory = require('../../entities/OfficeHistory')
const Office = require('../../entities/Office')
const Company = require('../../entities/Company')
const CompanyHistory = require('../../entities/CompanyHistory')

/**
 * Базовые проверки работы БД
 */
describe('AbstractHistoryEntity', () => {
    it('parentForeignKeyName', async () => {
        expect(CompanyHistory.parentForeignKeyName).toBe('ID_COMPANY')
    })

    it('History', async () => {
        expect(Company.History).toBe(CompanyHistory)
    })

    it('getHistoryPrimaryKey', async () => {
        await container.transaction(async (connection) => {
            const result = await Company.getHistoryPrimaryKey(connection, 563)
            expect (result).toBe('b02709d3-c0b7-46ce-bbf1-117c7823f6c0    ')
        })
    })

    it('find', async () => {
        await container.transaction(async (connection) => {
            let entity = await Company.find(connection, 563)
            expect(entity).toBeInstanceOf(Company)
            expect(entity.history).toBeInstanceOf(CompanyHistory)
            expect(entity.ID).toBe(563)
            expect(entity.history.ID).toContain('b02709d3-c0b7-46ce-bbf1-117c7823f6c0    ')
        })
    })

    it('create', async () => {
        await container.transaction(async (connection) => {
            const office= new Office()

        })
    })


})
