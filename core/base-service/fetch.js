import { getUserAgent } from './got-config.js'

class FetchError extends Error {
  constructor(message, statusCode, response) {
    super(message)
    this.name = 'FetchError'
    this.statusCode = statusCode
    this.response = response
  }
}

export async function fetch(url, options = {}) {
  const headers = {
    'User-Agent': getUserAgent(),
    ...options.headers,
  }

  const response = await globalThis.fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new FetchError(
      `HTTP Error: ${response.status}`,
      response.status,
      response
    )
  }

  return response
}

export async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  })

  return response.json()
}

export async function fetchText(url, options = {}) {
  const response = await fetch(url, options)
  return response.text()
}

export async function fetchBuffer(url, options = {}) {
  const response = await fetch(url, options)
  return response.arrayBuffer()
} 