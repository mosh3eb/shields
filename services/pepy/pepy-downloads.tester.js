import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('downloads (valid)')
  .get('/dt/django.json')
  .intercept(nock =>
    nock('https://api.pepy.tech')
      .get('/api/v2/projects/django')
      .matchHeader('x-api-key', 'test-key')
      .reply(200, {
        total_downloads: 1000000,
      }),
  )
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (not found)')
  .get('/dt/not-a-package.json')
  .intercept(nock =>
    nock('https://api.pepy.tech')
      .get('/api/v2/projects/not-a-package')
      .matchHeader('x-api-key', 'test-key')
      .reply(404),
  )
  .expectBadge({ label: 'downloads', message: 'not found' })
