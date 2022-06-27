import * as sp from "astn-handlers-api"

export type ExpectedElement<EventAnnotation> = {
    name: string
    getHandler: () => sp.IRequiredValueHandler<EventAnnotation>
}

export type ExpectedElements<EventAnnotation> = ExpectedElement<EventAnnotation>[]

export type ExpectedProperty<EventAnnotation> = {
    onExists: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => sp.IRequiredValueHandler<EventAnnotation>
    onNotExists: null | (($: {
        beginToken: sp.OpenObjectToken<EventAnnotation>
        endToken: sp.CloseObjectToken<EventAnnotation>
    }) => void) //if onNotExists is null and the property does not exist, an error will be raised
}

export type ExpectedProperties<EventAnnotation> = {
    [key: string]: ExpectedProperty<EventAnnotation>
}

export type Options<EventAnnotation> = {
    [key: string]: (
        taggedUnionToken: sp.TaggedUnionToken<EventAnnotation>,
        optionData: sp.SimpleStringToken<EventAnnotation>,
    ) => sp.IRequiredValueHandler<EventAnnotation>
}

export type OnInvalidType<EventAnnotation> = null | (($: {
    annotation: EventAnnotation
}) => void)

export type ExpectDictionaryParameters<EventAnnotation> = {
    onBegin?: ($: {
        token: sp.OpenObjectToken<EventAnnotation>
    }) => void
    onProperty: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => sp.IRequiredValueHandler<EventAnnotation>
    onEnd?: ($: {
        annotation: EventAnnotation
    }) => void
    onInvalidType?: OnInvalidType<EventAnnotation>
    onNull?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
}

export type ExpectListParameters<EventAnnotation> = {
    onBegin?: ($: {
        token: sp.OpenArrayToken<EventAnnotation>
    }) => void
    onElement: () => sp.IValueHandler<EventAnnotation>
    onEnd?: ($: {
        annotation: EventAnnotation
    }) => void
    onInvalidType?: OnInvalidType<EventAnnotation>
    onNull?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
}

export type ExpectTaggedUnionParameters<EventAnnotation> = {
    options?: Options<EventAnnotation>
    onUnexpectedOption?: ($: {
        taggedUnionToken: sp.TaggedUnionToken<EventAnnotation>
        optionToken: sp.SimpleStringToken<EventAnnotation>
    }) => void
    onMissingOption?: () => void
    onInvalidType?: OnInvalidType<EventAnnotation>
    onNull?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
}

export type ExpectVerboseGroupParameters<EventAnnotation> = {
    properties?: ExpectedProperties<EventAnnotation>
    onBegin?: ($: {
        token: sp.OpenObjectToken<EventAnnotation>
    }) => void
    onEnd?: ($: {
        hasErrors: boolean
        annotation: EventAnnotation
    }) => void
    onUnexpectedProperty?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => sp.IRequiredValueHandler<EventAnnotation>
    onInvalidType?: OnInvalidType<EventAnnotation>
    onNull?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
}

export type ExpectStringParameters<EventAnnotation> = {
    callback: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
    onInvalidType?: OnInvalidType<EventAnnotation>
    onNull?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
}

export type ExpectQuotedStringParameters<EventAnnotation> = {
    callback: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
    onInvalidType?: OnInvalidType<EventAnnotation>
    onNull?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
    warningOnly?: boolean
}

export type ExpectNonwrappedStringParameters<EventAnnotation> = {
    callback: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
    onInvalidType?: OnInvalidType<EventAnnotation>
    onNull?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
    warningOnly?: boolean
}

export type ExpectShorthandGroupParameters<EventAnnotation> = {
    elements?: ExpectedElements<EventAnnotation>
    onBegin?: ($: {
        token: sp.OpenArrayToken<EventAnnotation>
    }) => void
    onEnd?: ($: {
        annotation: EventAnnotation
    }) => void
    onInvalidType?: OnInvalidType<EventAnnotation>
    onNull?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
}

export type ExpectGroupParameters<EventAnnotation> = {
    properties?: ExpectedProperties<EventAnnotation>
    elements?: ExpectedElements<EventAnnotation>
    onTypeBegin?: ($: {
        token: sp.OpenObjectToken<EventAnnotation>
    }) => void
    onTypeEnd?: ($: {
        hasErrors: boolean
        annotation: EventAnnotation
    }) => void
    onUnexpectedProperty?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => sp.IRequiredValueHandler<EventAnnotation>
    onShorthandGroupBegin?: ($: {
        token: sp.OpenArrayToken<EventAnnotation>
    }) => void
    onShorthandGroupEnd?: ($: {
        annotation: EventAnnotation
    }) => void
    onInvalidType?: OnInvalidType<EventAnnotation>
    onNull?: ($: {
        token: sp.SimpleStringToken<EventAnnotation>
    }) => void
}
export type IExpectContext<EventAnnotation> = {
    expectSimpleString($: ExpectStringParameters<EventAnnotation>): sp.IValueHandler<EventAnnotation>
    expectQuotedString($: ExpectQuotedStringParameters<EventAnnotation>): sp.IValueHandler<EventAnnotation>
    expectNonWrappedString($: ExpectNonwrappedStringParameters<EventAnnotation>): sp.IValueHandler<EventAnnotation>
    expectDictionary($: ExpectDictionaryParameters<EventAnnotation>): sp.IValueHandler<EventAnnotation>
    expectVerboseGroup($: ExpectVerboseGroupParameters<EventAnnotation>): sp.IValueHandler<EventAnnotation>
    expectList($: ExpectListParameters<EventAnnotation>): sp.IValueHandler<EventAnnotation>
    expectShorthandGroup($: ExpectShorthandGroupParameters<EventAnnotation>): sp.IValueHandler<EventAnnotation>
    expectGroup($: ExpectGroupParameters<EventAnnotation>): sp.IValueHandler<EventAnnotation>
    expectTaggedUnion($: ExpectTaggedUnionParameters<EventAnnotation>): sp.IValueHandler<EventAnnotation>

}