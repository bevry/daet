/* eslint no-dupe-class-members:0, no-throw-literal:0, no-case-declarations:0, no-use-before-define:0 */
import { StrictUnion } from 'simplytyped'
import memo from '@bevry/memo'
import getSW from 'start-of-week'
const startOfWeek = getSW()

import * as intl from './intl.js'

export type SetUnits = 'millisecond' | 'second' | 'minute' | 'hour'
export type ArithmeticUnits =
	| 'millisecond'
	| 'second'
	| 'minute'
	| 'hour'
	| 'week'
	| 'day'
export type Input = string | number | Date | Daet

export const Millisecond = 1
export const Second = Millisecond * 1000
export const Minute = Second * 60
export const Hour = Minute * 60
export const Day = Hour * 24
export const Week = Day * 7

/** The abstract base tier to use for the human relative date display. */
export interface BaseTier {
	/** How long in milliseconds until this particular tier becomes irrelevant? If not specified then it will be detected automatically. */
	refresh?: number

	/** Generate the human relative date display for this particular tier. */
	message: (opts: { past: boolean; delta: number; when: Daet }) => string
}
/** This tier is relevant until the delta milliseconds is reached. E.g. 1000 milliseconds from now. */
export interface LimitTier extends BaseTier {
	/** Generate a millisecond delta for when this tier is no longer relevant. */
	limit: number
}
/** This tier is relevant until the absolute milliseconds are reached. E.g. Tomorrow at midnight. */
export interface WhenTier extends BaseTier {
	/** Generate an epoch time for when this tier is no longer relevant. */
	when: (opts: { past: boolean }) => number
}

/** A tier to use for the human relative date display. */
export type Tier = StrictUnion<LimitTier | WhenTier>

/** A minimal immutable date class that supports relative time, calendar time, and plus/minus of different units. */
export default class Daet {
	/** The raw date object behind this daet instance. */
	readonly raw: Date

	/** The tiers used for human relative date display. */
	static get tiers(): Tier[] {
		return [
			{
				// right now
				limit: Second,
				refresh: Second,
				message: intl.rightNow,
			},
			{
				// x seconds
				limit: Minute,
				refresh: Second,
				message: intl.relativeDelta,
			},
			{
				// x minutes
				limit: Hour,
				refresh: Minute,
				message: intl.relativeDelta,
			},
			{
				// x hours x minutes
				limit: 12 * Hour,
				refresh: Minute,
				message: intl.relativeDelta,
			},
			{
				// later/earlier today
				when: ({ past }) =>
					past
						? new Daet().reset('hour').getTime()
						: new Daet().plus(1, 'day').reset('hour').getTime(),
				message: intl.earlierOrLaterToday,
			},
			{
				// yesterday or tomorrow
				when: ({ past }) =>
					past
						? new Daet().minus(1, 'day').reset('hour').getTime()
						: new Daet().plus(2, 'day').reset('hour').getTime(),
				message: intl.yesterdayOrTommorow,
			},
			{
				// this week
				when: ({ past }) =>
					past
						? new Daet().endOfLastWeek().getTime()
						: new Daet().startOfNextWeek().getTime(),
				message: intl.relativeThisWeek,
			},
			{
				// next or last week
				when: ({ past }) =>
					past
						? new Daet().endOfLastWeek().endOfLastWeek().getTime()
						: new Daet().startOfNextWeek().startOfNextWeek().getTime(),
				message: intl.relativeSecondWeek,
			},
			{
				// earlier or later
				limit: Infinity,
				message: intl.earlierOrLater,
			},
		]
	}

	/** Create a new daet instance based on the input */
	static create(input?: Input): Daet {
		return new this(input)
	}

	/** Create a new daet instance based on the input */
	constructor(input?: Input) {
		this.raw =
			input instanceof Daet
				? new Date(input.raw)
				: input
				? new Date(input)
				: new Date()
		this.raw.setMilliseconds(0)
	}

	/** Return a new daet instance that is in the past by the value amount. */
	minus(value: number, unit: ArithmeticUnits): Daet {
		return this.plus(value * -1, unit)
	}

	/** Return a new daet instance that is in the future by the value amount. */
	plus(value: number, unit: ArithmeticUnits): Daet {
		switch (unit) {
			case 'millisecond': {
				const next = new Date(this.raw.getTime() + value)
				return new Daet(next)
			}
			case 'second': {
				return this.plus(value * Second, 'millisecond')
			}
			case 'minute': {
				return this.plus(value * Minute, 'millisecond')
			}
			case 'hour': {
				return this.plus(value * Hour, 'millisecond')
			}
			case 'day': {
				return this.plus(value * Day, 'millisecond')
			}
			case 'week': {
				return this.plus(value * Week, 'millisecond')
			}
			default:
				// https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html
				const neverCheck: never = unit
				throw new Error('unknown unit')
		}
	}

