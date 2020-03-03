const {container} = require('../../bottle');
const {Company, CompanyHistory, Curator} = require('../../entities')

describe('CompanyHistory', () => {
  it('find', async () => {
    await container.transaction(async (connection) => {
      let entity = await CompanyHistory.find(connection, 'f9a45dc6-a267-41fe-89a6-88936f78b9af    ')
      expect(entity.ID).toBe('f9a45dc6-a267-41fe-89a6-88936f78b9af    ')
      expect(entity.ID_COMPANY).toBe(348)
    })
  })
});
