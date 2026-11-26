/**
 * Promise-based confirm dialog, replacing window.confirm.
 *
 *   if (!(await confirm({ title: 'Delete group?', body: '...', danger: true }))) return
 *
 * A single <ConfirmHost /> in App renders the dialog.
 */
let listener = null

export function confirm(options) {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(window.confirm(options.title))
      return
    }
    listener({ ...options, resolve })
  })
}

export function subscribeToConfirm(fn) {
  listener = fn
  return () => {
    if (listener === fn) listener = null
  }
}
