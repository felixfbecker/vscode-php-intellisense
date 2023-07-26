import * as vscode from 'vscode'
import {
    ProtocolRequestType,
    TextDocumentPositionParams,
    TextDocumentRegistrationOptions,
    WorkDoneProgressOptions,
    WorkDoneProgressParams,
} from 'vscode-languageclient/node'

interface EvaluatableExpression {
    expression?: string
    range: vscode.Range
}

interface EvaluatableExpressionOptions extends WorkDoneProgressOptions {}

interface EvaluatableExpressionParams extends TextDocumentPositionParams, WorkDoneProgressParams {}

interface EvaluatableExpressionRegistrationOptions
    extends TextDocumentRegistrationOptions,
        EvaluatableExpressionOptions {}

export namespace EvaluatableExpressionRequest {
    export const method: 'textDocument/xevaluatableExpression' = 'textDocument/xevaluatableExpression'
    export const type = new ProtocolRequestType<
        EvaluatableExpressionParams,
        EvaluatableExpression | null,
        never,
        void,
        EvaluatableExpressionRegistrationOptions
    >(method)
}
