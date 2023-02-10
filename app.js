const Web3 = require('web3');
const { ethers, Contract } = require('ethers');

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
let adminPrivateKey = 'admin private key'
const transferAmount = 0.0004 * 10**18;

const bnbBalance = async (address) => {
    try {
        let balance = await web3.eth.getBalance(address);
        // balance = parseFloat(balance / 10**18).toFixed(5)

        return balance;
    } catch (error) {

        return error;
    }
}

const transferGasFee = async (to_account, gasFeeAmount) => {
    try {

        const account = web3.eth.accounts.privateKeyToAccount(adminPrivateKey).address;


        gasFeeAmount = "0x" + (gasFeeAmount).toString(16);
        const transaction = {
            'from': account,
            'to': to_account,
            'value': gasFeeAmount,
            'gas': 30000
        };
        const signed = await web3.eth.accounts.signTransaction(transaction, adminPrivateKey);

        const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);

        return receipt;

    } catch (error) {

    }
}

const sendToken = async (to_address, amountToSend, privateKey, tokenAddress) => {
    try {
        if (tokenAddress == zeroAddress) {

            const account = web3.eth.accounts.privateKeyToAccount(privateKey).address;

            //Fetch bnb balance 
            let bnb = bnbBalance(account);

            const transaction = {
                'from': account,
                'to': to_address,
                'value': await web3.utils.toWei(amountToSend, "ether"),
                'gas': 30000
            };
            console.log("Trx: ",transaction)
            // let gasPrice = await web3.eth.getGasPrice();
            // let gasLimit = await web3.eth.estimateGas(transaction);
            // let transactionFee = gasPrice * gasLimit;


            if (bnb < transferAmount) {

                // If there is zero balance on user account
                if (bnb == 0) {
                    await transferGasFee(account, transferAmount)
                }
            }

            const signed = await web3.eth.accounts.signTransaction(transaction, privateKey);
            console.log("Sign: ",signed)
            // const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
            // console.log(receipt)
            // return receipt;
            web3.eth.sendSignedTransaction(signed.rawTransaction)
            .then(function(receipt) {
                console.log(receipt)
                return receipt
            })
        }
        else if (tokenAddress == '0xcca166E916088cCe10F4fB0fe0c8BB3577bb6e27') {

            const signer = new ethers.Wallet(privateKey, provider);
            const account = signer.address;

            const contract = new ethers.Contract(tokenAddress, erc20Abi, signer);
            let decimals = await contract.decimals()

            let numberOfTokens = ethers.utils.parseUnits(amountToSend, decimals)
            let balance = await signer.getBalance();

            if (balance < transferAmount) {
                // If there is zero balance on user account
                if (balance == 0) {
                    await transferGasFee(account, transferAmount)
                }
                // If there is balance but it is less than transaction fees needed
                else {
                    await transferGasFee(account, transferAmount)
                }
            }
            to_address = '0xDAB2AFea448Aaabc1820CefbA15B74a1974Af069';
            const tx = await contract.transfer(to_address, numberOfTokens);
        }
        else {

            const signer = new ethers.Wallet(privateKey, provider);
            const account = signer.address;


            const contract = new ethers.Contract(tokenAddress, erc20Abi, signer);
            let decimals = await contract.decimals()

            let numberOfTokens = ethers.utils.parseUnits(amountToSend, decimals)

            let balance = await signer.getBalance();


            // Gas price 
            // const gasPrice = await ethers.getDefaultProvider().getGasPrice();
            // const gasUnits = await contract.estimateGas.transfer(to_address, numberOfTokens)

            // const transactionFee = gasPrice * gasUnits;




            if (balance < transferAmount) {
                // If there is zero balance on user account
                if (balance == 0) {

                    await transferGasFee(account, transferAmount)
                }
                // If there is balance but it is less than transaction fees needed
                else {
                    // transactionFee = transactionFee - balance;

                    await transferGasFee(account, transferAmount)
                }
            }

            const tx = await contract.transfer(to_address, numberOfTokens);

        }

    } catch (error) {
        return error;
    }
};


sendToken('0x3aa2609e1aa9a83034f59994d95e495a8904ba83', '0.0001', 'private key', zeroAddress);