export function cache<T>(
    fn: () => Promise<T>,
    timeoutMs: (success: boolean) => number
) {
    let p: Promise<T> | undefined
    let deadline = 0
    return async () => {
        if (!p || Date.now() > deadline) {
            deadline = Infinity
            p = fn()
            p.then(() => {
                deadline = Date.now() + timeoutMs(true)
            }).catch(() => {
                deadline = Date.now() + timeoutMs(false)
            })
        }
        return await p
    }
}
