import { createSignal, Show, For } from 'solid-js'
import { GoalRecord, GoalConfig } from '../types'
import InlineEdit from './InlineEdit'

const GoalName = ({
  goal,
  editGoal,
  deleteGoal,
  readonly,
}: {
  goal: GoalRecord
  editGoal: (newGoal: GoalConfig) => void
  deleteGoal: () => void
  readonly: boolean
}) => {
  const [editing, setEditing] = createSignal(false)
  const [proposedName, setProposedName] = createSignal(goal.name)
  const [proposedDaysNeeded, setProposedDaysNeeded] = createSignal(
    goal.daysNeeded
  )

  const save = () => {
    setEditing(false)
    if (
      readonly ||
      (proposedName() === goal.name && proposedDaysNeeded() === goal.daysNeeded)
    ) {
      return
    }

    const newGoal = {
      name: proposedName() || 'Unnamed Goal',
      daysNeeded: proposedDaysNeeded() || 1,
    }
    editGoal(newGoal)
  }
  return (
    <div>
      <InlineEdit
        value={proposedName}
        setValue={setProposedName}
        editing={editing}
      />
      <Show when={!readonly}>
        <Show when={!editing()} fallback={<span onClick={save}>(s)</span>}>
          <span onClick={() => setEditing(true)}>(e)</span>
          <span onClick={deleteGoal}>(d)</span>
        </Show>
      </Show>

      <div class="flex gap-1">
        <Show
          when={editing()}
          fallback={
            <For each={[...Array(goal.daysNeeded).keys()]}>
              {(_, i) => (
                <div
                  classList={{
                    'border border-black w-2 aspect-square': true,
                    'bg-red-500': i() < goal.daysCompleted.length,
                  }}
                />
              )}
            </For>
          }
        >
          <For each={[...Array(7).keys()]}>
            {(_, i) => {
              const impossible = i() >= proposedDaysNeeded()
              const completed = i() < goal.daysCompleted.length

              return (
                <div
                  classList={{
                    'border border-black w-2 aspect-square': true,
                    'border-gray-300': impossible,
                    'bg-red-500': completed,
                  }}
                  onClick={() => setProposedDaysNeeded(i() + 1)}
                />
              )
            }}
          </For>
        </Show>
      </div>
    </div>
  )
}

export default GoalName
