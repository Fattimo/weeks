import { Accessor, Setter, Show } from 'solid-js'

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
    <Show
      when={editing()}
      fallback={<div class="whitespace-nowrap">{value}</div>}
    >
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

export default InlineEdit
