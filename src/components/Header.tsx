import { Accessor, Show } from 'solid-js'

interface HeaderProps {
  incrementWeek: () => void
  decrementWeek: () => void
  fromDate: Accessor<Date>
  toDate: Accessor<Date>
  readonly: () => boolean
}

const Header = ({
  incrementWeek,
  decrementWeek,
  fromDate,
  toDate,
  readonly,
}: HeaderProps) => {
  return (
    <div>
      <div class="font-bold">Weeks</div>
      <span onClick={decrementWeek}>&#60; </span>
      {readonly() ? 'Past Week: ' : 'Current Week: '}
      {fromDate().toLocaleDateString()} - {toDate().toLocaleDateString()}
      <Show when={readonly()}>
        <span onClick={incrementWeek}> &#62;</span>
      </Show>
    </div>
  )
}

export default Header
