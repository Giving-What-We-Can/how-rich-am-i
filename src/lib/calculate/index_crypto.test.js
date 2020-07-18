/* eslint-env jest */
import { getCryptoExchange, KRAKEN_TICKER_API } from './index_crypto'

describe('exchange rate', () => {
  afterEach(() => {
    global.fetch.mockClear()
  })

  test('fetches BTC exchange rate correctly', async () => {
    const mockSuccessResponse = { result: { XXBTZUSD: { b: [9500] } } }
    const mockJsonPromise = Promise.resolve(mockSuccessResponse)
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise,
    })
    jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise)

    const rate = await getCryptoExchange('BTC')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(`${KRAKEN_TICKER_API}?pair=XBTUSD`)

    expect(rate).toBe(9500)
  })

  test('fetches ETH exchange rate correctly', async () => {
    const mockSuccessResponse = { result: { XETHZUSD: { b: [230] } } }
    const mockJsonPromise = Promise.resolve(mockSuccessResponse)
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise,
    })
    jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise)

    const rate = await getCryptoExchange('ETH')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(`${KRAKEN_TICKER_API}?pair=ETHUSD`)

    expect(rate).toBe(230)
  })

  test('fetches USDC exchange rate correctly', async () => {
    const mockSuccessResponse = { result: { USDCUSD: { b: [1.0002] } } }
    const mockJsonPromise = Promise.resolve(mockSuccessResponse)
    const mockFetchPromise = Promise.resolve({
      json: () => mockJsonPromise,
    })
    jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise)

    const rate = await getCryptoExchange('USDC')
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(`${KRAKEN_TICKER_API}?pair=USDCUSD`)

    expect(rate).toBe(1.0002)
  })
})