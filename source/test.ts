import kava from 'kava'
import { equal } from 'assert-helpers'

import { Second, Minute, Hour, Day, default as Daet } from './index.js'

kava.suite('Daet', function (suite, test) {
	test('plus', function () {
		const d = Daet.create()
		equal(d.getMillisecondsFromNow(), 0, 'zero')
		equal(d.plus(1, 'second').getMillisecondsFromNow(), Second, '1 second')
		equal(
			d.plus(15, 'second').getMillisecondsFromNow(),
			15 * Second,
			'15 seconds',
		)
		equal(d.plus(1, 'minute').getMillisecondsFromNow(), Minute, '1 minute')
		equal(
			d.plus(15, 'minute').getMillisecondsFromNow(),
			15 * Minute,
			'15 minutes',
		)
		equal(d.plus(1, 'hour').getMillisecondsFromNow(), Hour, '1 hour')
		equal(d.plus(15, 'hour').getMillisecondsFromNow(), 15 * Hour, '15 hours')
		equal(d.plus(1, 'day').getMillisecondsFromNow(), Day, '1 day')
		equal(d.plus(15, 'day').getMillisecondsFromNow(), 15 * Day, '15 days')
		equal(d.plus(400, 'day').getMillisecondsFromNow(), 400 * Day, '400 days')
	})
	test('fromNow', function () {
		const d = Daet.create()
		equal(d.fromNow(), 'right now')
		equal(d.plus(2, 'second').fromNow(), 'in 2 seconds')
		equal(d.plus(1, 'second').fromNow(), 'in 1 second')
		equal(d.plus(15, 'second').fromNow(), 'in 15 seconds')
		equal(d.plus(1, 'minute').fromNow(), 'in 1 minute')
		equal(
			d.plus(1, 'minute').plus(30, 'second').fromNow(),
			'in 1 minute',
			'in 1 minute 30 seconds',
		)
		equal(d.plus(15, 'minute').fromNow(), 'in 15 minutes')
		equal(d.plus(1, 'hour').fromNow(), 'in 1 hour')
		equal(
			d.plus(1, 'hour').plus(30, 'minute').fromNow(),
			'in 1 hour 30 minutes',
		)
		// equal(d.plus(13, 'hour').fromNow(), 'later today', '13 hours')
		equal(d.plus(1, 'day').fromNow(), 'tomorrow', 'in 1 day')
		equal(
			d.startOfNextWeek().plus(2, 'day').fromNow(),
			'next Wednesday', // tests run on ISO-8601 which make Monday start of week
		)
		equal(d.plus(15, 'day').fromNow(), 'sometime later', 'in 15 days')
		equal(d.plus(400, 'day').fromNow(), 'sometime later', 'in 400 days')
	})
})
