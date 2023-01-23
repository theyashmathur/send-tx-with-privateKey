const Web3 = require('web3');

// Web3 instance
const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed1.binance.org/'))     // Mainnet rpc url

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
zeroAddress = '0x0000000000000000000000000000000000000000';

const bnbBalance = async (address) => {
    try {
        let balance = await web3.eth.getBalance(address);
        balance = parseFloat(balance / 10**18).toFixed(5)
        console.log("Balance BNB: ",balance)
        return balance;
    } catch (error) {
        console.log(error);
        return error;
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

            if(bnb < transactionFee) {
                console.log("Insufficient balance");
                return false;
            }

            // Update transaction object
            transaction.gas = gasLimit;
            transaction.value = amount - transactionFee;

            const signed  = await web3.eth.accounts.signTransaction(transaction, privateKey);
            console.log(signed)
            const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
            console.log("Transaction: ",receipt);
            return receipt;
        }
        else{
            const account = web3.eth.accounts.privateKeyToAccount(privateKey).address;
            console.log(account)

            //Fetch bnb balance 
            let bnb = bnbBalance(account);

            const contract = new web3.eth.Contract(erc20Abi, tokenAddress);
            let decimals = contract.methods.decimals().call();
            let amountMultiplied = amountToSend * 10 ** decimals;
            amountInHex = "0x" + amountMultiplied.toString(16);
            const encodedAbi = contract.methods.transfer(to_address, amountInHex);

            let transaction = {
                'from'  : account,
                'to'    : to_address,
                'data'  : encodedAbi,
                'gas'   : 30000
            }

            let gasPrice = await web3.eth.getGasPrice();
            let gasLimit = await web3.eth.estimateGas(transaction);
            let transactionFee = gasPrice * gasLimit;

            if(bnb < transactionFee) {
                console.log("Insufficient balance for transaction");
                return false;
            }

            // Update transaction object
            transaction.gas = gasLimit;

            const signed  = await web3.eth.accounts.signTransaction(transaction, privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
            console.log("Transaction: ",receipt);
            return receipt;   
        }

    } catch (error) {
        console.log(error);
    }
};


sendToken('to address', 'amount in string', 'private key of account', 'token address(zero address if bnb)');