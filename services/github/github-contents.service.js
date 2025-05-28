import { GithubAuthV3Service } from './github-auth-service.js'

export default class GithubContents extends GithubAuthV3Service {
  static category = 'other'
  static route = {
    base: 'github',
    pattern: ':variant(contents|raw)/:user/:repo/:path*',
  }

  static examples = [
    {
      title: 'GitHub file contents',
      pattern: 'contents/:user/:repo/:path*',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        path: 'README.md',
      },
      staticPreview: this.render({ content: 'Hello World' }),
      documentation: 'Fetch file contents from GitHub using the Contents API',
    },
    {
      title: 'GitHub raw file',
      pattern: 'raw/:user/:repo/:path*',
      namedParams: {
        user: 'badges',
        repo: 'shields',
        path: 'README.md',
      },
      staticPreview: this.render({ content: 'Hello World' }),
      documentation: 'Fetch raw file contents from GitHub',
    },
  ]

  static defaultBadgeData = {
    label: 'file',
    color: 'blue',
  }

  static render({ content }) {
    return {
      message: content,
    }
  }

  async handle({ variant, user, repo, path }) {
    const response = await this._requestFetcher({
      url: `/repos/${user}/${repo}/contents/${path}`,
      options: {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('repo or file not found')
      }
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const { content, encoding } = await response.json()

    if (encoding !== 'base64') {
      throw new Error('Unexpected encoding')
    }

    const decodedContent = Buffer.from(content, 'base64').toString('utf8')

    if (variant === 'raw') {
      return {
        message: decodedContent,
      }
    }

    return this.constructor.render({ content: decodedContent })
  }
}
