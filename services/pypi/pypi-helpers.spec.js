import { test, given, forCases } from 'sazerac'
import {
  parseClassifiers,
  parsePypiVersionString,
  sortPypiVersions,
  getLicenses,
  getPackageFormats,
} from './pypi-helpers.js'

const classifiersFixture = {
  info: {
    classifiers: [
      'Development Status :: 5 - Production/Stable',
      'Environment :: Web Environment',
      'Framework :: Django',
      'Framework :: Django :: 1.10',
      'Framework :: Django :: 1.11',
      'Intended Audience :: Developers',
      'Intended Audience :: Developers',
      'License :: OSI Approved :: BSD License',
      'Operating System :: OS Independent',
      'Natural Language :: English',
      'Programming Language :: Python',
      'Programming Language :: Python :: 2',
      'Programming Language :: Python :: 2.7',
      'Programming Language :: Python :: 3',
      'Programming Language :: Python :: 3.4',
      'Programming Language :: Python :: 3.5',
      'Programming Language :: Python :: 3.6',
      'Topic :: Internet :: WWW/HTTP',
      'Programming Language :: Python :: Implementation :: CPython',
      'Programming Language :: Python :: Implementation :: PyPy',
    ],
  },
}

describe('PyPI helpers', function () {
  test(parseClassifiers, () => {
    given(
      classifiersFixture,
      /^Programming Language :: Python :: ([\d.]+)$/,
    ).expect(['2', '2.7', '3', '3.4', '3.5', '3.6'])

    given(classifiersFixture, /^Framework :: Django :: ([\d.]+)$/).expect([
      '1.10',
      '1.11',
    ])

    given(
      classifiersFixture,
      /^Programming Language :: Python :: Implementation :: (\S+)$/,
    ).expect(['cpython', 'pypy'])

    // regex that matches everything
    given(classifiersFixture, /^([\S\s+]+)$/).expect(
      classifiersFixture.info.classifiers.map(e => e.toLowerCase()),
    )

    // regex that matches nothing
    given(classifiersFixture, /^(?!.*)*$/).expect([])
  })

  test(parsePypiVersionString, () => {
    given('1').expect({ major: 1, minor: 0 })
    given('1.0').expect({ major: 1, minor: 0 })
    given('7.2').expect({ major: 7, minor: 2 })
    given('7.2derpderp').expect({ major: 7, minor: 2 })
    given('7.2.9.5.8.3').expect({ major: 7, minor: 2 })
    given('foo').expect({ major: 0, minor: 0 })
  })

  test(sortPypiVersions, () => {
    // Each of these includes a different variant: 2.0, 2, and 2.0rc1.
    given(['2.0', '1.9', '10', '1.11', '2.1', '2.11']).expect([
      '1.9',
      '1.11',
      '2.0',
      '2.1',
      '2.11',
      '10',
    ])

    given(['2', '1.9', '10', '1.11', '2.1', '2.11']).expect([
      '1.9',
      '1.11',
      '2',
      '2.1',
      '2.11',
      '10',
    ])

    given(['2.0rc1', '10', '1.9', '1.11', '2.1', '2.11']).expect([
      '1.9',
      '1.11',
      '2.0rc1',
      '2.1',
      '2.11',
      '10',
    ])
  })

  test(getLicenses, () => {
    forCases([
      given({
        info: {
          license: null,
          license_expression: 'MIT',
          classifiers: [],
        },
      }),
      given({
        info: {
          license: 'MIT',
          license_expression: null,
          classifiers: [],
        },
      }),
      given({
        info: {
          license: null,
          license_expression: null,
          classifiers: ['License :: OSI Approved :: MIT License'],
        },
      }),
      given({
        info: {
          license: '',
          license_expression: null,
          classifiers: ['License :: OSI Approved :: MIT License'],
        },
      }),
      given({
        info: {
          license:
            'this text is really really really really really really long',
          license_expression: null,
          classifiers: ['License :: OSI Approved :: MIT License'],
        },
      }),
      given({
        info: {
          license: '',
          license_expression: null,
          classifiers: [
            'License :: OSI Approved :: MIT License',
            'License :: DFSG approved',
          ],
        },
      }),
    ]).expect(['MIT'])
    given({
      info: {
        license: '',
        license_expression: null,
        classifiers: ['License :: Public Domain'],
      },
    }).expect(['Public Domain'])
    given({
      info: {
        license: '',
        license_expression: null,
        classifiers: ['License :: Netscape Public License (NPL)'],
      },
    }).expect(['NPL'])
    given({
      info: {
        license: '',
        license_expression: null,
        classifiers: ['License :: OSI Approved :: Apache Software License'],
      },
    }).expect(['Apache-2.0'])
    given({
      info: {
        license: '',
        license_expression: null,
        classifiers: [
          'License :: CC0 1.0 Universal (CC0 1.0) Public Domain Dedication',
        ],
      },
    }).expect(['CC0-1.0'])
    given({
      info: {
        license: '',
        license_expression: null,
        classifiers: [
          'License :: OSI Approved :: GNU Affero General Public License v3',
        ],
      },
    }).expect(['AGPL-3.0'])
    given({
      info: {
        license: '',
        license_expression: null,
        classifiers: ['License :: OSI Approved :: Zero-Clause BSD (0BSD)'],
      },
    }).expect(['0BSD'])
  })

  test(getPackageFormats, () => {
    given({
      urls: [{ packagetype: 'bdist_wheel' }, { packagetype: 'sdist' }],
    }).expect({ hasWheel: true, hasEgg: false })
    given({
      urls: [{ packagetype: 'sdist' }],
    }).expect({ hasWheel: false, hasEgg: false })
    given({
      urls: [
        { packagetype: 'bdist_egg' },
        { packagetype: 'bdist_egg' },
        { packagetype: 'sdist' },
      ],
    }).expect({ hasWheel: false, hasEgg: true })
  })
})
