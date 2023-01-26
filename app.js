const Web3 = require('web3');
const { ethers } = require('ethers');

// Web3 instance
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org/'))     // Mainnet rpc url

// ethers provider 
const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.binance.org/');


const erc20Abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
]
let zeroAddress = '0x0000000000000000000000000000000000000000'
let adminPrivateKey = ''

const bnbBalance = async (address) => {
    try {
        let balance = await web3.eth.getBalance(address);
        // balance = parseFloat(balance / 10**18).toFixed(5)
        console.log("Balance BNB: ",balance)
        return balance;
    } catch (error) {
        console.log(error);
        return error;
    }
}

const transferGasFee = async (to_account, gasFeeAmount) => {
    try {
        
        const account = web3.eth.accounts.privateKeyToAccount(adminPrivateKey).address;
        const transaction = {
            'from'    : account,
            'to'      : to_account,
            'value'   : gasFeeAmount,
            'gas'     : 30000
        };
        const signed  = await web3.eth.accounts.signTransaction(transaction, privateKey);
        console.log(signed)
        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
        console.log("Transaction: ",receipt);
        return receipt;

    } catch (error) {
        console.log(error)
    }
}

const sendToken = async (to_address, amountToSend, privateKey, tokenAddress) => {
    try {
        if(tokenAddress == zeroAddress){
            console.log("details", to_address, amountToSend, privateKey, tokenAddress)
            const account = web3.eth.accounts.privateKeyToAccount(privateKey).address;

            //Fetch bnb balance 
            let bnb = bnbBalance(account);

            const transaction = {
                'from'    : account,
                'to'      : to_address,
                'value'   : await web3.utils.toWei(amountToSend, "ether"),
                'gas'     : 30000
            };

            let gasPrice = await web3.eth.getGasPrice();
            let gasLimit = await web3.eth.estimateGas(transaction);
            let transactionFee = gasPrice * gasLimit;
            console.log("Tx fee: ", transactionFee)

            if(bnb < transactionFee) {
                console.log("Insufficient balance for gas fee");
                await transferGasFee(account, transactionFee)
            }

            // Update transaction object
            transaction.gas = gasLimit;
            transaction.value = web3.utils.toWei(amountToSend, "ether") - transactionFee;

            const signed  = await web3.eth.accounts.signTransaction(transaction, privateKey);
            console.log(signed)
            const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
            console.log("Transaction: ",receipt);
            return receipt;
        }
        else{

            const signer = new ethers.Wallet(privateKey, provider);

            const contract = new ethers.Contract(tokenAddress, erc20Abi, signer);

            let decimals = await contract.decimals()

            let numberOfTokens = ethers.utils.parseUnits(amountToSend, 18)
            console.log("number of tokens:", numberOfTokens)
            let balance = await signer.getBalance();

            if(balance < 0.001) {
                console.log("Insufficient amount for tx");
                await transferGasFee(account, 0.001)
            }
            const tx = await contract.transfer(to_address, numberOfTokens);


            // let amountMultiplied = parseFloat(amountToSend) * 10 ** decimals;
            // amountInHex = "0x" + amountMultiplied.toString(16);
            // const tx = {
            //     from: signer.address,
            //     to: to_address,
            //     data: contract.transfer(to_address, amountInHex),
            //     // gas: 300000,
            //     gasLimit: 30000000
            // }

            // let gasPrice = await signer.getGasPrice;
            // let gasLimit = await signer.estimateGas(tx)
            // let balance = await signer.getBalance()

            // let txfee = gasPrice * gasLimit;

            // if(balance < txfee) {
            //     console.log("insufficient balance for tx")
            //     return false;
            // }

            // tx.gas = gasLimit;
            // const signed = signer.signTransaction(tx)
            // console.log(signed);

            // const account = web3.eth.accounts.privateKeyToAccount(privateKey).address;
            // console.log(account)

            // //Fetch bnb balance 
            // let bnb = bnbBalance(account);

            // const contract = new web3.eth.Contract(erc20Abi, tokenAddress);
            // let decimals = await contract.methods.decimals().call();
            // let amountMultiplied = parseFloat(amountToSend) * 10 ** decimals;
            // amountInHex = "0x" + amountMultiplied.toString(16);
            // const encodedAbi = contract.methods.transfer(to_address, amountInHex);
            // console.log(encodedAbi)
            // const transaction = {
            //     'from'  : account,
            //     'to'    : to_address,
            //     'data'  : encodedAbi,
            //     'gas'   : 30000
            // }
            // console.log(transaction);
            // let gasPrice = await web3.eth.getGasPrice();
            // // let gasLimit = await web3.eth.estimateGas(transaction);
            // let transactionFee = gasPrice * 30000;
            // console.log("Fee: ",transactionFee)

            // if(bnb < transactionFee) {
            //     console.log("Insufficient balance for transaction");
            //     await transferGasFee(account, transactionFee)
            // }

            // // Update transaction object
            // // transaction.gas = gasLimit;

            // const signed  = await web3.eth.accounts.signTransaction(transaction, privateKey);
            // const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
            // console.log("Transaction: ",receipt);
            // return receipt;   
        }

    } catch (error) {
        console.log(error);
    }
};


sendToken('0x3aa2609e1aa9a83034f59994d95e495a8904ba83', '0.05', '', '0xcca166E916088cCe10F4fB0fe0c8BB3577bb6e27');