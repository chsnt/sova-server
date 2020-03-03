const {container} = require('../../bottle')
const CompanyType = require('../../entities/CompanyType')

/**
 * CompanyType
 */
describe('CompanyType', () => {
    it('primaryKeyName', async () => {
        expect(CompanyType.primaryKeyName).toBe('ID')
    })

    // TODO: not working
    it.skip('columnsWoPrimaryKey', () => {
        expect(CompanyType.columnsWoGenerated).toBeInstanceOf(Object)
        expect(CompanyType.columnsWoGenerated).not.toHaveProperty('ID')
        expect(CompanyType.columnsWoGenerated).toHaveProperty('TYPE_OF_COMPANY')
    })

    it('find', async () => {
        let entity = await container.transaction(async (connection) => CompanyType.find(connection, '0c9dc546-dc2b-41bf-9a23-bfa4971645c1'))
        expect(entity).toBeInstanceOf(CompanyType)
        expect(entity.ID).toBe('0c9dc546-dc2b-41bf-9a23-bfa4971645c1')
        expect(entity.TYPE_OF_COMPANY).toContain('ООО')
    })

})
