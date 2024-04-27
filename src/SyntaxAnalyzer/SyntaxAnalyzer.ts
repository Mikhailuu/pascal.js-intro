import { Multiplication } from './Tree/Multiplication';
import { Division } from './Tree/Division';
import { Addition } from './Tree/Addition';
import { Subtraction } from './Tree/Subtraction';
import { NumberConstant } from './Tree/NumberConstant';
import { SymbolsCodes } from '../LexicalAnalyzer/SymbolsCodes';
import { LexicalAnalyzer } from '../LexicalAnalyzer/LexicalAnalyzer';
import { TreeNodeBase } from './Tree/TreeNodeBase';
import { SymbolBase } from '../LexicalAnalyzer/Symbols/SymbolBase';
import { BinaryOperation } from './Tree/BinaryOperation';
import { UnaryMinus } from './Tree/UnaryMinus';
import { UnaryOperation } from './Tree/UnaryOperation';
import { IntegerConstant } from 'src/LexicalAnalyzer/Symbols/IntegerConstant';

/**
 * Синтаксический анализатор - отвечает за построение синтаксического дерева
 */
export class SyntaxAnalyzer {

    lexicalAnalyzer: LexicalAnalyzer;
    symbol: SymbolBase | null;

    /**
     * Деревья, которые будут построены (например, для каждой строки исходного кода)
     */
    trees: TreeNodeBase[];

    constructor(lexicalAnalyzer: LexicalAnalyzer) {
        this.lexicalAnalyzer = lexicalAnalyzer;
        this.symbol = null;
        this.trees = [];
    }

    /**
     * Перемещаемся по последовательности "символов" лексического анализатора,
     * получая очередной "символ" ("слово")
     */
    nextSym(): void {
        this.symbol = this.lexicalAnalyzer.nextSym();
    }

    accept(expectedSymbolCode: string): void {
        if (this.symbol === null) {
            throw `${expectedSymbolCode} expected but END OF FILE found!`;
        }

        if (this.symbol.symbolCode === expectedSymbolCode) {
            this.nextSym();
        } else {
            throw `${expectedSymbolCode} expected but ${this.symbol.symbolCode} found!`;
        }
    }

    analyze(): TreeNodeBase[] {
        this.nextSym();

        while (this.symbol !== null) {
            let expression: TreeNodeBase = this.scanExpression();

            this.trees.push(expression);

            // Последняя строка может не заканчиваться переносом на следующую строку.
            if (this.symbol !== null) {
                this.accept(SymbolsCodes.endOfLine);
            }
        }

        return this.trees;
    }

    /**
     * Разбор выражения
     */
    scanExpression(): TreeNodeBase {
        let term: TreeNodeBase = this.scanTerm();
        let operationSymbol: SymbolBase | null = null;

        while (this.symbol !== null && (
            this.symbol.symbolCode === SymbolsCodes.plus ||
            this.symbol.symbolCode === SymbolsCodes.minus
        )) {

            operationSymbol = this.symbol;
            this.nextSym();

            // Когда ожидается очередной "символ", т.е. выражение не завершено.
            if (this.symbol === null) {
                throw 'The expression is not complited.';
            }

            let secondTerm: TreeNodeBase = this.scanTerm();

            switch (operationSymbol.symbolCode) {
                case SymbolsCodes.plus:
                    term = new Addition(operationSymbol, term, secondTerm);
                    break;
                case SymbolsCodes.minus:
                    term = new Subtraction(operationSymbol, term, secondTerm);
                    break;
            }
        }

        return term;
    }

    /**
     * Разбор "слагаемого"
     */
    scanTerm(): TreeNodeBase {
        let multiplier: TreeNodeBase = this.scanMultiplier();
        let operationSymbol: SymbolBase | null = null;

        while (this.symbol !== null && (
            this.symbol.symbolCode === SymbolsCodes.star ||
            this.symbol.symbolCode === SymbolsCodes.slash
        )) {

            operationSymbol = this.symbol;
            this.nextSym();

            let secondTerm: TreeNodeBase = this.scanMultiplier();

            switch (operationSymbol.symbolCode) {
                case SymbolsCodes.star:
                    multiplier = new Multiplication(operationSymbol, multiplier, secondTerm);
                    break;
                case SymbolsCodes.slash:
                    multiplier = new Division(operationSymbol, multiplier, secondTerm);
                    break;
            }
        }

        return multiplier;
    }

    /**
     *  Разбор "множителя"
     */
    scanMultiplier(): NumberConstant {
        let integerConstant: SymbolBase | null = this.symbol;
        let integer = new NumberConstant(integerConstant);
        let operationSymbol: SymbolBase | null = null;
        
        if (this.symbol !== null && (
            this.symbol.symbolCode === SymbolsCodes.minus ||
            this.symbol.symbolCode === SymbolsCodes.integerConst)) {

            operationSymbol = this.symbol;
            

            switch (operationSymbol.symbolCode) {
                case SymbolsCodes.minus:
                    this.nextSym();
                    integer = this.scanMultiplier();
                    integer = new UnaryMinus(operationSymbol, integer);
                    break;
                case SymbolsCodes.integerConst:
                    integer = new NumberConstant(integerConstant);
                    this.accept(SymbolsCodes.integerConst); // проверим, что текущий символ это именно константа, а не что-то еще
                    break;
            }
        }
        
        return integer;
    }
};