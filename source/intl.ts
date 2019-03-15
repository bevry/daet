import { Hour, Minute, Second, default as Daet } from './index'

export function rightNow() {
	return 'right now'
}
export function relativeTicks({
	past,
	ticks
}: {
	past: boolean
	ticks: string
}) {
	return past ? `${ticks} ago` : `in ${ticks}`
}
export function seconds({ seconds }: { seconds: number }) {
	return `${seconds} ${seconds > 1 ? 'seconds' : 'second'}`
}
export function relativeSeconds(opts: { past: boolean; seconds: number }) {
	const ticks = seconds({ seconds: opts.seconds })
	return relativeTicks({ past: opts.past, ticks })
}
export function minutes({ minutes }: { minutes: number }) {
	return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'}`
}
export function relativeMinutes(opts: { past: boolean; minutes: number }) {
	const ticks = minutes({ minutes: opts.minutes })
	return relativeTicks({ past: opts.past, ticks })
}
export function hours({ hours }: { hours: number }) {
	return `${hours} ${hours > 1 ? 'hours' : 'hour'}`
}
export function hoursAndMinutes(opts: { hours: number; minutes: number }) {
	return hours(opts) + (opts.minutes ? ' ' + minutes(opts) : '')
}
export function yesterdayOrTommorow({ past }: { past: boolean }) {
	return past ? 'yesterday' : 'tomorrow'
}
export function relativeHoursAndMinutes(opts: {
	past: boolean
	hours: number
	minutes: number
}) {
	const ticks = hoursAndMinutes({ hours: opts.hours, minutes: opts.minutes })
	return relativeTicks({ past: opts.past, ticks })
}
export function relativeDelta(opts: { past: boolean; delta: number }) {
	if (opts.delta < Minute) {
		const seconds = Math.floor(opts.delta / Second)
		if (seconds) return relativeSeconds({ past: opts.past, seconds })
	}
	const hours = Math.floor(opts.delta / Hour)
	const minutes = Math.floor((opts.delta - hours * Hour) / Minute)
	if (hours) return relativeHoursAndMinutes({ past: opts.past, hours, minutes })
	if (minutes) return relativeMinutes({ past: opts.past, minutes })
	return rightNow()
}
export function weekdayThisWeek({ weekday }: { weekday: string }) {
	return `this ${weekday}`
}
export function weekdayNextWeek({ weekday }: { weekday: string }) {
	return `next ${weekday}`
}
export function fewSeconds({ past }: { past: boolean }) {
	return past ? 'a few seconds ago' : 'in a few seconds'
}
export function underMinute({ past }: { past: boolean }) {
	return past ? 'under a minute ago' : 'in under a minute'
}
export function earlierOrLaterToday({ past }: { past: boolean }) {
	return past ? 'earlier today' : 'later today'
}
export function earlierOrLater({ past }: { past: boolean }) {
	return past ? 'sometime earlier' : 'sometime later'
}
export function earlierThisWeek() {
	return 'earlier this week'
}
export function earlierLastWeek() {
	return 'earlier last week'
}
export function relativeThisWeek({
	past,
	when
}: {
	past: boolean
	when: Daet
}) {
	return past
		? earlierThisWeek()
		: weekdayThisWeek({
				weekday: when.format('en', {
					weekday: 'long'
				})
		  })
}
export function relativeSecondWeek({
	past,
	when
}: {
	past: boolean
	when: Daet
}) {
	return past
		? earlierLastWeek()
		: weekdayNextWeek({
				weekday: when.format('en', {
					weekday: 'long'
				})
		  })
}
