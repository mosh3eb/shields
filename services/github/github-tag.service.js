import gql from 'graphql-tag'
import Joi from 'joi'
import { matcher } from 'matcher'
import { latest, renderVersionBadge } from '../version.js'
import { NotFound, redirector, pathParam } from '../index.js'
import { GithubAuthV4Service } from './github-auth-service.js'
import {
  queryParamSchema,
  openApiQueryParams,
} from './github-common-release.js'
import { documentation, transformErrors } from './github-helpers.js'

const schema = Joi.object({
  data: Joi.object({
    repository: Joi.object({
      refs: Joi.object({
        edges: Joi.array()
          .items({
            node: Joi.object({
              name: Joi.string().required(),
              target: Joi.object({
                oid: Joi.string().required(),
              }).required(),
            }).required(),
          })
          .required(),
      }).required(),
      submodules: Joi.object({
        nodes: Joi.array()
          .items({
            name: Joi.string().required(),
            branch: Joi.string().required(),
          })
          .required(),
      }).required(),
    }).required(),
  }).required(),
}).required()

class GithubTag extends GithubAuthV4Service {
  static category = 'version'

  static route = {
    base: 'github/v/tag',
    pattern: ':user/:repo/:submodule?',
    queryParamSchema,
  }

  static openApi = {
    '/github/v/tag/{user}/{repo}': {
      get: {
        summary: 'GitHub Tag',
        description: documentation,
        parameters: [
          pathParam({ name: 'user', example: 'expressjs' }),
          pathParam({ name: 'repo', example: 'express' }),
          pathParam({
            name: 'submodule',
            example: 'submodule-name',
            required: false,
          }),
          ...openApiQueryParams,
        ],
      },
    },
  }

  static defaultBadgeData = {
    label: 'tag',
  }

  static getLimit({ sort, filter }) {
    if (!filter && sort === 'date') {
      return 1
    }
    return 100
  }

  static applyFilter({ tags, filter }) {
    if (!filter) {
      return tags
    }
    return matcher(tags, filter)
  }

  async fetch({ user, repo, submodule, limit }) {
    return this._requestGraphql({
      query: gql`
        query ($user: String!, $repo: String!, $limit: Int!) {
          repository(owner: $user, name: $repo) {
            refs(
              refPrefix: "refs/tags/"
              first: $limit
              orderBy: { field: TAG_COMMIT_DATE, direction: DESC }
            ) {
              edges {
                node {
                  name
                  target {
                    oid
                  }
                }
              }
            }
            submodules(first: 100) {
              nodes {
                name
                branch
              }
            }
          }
        }
      `,
      variables: { user, repo, limit },
      schema,
      transformErrors,
    })
  }

  static getLatestTag({ tags, sort, includePrereleases }) {
    if (sort === 'semver') {
      return latest(tags, { pre: includePrereleases })
    }
    return tags[0]
  }

  async handle({ user, repo, submodule }, queryParams) {
    const sort = queryParams.sort
    const includePrereleases = queryParams.include_prereleases !== undefined
    const filter = queryParams.filter
    const limit = this.constructor.getLimit({ sort, filter })

    const json = await this.fetch({ user, repo, submodule, limit })

    // Check if submodule exists
    if (submodule) {
      const submodules = json.data.repository.submodules.nodes
      const submoduleInfo = submodules.find(s => s.name === submodule)
      if (!submoduleInfo) {
        throw new NotFound({ prettyMessage: 'submodule not found' })
      }
    }

    const tags = this.constructor.applyFilter({
      tags: json.data.repository.refs.edges.map(edge => edge.node.name),
      filter,
    })

    if (tags.length === 0) {
      const prettyMessage = filter ? 'no matching tags found' : 'no tags found'
      throw new NotFound({ prettyMessage })
    }

    const version = this.constructor.getLatestTag({
      tags,
      sort,
      includePrereleases,
    })

    return renderVersionBadge({
      version,
      tag: submodule ? `${submodule}@${version}` : version,
    })
  }
}

const redirects = {
  GithubTagRedirect: redirector({
    category: 'version',
    route: {
      base: 'github/tag',
      pattern: ':user/:repo/:submodule?',
    },
    transformPath: ({ user, repo, submodule }) =>
      `/github/v/tag/${user}/${repo}${submodule ? `/${submodule}` : ''}`,
    transformQueryParams: params => ({ sort: 'semver' }),
    dateAdded: new Date('2019-08-17'),
  }),
  GithubTagPreRedirect: redirector({
    category: 'version',
    route: {
      base: 'github/tag-pre',
      pattern: ':user/:repo/:submodule?',
    },
    transformPath: ({ user, repo, submodule }) =>
      `/github/v/tag/${user}/${repo}${submodule ? `/${submodule}` : ''}`,
    transformQueryParams: params => ({
      sort: 'semver',
      include_prereleases: null,
    }),
    dateAdded: new Date('2019-08-17'),
  }),
  GithubTagDateRedirect: redirector({
    category: 'version',
    route: {
      base: 'github/tag-date',
      pattern: ':user/:repo/:submodule?',
    },
    transformPath: ({ user, repo, submodule }) =>
      `/github/v/tag/${user}/${repo}${submodule ? `/${submodule}` : ''}`,
    dateAdded: new Date('2019-08-17'),
  }),
}

export { GithubTag, redirects }
