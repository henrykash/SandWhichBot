import { readFileSync } from "fs";
const WebSocket = require('ws');
import { ethers } from 'ethers';
import { saveTrade } from "./common";
require("./models/connect");
const ws = new WebSocket(process.env.ENTERPRISE_BLOXROUTE!, {
    cert: readFileSync(
        `src/utils/certs/external_gateway_cert.pem`
    ),
    key: readFileSync(
        `src/utils/certs/external_gateway_key.pem`
    ),
    rejectUnauthorized: false,
});


const methodsExclusion = ["0x", "0x20", "0x00"]
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

function subscribe() {
    ws.send(
        `{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["newTxs", {"duplicates":false,"include": ["tx_hash", "tx_contents.to", "tx_contents.from", "tx_contents.value", "tx_contents.gas_price", "tx_contents.gas", "tx_contents.input"],"filters":"method_id in [f305d719,e8e33700]"}]}`
    );

}

const main = async () => {

    if (
        !process.env.JSON_RPC &&
        !process.env.WS_BLOXROUTE &&
        !process.env.WALLET_ADDRESS &&
        !process.env.PRIVATE_KEY &&
        !process.env.MONGO_DB_URL &&
        !process.env.BLOXROUTE_AUTHORIZATION_HEADER
    ) {
        throw new Error(
            "APP_NAME && JSON_RPC && WS_BLOXROUTE && WALLET_ADDRESS && PRIVATE_KEY && MONGO_DB_URL && BLOXROUTE_AUTHORIZATION_HEADER  Must be defined in your .env FILE"
        );
    }

    try {

        var abi = await JSON.parse(
            readFileSync(`${__dirname}/utils/abiUniswap.json`, "utf8")
        );

        const inter = new ethers.utils.Interface(abi);



        const mempoolData = async (notification: string) => {

            try {
                let JsonData = await JSON.parse(notification)
                let tx = JsonData.params.result;

                if (!methodsExclusion.includes(tx.txContents.input)) {
                    console.log(tx)

                    let routerAddress = tx.txContents.to.toLowerCase()

                    const decodedInput = inter.parseTransaction({
                        data: tx.txContents.input,
                    });

                    // console.log(decodedInput)

                    // console.log("\n\n\n\n Target ", tx.txContents.from)
                    // console.log("Tx ", tx.txHash)
                    // console.log("TO ", tx.txContents.to)
                    // console.log("input ", tx.txContents.input);
                    console.log("Router : ", routerAddress)


                    let methodName = decodedInput.name // getting the name of the methods i.e addLiquidity, swapTHForTokens
                    let token = decodedInput.args.token //the path of getting the token for addLiquidityETH 


                    if (methodName == "AddLiquidity") {
                        let tokenA = decodedInput.args.TokenA // when adding Liquidity using AddLiquidty method either of two tokens A and B is added liquidity acess the path this way 
                        let tokenB = decodedInput.args.TokenB

                        if (tokenA.toLowerCase() == WETH.toLowerCase()) {
                            token = tokenB

                        } else if (tokenB.toLowerCase() == WETH.toLowerCase()) {
                            token = tokenA

                        }
                    }

                    await saveTrade(token)

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