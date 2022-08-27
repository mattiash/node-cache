/**
 * Wrap a function in a cache and return possibly cached values from the function.
 * Guarantees that only a single request to the original function is done at a time,
 * even if there are multiple calls to the cached function in rapid succession
 *
 * The return value from timeoutMs decides how long a value is cached.
 * `success` is true if fn resolved and false otherwise.
 *
 * The cache timeout starts running AFTER the fn resolves or rejects. If fn does not reolve or reject,
 * all calls to the cached function will be blocked forever! Make sure that the original function always
 * resolves or rejects eventually.
 *
 */
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
