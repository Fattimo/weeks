// App Config

export type GoalConfig = {
  name: string
  daysNeeded: number // up to 7
}

export type WeeklyTemplate = {
  [goalName: string]: GoalConfig | undefined
}

export type GoalRecord = GoalConfig & {
  daysCompleted: number[] // an array of day indices, e.g. [1, 3, 5] = M, R, F
}

/**
 * The data of goals for a given week.
 * Consists of goal names (id) mapped to data related to that goal.
 */
export type WeeklyRecord = {
  [goalName: string]: GoalRecord | undefined
}

/**
 * The complete history of goals.
 * A mapping of weeks to the data associated with that week.
 * `week` is determined using `convertDateToKey` in ./utils
 */
export type Record = {
  [week: string]: WeeklyRecord | undefined // week is the iso string of the first day (sunday)
}

export const BASE_GOAL: GoalConfig = {
  name: 'Unnamed Goal',
  daysNeeded: 1,
}

// Date
export const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'R', 'F', 'S']
