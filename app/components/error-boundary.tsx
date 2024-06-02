import { isRouteErrorResponse, useRouteError } from "@remix-run/react"
import { getErrorMessage } from "~/lib/utils"

export function GeneralError({
  unexpectedError: unexpectedError = (error) => <p>{getErrorMessage(error)}</p>,
}: {
  unexpectedError?: (error: unknown) => JSX.Element | null
}) {
  const error = useRouteError()
  return (
    <div className="container bg-destructive text-xl font-bold grid place-items-center w-full h-full text-white text-center">
      {isRouteErrorResponse(error) ? (
        <div>
          <h1>
            {error.status} {error.statusText}
          </h1>
          <p>{error.data}</p>
        </div>
      ) : (
        unexpectedError(error)
      )}
    </div>
  )
}
