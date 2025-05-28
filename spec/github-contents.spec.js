import { ServiceTester } from '../core/service-test-runner/service-tester.js'

export const t = new ServiceTester({
  id: 'github-contents',
  title: 'GithubContents',
})

t.create('fetch file contents')
  .get('/github/contents/badges/shields/README.md.json')
  .expectBadge({
    label: 'file',
    message: msg => typeof msg === 'string' && msg.length > 0,
  })

t.create('fetch raw file contents')
  .get('/github/raw/badges/shields/README.md.json')
  .expectBadge({
    label: 'file',
    message: msg => typeof msg === 'string' && msg.length > 0,
  })

t.create('handle non-existent file')
  .get('/github/contents/badges/shields/non-existent-file.md.json')
  .expectBadge({
    label: 'file',
    message: 'repo or file not found',
  })
