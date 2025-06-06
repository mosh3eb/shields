import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const getURL = '/3.0.json?specUrl=https://example.com/example.json'
const getURLBase = '/3.0.json?specUrl='
const apiURL = 'http://validator.swagger.io'
const apiGetURL = '/validator/debug'
const apiGetQueryParams = {
  url: 'https://example.com/example.json',
}

t.create('Invalid')
  .get(getURL)
  .intercept(nock =>
    nock(apiURL)
      .get(apiGetURL)
      .query(apiGetQueryParams)
      .reply(200, {
        schemaValidationMessages: [
          {
            level: 'error',
            message: 'error',
          },
        ],
      }),
  )
  .expectBadge({
    label: 'swagger',
    message: 'invalid',
    color: 'red',
  })

t.create('Valid json 2.0')
  .get(
    '/3.0.json?specUrl=https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json',
  )
  .intercept(nock =>
    nock('http://validator.swagger.io')
      .get('/validator/debug')
      .query({
        url: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/json/petstore-expanded.json',
      })
      .reply(200, {
        schemaValidationMessages: [],
      }),
  )
  .expectBadge({
    label: 'swagger',
    message: 'valid',
    color: 'brightgreen',
  })

t.create('Valid yaml 3.0')
  .get(
    '/3.0.json?specUrl=https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/petstore.yaml',
  )
  .intercept(nock =>
    nock('http://validator.swagger.io')
      .get('/validator/debug')
      .query({
        url: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/petstore.yaml',
      })
      .reply(200, {
        schemaValidationMessages: [],
      }),
  )
  .expectBadge({
    label: 'swagger',
    message: 'valid',
    color: 'brightgreen',
  })

t.create('Valid with warnings')
  .get(`${getURLBase}https://petstore3.swagger.io/api/v3/openapi.json`)
  .expectBadge({
    label: 'swagger',
    message: 'valid',
    color: 'brightgreen',
  })

// Isn't a spec, but valid json
t.create('Invalid')
  .get(
    '/3.0.json?specUrl=https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v3.0/schema.json',
  )
  .intercept(nock =>
    nock('http://validator.swagger.io')
      .get('/validator/debug')
      .query({
        url: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v3.0/schema.json',
      })
      .reply(200, {
        schemaValidationMessages: [
          {
            level: 'error',
            message: 'Invalid schema',
          },
        ],
      }),
  )
  .expectBadge({
    label: 'swagger',
    message: 'invalid',
    color: 'red',
  })

t.create('Not found')
  .get(
    `${getURLBase}https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v3.0/notFound.yaml`,
  )
  .expectBadge({
    label: 'swagger',
    message: 'spec not found or unreadable',
    color: 'red',
  })
