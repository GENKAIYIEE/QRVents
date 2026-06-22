"use client"

import { toast as sonnerToast } from "sonner"

interface ToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  const success = (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    })
  }

  const error = (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration ?? 5000,
      action: options?.action
        ? { label: options.action.label, onClick: options.action.onClick }
        : undefined,
    })
  }

  const info = (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    })
  }

  const warning = (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration ?? 4000,
    })
  }

  const loading = (message: string) => {
    return sonnerToast.loading(message)
  }

  const dismiss = (id?: string | number) => {
    sonnerToast.dismiss(id)
  }

  const promise = <T,>(
    fn: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) => {
    return sonnerToast.promise(fn, messages)
  }

  return { success, error, info, warning, loading, dismiss, promise, toast: sonnerToast }
}
