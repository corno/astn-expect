/* eslint
*/
import * as pl from "pareto-lib-core"
import * as pr from "pareto-runtime"
import * as th from "astn-handlers-api"
import * as astn from "astn-expect-api"

interface ICreateContext<EventAnnotation> {
    createDictionaryHandler(
        onEntry: ($: {
            token: th.SimpleStringToken<EventAnnotation>
        }) => th.IRequiredValueHandler<EventAnnotation>,
        onBegin?: ($: {
            token: th.OpenObjectToken<EventAnnotation>
        }) => void,
        onEnd?: ($: {
            annotation: EventAnnotation
        }) => void,
    ): th.OnObject<EventAnnotation>
    createVerboseGroupHandler(
        expectedProperties?: astn.ExpectedProperties<EventAnnotation>,
        onBegin?: ($: {
            token: th.OpenObjectToken<EventAnnotation>
        }) => void,
        onEnd?: ($: {
            hasErrors: boolean
            annotation: EventAnnotation
        }) => void,
        onUnexpectedProperty?: ($: {
            token: th.SimpleStringToken<EventAnnotation>
        }) => th.IRequiredValueHandler<EventAnnotation>,
    ): th.OnObject<EventAnnotation>
    createShorthandGroupHandler(
        expectedElements?: astn.ExpectedElements<EventAnnotation>,
        onBegin?: ($: {
            token: th.OpenArrayToken<EventAnnotation>
        }) => void,
        onEnd?: ($: {
            annotation: EventAnnotation
        }) => void
    ): th.OnArray<EventAnnotation>
    createListHandler(
        onElement: () => th.IValueHandler<EventAnnotation>,
        onBegin?: ($: {
            token: th.OpenArrayToken<EventAnnotation>
        }) => void,
        onEnd?: ($: {
            annotation: EventAnnotation
        }) => void,
    ): th.OnArray<EventAnnotation>
    createTaggedUnionHandler(
        options?: astn.Options<EventAnnotation>,
        onUnexpectedOption?: ($: {
            taggedUnionToken: th.TaggedUnionToken<EventAnnotation>
            optionToken: th.SimpleStringToken<EventAnnotation>
        }) => void,
        onMissingOption?: () => void,
    ): th.OnTaggedUnion<EventAnnotation>
    createUnexpectedSimpleStringHandler(
        expected: astn.ExpectedValue,
        onInvalidType?: astn.OnInvalidType<EventAnnotation>,
        onNull?: ($: {
            token: th.SimpleStringToken<EventAnnotation>
        }) => void,
    ): th.OnSimpleString<EventAnnotation>
    createUnexpectedMultilineStringHandler(
        expected: astn.ExpectedValue,
        onInvalidType?: astn.OnInvalidType<EventAnnotation>,
    ): th.OnMultilineString<EventAnnotation>
    createNullHandler(
        expected: astn.ExpectedValue,
        onInvalidType?: astn.OnInvalidType<EventAnnotation>,
    ): th.OnSimpleString<EventAnnotation>
    createUnexpectedTaggedUnionHandler(
        expected: astn.ExpectedValue,
        onInvalidType?: astn.OnInvalidType<EventAnnotation>,
    ): th.OnTaggedUnion<EventAnnotation>
    createUnexpectedObjectHandler(
        expected: astn.ExpectedValue,
        onInvalidType?: astn.OnInvalidType<EventAnnotation>,
    ): th.OnObject<EventAnnotation>
    createUnexpectedArrayHandler(
        expected: astn.ExpectedValue,
        onInvalidType?: astn.OnInvalidType<EventAnnotation>,
    ): th.OnArray<EventAnnotation>
}

