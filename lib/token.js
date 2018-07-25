const Web3 = require('web3')
const path = require('path')
const cjson = require('cjson')
const TX = require('ethereumjs-tx')

// contract details
const provider = 'https://rinkeby.infura.io/v3/49489982b438407ea553d0ac3dc0671b'
const contractAddress = '0xff8298ae7364d0e79a502dec7d53bc19dfd6ba5f'
const privateKey = new Buffer('01b83f2972df3f5f7894c3425300cd66f4617b0da748dbb25159ccd0d4568455', 'hex')
const defaultAccount = '0x5fe168a1256d574cef13bc5f4e00c021183f4dbe'
const etherscanLink = 'https://rinkeby.etherscan.io/tx/'

// initiate the web3
const web3 = new Web3(provider)

// initiate the contract with null value
var contract = null;

// convert Wei to Eth
function convertWeiToEth( stringValue ) {
  if ( typeof stringValue != 'string' ) {
    stringValue = String( stringValue );
  }
  return web3.utils.fromWei( stringValue, "ether" );
}

// Initiate the Contract
function getContract() {	
  if (contract === null) {
    var abi = cjson.load(path.resolve(__dirname, '../ABI/abi.json'));
    var c = new web3.eth.Contract(abi,contractAddress)
    contract = c.clone();
  }
  console.log('Contract Initiated successfully!')
  return contract;
}

// send token to Address
async function sendToken(req, res) {
  var address = req.body.address
  var tokens = Number(req.body.tokens)

  if (address && tokens) {
    const rawTrans = getContract().methods.send(address, tokens) // contract method  
    return res.send(await sendSignTransaction(rawTrans))
  } else {
    res.send({
      'message':'Wallet address or no. of tokens is missing.'
    })
  }

}

// Mint token to given address
async function mintToken(req, res) {
  var address = req.body.address
  var tokens = Number(req.body.tokens)

  if (address && tokens) {
    const rawTrans = getContract().methods.mint(address, tokens) // contract method       
    return res.send(await sendSignTransaction(rawTrans))
  } else {
    res.send({
      'message':'Wallet address or no. of tokens is missing.'
    })
  }
}

// get the balance of given address
async function getBalance(req, res) {
  var address = req.query.address
  if (address) {
    // get the Ether balance of the given address
    var ethBalance = convertWeiToEth( await web3.eth.getBalance(address)) || '0'

    // get the token balance of the given address
    var tokenBalance = await getContract().methods.balances(address).call() || '0'

    // response data back to requestor
    return res.send({
      'Ether Balance': ethBalance,
      'Token Balance': tokenBalance
    })
  } 
}

// Send Signed Transaction
async function sendSignTransaction(rawTrans) {
  // Initiate values required by the dataTrans
  if (rawTrans) {
    var txCount = await web3.eth.getTransactionCount(defaultAccount) // needed for nonce
    var abiTrans = rawTrans.encodeABI() // encoded contract method 
    
    var gas = await rawTrans.estimateGas()
    var gasPrice = await web3.eth.getGasPrice()
    gasPrice = Number(gasPrice)
    gasPrice = gasPrice * 2
    var gasLimit = gas * 4

    // Initiate the transaction data
    var dataTrans = {
      nonce: web3.utils.toHex(txCount),
      gasLimit: web3.utils.toHex(gasLimit),
      gasPrice: web3.utils.toHex(gasPrice), 
      to: contractAddress,
      data: abiTrans 
    }
    
    // sign transaction
    var tx = new TX(dataTrans)
    tx.sign(privateKey)

    // after signing send the transaction
    return await sendSigned(tx)
  } else {
    throw new console.error('Encoded raw transaction was not given.');
  }
  
}

function sendSigned(tx) {
  return new Promise(function(resolve,reject){
    // send the signed transaction
    web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
    .once('transactionHash', function(hash){
      var result = {
        'status':'sent',
        'url': etherscanLink + hash,
        'message':'click the given url to verify status of transaction'
      }

      // respond with the result
      resolve(result)
    })
    .then(out => {console.log(out)})
    .catch(err => {
      // respond with error
      reject(err)
    })
  })
}

module.exports = {
  send: sendToken,
  mint: mintToken,
  balance: getBalance
}