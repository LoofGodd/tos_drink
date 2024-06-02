export type listOfErrors = Array<string | null | undefined> | null | undefined

export function ErrorList({
  id,
  errors,
}: {
  id: string
  errors: listOfErrors
}) {
  const errorToRender = errors?.filter(Boolean)
  if (!errorToRender?.length) return null
  return (
    <ul id={id} className="flex flex-col gap-1">
      {errorToRender.map((e) => (
        <li key={e} className="text-[10px] text-red-500">
          {e}
        </li>
      ))}
    </ul>
  )
}
