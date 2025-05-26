import { expect } from 'chai'
import { fetch, fetchJson, fetchText, fetchBuffer } from './fetch.js'

describe('Fetch implementation', function () {
  it('should fetch JSON data', async function () {
    const response = await fetchJson('https://api.github.com/users/badges')
    expect(response).to.have.property('login', 'badges')
  })

  it('should fetch text data', async function () {
    const response = await fetchText('https://raw.githubusercontent.com/badges/shields/master/README.md')
    expect(response).to.be.a('string')
    expect(response).to.include('shields.io')
  })

  it('should fetch binary data', async function () {
    const response = await fetchBuffer('https://raw.githubusercontent.com/badges/shields/master/readme-logo.svg')
    expect(response).to.be.an('ArrayBuffer')
  })

  it('should handle errors', async function () {
    try {
      await fetch('https://api.github.com/nonexistent')
      expect.fail('Expected error was not thrown')
    } catch (error) {
      expect(error).to.be.instanceof(Error)
      expect(error.name).to.equal('FetchError')
      expect(error.statusCode).to.equal(404)
    }
  })
}) 