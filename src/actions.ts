import { GoalRecord, Record, WeeklyRecord } from './types'
import { convertDateToKey } from './utils'

// Record updates
/**
 * Updates the complete record.
 * @param record The current complete record
 * @param day The day of the complete record needed to be updated
 * @param weeklyRecord What to update the given key with.
 * @returns the new complete record
 */
export const updateWeekOfRecord = (
  record: Record,
  day: Date,
  weeklyRecord: WeeklyRecord
): Record => {
  const newCompleteRecord = {
    ...record,
    [convertDateToKey(day)]: weeklyRecord,
  }
  return newCompleteRecord
}

// Weekly Record updates
/**
 * Updates a single goal in a weekly record
 * @param weeklyRecord The current weekly record of goals
 * @param oldGoal The old goal to update
 * @param newGoal The new goal to replace the old goal with. If undefined, then deletes the old goal
 * @returns the new weekly record of goals
 */
export const updateGoalOfRecord = (
  weeklyRecord: WeeklyRecord,
  oldGoal: GoalRecord,
  newGoal?: GoalRecord
): WeeklyRecord => {
  const newRecord = {
    ...weeklyRecord,
  }
  if (oldGoal.name !== newGoal?.name) {
    delete newRecord[oldGoal.name]
  }
  if (newGoal) {
    newRecord[newGoal.name] = newGoal
  }
  return newRecord
}
