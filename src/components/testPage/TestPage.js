// import { debugResource } from "../Constants";
import { useEffect, useState } from "react";
import {
    getStringDateFromDateTime,
    getYearAndWeekFromInputWeekValueString,
    addDaysToDateTime,
    weekToDateRange,
    dateToWeek
} from "../../funcs/funcForDates"





function TestPage() {

    const [startWeekDate, setStartWeekDate] = useState('')
    const [endWeekDate, setEndWeekDate] = useState('')

    const [testResult, setTestResult] = useState()



    function Test_dateToWeek() {
        let date = new Date(0)

        let pYear = 1969;
        let week = 1;

        let outputs = []

        let weeksCnt = 0;

        do {
            let [yearOfWeek, numberOfWeek] = dateToWeek(date)

            let [startDateOfWeek, endDateOfWeek] = weekToDateRange(yearOfWeek, numberOfWeek)

            const compareResult = (date >= startDateOfWeek && date <= endDateOfWeek);

            if (compareResult === false) {
                outputs.push(getStringDateFromDateTime(date) + "\t" + [yearOfWeek, numberOfWeek].join('-') + "\t" + compareResult)
            }

            addDaysToDateTime(date, 1)
        }
        while (date.getUTCFullYear() < 2050)

        outputs.push('good ' + new Date())

        setTestResult(outputs)
    }

    function Test_weekToDateRange() {

        let outArr = []

        let date = new Date(0)

        let pYear = 1969;
        let week = 1;

        let errors = []

        let weeksCnt = 0;

        do {
            if (date.getUTCDay() === 4) {
                if (pYear !== date.getUTCFullYear()) {
                    week = 1;
                    pYear = date.getUTCFullYear()
                }
                else {
                    week++;
                }

                let d = new Date(date)
                addDaysToDateTime(d, -3)

                let [sD, eD] = weekToDateRange(date.getUTCFullYear(), week)

                let compareResult = getStringDateFromDateTime(d) === getStringDateFromDateTime(sD)

                if (compareResult === false) {
                    errors.push([d, sD])
                }

                // outArr.push(date.getUTCFullYear() + "-" + week + "\t" + getStringDateFromDateTime(d) + " === " + getStringDateFromDateTime(sD) + "\t" + compareResult)

                weeksCnt++;
            }

            addDaysToDateTime(date, 1)
        }
        while (date.getUTCFullYear() < 2040)

        console.log('errors count: ' + errors.length)
        console.log('weeksCnt: ' + weeksCnt)

        setTestResult(errors)
    }

    useEffect(() => {
        console.log('useEffect ' + new Date())
    }, [])

    return (
        <>
            <div>
                <input type="week" onChange={e => {
                    let [year, week] = getYearAndWeekFromInputWeekValueString(e.target.value)
                    let dateRange = weekToDateRange(year, week)
                    setStartWeekDate(getStringDateFromDateTime(dateRange[0]))
                    setEndWeekDate(getStringDateFromDateTime(dateRange[1]))
                }} />
            </div>
            <div>{startWeekDate}</div>
            <div>{endWeekDate}</div>
            <div>
                <button onClick={Test_dateToWeek}>Test weekToRangeDate</button>
            </div>
            <div>
                {testResult && <>
                    {testResult.map(item => <div>
                        {item}
                    </div>)}
                </>}
            </div>
        </>
    )
}

export default TestPage;