import { UnaryOperation } from './UnaryOperation';

export class UnMinus extends UnaryOperation
{
    constructor(symbol, right)
    {
        super(symbol, right);
    }
}