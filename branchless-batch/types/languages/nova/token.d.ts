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
export declare enum TokenType {
    Identifier = 0,
    Number = 1,
    Assignment = 2,
    Plus = 3,
    Minus = 4,
    Multiply = 5,
    Divide = 6,
    Remainder = 7,
    Exponentiation = 8,
    And = 9,
    Or = 10,
    Xor = 11,
    Not = 12,
    LeftShift = 13,
    SignedRightShift = 14,
    ZeroFillRightShift = 15,
    Equal = 16,
    NotEqual = 17,
    GreaterThan = 18,
    GreaterThanOrEqual = 19,
    LessThan = 20,
    LessThanOrEqual = 21,
    LogicalAnd = 22,
    LogicalOr = 23,
    LogicalNot = 24,
    Comma = 25,
    Hash = 26,
    LeftParenthesis = 27,
    RightParenthesis = 28,
    QuestionMark = 29,
    Colon = 30,
    Comment = 31,
    NewLine = 32,
    EndOfFile = 33,
    Unknown = 34
}
declare class Token {
    type: TokenType;
    line: number;
    column: number;
    start: number;
    end: number;
    value?: string | number | undefined;
    constructor(type: TokenType, line: number, column: number, start: number, end: number, value?: string | number | undefined);
}
export default Token;
