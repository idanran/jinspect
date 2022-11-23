// Forked from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race#using_promise.race_to_detect_the_status_of_a_promise
export function promiseState(promise: Promise<unknown>): Promise<promiseDetails> {
    const pendingState = { status: "pending" } as const

    return Promise.race([promise, pendingState]).then(
        (value) =>
            value === pendingState ? pendingState : { status: "fulfilled", result: value },
        (reason) => ({ status: "rejected", result: reason }),
    )
}

interface promiseDetails {
    status: "pending" | "fulfilled" | "rejected"
    result?: unknown
}