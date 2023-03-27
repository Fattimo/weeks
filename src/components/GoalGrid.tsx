import { Show, createSignal, For, Accessor } from 'solid-js'
import { updateGoalOfRecord } from '../actions'
import { DAYS_OF_WEEK, GoalConfig, GoalRecord, WeeklyRecord } from '../types'
import GoalRow from './GoalRow'

interface GoalGridProps {
  weeklyRecord: Accessor<WeeklyRecord | undefined>
  updateWeeklyRecord: (newRecord: WeeklyRecord) => void
  onAddGoal: () => void
  onDeleteGoal: (goal: GoalConfig) => void
  onEditGoal: (originalGoal: GoalRecord, newGoal: GoalConfig) => void
  readonly: () => boolean
}

const GoalGrid = ({
  weeklyRecord,
  updateWeeklyRecord,
  onAddGoal,
  onDeleteGoal,
  onEditGoal,
  readonly,
}: GoalGridProps) => {
  const toggleGoal = (goal: GoalRecord, dayIndex: number) => {
    // Get all days with goal complete that are not the current day
    const filteredDaysCompleted = goal.daysCompleted.filter(
      (d) => d !== dayIndex
    )
    // If it's equal to the actual all days with goal complete, we're adding the current day.
    // Otherwise, we've already filtered out the current day (removed current day)
    if (filteredDaysCompleted.length === goal.daysCompleted.length) {
      filteredDaysCompleted.push(dayIndex)
    }
    const newGoal = {
      ...goal,
      daysCompleted: filteredDaysCompleted,
    }
    const newRecord = updateGoalOfRecord(weeklyRecord() || {}, goal, newGoal)
    updateWeeklyRecord(newRecord)
  }

  return (
    <div class="grid grid-cols-goal-grid">
      <div />
      <For each={DAYS_OF_WEEK}>{(d) => <div>{d}</div>}</For>
      <Show when={weeklyRecord()} keyed>
        {(record) => (
          <For each={Object.values(record)}>
            {(goal) => (
              <Show when={goal} keyed>
                {(g) => (
                  <GoalRow
                    goal={g}
                    toggleGoal={toggleGoal}
                    editGoal={(newGoal) => onEditGoal(g, newGoal)}
                    deleteGoal={() => onDeleteGoal(g)}
                    readonly={readonly}
                  />
                )}
              </Show>
            )}
          </For>
        )}
      </Show>
      <Show when={!readonly()}>
        <div class="col-span-8 flex justify-center" onClick={onAddGoal}>
          +
        </div>
      </Show>
    </div>
  )
}

export default GoalGrid
