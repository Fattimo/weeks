import { For } from 'solid-js'
import { GoalRecord, GoalConfig, DAYS_OF_WEEK } from '../types'
import GoalName from './GoalName'

interface GoalRowProps {
  goal: GoalRecord
  toggleGoal: (goal: GoalRecord, dayIndex: number) => void
  editGoal: (newGoal: GoalConfig) => void
  deleteGoal: () => void
  readonly: () => boolean
}

const GoalRow = ({
  goal,
  toggleGoal,
  editGoal,
  deleteGoal,
  readonly,
}: GoalRowProps) => {
  return (
    <>
      <GoalName
        goal={goal}
        editGoal={editGoal}
        deleteGoal={deleteGoal}
        readonly={readonly()}
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

export default GoalRow
