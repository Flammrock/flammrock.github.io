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
import { ProgramNode } from './ast';
export interface ParseOptions {
    /**
     * default: false
     */
    ignoreErrors: boolean;
}
export default class Parser {
    private lexer;
    private currentToken;
    private previousToken;
    private state;
    private position;
    private shouldIgnoreErrors;
    private context;
    constructor(source: string);
    reset(): void;
    save(): void;
    unsave(): void;
    restore(): void;
    parse(options?: ParseOptions): ProgramNode;
    private match;
    private skipNewLine;
    private skipComments;
    private check;
    private isAtEnd;
    private advance;
    private peek;
    private previous;
    private error;
    private get precedence();
    private program;
    private statement;
    private expression;
    private ternary;
    private logicalOr;
    private logicalAnd;
    private bitwiseOr;
    private bitwiseXor;
    private bitwiseAnd;
    private equality;
    private relational;
    private bitshift;
    private term;
    private factor;
    private exponentiation;
    private prefix;
    private primary;
    private symbol;
}
