
const { ethers } = require('ethers')
import { toHex } from "../common"

// Perepare enviroment and setup variables
const WALLET_ADDRESS = process.env.WALLET_ADDRESS
const walletAddress = ethers.utils.getAddress(WALLET_ADDRESS)
const PRIVATE_KEY = process.env.PRIVATE_KEY

const signer = new ethers.Wallet(PRIVATE_KEY);
const provider = ethers.getDefaultProvider(process.env.JSON_RPC, { name: 'binance', chainId: 56 });
const account = signer.connect(provider);

const uniswap = new ethers.Contract(
    "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    [
        "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
    ],
    account
);

const swapExactETHForTokens = async (amountOutMin: number, ethAmount: number, path: Array<string>, gasPrice: number, gasLimit: number, nonce: number) => {
    try {

        console.log("\n\n==================== swapExactETHForTokens =====================");

        // Convert amount to toHex
        let value = toHex(ethAmount)

        const deadline = Math.floor(Date.now() / 1000) + (60 * 2);

        console.log(`\n\n amountOutMin: ${amountOutMin}, \n\nValue : ${value} \nto: ${WALLET_ADDRESS}, \npath: ${path}, \ngasprice: ${gasPrice}, \ngasLimit: ${gasLimit}, \n deadline: ${deadline},`);

        const tx = await uniswap.swapExactETHForTokens(
            toHex(amountOutMin),
            path,
            walletAddress,
            deadline,
            {
                nonce: nonce,
                value,
                gasPrice,
                gasLimit,
            }
        );

        console.log("\n\n\n ************** BUY ***************")
        console.log("Transaction hash: ", tx.hash);
        console.log("*****************************")

        return { success: true, data: `${tx.hash}` };

    } catch (error) {
        console.log("swapExactETHForTokens:  ====> ", error);

        return { success: false, data: `${error}` };
    }
}


const swapExactETHForTokensSupportingFeeOnTransferTokens = async (amountOutMin: number, ethAmount: number, path: Array<string>, gasPrice: number, gasLimit: number, nonce: number) => {

    try {

        console.log("\n\n==================== swapExactETHForTokensSupportingFeeOnTransferTokens ===============");

        const uniswap = new ethers.Contract(
            "0x10ED43C718714eb63d5aA57B78B54704E256024E",
            [
                "function swapExactETHForTokensSupportingFeeOnTransferTokens( uint amountOutMin, address[] calldata path, address to, uint deadline ) external returns (uint[] memory amounts)"
            ],
            account
        );

        let value = toHex(ethAmount)

        const deadline = Math.floor(Date.now() / 1000) + (60 * 2);

        console.log(`\n \n amountOutMin: ${amountOutMin}, \nValue: ${value} \nto: ${WALLET_ADDRESS}, \npath: ${path}, \ngasprice: ${gasPrice}, \ngasLimit: ${gasLimit}, \n deadline: ${deadline},`);

        const tx = await uniswap.swapExactETHForTokensSupportingFeeOnTransferTokens(
            toHex(amountOutMin),
            path,
            walletAddress,
            deadline,
            {
                nonce: nonce,
                value,
                gasPrice,
                gasLimit,
            }
        );

        console.log("\n\n\n ************** BUY ***************")
        console.log("Transaction hash: ", tx.hash);
        console.log("*****************************************")

        return { success: true, data: `${tx.hash}` };

    } catch (error) {
        console.log("swapExactETHForTokensSupportingFeeOnTransferTokens:  ====> ", error);

        return { success: false, data: `${error}` };
    }
}


const swapETHForExactTokens = async (amountOut: number, ethAmount: number, path: Array<string>, gasPrice: number, gasLimit: number, nonce: number) => {
    try {

        console.log("\n\n==================== swapETHForExactTokens ===============");

        const uniswap = new ethers.Contract(
            "0x10ED43C718714eb63d5aA57B78B54704E256024E",
            [
                "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
            ],
            account
        );

        // Convert amount to toHex
        let value = toHex(ethAmount)

        const deadline = Math.floor(Date.now() / 1000) + (60 * 2);

        console.log(`\n\n amountOut: ${amountOut}, \n Value: ${value} \nto: ${WALLET_ADDRESS}, \npath: ${path}, \ngasprice: ${gasPrice}, \ngasLimit: ${gasLimit}, \n deadline: ${deadline},`);

        const tx = await uniswap.swapETHForExactTokens(
            toHex(amountOut),
            path,
            walletAddress,
            deadline,
            {
                nonce: nonce,
                value,
                gasPrice,
                gasLimit,
            }
        );

        console.log("\n\n\n ************** BUY ***************")
        console.log("Transaction hash: ", tx.hash);
        console.log("*****************************************")

        return { success: true, data: `${tx.hash}` };

    } catch (error) {
        console.log("swapETHForExactTokens:  ====> ", error);

        return { success: false, data: `${error}` };
    }
}


export { swapExactETHForTokens, swapETHForExactTokens, swapExactETHForTokensSupportingFeeOnTransferTokens }