function createCreateContext<EventAnnotation>(
    issueHandler: astn.OnExpectIssue<EventAnnotation>,
    createDummyValueHandler: () => th.IValueHandler<EventAnnotation>,
    duplicateEntrySeverity: astn.ExpectSeverity,
    onDuplicateEntry: astn.OnDuplicateEntry,
): ICreateContext<EventAnnotation> {

    function raiseWarning(issue: astn.ExpectIssue, annotation: EventAnnotation): void {
        issueHandler({
            issue: issue,
            severity: ["warning", {}],
            annotation: annotation,
        })
    }
    function raiseError(issue: astn.ExpectIssue, annotation: EventAnnotation): void {
        issueHandler({
            issue: issue,
            severity: ["error", {}],
            annotation: annotation,
        })
    }

    function createDummyRequiredValueHandler(): th.IRequiredValueHandler<EventAnnotation> {
        return {
            exists: createDummyValueHandler(),
            missing: () => { },
        }
    }

    return {
        createDictionaryHandler: (onEntry, onBegin, onEnd) => {
            return (data) => {

                if (data.token.token.type[0] !== "dictionary") {
                    raiseWarning(["object is not a dictionary", {}], data.token.annotation)
                }
                if (onBegin) {
                    onBegin(data)
                }
                const foundEntries: string[] = []
                return {
                    property: (propertyData) => {
                        const process = (): th.IRequiredValueHandler<EventAnnotation> => {
                            if (foundEntries.indexOf(propertyData.token.token.value) === -1) {
                                switch (duplicateEntrySeverity[0]) {
                                    case "error":
                                        raiseError(["duplicate entry", { key: propertyData.token.token.value }], propertyData.token.annotation)
                                        break
                                    case "nothing":
                                        break
                                    case "warning":
                                        raiseWarning(["duplicate entry", { key: propertyData.token.token.value }], propertyData.token.annotation)
                                        break
                                    default:
                                        pl.au(duplicateEntrySeverity[0])
                                }
                                switch (onDuplicateEntry[0]) {
                                    case "ignore":
                                        return createDummyRequiredValueHandler()
                                    case "overwrite":
                                        return onEntry(propertyData)
                                    default:
                                        return pl.au(onDuplicateEntry[0])
                                }
                            } else {
                                return onEntry(propertyData)
                            }

                        }
                        const vh = process()
                        foundEntries.push(propertyData.token.token.value)
                        return vh
                    },
                    onEnd: (endData) => {
                        if (onEnd) {
                            onEnd(endData.token)
                        }
                    },
                }
            }
        },
        createVerboseGroupHandler: (expectedProperties, onBegin, onEnd, onUnexpectedProperty) => {
            const properties = expectedProperties ? expectedProperties : {}
            return (data) => {

                if (data.token.token.type[0] !== "verbose group") {
                    raiseWarning(["object is not a verbose group", {}], data.token.annotation)
                }
                if (onBegin) {
                    onBegin(data)
                }
                const foundProperies: string[] = []
                let hasErrors = false
                return {
                    property: ($$) => {
                        const onProperty = (): th.IRequiredValueHandler<EventAnnotation> => {
                            const expected = properties[$$.token.token.value]
                            if (expected === undefined) {
                                hasErrors = true
                                raiseError(["unexpected property", {
                                    "found key": $$.token.token.value,
                                    "valid keys": pr.Objectkeys(properties).sort(),
                                }], $$.token.annotation)
                                if (onUnexpectedProperty !== undefined) {
                                    return onUnexpectedProperty($$)
                                } else {
                                    return {
                                        exists: createDummyValueHandler(),
                                        missing: () => { },
                                    }
                                }
                            }
                            return expected.onExists($$)
                        }
                        const process = (): th.IRequiredValueHandler<EventAnnotation> => {
                            if (foundProperies.indexOf($$.token.token.value) !== -1) {
                                switch (duplicateEntrySeverity[0]) {
                                    case "error":
                                        raiseError(["duplicate property", { name: $$.token.token.value }], $$.token.annotation)
                                        break
                                    case "nothing":
                                        break
                                    case "warning":
                                        raiseWarning(["duplicate property", { name: $$.token.token.value }], $$.token.annotation)
                                        break
                                    default:
                                        return pl.au(duplicateEntrySeverity[0])
                                }
                                switch (onDuplicateEntry[0]) {
                                    case "ignore":
                                        return createDummyRequiredValueHandler()
                                    case "overwrite":
                                        return onProperty()
                                    default:
                                        return pl.au(onDuplicateEntry[0])
                                }
                            } else {
                                return onProperty()
                            }

                        }
                        const vh = process()
                        foundProperies.push($$.token.token.value)
                        return vh
                    },
                    onEnd: (endData) => {
                        pr.Objectkeys(properties).forEach((epName) => {
                            if (foundProperies.indexOf(epName) === -1) {
                                const ep = properties[epName]
                                if (ep.onNotExists === null) {
                                    raiseError(["missing property", { name: epName }], data.token.annotation)//FIX print location properly
                                    hasErrors = true
                                } else {
                                    ep.onNotExists({
                                        beginToken: data.token,
                                        endToken: endData.token,
                                    })
                                }
                            }
                        })
                        if (onEnd) {
                            onEnd({
                                hasErrors: hasErrors,
                                annotation: endData.token.annotation,
                            })
                        }

                    },
                }
            }
        },
        createShorthandGroupHandler: (
            expectedElements,
            onBegin,
            onEnd,
        ) => {
            const elements = expectedElements ? expectedElements : []
            return (typeData) => {
                if (onBegin) {
                    onBegin(typeData)
                }
                if (typeData.token.token.type[0] !== "shorthand group") {
                    raiseWarning(["array is not a shorthand group", {}], typeData.token.annotation)
                }
                let index = 0
                return {
                    element: () => {
                        const ee2 = pr.getElement(elements, index)
                        index++
                        if (ee2 === undefined) {
                            const dvh = createDummyValueHandler()
                            return {
                                object: (data) => {
                                    raiseError(["superfluous element", {}], data.token.annotation)
                                    return dvh.object(data)
                                },
                                array: (data) => {
                                    raiseError(["superfluous element", {}], data.token.annotation)
                                    return dvh.array(data)
                                },
                                simpleString: (data) => {
                                    raiseError(["superfluous element", {}], data.token.annotation)
                                    return dvh.simpleString(data)
                                },
                                multilineString: (data) => {
                                    raiseError(["superfluous element", {}], data.token.annotation)
                                    return dvh.multilineString(data)
                                },
                                taggedUnion: (data) => {
                                    raiseError(["superfluous element", {}], data.token.annotation)
                                    return dvh.taggedUnion(data)
                                },
                            }
                        } else {
                            return ee2.getHandler().exists
                        }
                    },
                    onEnd: ($$) => {
                        const missing = elements.length - index
                        if (missing > 0) {
                            raiseError(['elements missing', {
                                names: elements.map((ee2) => {
                                    return ee2.name
                                }),
                            }], $$.token.annotation)
                            for (let x = index; x !== elements.length; x += 1) {
                                const ee2 = pr.getElement(elements, x)
                                ee2.getHandler().missing()
                            }
                        }
                        if (onEnd) {
                            onEnd($$.token)
                        }

                    },
                }
            }
        },
        createListHandler: (
            onElement,
            onBegin,
            onEnd,
        ) => {
            return (data) => {
                if (data.token.token.type[0] !== "list") {
                    raiseWarning(["array is not a list", {}], data.token.annotation)
                }
                if (onBegin) {
                    onBegin(data)
                }
                return {
                    element: () => onElement(),
                    onEnd: (endData) => {
                        if (onEnd) {
                            onEnd(endData.token)
                        }

                    },
                }
            }
        },
        createTaggedUnionHandler: (
            options,
            onUnexpectedOption,
            onMissingOption,
        ) => {
            return (tuData) => {
                return {
                    option: (optionData) => {

                        const optionHandler = options ? options[optionData.token.token.value] : undefined
                        if (optionHandler === undefined) {
                            raiseError(["unknown option", {
                                "found": optionData.token.token.value,
                                "valid options": options ? pr.Objectkeys(options) : [],
                            }], optionData.token.annotation)
                            if (onUnexpectedOption !== undefined) {
                                onUnexpectedOption({
                                    taggedUnionToken: tuData.token,
                                    optionToken: optionData.token,
                                })
                            }
                            return createDummyRequiredValueHandler()
                        } else {
                            return optionHandler(tuData.token, optionData.token)
                        }

                    },
                    missingOption: onMissingOption ? onMissingOption : (): void => { },
                    end: () => { },
                }
            }
        },
        createUnexpectedSimpleStringHandler: (
            expected,
            onInvalidType,
            onNull,
        ) => {
            return (svData) => {
                if (onNull !== undefined && svData.token.token.wrapping[0] === "none" && svData.token.token.value === "null") {
                    onNull(svData)
                } else {
                    if (onInvalidType !== undefined && onInvalidType !== null) {
                        onInvalidType({
                            annotation: svData.token.annotation,
                        })
                    } else {
                        raiseError(["invalid value type", {
                            found: "string",
                            expected: expected,

                        }], svData.token.annotation)
                    }
                }
            }
        },
        createUnexpectedMultilineStringHandler: (
            expected,
            onInvalidType,
        ) => {
            return (svData) => {
                if (onInvalidType !== undefined && onInvalidType !== null) {
                    onInvalidType({
                        annotation: svData.token.annotation,
                    })
                } else {
                    raiseError(["invalid value type", {
                        found: "string",
                        expected: expected,

                    }], svData.token.annotation)
                }
            }
        },
        createNullHandler: (
            expected,
            onInvalidType,
        ) => {
            return (svData) => {
                if (onInvalidType !== undefined && onInvalidType !== null) {
                    onInvalidType({
                        annotation: svData.token.annotation,
                    })
                } else {
                    raiseError(["invalid value type", { found: "string", expected: expected }], svData.token.annotation)
                }
            }
        },
        createUnexpectedTaggedUnionHandler: (
            expected,
            onInvalidType,
        ) => {
            return () => {
                return {
                    option: ($) => {
                        if (onInvalidType !== undefined && onInvalidType !== null) {
                            onInvalidType({
                                annotation: $.token.annotation,
                            })
                        } else {
                            raiseError(["invalid value type", { found: "tagged union", expected: expected }], $.token.annotation)
                        }
                        return createDummyRequiredValueHandler()
                    },
                    missingOption: () => { },
                    end: () => { },
                }
            }
        },
        createUnexpectedObjectHandler: (
            expected,
            onInvalidType,
        ) => {
            return ($) => {
                if (onInvalidType !== undefined && onInvalidType !== null) {
                    onInvalidType({
                        annotation: $.token.annotation,
                    })
                } else {
                    raiseError(
                        ["invalid value type", { found: "object", expected: expected }],
                        $.token.annotation,
                    )
                }
                return {
                    property: (propertyData) => {
                        return {
                            exists: createDummyValueHandler(),
                            missing: () => { },
                        }
                    },
                    onEnd: (_endData) => { },
                }
            }
        },
        createUnexpectedArrayHandler: (
            expected,
            onInvalidType,
        ) => {
            return ($) => {
                if (onInvalidType !== undefined && onInvalidType !== null) {
                    onInvalidType({
                        annotation: $.token.annotation,
                    })
                } else {
                    raiseError(
                        ["invalid value type", { found: "array", expected: expected }],
                        $.token.annotation
                    )
                }
                return {
                    element: () => {
                        return createDummyValueHandler()
                    },
                    onEnd: (_endData) => { },
                }
            }
        },
    }
}

