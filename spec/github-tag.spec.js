import { ServiceTester } from '../core/service-test-runner/service-tester.js'

export const t = new ServiceTester({ id: 'github-tag', title: 'GithubTag' })

t.create('fetch tag version')
  .get('/github/v/tag/badges/shields.json')
  .expectBadge({
    label: 'tag',
    message: msg => typeof msg === 'string' && msg.length > 0,
  })

t.create('handle non-existent repository')
  .get('/github/v/tag/non-existent-user/non-existent-repo.json')
  .expectBadge({
    label: 'tag',
    message: 'repo not found',
  })
// Note: Submodule tests require a repo with submodules, which may not be available in public repos.
