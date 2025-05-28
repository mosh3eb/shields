import dayjs from 'dayjs'
import { isMetric, isMetricOverTimePeriod } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const getDateRange = interval => {
  const endDate = dayjs().subtract(24, 'hours')
  const startDate =
    interval === 'dt'
      ? dayjs(0)
      : interval === 'dw'
        ? endDate.subtract(6, 'days')
        : interval === 'dm'
          ? endDate.subtract(30, 'days')
          : endDate
  return {
    start_date: startDate.format('YYYY-MM-DD'),
    end_date: endDate.format('YYYY-MM-DD'),
  }
}

t.create('total downloads')
  .get('/dt/sevenzip.json')
  .intercept(nock =>
    nock('https://sourceforge.net')
      .get('/projects/sevenzip/files/stats/json')
      .query(getDateRange('dt'))
      .reply(200, {
        total: 1000000,
      }),
  )
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('total downloads (with subdirs)')
  .get('/dt/smartmontools/smartmontools/7.1.json')
  .intercept(nock =>
    nock('https://sourceforge.net')
      .get('/projects/smartmontools/files/smartmontools/7.1/stats/json')
      .query(getDateRange('dt'))
      .reply(200, {
        total: 500000,
      }),
  )
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('monthly downloads')
  .get('/dm/sevenzip.json')
  .intercept(nock =>
    nock('https://sourceforge.net')
      .get('/projects/sevenzip/files/stats/json')
      .query(getDateRange('dm'))
      .reply(200, {
        total: 100000,
        timeframe: 'month',
      }),
  )
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('weekly downloads')
  .get('/dw/sevenzip.json')
  .intercept(nock =>
    nock('https://sourceforge.net')
      .get('/projects/sevenzip/files/stats/json')
      .query(getDateRange('dw'))
      .reply(200, {
        total: 25000,
        timeframe: 'week',
      }),
  )
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('daily downloads')
  .get('/dd/sevenzip.json')
  .intercept(nock =>
    nock('https://sourceforge.net')
      .get('/projects/sevenzip/files/stats/json')
      .query(getDateRange('dd'))
      .reply(200, {
        total: 3500,
        timeframe: 'day',
      }),
  )
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('downloads folder')
  .get('/dm/arianne/stendhal.json')
  .intercept(nock =>
    nock('https://sourceforge.net')
      .get('/projects/arianne/files/stendhal/stats/json')
      .query(getDateRange('dm'))
      .reply(200, {
        total: 75000,
        timeframe: 'month',
      }),
  )
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('invalid project')
  .get('/dd/invalid.json')
  .intercept(nock =>
    nock('https://sourceforge.net')
      .get('/projects/invalid/files/stats/json')
      .query(getDateRange('dd'))
      .reply(404),
  )
  .expectBadge({
    label: 'sourceforge',
    message: 'project not found',
  })
