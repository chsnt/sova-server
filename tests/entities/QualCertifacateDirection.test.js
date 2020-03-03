const {container} = require('../../bottle');
const QualCertifacateDirection = require('../../entities/QualCertificateDirection');

describe('QualCertifacateDirection', () => {

  it('find', async () => {
    let key = await container.transaction(async (connection) => {
    let QCDdata = await QualCertifacateDirection.find(connection, 1);
        expect(QCDdata.ID).toBe(1)
    });

  })

});
