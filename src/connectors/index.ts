import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { ChainId } from '../sdk'
import { NetworkConnector } from './NetworkConnector'
import fetchIntercept from 'fetch-intercept'

const NETWORK_URLS = {
  [ChainId.POA]: 'https://core.poa.network',
  [ChainId.SOKOL]: 'https://sokol.poa.network'
}

export const network = new NetworkConnector({
  urls: NETWORK_URLS,
  defaultChainId: 99
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({
  supportedChainIds: [99, 77]
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
  supportedChainIds: [99, 77],
  rpc: NETWORK_URLS,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: 5000
})

// hot fix
// https://github.com/MetaMask/web3-provider-engine/blob/main/index.js
// "skipCache: true" causes problems with poa rpc.

fetchIntercept.register({
  request: function(url, config) {
    try {
      const body = JSON.parse(config.body)
      delete body[0].skipCache
      config.body = JSON.stringify(body)
    } catch (e) {}

    return [url, config]
  }
})

const send = window.XMLHttpRequest.prototype.send
window.XMLHttpRequest.prototype.send = function(...rest) {
  try {
    const body = JSON.parse(rest[0]?.toString() || '')
    delete body.skipCache
    rest[0] = JSON.stringify(body)
  } catch (e) {}
  return send.call(this, ...rest)
}
