import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('EssentialsX (id 9089)')
  .get('/9089.json')
  .intercept(nock =>
    nock('https://api.spiget.org')
      .get('/v2/resources/9089')
      .reply(200, {
        downloads: 1000000,
        file: {
          type: 'jar',
          size: 1000000,
          sizeUnit: 'B',
        },
        testedVersions: ['1.8.8', '1.12.2'],
        rating: {
          count: 100,
          average: 4.5,
        },
      }),
  )
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('Invalid Resource (id 1)')
  .get('/1.json')
  .intercept(nock =>
    nock('https://api.spiget.org').get('/v2/resources/1').reply(404),
  )
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })
