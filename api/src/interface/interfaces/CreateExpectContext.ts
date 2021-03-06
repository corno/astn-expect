import { OnExpectIssue } from "./OnExpectIssue";
import { IExpectContext } from "./IExpectContext";
import { ExpectSeverity, OnDuplicateEntry } from "../types/expect";

export type CreateExpectContext_In<EventAnnotation> = {
    issueHandler: OnExpectIssue<EventAnnotation>
    duplicateEntrySeverity: ExpectSeverity
    onDuplicateEntry: OnDuplicateEntry
}

export type CreateExpectContext<EventAnnotation> = (
    $: CreateExpectContext_In<EventAnnotation>
    ) => IExpectContext<EventAnnotation>