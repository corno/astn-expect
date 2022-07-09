import * as pl from "pareto-lib-core"

import * as astn from "astn-expect-api"

export function printExpectedValueType(vt: astn.ExpectedValueType): string {
    switch (vt) {
        case "array": {
            return `an array ([] or <>)`
        }
        case "shorthand group": {
            return `a shorhand type (<>)`
        }
        case "boolean": {
            return `a boolean (true/false)`
        }
        case "dictionary": {
            return `a dictionary ( {} )`
        }
        case "list": {
            return `a list ( [] )`
        }
        case "nothing": {
            return `nothing`
        }
        case "null": {
            return `'null'`
        }
        case "number": {
            return `a number`
        }
        case "object": {
            return `an object ( {} or () )`
        }
        case "string": {
            return `a string (quoted, apostrophed, multiline or non wrapped (including a number, a keyword, a boolean)`
        }
        case "quoted string": {
            return `a string with quotes`
        }
        case "nonwrapped string": {
            return `a string without quotes or aposthropes`
        }
        case "tagged union": {
            return `a tagged union ( | "statename" data )`
        }
        case "type": {
            return `a type ( () )`
        }
        case "type or shorthand group": {
            return `a type ( () ) or a shorhand type (<>)`
        }
        case "verbose group": {
            return `a verbose group ( () )`
        }
        default:
            return pl.au(vt[0])
    }
}

export function printExpectedValue(vt: astn.ExpectedValue): string {
    return `${printExpectedValueType(vt.type)}${vt["null allowed"] ? 'or null' : ''}`
}
