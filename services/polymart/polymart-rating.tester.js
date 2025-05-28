import { isStarRating, withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Stars - Polymart Plugin (id 323)')
  .get('/stars/323.json')
  .intercept(nock =>
    nock('https://api.polymart.org')
      .get('/v1/getResourceInfo/')
      .query({ resource_id: '323' })
      .reply(200, {
        response: {
          resource: {
            price: 0,
            downloads: '1000',
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
    label: 'rating',
    message: isStarRating,
  })

t.create('Stars - Invalid Resource (id 0)')
  .get('/stars/0.json')
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
    label: 'rating',
    message: 'not found',
  })

t.create('Rating - Polymart Plugin (id 323)')
  .get('/rating/323.json')
  .intercept(nock =>
    nock('https://api.polymart.org')
      .get('/v1/getResourceInfo/')
      .query({ resource_id: '323' })
      .reply(200, {
        response: {
          resource: {
            price: 0,
            downloads: '1000',
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
    label: 'rating',
    message: withRegex(/^(\d*\.\d+)(\/5 \()(\d+)(\))$/),
  })

t.create('Rating - Invalid Resource (id 0)')
  .get('/rating/0.json')
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
    label: 'rating',
    message: 'not found',
  })
