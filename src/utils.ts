import { Accessor, createSignal } from 'solid-js'

export const getWeeklyDateRange = (reference?: Date) => {
  const curr = reference || new Date() // get current date
  const first = curr.getDate() - curr.getDay() // First day is the day of the month - the day of the week
  const last = first + 6 // last day is the first day + 6

  const firstDay = new Date(curr.setDate(first))
  const lastDay = new Date(curr.setDate(last))

  return [firstDay, lastDay]
}

export const convertDateToKey = (date: Date) => {
  return `${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`
}

export const createLocalStorageSignal = <T>(
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
