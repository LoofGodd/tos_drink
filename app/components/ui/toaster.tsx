import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "~/components/ui/toast"
import { ToastInput } from "~/lib/toast.server"
import { cn } from "~/lib/utils"

export function Toaster({ toasts }: { toasts: Array<ToastInput | null> }) {
  return (
    <ToastProvider>
      {toasts.map(function (toast) {
        if (!toast) return null
        return (
          <Toast
            key={toast.id}
            className={cn(
              "border-2",
              toast.type === "success"
                ? "border-green-500"
                : toast.type === "error"
                ? "border-destructive"
                : "border-secondary"
            )}
          >
            <div className="grid gap-1">
              <ToastTitle className="text-bold">{toast.title}</ToastTitle>
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
