
export function getStringDateFromDateTime(date = new Date(0)) {


    return date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1).toString().padStart(2, "0") + "-" + date.getUTCDate().toString().padStart(2, "0")
}

export function getStringDateFromDateTimestamp(datetimestamp = 0) {

    return getStringDateFromDateTime(new Date(datetimestamp))
}

export function getDateFromStringDate(dateStr) {

    const [year, month, dayOfMonth] = dateStr.split('-').map(item => parseInt(item))

    const date = new Date(0)

    date.setUTCFullYear(year)
    date.setUTCMonth(month - 1)
    date.setUTCDate(dayOfMonth)

    return date
}

export function getYearAndWeekFromInputWeekValueString(yearWeekStr) {

    return yearWeekStr.replace('W', '').split('-').map(val => parseInt(val))
}

export function getInputWeekValueStringFromYearAndWeek([year, week]) {
    return year.toString().padStart('0000') + '-W' + week.toString().padStart('00')
}

export function addDaysToDateTime(dateTime, daysCount) {

    dateTime.setTime(dateTime.getTime() + 86400000 * daysCount)
}

export function weekToDateRange(year, week) {

    let date = new Date(0)
    date.setUTCFullYear(year)
    let firstDayOfYear = date.getUTCDay()

    if (firstDayOfYear === 0) {
        firstDayOfYear = 7;
    }

    date.setUTCDate(date.getUTCDate() + (firstDayOfYear > 4 ? (8 - firstDayOfYear) : (1 - firstDayOfYear))) // первый понедельник года
    date.setUTCDate(date.getUTCDate() + (week - 1) * 7)  // первый понедельник недели
    return [new Date(date.getTime()), new Date(date.setUTCDate(date.getUTCDate() + 6))]
}

export function dateToWeek(dateIn) {

    let date = new Date(dateIn)

    let day = date.getUTCDay()

    if (day === 0) {
        day = 7
    }

    addDaysToDateTime(date, 4 - day) // выставляем дату на четверг недели, в которой находится исходная дата

    let year = date.getUTCFullYear()

    let yearStartDate = new Date(0)
    yearStartDate.setUTCFullYear(year) // первое число года

    let yearStartDay = yearStartDate.getUTCDay()

    if (yearStartDay === 0) {
        yearStartDay = 7
    }

    addDaysToDateTime(yearStartDate, ((yearStartDay > 4) ? 11 : 4) - yearStartDay) // двигаем на первый четверг года

    let weekCountBeetween = (date - yearStartDate) / (7 * 86400000)

    return [yearStartDate.getUTCFullYear(), weekCountBeetween + 1]
}