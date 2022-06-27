import { DiagnosticSeverity } from "../types/DiagnosticSeverity"
import { ExpectIssue } from "../types/ExpectIssue"

export type OnExpectIssue<EventAnnotation> = ($: {
    issue: ExpectIssue
    severity: DiagnosticSeverity
    annotation: EventAnnotation
}) => void