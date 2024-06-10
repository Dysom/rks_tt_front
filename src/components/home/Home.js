import { useState, useEffect } from "react";
import styled from "styled-components";
import { jsonPostRequestToServer } from "../../funcs/funcs";
import { addDaysToDateTime, dateToWeek, getDateFromStringDate, getInputWeekValueStringFromYearAndWeek, getStringDateFromDateTime, getStringDateFromDateTimestamp, getYearAndWeekFromInputWeekValueString, weekToDateRange } from "../../funcs/funcForDates"

const DatesSection = styled.section`

    display: flex;
    
    & input {
        margin: 5px;
    }

    & > * {
        margin: 10px;
    }

    .aux-date {        
        font-style: italic;
        color: #454545;        
    }

    @-moz-document url-prefix() {
        .aux-date-moz-hidden {
            visibility: hidden;
        }
     }
`

const EmpsSection = styled.div`

    display: flex;

    .emps-section {
        padding: 20px;
        text-align: left;
    }

    .emps-section__header {
        margin-bottom: 15px;
        font-weight: bold;
        font-size: 1.2em;
    }

    .emps-section__e-item {
        padding: 3px 0;
    }

    .emps-section__d-item {
        padding: 5px 0;
    }
`

const ButtonAppend = styled.button`
    padding: 10px;
    font-size: 1.15em;
    font-weight: bold
    
`

const HistogramShell = styled.div`
    padding: 10px;
    display: flex;
    align-items: center;

    & * {
        margin: 5px;
    }

    & .histogram-fio {
        width: 300px;
        text-align: right;        
    }

    & .histogram {
        width: 300px;
    }

    & .histogram__fill {        
        height: 1.2em;        
        background-color: #3b3;
    }
`

