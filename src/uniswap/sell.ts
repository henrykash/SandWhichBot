

import { ethers } from "ethers"
import { toHex } from "../common"

// Perepare enviroment and setup variables
const WALLET_ADDRESS = process.env.WALLET_ADDRESS
let walletAddress = ethers.utils.getAddress(WALLET_ADDRESS!)
const PRIVATE_KEY = process.env.PRIVATE_KEY

const signer = new ethers.Wallet(PRIVATE_KEY!);
const provider = ethers.getDefaultProvider(process.env.JSON_RPC, { name: 'binance', chainId: 56 });
const account = signer.connect(provider);


const swapTokensForExactETH = async (amountInMax: number, amountOut: number, path: Array<string>, gasPrice: number, gasLimit: number, nonce: number) => {
    try {

        const uniswap = new ethers.Contract(
            "0x10ED43C718714eb63d5aA57B78B54704E256024E",
            [
                "function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) returns (uint[] memory amounts)"
            ],
            account
        );


        console.log("\n\n==================== swapTokensForExactETH ===============");

        const deadline = Math.floor(Date.now() / 1000) + (60 * 2);

        console.log(`\n\n amountIn: ${amountInMax}, \n amountOutMin: ${amountOut}, \nto: ${WALLET_ADDRESS}, \npath: ${path}, \ngasprice: ${gasPrice}, \ngasLimit: ${gasLimit}, \n deadline: ${deadline}`);

        const tx = await uniswap.swapTokensForExactETH(
            toHex(amountInMax),
            toHex(amountOut),
            path,
            walletAddress,
            deadline,
            {
                nonce: nonce,
                gasPrice,
                gasLimit,
            }
        );

        console.log("\n\n\n ************** SELL ***************")
        console.log("Transaction hash: ", tx.hash);
        console.log("******************************************")

        return { success: true, data: `${tx.hash}` };

    } catch (error) {
        console.log("swapTokensForExactETH ====>  ", error);

        return { success: false, data: `${error}` };
    }
}


const swapExactTokensForETHSupportingFeeOnTransferTokens = async (amountIn: number, amountOutMin: number, path: Array<string>, gasPrice: number, gasLimit: number, nonce: number) => {
    try {

        const uniswap = new ethers.Contract(
            "0x10ED43C718714eb63d5aA57B78B54704E256024E",
            [
                "function swapExactTokensForETHSupportingFeeOnTransferTokens( uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline ) external returns (uint[] memory amounts)"
            ],
            account
        );

        console.log("\n\n==================== swapExactTokensForETHSupportingFeeOnTransferTokens ===============");

        const deadline = Math.floor(Date.now() / 1000) + (60 * 2);

        console.log(`\n\n amountIn: ${amountIn}, \n amountOutMin: ${amountOutMin}, \nto: ${WALLET_ADDRESS}, \npath: ${path}, \ngasprice: ${gasPrice}, \ngasLimit: ${gasLimit}, \n deadline: ${deadline}`);

        const tx = await uniswap.swapExactTokensForETHSupportingFeeOnTransferTokens(
            toHex(amountIn),
            toHex(amountOutMin),
            path,
            walletAddress,
            deadline,
            {
                nonce: nonce,
                gasPrice,
                gasLimit,
            }
        );

        console.log("\n\n\n ************** SELL ***************")
        console.log("Transaction hash: ", tx.hash);
        console.log("******************************************")

        return { success: true, data: `${tx.hash}` };

    } catch (error) {
        console.log("swapExactTokensForETH error ====> ", error);

        return { success: false, data: `${error}` };
    }
}


const swapExactTokensForETH = async (amountIn: number, amountOutMin: number, path: Array<string>, gasPrice: number, gasLimit: number, nonce: number) => {
    try {

        const uniswap = new ethers.Contract(
            "0x10ED43C718714eb63d5aA57B78B54704E256024E",
            [
                "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)  returns (uint[] memory amounts)"
            ],
            account
        );


        console.log("\n\n==================== swapExactTokensForETH ===============");

        const deadline = Math.floor(Date.now() / 1000) + (60 * 2);

        console.log(`\n\n amountIn: ${amountIn}, \n amountOutMin: ${amountOutMin}, \nto: ${WALLET_ADDRESS}, \npath: ${path}, \ngasprice: ${gasPrice}, \ngasLimit: ${gasLimit}, \n deadline: ${deadline}`);

        const tx = await uniswap.swapExactTokensForETH(
            toHex(amountIn),
            toHex(amountOutMin),
            path,
            walletAddress,
            deadline,
            {
                nonce: nonce,
                gasPrice,
                gasLimit,
            }
        );

        console.log("\n\n\n ************** SELL ***************")
        console.log("Transaction hash: ", tx.hash);
        console.log("******************************************")

        return { success: true, data: `${tx.hash}` };

    } catch (error) {
        console.log("swapExactTokensForETH ====>  ", error);

        return { success: false, data: `${error}` };
    }
}


export { swapExactTokensForETHSupportingFeeOnTransferTokens, swapTokensForExactETH, swapExactTokensForETH }
