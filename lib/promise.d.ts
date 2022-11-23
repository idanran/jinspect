export declare function promiseState(promise: Promise<unknown>): Promise<promiseDetails>;
interface promiseDetails {
    status: "pending" | "fulfilled" | "rejected";
    result?: unknown;
}
export {};
