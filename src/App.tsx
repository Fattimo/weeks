import { Component, createSignal, onMount } from 'solid-js'

import {
  BASE_GOAL,
  GoalConfig,
  GoalRecord,
  Record,
  WeeklyRecord,
  WeeklyTemplate,
} from './types'
import {
  convertDateToKey,
  createLocalStorageSignal,
  getWeeklyDateRange,
} from './utils'
import { updateWeekOfRecord } from './actions'
import Header from './components/Header'
import GoalGrid from './components/GoalGrid'

const GOAL_CONFIG_KEY = 'GOAL_CONFIG'
const GOAL_RECORD_KEY = 'GOAL_RECORD'

const App: Component = () => {
  // configuration
  const [config, setConfig] =
    createLocalStorageSignal<WeeklyTemplate>(GOAL_CONFIG_KEY)
  // record
  const [record, setRecord] = createLocalStorageSignal<Record>(GOAL_RECORD_KEY)
  // current week
  const [initialFirstDay, initialLastDay] = getWeeklyDateRange()
  const [firstDay, setFirstDay] = createSignal(initialFirstDay)
  const [lastDay, setLastDay] = createSignal(initialLastDay)
  const isCurrentWeek = () => initialFirstDay.valueOf() !== firstDay().valueOf()
  const [currentRecord, setCurrentRecord] = createSignal(
    record()[convertDateToKey(firstDay())]
  )
  const changeWeek = (decrement?: boolean) => {
    const nextWeek = new Date(firstDay())
    nextWeek.setDate(firstDay().getDate() + (decrement ? -7 : 7))
    const [nextFirstDay, nextLastDay] = getWeeklyDateRange(nextWeek)
    setFirstDay(nextFirstDay)
    setLastDay(nextLastDay)
    setCurrentRecord(record()[convertDateToKey(nextFirstDay)])
  }
  // functions
  const updateCurrentRecord = (newRecord: WeeklyRecord) => {
    // set storage and signal
    const newCompleteRecord = updateWeekOfRecord(
      record(),
      firstDay(),
      newRecord
    )
    setRecord(newCompleteRecord)
    setCurrentRecord(newRecord)
  }

  const compareConfigToCurrentRecord = (newConfig?: WeeklyTemplate) => {
    const recordWithConfig = currentRecord() || {}
    const comparedConfig = newConfig || config()
    // add all of the config into the current record
    Object.values(comparedConfig).forEach((goal) => {
      if (!goal?.name) return
      if (!recordWithConfig[goal.name]) {
        recordWithConfig[goal.name] = {
          ...goal,
          daysCompleted: [],
        }
      }
    })
    // subtract any fields from the record not in the config
    const finalRecord: WeeklyRecord = {}
    Object.values(recordWithConfig).forEach((goal) => {
      if (!goal?.name) return
      if (comparedConfig[goal.name]) {
        finalRecord[goal.name] = goal
      }
    })
    // update record
    updateCurrentRecord(finalRecord)
  }
  onMount(compareConfigToCurrentRecord)

  const addConfig = (newGoal: GoalConfig) => {
    const newConfig = {
      ...config(),
      [newGoal.name]: newGoal,
    }
    setConfig(newConfig)
    compareConfigToCurrentRecord(newConfig)
  }

  const deleteGoal = (goal: GoalConfig) => {
    const originalName = goal.name
    const { [originalName]: _originalGoal, ...cleanedRecord } =
      currentRecord() || {}
    const { [originalName]: _originalConfig, ...cleanedConfig } = config()
    setConfig(cleanedConfig)
    updateCurrentRecord(cleanedRecord)
  }

  const editGoal = (goal: GoalRecord, newConfig: GoalConfig) => {
    const originalName = goal.name
    const { [originalName]: _originalGoal, ...cleanedRecord } =
      currentRecord() || {}
    const newRecord = {
      ...cleanedRecord,
      [newConfig.name]: {
        ...goal,
        ...newConfig,
      },
    }
    const { [originalName]: _originalConfig, ...cleanedConfig } = config()
    const updatedConfig = {
      ...cleanedConfig,
      [newConfig.name]: newConfig,
    }
    setConfig(updatedConfig)
    updateCurrentRecord(newRecord)
  }

  return (
    <div class="flex flex-col justify-center items-center">
      <Header
        incrementWeek={() => changeWeek(false)}
        decrementWeek={() => changeWeek(true)}
        fromDate={firstDay}
        toDate={lastDay}
        readonly={isCurrentWeek}
      />
      <GoalGrid
        weeklyRecord={currentRecord}
        updateWeeklyRecord={updateCurrentRecord}
        onAddGoal={() => addConfig(BASE_GOAL)}
        onDeleteGoal={deleteGoal}
        onEditGoal={editGoal}
        readonly={isCurrentWeek}
      />
    </div>
  )
}

export default App