export function createExpectContext<EventAnnotation>($p: {
    issueHandler: astn.OnExpectIssue<EventAnnotation>
    createDummyValueHandler: () => th.IValueHandler<EventAnnotation>
    duplicateEntrySeverity: astn.ExpectSeverity
    onDuplicateEntry: astn.OnDuplicateEntry
}
): astn.IExpectContext<EventAnnotation> {

    function raiseError(issue: astn.ExpectIssue, annotation: EventAnnotation): void {
        $p.issueHandler({
            issue: issue,
            severity: ["error", {}],
            annotation: annotation,
        })
    }
    function raiseWarning(issue: astn.ExpectIssue, annotation: EventAnnotation): void {
        $p.issueHandler({
            issue: issue,
            severity: ["warning", {}],
            annotation: annotation,
        })
    }

    const createContext = createCreateContext(
        $p.issueHandler,
        $p.createDummyValueHandler,
        $p.duplicateEntrySeverity,
        $p.onDuplicateEntry,
    )

    function expectSimpleStringImp(
        expected: astn.ExpectedValue,
        callback: ($: {
            token: th.SimpleStringToken<EventAnnotation>
        }) => void,
        onInvalidType?: astn.OnInvalidType<EventAnnotation>,
    ): th.IValueHandler<EventAnnotation> {
        return {
            array: createContext.createUnexpectedArrayHandler(expected, onInvalidType),
            object: createContext.createUnexpectedObjectHandler(expected, onInvalidType),
            simpleString: callback,
            multilineString: createContext.createUnexpectedMultilineStringHandler(expected, onInvalidType),
            taggedUnion: createContext.createUnexpectedTaggedUnionHandler(expected, onInvalidType),
        }
    }

    return {
        expectSimpleString: ($) => {

            const expectValue: astn.ExpectedValue = {
                "type": "string",
                "null allowed": $.onNull !== undefined,
            }
            return expectSimpleStringImp(expectValue, $.callback, $.onInvalidType)
        },
        expectQuotedString: ($) => {
            const expectValue: astn.ExpectedValue = {
                "type": "quoted string",
                "null allowed": $.onNull !== undefined,
            }
            return expectSimpleStringImp(
                expectValue,
                ($$) => {
                    if ($$.token.token.wrapping[0] !== "quote") {
                        if ($.warningOnly) {
                            raiseWarning(["string is not quoted", {}], $$.token.annotation)
                            return $.callback({
                                token: $$.token,
                            })
                        } else {
                            if ($.onInvalidType) {
                                $.onInvalidType({
                                    annotation: $$.token.annotation,
                                })
                            } else {
                                raiseError(["string is not quoted", {}], $$.token.annotation)
                            }
                        }
                    } else {
                        return $.callback({
                            token: $$.token,
                        })
                    }
                },
                $.onInvalidType
            )
        },
        expectNonWrappedString: ($) => {
            const expectValue: astn.ExpectedValue = {
                "type": "nonwrapped string",
                "null allowed": $.onNull !== undefined,
            }
            return expectSimpleStringImp(
                expectValue,
                ($$) => {
                    if ($$.token.token.wrapping[0] !== "none") {
                        if ($.warningOnly) {
                            raiseWarning(["string should not have quotes or apostrophes", {}], $$.token.annotation)
                            return $.callback({
                                token: $$.token,
                            })
                        } else {
                            if ($.onInvalidType) {
                                $.onInvalidType({
                                    annotation: $$.token.annotation,
                                })
                            } else {
                                raiseError(["string should not have quotes or apostrophes", {}], $$.token.annotation)
                            }
                        }
                    } else {
                        return $.callback({
                            token: $$.token,
                        })
                    }
                },
                $.onInvalidType
            )
        },
        expectDictionary: ($) => {

            const expectValue: astn.ExpectedValue = {
                "type": "dictionary",
                "null allowed": false,
            }
            return {
                array: createContext.createUnexpectedArrayHandler(expectValue, $.onInvalidType),
                object: createContext.createDictionaryHandler($.onProperty, $.onBegin, $.onEnd),
                simpleString: createContext.createUnexpectedSimpleStringHandler(expectValue, $.onInvalidType, $.onNull),
                multilineString: createContext.createUnexpectedMultilineStringHandler(expectValue, $.onInvalidType),
                taggedUnion: createContext.createUnexpectedTaggedUnionHandler(expectValue, $.onInvalidType),
            }
        },
        expectVerboseGroup: ($) => {

            const expectValue: astn.ExpectedValue = {
                "type": "verbose group",
                "null allowed": $.onNull !== undefined,
            }
            return {
                array: createContext.createUnexpectedArrayHandler(expectValue, $.onInvalidType),
                object: createContext.createVerboseGroupHandler(
                    $.properties,
                    $.onBegin,
                    $.onEnd,
                    $.onUnexpectedProperty
                ),
                simpleString: createContext.createUnexpectedSimpleStringHandler(expectValue, $.onInvalidType, $.onNull),
                multilineString: createContext.createUnexpectedMultilineStringHandler(expectValue, $.onInvalidType),
                taggedUnion: createContext.createUnexpectedTaggedUnionHandler(expectValue, $.onInvalidType),
            }
        },
        expectList: ($) => {

            const expectValue: astn.ExpectedValue = {
                "type": "list",
                "null allowed": false,
            }
            return {
                array: createContext.createListHandler($.onElement, $.onBegin, $.onEnd),
                object: createContext.createUnexpectedObjectHandler(expectValue, $.onInvalidType),
                simpleString: createContext.createUnexpectedSimpleStringHandler(expectValue, $.onInvalidType, $.onNull),
                multilineString: createContext.createUnexpectedMultilineStringHandler(expectValue, $.onInvalidType),
                taggedUnion: createContext.createUnexpectedTaggedUnionHandler(expectValue, $.onInvalidType),
            }
        },
        expectShorthandGroup: ($) => {

            const expectValue: astn.ExpectedValue = {
                "type": "shorthand group",
                "null allowed": $.onNull !== undefined,
            }
            return {
                array: createContext.createShorthandGroupHandler($.elements, $.onBegin, $.onEnd),
                object: createContext.createUnexpectedObjectHandler(expectValue, $.onInvalidType),
                simpleString: createContext.createUnexpectedSimpleStringHandler(expectValue, $.onInvalidType, $.onNull),
                multilineString: createContext.createUnexpectedMultilineStringHandler(expectValue, $.onInvalidType),
                taggedUnion: createContext.createUnexpectedTaggedUnionHandler(expectValue, $.onInvalidType),
            }
        },

        expectGroup: ($) => {

            const expectValue: astn.ExpectedValue = {
                "type": "type or shorthand group",
                "null allowed": $.onNull !== undefined,
            }
            return {
                array: createContext.createShorthandGroupHandler($.elements, $.onShorthandGroupBegin, $.onShorthandGroupEnd),
                object: createContext.createVerboseGroupHandler(
                    $.properties,
                    $.onTypeBegin,
                    $.onTypeEnd,
                    $.onUnexpectedProperty
                ),
                simpleString: createContext.createUnexpectedSimpleStringHandler(expectValue, $.onInvalidType, $.onNull),
                multilineString: createContext.createUnexpectedMultilineStringHandler(expectValue, $.onInvalidType),
                taggedUnion: createContext.createUnexpectedTaggedUnionHandler(expectValue, $.onInvalidType),
            }
        },
        expectTaggedUnion: ($) => {

            const expectValue: astn.ExpectedValue = {
                "type": "tagged union",
                "null allowed": $.onNull !== undefined,
            }
            return {
                array: createContext.createUnexpectedArrayHandler(expectValue, $.onInvalidType),
                object: createContext.createUnexpectedObjectHandler(expectValue, $.onInvalidType),
                simpleString: createContext.createUnexpectedSimpleStringHandler(expectValue, $.onInvalidType, $.onNull),
                multilineString: createContext.createUnexpectedMultilineStringHandler(expectValue, $.onInvalidType),
                taggedUnion: createContext.createTaggedUnionHandler(
                    $.options,
                    $.onUnexpectedOption,
                    $.onMissingOption,
                ),
            }
        },
    }
}