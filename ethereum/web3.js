import Web3 from 'web3';

let provider;
let web3;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
  // Client side AND Metamask running
  provider = window.web3.currentProvider;
} else {
  // Server side OR Metamask not running
  provider = new Web3.providers.HttpProvider('https://rinkeby.infura.io/1PgmCKFGBQaFp1dC8Cut');
}

web3 = new Web3(provider);

export default web3;
export { provider };
