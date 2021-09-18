import { readFileSync } from "fs";
import axios from "axios"
const WebSocket = require('ws');
import { ethers } from 'ethers';
import { ADDITIONAL_BUY_GAS, ADDITIONAL_GAS_SELL, BNB_AMOUNT_TO_BUY, ETH_AMOUNT_TO_BUY, TOKENS_TO_MONITOR } from "./config/setup";
import "./models/connect"

import { Token, Trade } from "../src/models/token"
import { swapETHForExactTokens, swapExactETHForTokens, swapExactETHForTokensSupportingFeeOnTransferTokens } from "./uniswap/buy";
import { approve, walletNonce } from "./uniswap/approve";
import { swapExactTokensForETHSupportingFeeOnTransferTokens } from "./uniswap/sell";

const ws = new WebSocket(process.env.ENTERPRISE_BLOXROUTE!, {
    cert: readFileSync(
        `src/utils/certs/external_gateway_cert.pem`
    ),
    key: readFileSync(
        `src/utils/certs/external_gateway_key.pem`
    ),
    rejectUnauthorized: false,
});

const PANCAKE_SWAP = "0x10ed43c718714eb63d5aa57b78b54704e256024e"
let dbTokensToMonitor: string[] = []

function subscribe() {
    ws.send(
        `{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["newTxs", {"duplicates":false,"include": ["tx_hash", "tx_contents.to", "tx_contents.from", "tx_contents.value", "tx_contents.gas_price", "tx_contents.gas", "tx_contents.input"],"filters":"method_id in [fb3bdb41,b6f9de95,7ff36ab5, b6f9de95]"}]}`
    );

}

const getTrade = async (token: any, target: any) => {
    token = token.toLowerCase();
    console.log("\n Tokens to get amounts ", token);

    try {
        let trade = await Trade.findOne({ token: token, target: target }).lean();
        return trade

    } catch (err) {
        console.log(err);

    }
}

/**
 * 
 * @param tokenAddress querrying etherscan api to get the number of tokens a given walletAdddress has 
 * @returns 
 */
const getTokenAmount = async (tokenAddress: string) => {
    let noOfTokens = 0;
    try {
        let { data } = await axios({
            method: 'get',
            url: `https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${process.env.WALLET_ADDRESS}&sort=asc&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`
        })

        if (data.result == "1") {
            noOfTokens = data.result
        }
    } catch (err) {
        console.log(err);

    }

    return noOfTokens
}
/**
 * 
 * @param token : function Querries the DB to check for the tokens
 */
const getToken = async (token: any) => {
    try {
        let order = await Token.findOne({ token: token.toLowerCase() })
        console.log("Order ", order)

        return order;
    } catch (err) {
        console.log(err);
    }
}

/**
 @param: function that listens to any change on the collection
 */
const getDBTokens = () => {
    console.log("Start ");
    let changeStream = Token.watch();
    changeStream.on("change", (next: any) => {

        if (next.operationType == "insert") {
            try {
                dbTokensToMonitor.push(next.fullDocument.address.toLowerCase())
                console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\ New token added to db: \t", dbTokensToMonitor);

            } catch (error) {
                console.log("Encoutered an issue while listening for changes in the Order model", error)
            }

        }
    });

    return true

}

