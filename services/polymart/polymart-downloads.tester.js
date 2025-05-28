import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Polymart Plugin (id 323)')
  .get('/323.json')
  .intercept(nock =>
    nock('https://api.polymart.org')
      .get('/v1/getResourceInfo/')
      .query({ resource_id: '323' })
      .reply(200, {
        response: {
          resource: {
            downloads: '1000',
            price: 0,
            reviews: {
              count: 10,
              stars: 4.5,
            },
            updates: {
              latest: {
                version: '1.0.0',
              },
            },
          },
        },
      }),
  )
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('Invalid Resource (id 0)')
  .get('/0.json')
  .intercept(nock =>
    nock('https://api.polymart.org')
      .get('/v1/getResourceInfo/')
      .query({ resource_id: '0' })
      .reply(200, {
        response: {
          success: false,
          errors: {
            resource: 'Resource not found',
          },
        },
      }),
  )
  .expectBadge({
    label: 'downloads',
    message: 'not found',
  })