	/** Clone this daet instance based on its raw value. */
	private rawClone() {
		return new Date(this.raw)
	}

	/** Clone this daet instance. */
	clone() {
		return new Daet(this)
	}

	/** Return a new daet instance that has the unit set to the desired value. */
	set(value: number, unit: SetUnits): Daet {
		switch (unit) {
			case 'millisecond': {
				const next = this.rawClone().setMilliseconds(value)
				return new Daet(next)
			}
			case 'second': {
				const next = this.rawClone().setSeconds(value)
				return new Daet(next)
			}
			case 'minute': {
				const next = this.rawClone().setMinutes(value)
				return new Daet(next)
			}
			case 'hour': {
				const next = this.rawClone().setHours(value)
				return new Daet(next)
			}
			default:
				// https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html
				const neverCheck: never = unit
				throw new Error('unknown unit')
		}
	}

	/** Return a new daet instance that has the desired unit reset to 0. */
	reset(unit: SetUnits): Daet {
		switch (unit) {
			case 'millisecond': {
				const next = this.rawClone().setMilliseconds(0)
				return new Daet(next)
			}
			case 'second': {
				const next = this.rawClone().setSeconds(0, 0)
				return new Daet(next)
			}
			case 'minute': {
				const next = this.rawClone().setMinutes(0, 0, 0)
				return new Daet(next)
			}
			case 'hour': {
				const next = this.rawClone().setHours(0, 0, 0, 0)
				return new Daet(next)
			}
			default:
				// https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html
				const neverCheck: never = unit
				throw new Error('unknown unit')
		}
	}

	/** Get the epoch time of this daet instance. */
	getTime = memo((): number => this.raw.getTime())

	/** Get the milliseconds from the passed daet instance to this daet instance. */
	getMillisecondsFrom(from: Daet): number {
		const now = from.getTime()
		const time = this.getTime()
		return time - now
	}

	/** Get the milliseconds from now to this daet instance */
	getMillisecondsFromNow(): number {
		return this.getMillisecondsFrom(new Daet())
	}

	/** Use https://devdocs.io/javascript/global_objects/datetimeformat to format our daet instance. */
	format(locale: string, options: object): string {
		return new Intl.DateTimeFormat(locale, options).format(this.raw)
	}

	/** Return a new daet instance that is the start of the week proceeding that of this daet instance. */
	startOfNextWeek = memo((): Daet => {
		// continue until we become the start of next week
		let latest: Daet = this.plus(1, 'day')
		while (latest.raw.getDay() !== startOfWeek) {
			latest = latest.plus(1, 'day')
		}
		// reset the time, so we become the start time of that week
		return latest.reset('hour')
	})

	/** Return a new daet instance that is the end of the week preceeding that of this daet instance. */
	endOfLastWeek = memo((): Daet => {
		// continue until we become the start of this week
		let latest: Daet = this
		while (latest.raw.getDay() !== startOfWeek) {
			latest = latest.minus(1, 'day')
		}
		// reset the time, then minus a second, so we become the end of the prior week
		return latest.reset('hour').minus(1, 'second')
	})

	/** Get the human absolute date display for this daet instance. */
	calendar(): string {
		return this.format('en', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
		})
	}

	/** Return the human relative display from now, as well as the millisecond delta before a refresh is needed. */
	fromNowDetails() {
		const now = new Daet()
		const nowTime = now.getTime()
		const eventTime = this.getTime()
		const past = nowTime > eventTime
		const delta = Math.abs(eventTime - nowTime)
		const tiers = Daet.tiers
		let lastTierDelta: number = 0
		for (const tier of tiers) {
			const limit = tier.limit
			const when = tier.when ? tier.when({ past }) : 0
			const tierDelta = limit || Math.abs(when - nowTime)
			if (delta < tierDelta) {
				const message = tier.message({ past, delta, when: this })
				const refresh = tier.refresh || delta - lastTierDelta
				return { message, refresh }
			}
			lastTierDelta = tierDelta
		}
		throw new Error('no tier matched the input delta')
	}

	/** Return the human relative display from now. */
	fromNow() {
		return this.fromNowDetails().message
	}

	/** Return the ISO string for this daet instance. */
	toISOString = memo(() => this.raw.toISOString())

	/** Return the JSON string for this daet instance. */
	toJSON = memo(() => this.raw.toJSON())
}
