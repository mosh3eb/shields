import semver from 'semver'

const description =
  '[Ruby Gems](https://rubygems.org/) is a registry for ruby libraries'

function latest(versions) {
  // latest Ruby Gems version, including pre-releases
  return semver.maxSatisfying(versions, '>0')
}

function versionColor(version) {
  if (!semver.valid(version)) {
    return 'lightgrey'
  }

  version = `${version}`
  let first = version[0]
  if (first === 'v') {
    first = version[1]
  }

  if (first === '0' || semver.prerelease(version)) {
    return 'orange'
  }
  return 'blue'
}

export { description, latest, versionColor }
