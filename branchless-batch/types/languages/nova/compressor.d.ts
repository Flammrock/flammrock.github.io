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
import { AssignmentStatementNode, Operator, ProgramNode } from './ast';
export type UnknownOperator = '?:' | '||' | '&&' | '==' | '!=' | '>' | '<' | '>=' | '<=';
export declare const OperatorConversionTable: Record<UnknownOperator, (name: string) => AssignmentStatementNode>;
export declare const UnknownOperators: UnknownOperator[];
export interface CompressorReduceOptions {
    customPolyfillNamer: (operator: Operator, requested: string, solved: string) => string;
}
declare class Compressor {
    private program;
    private newDefs;
    constructor(program: ProgramNode);
    getAddedSymbols(): Array<string>;
    getProgram(): ProgramNode;
    inject(): void;
    /**
     * Transfrom unkown operator to know operator with the following conversion table:
     *
     * TODO: implement pow
     *
     * ```
     * c ? a : b                               <=> (c != 0) * a + (1 - (c != 0)) * b
     * || -> (1-((a|(~a+1))>>31)&1)*b+a        <=> a == 0 ? b : a
     * && -> ((a|(~a+1))>>31)&1*(b-a)+a        <=> a == 0 ? a : b
     * == -> 1-(((b-a)>>31)&1)-(((a-b)>>31)&1) <=> a == b ? 1 : 0
     * != -> (((b-a)>>31)&1)+(((a-b)>>31)&1)   <=> a != b ? 1 : 0
     * >  -> ((b-a)>>31)&1                     <=> a > b ? 1 : 0
     * <  -> ((a-b)>>31)&1                     <=> a < b ? 1 : 0
     * <= -> 1-((b-a)>>31)&1                   <=> a <= b ? 1 : 0
     * >= -> 1-((a-b)>>31)&1                   <=> a >= b ? 1 : 0
     * ** -> see pow.bat
     * ```
     */
    reduce(options?: Partial<CompressorReduceOptions>): void;
}
export default Compressor;
