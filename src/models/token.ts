import { Schema, model } from 'mongoose';

// Token Interface
interface TokenInterface {
    token: string;
}

///trade interface
interface TradeInterface{
    token:any,
    target: string
}

// Token Schema
const orderSchema = new Schema<TokenInterface>({
    token: { type: String, required: true, unique: true }
},
    {
        timestamps: true
    }

);

//trade schema
const tradeSchema = new Schema<TradeInterface>({
    token: { type: String, required: true, unique: true}
},
    {
        timestamps: true
    }
);

const Trade = model<TradeInterface>("Trades", tradeSchema, "trades");

const Token = model<TokenInterface>("tokens", orderSchema, "tokens");

export{ Token, Trade}