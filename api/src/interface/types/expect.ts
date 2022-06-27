
export type ExpectSeverity =
    | ["warning", {}]
    | ["error", {}]
    | ["nothing", {}]

export type OnDuplicateEntry =
    | ["ignore", {}]
    | ["overwrite", {}]