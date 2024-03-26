/*********************************************************************************\
* Copyright (c) 2024 Flammrock                                                    *
*                                                                                 *
* Permission is hereby granted, free of charge, to any person obtaining a copy    *
* of this software and associated documentation files (the "Software"), to deal   *
* in the Software without restriction, including without limitation the rights    *
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell       *
* copies of the Software, and to permit persons to whom the Software is           *
* furnished to do so, subject to the following conditions:                        *
*                                                                                 *
* The above copyright notice and this permission notice shall be included in all  *
* copies or substantial portions of the Software.                                 *
*                                                                                 *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR      *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,        *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE     *
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER          *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,   *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE   *
* SOFTWARE.                                                                       *
\*********************************************************************************/
import { TokenType } from './token';
export interface NodeMetadata {
    start: number;
    end: number;
    length: number;
}
export declare const EmptyNodeMetadata: NodeMetadata;
export interface Node {
    type: string;
    metadata?: NodeMetadata;
}
export type BinaryOperator = '+' | '-' | '*' | '/' | '**' | '%' | '&' | '|' | '^' | '&&' | '||' | '==' | '!=' | '>=' | '<=' | '<' | '>' | '>>' | '>>>' | '<<';
export type UnaryOperator = '~' | '-' | '+' | '!';
export type Operator = BinaryOperator | UnaryOperator | '?:';
export interface CommentNode extends Node {
    type: 'Comment';
    text: string;
}
export interface CommentStatementNode extends Node {
    type: 'CommentStatement';
    text: string;
}
export interface IdentifierLiteralNode extends Node {
    type: 'IdentifierLiteral';
    name: string;
    isGlobal: boolean;
}
export interface NumberLiteralNode extends Node {
    type: 'NumberLiteral';
    value: number;
}
export interface OperatorNode<OperatorType> extends Node {
    type: 'Operator';
    sign: OperatorType;
}
export interface BinaryExpressionNode extends Node {
    type: 'BinaryExpression';
    operator: OperatorNode<BinaryOperator>;
    left: ExpressionNode;
    right: ExpressionNode;
}
export interface UnaryExpressionNode extends Node {
    type: 'UnaryExpression';
    operator: OperatorNode<UnaryOperator>;
    operand: ExpressionNode;
}
export interface ParenthesizedExpressionNode extends Node {
    type: 'ParenthesizedExpression';
    expression: ExpressionNode;
}
export interface CallExpressionNode extends Node {
    type: 'CallExpression';
    symbol: IdentifierLiteralNode;
    args: Array<ExpressionNode>;
}
export interface VariableDefinitionNode extends Node {
    type: 'VariableDefinition';
    name: string;
}
export interface FunctionParameterNode extends Node {
    type: 'FunctionParameter';
    name: string;
}
export interface ArgumentIdentifierNode extends Node {
    type: 'ArgumentIdentifier';
    name: string;
}
export interface FunctionDefinitionNode extends Node {
    type: 'FunctionDefinition';
    name: string;
    params: Array<FunctionParameterNode>;
}
export interface TernaryExpressionNode extends Node {
    type: 'TernaryExpression';
    condition: ExpressionNode;
    operators: [OperatorNode<'?'>, OperatorNode<':'>];
    expressions: [ExpressionNode, ExpressionNode];
}
export type SymbolDefinitionNode = VariableDefinitionNode | FunctionDefinitionNode;
export interface AssignmentStatementNode extends Node {
    type: 'AssignmentStatement';
    symbol: SymbolDefinitionNode;
    operator: OperatorNode<'='>;
    expression: ExpressionNode;
}
export interface EmptyStatementNode extends Node {
    type: 'EmptyStatement';
    size: number;
}
export interface ProgramNode extends Node {
    type: 'Program';
    statements: Array<StatementNode>;
}
export type ExpressionNode = IdentifierLiteralNode | NumberLiteralNode | BinaryExpressionNode | UnaryExpressionNode | ParenthesizedExpressionNode | CallExpressionNode | ArgumentIdentifierNode | TernaryExpressionNode;
export type StatementNode = AssignmentStatementNode | EmptyStatementNode | CommentStatementNode;
export type NodeType = CommentNode | ProgramNode | StatementNode | ExpressionNode | VariableDefinitionNode | FunctionDefinitionNode | FunctionParameterNode | OperatorNode<BinaryOperator> | OperatorNode<UnaryOperator> | OperatorNode<'='> | OperatorNode<'?'> | OperatorNode<':'>;
export type TreeVisitor = (node: NodeType, parent: any, key: any) => void | undefined | boolean;
export type NodeTypeName = NodeType['type'];
export declare const NodeTypeId: Record<NodeTypeName, number>;
export declare const TokenTypeToUnaryOperator: (tokenType: TokenType) => UnaryOperator;
export declare const TokenTypeToBinaryOperator: (tokenType: TokenType) => BinaryOperator;
export declare const BinaryOperatorToTokenTypeName: (operator: BinaryOperator) => string;
export declare const UnaryOperatorToTokenTypeName: (operator: UnaryOperator) => string;
export declare const AST: {
    IdentifierLiteral: (name: string, isGlobal?: boolean, metadata?: NodeMetadata) => IdentifierLiteralNode;
    VariableDefinition: (name: string, metadata?: NodeMetadata) => VariableDefinitionNode;
    FunctionDefinition: (name: string, params: Array<FunctionParameterNode>, metadata?: NodeMetadata) => FunctionDefinitionNode;
    FunctionParameter: (name: string, metadata?: NodeMetadata) => FunctionParameterNode;
    ArgumentIdentifier: (name: string, metadata?: NodeMetadata) => ArgumentIdentifierNode;
    NumberLiteral: (value: number, metadata?: NodeMetadata) => NumberLiteralNode;
    Operator: <T extends string>(sign: T, metadata?: NodeMetadata) => OperatorNode<T>;
    UnaryExpression: (operator: OperatorNode<UnaryOperator>, operand: ExpressionNode, metadata?: NodeMetadata) => UnaryExpressionNode;
    BinaryExpression: (left: ExpressionNode, operator: OperatorNode<BinaryOperator>, right: ExpressionNode, metadata?: NodeMetadata) => BinaryExpressionNode;
    GroupingExpression: (expression: ExpressionNode, metadata?: NodeMetadata) => ParenthesizedExpressionNode;
    CallExpression: (name: string | IdentifierLiteralNode, args: Array<ExpressionNode>, metadata?: NodeMetadata) => CallExpressionNode;
    TernaryExpression: (condition: ExpressionNode, questionMark: OperatorNode<'?'>, expressionA: ExpressionNode, colon: OperatorNode<':'>, expressionB: ExpressionNode, metadata?: NodeMetadata) => TernaryExpressionNode;
    AssignmentStatement: (symbol: SymbolDefinitionNode, operator: OperatorNode<'='>, expression: ExpressionNode, metadata?: NodeMetadata) => AssignmentStatementNode;
    EmptyStatement: (size?: number, metadata?: NodeMetadata) => EmptyStatementNode;
    Program: (statements: Array<StatementNode>, metadata?: NodeMetadata) => ProgramNode;
    Comment: (text: string, metadata?: NodeMetadata) => CommentNode;
    CommentStatement: (text: string | CommentNode, metadata?: NodeMetadata) => CommentStatementNode;
    metadata: (start: number, end: number) => NodeMetadata;
    toString: (node: NodeType, showMetadata?: boolean) => string;
    clone: <T_1 extends Node>(node: T_1) => T_1;
    children: (node: NodeType) => Array<NodeType>;
    visit: (node: NodeType, visitor: TreeVisitor) => void;
    isPrimary: (node: NodeType) => boolean;
    isSimple: (node: NodeType) => boolean;
};
export default AST;