function Home() {

    const [displayHistograms, setDisplayHistograms] = useState(false)
    const [departments, setDepartments] = useState([])
    const [employees, setEmployees] = useState([])

    const [minDate, setMinDate] = useState(getStringDateFromDateTimestamp())
    const [maxDate, setMaxDate] = useState(getStringDateFromDateTimestamp())
    const [startDate, setStartDate] = useState(getStringDateFromDateTimestamp())
    const [endDate, setEndDate] = useState(getStringDateFromDateTimestamp())

    const [aggregateFuncName, setAggregateFuncName] = useState('AVG')

    const [empsTimeDict, setEmpsTimeDict] = useState(new Map());

    const [maxEmpTime, setMaxEmpTime] = useState(0)
    const [checkedAllEmployees, setCheckedAllEmployees] = useState(false)

    const getAndAppendInitialData = () => {

        jsonPostRequestToServer('/commands', {
            'command': 'select_all_departmens_employees_and_minmax_dates'
        }, () => {

        }, (jsonResponse) => {
            console.log(jsonResponse)

            setMinDate(getStringDateFromDateTimestamp(jsonResponse.minDateTimestamp))
            setMaxDate(getStringDateFromDateTimestamp(jsonResponse.maxDateTimestamp))
            setStartDate(getStringDateFromDateTimestamp(jsonResponse.minDateTimestamp))
            setEndDate(getStringDateFromDateTimestamp(jsonResponse.maxDateTimestamp))

            setDepartments(jsonResponse.departments ? jsonResponse.departments.map((item) => (item)) : [])
            setEmployees(jsonResponse.employees ? jsonResponse.employees.map((item) => ({ ...item, 'checked': false })) : [])
        })
    }

    const getTimeTrackingData = () => {

        const checkedEmployees = employees.filter(item => item.checked)

        if (checkedEmployees.length === 0) {
            alert('Должен быть выбран хотя бы один сотрудник')
            return;
        }

        jsonPostRequestToServer('/commands', {
            'command': 'select_timeTracking',
            'startDate': "" + new Date(startDate).getTime(),
            'endDate': "" + new Date(endDate).getTime(),
            'aggregateFunc': aggregateFuncName,
            'employeesIds': checkedEmployees.map(item => item.employee_id)
        }, () => {

        }, (jsonResponse) => {
            setDisplayHistograms(true)
            // console.log(jsonResponse)

            let maxEmpTime_ = 0;

            (jsonResponse.time_tracks ? jsonResponse.time_tracks : []).forEach(item => {
                let time_ = parseInt(item.time)

                if (time_ > maxEmpTime_) {
                    maxEmpTime_ = time_
                }

                setMaxEmpTime(maxEmpTime_)
            })

            setEmpsTimeDict(new Map(
                (jsonResponse.time_tracks ? jsonResponse.time_tracks : []).map(item => {
                    return [item.employee_id, parseInt(item.time)];
                })
            ))
        })
    }

    const setCheckedEmployeesByDepartmentId = (departmentId) => {

        setEmployees(employees.map(item => {
            return { ...item, 'checked': item.checked || item.department_id === departmentId }
        }))
    }

    const setCheckedEmployeesByEmployeeId = (employeeId, checked) => {

        setCheckedAllEmployees(false)

        setEmployees(employees.map(item => {
            return { ...item, 'checked': item.employee_id === employeeId ? checked : item.checked }
        }))
    }

    useEffect(() => {

        getAndAppendInitialData()
    }, [])

    return (
        <>
            {(displayHistograms === false) &&
                <>
                    {
                        (employees.length === 0) &&
                        <>
                            <h1>Нет данных для фильтрации, необходимо заполнить базу данных</h1>
                        </>
                    }
                    {
                        (employees.length > 0) &&
                        <>
                            <DatesSection>
                                <div className="aux-date">
                                    <span>Дата:</span>
                                    <input type="date" name="one_day_date" min={minDate} max={maxDate} onChange={e => {
                                        setStartDate(e.target.value)
                                        setEndDate(e.target.value)
                                    }} />
                                </div>
                                <div className="aux-date aux-date-moz-hidden">
                                    <span>Неделя:</span>
                                    <input type="week" name="week_date"
                                        min={getInputWeekValueStringFromYearAndWeek(dateToWeek(getDateFromStringDate(minDate)))}
                                        max={getInputWeekValueStringFromYearAndWeek(dateToWeek(getDateFromStringDate(maxDate)))}
                                        onChange={e => {
                                            if (e.target.type === 'week') {
                                                let [year, week] = getYearAndWeekFromInputWeekValueString(e.target.value)
                                                let [startWeekDateStr, endWeekDateStr] = weekToDateRange(year, week)

                                                startWeekDateStr = getStringDateFromDateTime(startWeekDateStr)
                                                endWeekDateStr = getStringDateFromDateTime(endWeekDateStr)

                                                if (startWeekDateStr > maxDate) {
                                                    startWeekDateStr = maxDate
                                                }

                                                if (startWeekDateStr < minDate) {
                                                    startWeekDateStr = minDate
                                                }

                                                if (endWeekDateStr < minDate) {
                                                    endWeekDateStr = minDate
                                                }

                                                if (endWeekDateStr > maxDate) {
                                                    endWeekDateStr = maxDate
                                                }

                                                setStartDate(startWeekDateStr)
                                                setEndDate(endWeekDateStr)
                                            }
                                            else {
                                                e.target.value = ''
                                            }
                                        }} />
                                </div>
                                <div className="aux-date aux-date-moz-hidden">
                                    <span>Месяц:</span>
                                    <input type="month" name="month_date"
                                        min={minDate.split('-').filter((i, index) => index < 2).join('-')}
                                        max={maxDate.split('-').filter((i, index) => index < 2).join('-')}
                                        onChange={e => {
                                            if (e.target.type === 'month') {

                                                let startMonthDateStr = e.target.value + '-01';
                                                let date = getDateFromStringDate(startMonthDateStr)

                                                date.setUTCMonth(date.getUTCMonth() + 1)
                                                addDaysToDateTime(date, -1)
                                                let endMonthDateStr = getStringDateFromDateTime(date);

                                                if (startMonthDateStr > maxDate) {
                                                    startMonthDateStr = maxDate
                                                }

                                                if (startMonthDateStr < minDate) {
                                                    startMonthDateStr = minDate
                                                }

                                                if (endMonthDateStr < minDate) {
                                                    endMonthDateStr = minDate
                                                }

                                                if (endMonthDateStr > maxDate) {
                                                    endMonthDateStr = maxDate
                                                }

                                                setStartDate(startMonthDateStr)
                                                setEndDate(endMonthDateStr)
                                            }
                                            else {
                                                e.target.value = ''
                                            }
                                        }} />
                                </div>
                            </DatesSection>
                            <DatesSection>
                                <div>
                                    <span>Начальная дата:</span>
                                    <input type="date" name="min_date" min={minDate} max={endDate} value={startDate} onChange={e => setStartDate(e.target.value)} />
                                </div>
                                <div>
                                    <span>Конечная дата:</span>
                                    <input type="date" name="max_date" min={startDate} max={maxDate} value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div><input type="radio" value="AVG" checked={aggregateFuncName === 'AVG'} id="radio_avg" onChange={() => setAggregateFuncName('AVG')} /> <label htmlFor="radio_avg">Среднее значение</label></div>
                                    <div><input type="radio" value="MEDIAN" checked={aggregateFuncName === 'MEDIAN'} id="radio_median" onChange={() => setAggregateFuncName('MEDIAN')} /> <label htmlFor="radio_median">Медиана</label></div>
                                </div>
                                <div>
                                    <ButtonAppend onClick={getTimeTrackingData}>Применить</ButtonAppend>
                                </div>
                            </DatesSection>
                            <EmpsSection>
                                <div className="emps-section">
                                    <div className="emps-section__header">Сотрудники:</div>
                                    <div className="emps-section__body">
                                        <div className="emps-section__e-item">
                                            <input type='checkbox' checked={checkedAllEmployees} onChange={e => {

                                                setEmployees(employees.map(item => {
                                                    return { ...item, 'checked': e.target.checked }
                                                }))

                                                setCheckedAllEmployees(e.target.checked)
                                            }} />

                                        </div>
                                        {
                                            employees.map((item) => (
                                                <div key={'emp_' + item.employee_id} className="emps-section__e-item">
                                                    <input type='checkbox' id={'checkbox_emp_' + item.employee_id} checked={item.checked} value={item.employee_id} onChange={e => setCheckedEmployeesByEmployeeId(e.target.value, e.target.checked)} />
                                                    {' '}<label htmlFor={'checkbox_emp_' + item.employee_id}>{item.name + " " + item.surname + " " + item.patronymic + " " + item.position}</label>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                                <div className="emps-section">
                                    <div className="emps-section__header">Отделы:</div>
                                    <div className="emps-section__body">
                                        {
                                            departments.map((item) => (
                                                <div key={'dep_' + item.department_id} className="emps-section__d-item">{item.name}{' '}<button onClick={() => { setCheckedEmployeesByDepartmentId(item.department_id) }}>Установить</button></div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </EmpsSection>
                        </>
                    }
                </>}
            {
                (displayHistograms) &&
                <>
                    <div style={{ marginBottom: '30px' }}>
                        <ButtonAppend onClick={() => { setDisplayHistograms(false) }}>Вернуться к параметрам</ButtonAppend>
                    </div>
                    {(empsTimeDict.size === 0) && <>
                        <div>Нет данных для выбранных сотрудников за период времени</div>
                    </>}
                    {(empsTimeDict.size > 0) &&
                        <>
                            <div style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '1.05' }}>
                                {
                                    (aggregateFuncName === 'AVG') &&
                                    <>
                                        Среднее время работы
                                    </>
                                }
                                {
                                    (aggregateFuncName === 'MEDIAN') &&
                                    <>
                                        Медианное время работы
                                    </>
                                }
                            </div>
                            <div>
                                {
                                    employees.filter(emp => empsTimeDict.has(emp.employee_id)).map(emp => ({ ...emp, 'time': empsTimeDict.get(emp.employee_id) }))
                                        .sort((emp1, emp2) => (emp2.time - emp1.time))
                                        .map(emp =>
                                            <HistogramShell key={"h-sh_" + emp.employee_id}><div className="histogram-fio">{emp.name + " " + emp.surname + " " + emp.patronymic}{' '}<span className="nowrap">{emp.position}</span></div> {
                                                (() => {
                                                    return <>
                                                        <div className="histogram"><div className="histogram__fill" style={{ width: Math.round(emp.time * 100 / maxEmpTime) + '%' }}></div></div>
                                                        <div className="histogram-txt">{Math.floor(emp.time / 60) + 'ч. ' + (emp.time % 60) + 'мин.'}</div>
                                                    </>
                                                })()
                                            }</HistogramShell>
                                        )
                                }
                            </div>
                        </>
                    }
                </>
            }
        </>
    )
}

export default Home;