import {
  Accessor,
  Component,
  createSignal,
  For,
  onMount,
  Setter,
  Show,
} from 'solid-js'

import styles from './App.module.css'

const GOAL_CONFIG_KEY = 'GOAL_CONFIG'
const GOAL_RECORD_KEY = 'GOAL_RECORD'

type GoalConfig = {
  name: string
  daysNeeded: number // up to 7
}

type WeeklyTemplate = {
  [goalName: string]: GoalConfig | undefined
}

type GoalRecord = GoalConfig & {
  daysCompleted: number[] // an array of day indices, e.g. [1, 3, 5] = M, R, F
}

type WeeklyRecord = {
  [goalName: string]: GoalRecord | undefined
}

type Record = {
  [week: string]: WeeklyRecord | undefined // week is the iso string of the first day (sunday)
}

const getWeeklyDateRange = (reference?: Date) => {
  const curr = reference || new Date() // get current date
  const first = curr.getDate() - curr.getDay() // First day is the day of the month - the day of the week
  const last = first + 6 // last day is the first day + 6

  const firstDay = new Date(curr.setDate(first))
  const lastDay = new Date(curr.setDate(last))

  return [firstDay, lastDay]
}

const convertDateToKey = (date: Date) => {
  return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`
}

const InlineEdit = ({
  value,
  setValue,
  editing,
}: {
  value: Accessor<string>
  setValue: Setter<string>
  editing: Accessor<boolean>
}) => {
  return (
    <Show when={editing()} fallback={<div class={styles.GoalRow}>{value}</div>}>
      <input
        value={value()}
        onBlur={() => {
          const newValue = value()
          setValue(newValue)
        }}
        onChange={(e) => setValue(e.currentTarget.value)}
      />
    </Show>
  )
}

const GoalName = ({
  goal,
  setGoalConfig,
  deleteGoal,
}: {
  goal: GoalRecord
  setGoalConfig: (goal: GoalRecord, config: GoalConfig) => void
  deleteGoal: () => void
}) => {
  const [editing, setEditing] = createSignal(false)
  const [proposedName, setProposedName] = createSignal(goal.name)
  const [proposedDaysNeeded, setProposedDaysNeeded] = createSignal(
    goal.daysNeeded
  )

  const save = () => {
    setEditing(false)
    if (
      proposedName() === goal.name &&
      proposedDaysNeeded() === goal.daysNeeded
    ) {
      return
    }

    const newConfig = {
      name: proposedName() || 'Unnamed Goal',
      daysNeeded: proposedDaysNeeded() || 1,
    }
    setGoalConfig(goal, newConfig)
  }
  return (
    <div>
      <InlineEdit
        value={proposedName}
        setValue={setProposedName}
        editing={editing}
      />
      <Show when={!editing()} fallback={<span onClick={save}>(s)</span>}>
        <span onClick={() => setEditing(true)}>(e)</span>
        <span onClick={deleteGoal}>(d)</span>
      </Show>

      <div class={styles.CounterContainer}>
        <Show
          when={editing()}
          fallback={
            <For each={[...Array(goal.daysNeeded).keys()]}>
              {(_, i) => (
                <div
                  classList={{
                    [styles.Counter]: true,
                    [styles.active]: i() < goal.daysCompleted.length,
                  }}
                />
              )}
            </For>
          }
        >
          <For each={[...Array(7).keys()]}>
            {(_, i) => (
              <div
                classList={{
                  [styles.Counter]: true,
                  [styles.editing]: true,
                  [styles.impossible]: i() >= proposedDaysNeeded(),
                  [styles.active]: i() < goal.daysCompleted.length,
                }}
                onClick={() => setProposedDaysNeeded(i() + 1)}
              />
            )}
          </For>
        </Show>
      </div>
    </div>
  )
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'R', 'F', 'S']
const BASE_GOAL: GoalConfig = {
  name: 'Unnamed Goal',
  daysNeeded: 1,
}
const GoalRow = ({
  goal,
  toggleGoal,
  setGoalConfig,
  deleteGoal,
}: {
  goal: GoalRecord
  toggleGoal: (goal: GoalRecord, dayIndex: number) => void
  setGoalConfig: (goal: GoalRecord, config: GoalConfig) => void
  deleteGoal: () => void
}) => {
  return (
    <>
      <GoalName
        goal={goal}
        setGoalConfig={setGoalConfig}
        deleteGoal={deleteGoal}
      />
      <For each={DAYS_OF_WEEK}>
        {(_, i) => (
          <input
            type="checkbox"
            onChange={() => toggleGoal(goal, i())}
            checked={goal.daysCompleted.includes(i())}
          />
        )}
      </For>
    </>
  )
}

const createLocalStorageSignal = <T,>(
  key: string,
  defaultValue?: T
): [Accessor<T>, (newValue: T) => void] => {
  const stored = window.localStorage.getItem(key)
  const initial: T = stored ? JSON.parse(stored) : defaultValue || {}
  const [value, setValueSignal] = createSignal(initial)
  const setValue = (newValue: T) => {
    try {
      const string = JSON.stringify(newValue)
      window.localStorage.setItem(key, string)
      setValueSignal(() => newValue)
    } catch (e) {
      console.error(e, 'could not store record!')
    }
  }
  return [value, setValue]
}

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
    const newCompleteRecord = {
      ...record(),
      [convertDateToKey(firstDay())]: newRecord,
    }
    setRecord(newCompleteRecord)
    setCurrentRecord(newRecord)
  }
  const toggleGoal = (goal: GoalRecord, dayIndex: number) => {
    const filteredDaysCompleted = goal.daysCompleted.filter(
      (d) => d !== dayIndex
    )
    if (filteredDaysCompleted.length === goal.daysCompleted.length) {
      filteredDaysCompleted.push(dayIndex)
    }
    const newRecord = {
      ...currentRecord(),
      [goal.name]: {
        ...goal,
        daysCompleted: filteredDaysCompleted,
      },
    }
    updateCurrentRecord(newRecord)
  }
  const setGoalConfig = (goal: GoalRecord, newConfig: GoalConfig) => {
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
  const deleteGoal = (goal: GoalConfig) => {
    const originalName = goal.name
    const { [originalName]: _originalGoal, ...cleanedRecord } =
      currentRecord() || {}
    const { [originalName]: _originalConfig, ...cleanedConfig } = config()
    setConfig(cleanedConfig)
    updateCurrentRecord(cleanedRecord)
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

  return (
    <div class={styles.Container}>
      Weeks
      <div>
        <span onClick={() => changeWeek(true)}>&#60; </span>
        Current Week: {firstDay().toLocaleDateString()} -{' '}
        {lastDay().toLocaleDateString()}
        <span onClick={() => changeWeek(false)}> &#62;</span>
      </div>
      <div class={styles.GoalGrid}>
        <div />
        <For each={DAYS_OF_WEEK}>{(d) => <div>{d}</div>}</For>
        <Show when={currentRecord()} keyed>
          {(record) => (
            <For each={Object.values(record)}>
              {(goal) => (
                <Show when={goal} keyed>
                  {(g) => (
                    <GoalRow
                      goal={g}
                      toggleGoal={toggleGoal}
                      setGoalConfig={setGoalConfig}
                      deleteGoal={() => deleteGoal(g)}
                    />
                  )}
                </Show>
              )}
            </For>
          )}
        </Show>
        <div class={styles.AddButton} onClick={() => addConfig(BASE_GOAL)}>
          +
        </div>
      </div>
    </div>
  )
}

export default App
