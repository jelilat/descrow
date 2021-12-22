(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// import {
//   getProvider,
//   depositNativeToken,
//   initNativeTransaction,
//   withdrawNativeTransaction,
//   cancelNativeTransaction,
//   pauseNativeTransaction,
//   resumeNativeTransaction,
//   withdrawNativeTokenDeposit,
// } from "zebecprotocol-sdk";

//const zebec = require('zebecprotocol-sdk');
const walletConnect = document.getElementById('connect')
console.log(walletConnect)
walletConnect.onclick = async () => {
  console.log("we dey")
  //await zebec.getProvider();

}

// window.getWalleAddress = async () => {
//   console.log("we dey")
//   await zebec.getProvider();
// }
// getProvider();

// const getProvider = () => {
//     if ("solana" in window) {
//       const provider = window.solana;
//       if (provider.isPhantom) {
//         return provider;
//       }
//     }
//     window.open("https://phantom.app/", "_blank");
//   };

//   const checkIfWalletIsConnected = async () => {
//     try {
//       const { solana } = window;

//       if (solana) {
//         if (solana.isPhantom) {
//             console.log('Phantom wallet found!');

//             /*
//             * The solana object gives us a function that will allow us to connect
//             * directly with the user's wallet!
//             */
//             const response = await solana.connect({ onlyIfTrusted: true });
//             console.log(
//             'Connected with Public Key:',
//             response.publicKey.toString()
//             );

//             /*
//             * Set the user's publicKey in state to be used later!
//             */
//             setWalletAddress(response.publicKey.toString());
//         }
//         } else {
//         alert('Solana object not found! Get a Phantom Wallet 👻');
//         window.open("https://phantom.app/", "_blank");
//         }
//     } catch (error) {
//         console.error(error);
//     }
//     };

//   const connectWallet = async () => {
//   const { solana } = window;

//     if (solana) {
//         const response = await solana.connect();
//         console.log('Connected with Public Key:', response.publicKey.toString());
//         setWalletAddress(response.publicKey.toString());
//     }
// };

},{}]},{},[1]);