const main = async () => {


    if (
        !process.env.JSON_RPC &&
        !process.env.WSS_NODE &&
        !process.env.WS_BLOXROUTE &&
        !process.env.WALLET_ADDRESS &&
        !process.env.PRIVATE_KEY &&
        !process.env.MONGO_DB_URL &&
        !process.env.BLOXROUTE_AUTHORIZATION_HEADER
    ) {
        throw new Error(
            "APP_NAME && JSON_RPC && WSS_NODE && WS_BLOXROUTE && WALLET_ADDRESS && PRIVATE_KEY && MONGO_DB_URL && BLOXROUTE_AUTHORIZATION_HEADER  Must be defined in your .env FILE"
        );
    }

    try {

        let tokensToMonitor = TOKENS_TO_MONITOR.map((token: string) => token.toLowerCase());
        //call the function to get new tokens  whenever they get added to the DB
        //   getDBTokens()

        var abi = await JSON.parse(
            readFileSync(`${__dirname}/utils/abiUniswap.json`, "utf8")
        );

        const inter = new ethers.utils.Interface(abi);


        const mempoolData = async (notification: string) => {

            try {
                let JsonData = await JSON.parse(notification)
                let tx = JsonData.params.result;

                // console.log(tx)

                let routerAddress = tx.txContents.to.toLowerCase()

                console.log("\n\n\n\n Target ", tx.txContents.from)
                console.log("Tx ", tx.txHash)
                console.log("TO ", tx.txContents.to)
                console.log("input ", tx.txContents.input);
                console.log("Router : ", routerAddress)

                //we are using the uniswap router to carry out transactions
                if (routerAddress == PANCAKE_SWAP) {
                    const decodedInput = inter.parseTransaction({
                        data: tx.txContents.input,
                    });


                    let gasLimit = parseInt(tx.txContents.gas, 16);
                    let gasPrice = parseInt(tx.txContents.gasPrice, 16) + ADDITIONAL_BUY_GAS;
                    let path: Array<string> = decodedInput.args.path
                    let methodName = decodedInput.name
                    let targetEthAmount = parseInt(tx.txContents.value, 16)

                    let token = decodedInput.args.path[1]
                    gasPrice = gasPrice + ADDITIONAL_GAS_SELL;
                    let targetWallet = tx.txContents.from;


                    console.log("\n\n\n   Here we are here")
                    console.log(tx.txHash)
                    console.log(token)

                    // console.log("\n\n Target Details")
                    // console.log("------------------")
                    // console.log("Transaction Hash : ", tx.txHash)
                    // console.log("Target : ", tx.txContents.from)
                    // console.log("Path : ", decodedInput.args.path)
                    // console.log("WETH: ", targetEthAmount / 10 ** 18)
                    // console.log("GasPrice: ", parseInt(tx.txContents.gasPrice, 16) / 10 ** 9)
                    // console.log("GasLimit: ", gasLimit)
                    // console.log("method Name: ", methodName)

                    //check if the token being bought is on the database
                    let dbTokens = await getToken(token)

                    if (dbTokens) {
                        console.log(tx)
                        console.log("Decoded data:", decodedInput)


                        if (targetEthAmount > BNB_AMOUNT_TO_BUY) {
                            stateOn = false
                            let currentNonce = await walletNonce();

                            console.log("\n\n\n\n\n\n\n\n^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^66")

                            //check to make a buy after filtering BUY method
                            if (methodName == "swapExactETHForTokens") {

                                //buy
                                await swapExactETHForTokens(0, ETH_AMOUNT_TO_BUY, path, gasPrice, gasLimit, currentNonce)

                                //apprve
                                await approve(token, gasPrice - 1, gasLimit, currentNonce - 1)

                                //sell
                                let amountIn = await getTokenAmount(token);
                                await swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, 1, path, gasPrice, gasLimit, currentNonce)


                            } else if (methodName == "swapETHForExactTokens") {

                                //buy
                                await swapETHForExactTokens(0, ETH_AMOUNT_TO_BUY, path, gasPrice, gasLimit, currentNonce)
                                //approve
                                await approve(token, gasPrice - 1, gasLimit, currentNonce - 1)
                                //sell
                                let amountIn = await getTokenAmount(token);
                                await swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, 1, path, gasPrice, gasLimit, currentNonce)


                            } else if (methodName == "swapExactETHForTokensSupportingFeeOnTransferTokens") {

                                //buy
                                await swapExactETHForTokensSupportingFeeOnTransferTokens(0, ETH_AMOUNT_TO_BUY, path, gasPrice, gasLimit, currentNonce)
                                //approve
                                await approve(token, gasPrice - 1, gasLimit, currentNonce - 1)
                                //sell
                                let amountIn = await getTokenAmount(token);
                                await swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, 1, path, gasPrice, gasLimit, currentNonce)

                            }

                        }

                    }

                }


            } catch (err) {
                console.log(err);

            }
        }


        let stateOn = true
        const processMempoolData = (nextNotification: string) => {
            if (stateOn === true) {

                mempoolData(nextNotification);

            }

        }
        ws.on("open", subscribe);
        ws.on("message", processMempoolData);
        ws.on("close", () => {
            console.log("Websocket closed. Trying to reconnect");

        })

    } catch (err) {
        console.log(err);

    }

}

main()
