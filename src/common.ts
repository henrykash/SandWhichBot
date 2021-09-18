import { TokenClass } from "typescript";
import { Token } from "./models/token";

function toHex(currencyAmount: any) {
    if (currencyAmount.toString().includes("e")) {
        let hexedAmount = (currencyAmount).toString(16)
        return `0x${hexedAmount}`;
    } else {
        let parsedAmount = parseInt(currencyAmount)
        let hexedAmount = (parsedAmount).toString(16)
        return `0x${hexedAmount}`
    }
}

const saveTrade = async (token: string) => {
    let record = new Token({
        token: token.toLowerCase(),
    })

    await record.save().then(() => {
        console.log("Successfully added token to the database :) ")
    }).catch((error: any) => {
        console.log("Error while adding token to the dabatase", error)
    })
}

export { toHex, saveTrade }