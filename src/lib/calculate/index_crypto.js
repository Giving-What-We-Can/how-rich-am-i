import { currencies } from 'countryinfo'
import { single as interpolate } from 'simple-interpolation';
import INCOME_CENTILES from './data/income_centiles.json'
import PPP_CONVERSION from './data/ppp_conversion.json'
import EXCHANGE_RATES from './data/exchange_rates.json'
import COMPARISONS from './data/comparisons.json'
import BigNumber from 'bignumber.js'
export { COMPARISONS }

export const KRAKEN_TICKER_API = 'https://api.kraken.com/0/public/Ticker';

// data interpolation
const interpolateIncomeCentile = interpolate(
  INCOME_CENTILES.map(centile => ({ x: centile.percentage, y: centile.international_dollars }))
)

// multiply `amount` by 12 to make monthly comparisons
export const interpolateIncomeCentileByAmount = amount => BigNumber(interpolateIncomeCentile({ y: amount*12 }))
    .decimalPlaces(1)
    .toNumber()

export const interpolateIncomeAmountByCentile = centile => BigNumber(interpolateIncomeCentile({ x: centile }))
    .decimalPlaces(2)
    .toNumber()

export const MEDIAN_INCOME = interpolateIncomeAmountByCentile(50)

// country code -> currency code lookup
export const getCurrency = countryCode => {
  try {
    return currencies(countryCode)[0]
  } catch (err) {
    // don't choke on invalid code errors, just return a blank object
    if (/INVALIDCODE/.test(err)) return {}
    else console.warn(err)
  }
}
export const getCurrencyCode = countryCode => getCurrency(countryCode).alphaCode
export const getCryptoExchange = async (coinCode) => {
  const coinSymbol = coinCode === 'BTC' ? 'XBT' : coinCode;
  const pair = `${coinSymbol}USD`;
  const response = await fetch(`${KRAKEN_TICKER_API}?pair=${pair}`);
  const body = await response.json();

  if (body !== undefined) {
    const key = coinSymbol === 'USDC' ? 'USDCUSD' : `X${coinSymbol}ZUSD`;
    return body.result[key].b[0];
  }
  throw new TypeError('Kraken API response body is undefined');
} 
// calculate how to adjust for household size using OECD equivalised income
// the weightings are for first adult, subsequent adults and children respectively:
//   1, 0.7, 0.5
export const householdEquivalizationFactor = ({adults = 0, children = 0}) =>
  (
    (adults === 1
      ? BigNumber(1)
      : BigNumber(adults).times(0.7).plus(0.3)
    ).plus(
      (BigNumber(children).dividedBy(2))
    )
  ).toNumber()

// PPP conversion - returns an amount in Internationalized Dollar$
export const internationalizeIncome = (donation, countryCode) => BigNumber(donation)
  .multipliedBy(EXCHANGE_RATES[countryCode].rate) // convert cryptoUSD price to local currency,
  .dividedBy(PPP_CONVERSION[countryCode].factor) // then determine purchasing price parity
  .decimalPlaces(2)
  .toNumber()

// Exchange rate currency conversion, returns an amount in USD
export const convertIncome = (donation, exchangeRate) => BigNumber(donation)
  .multipliedBy(exchangeRate)
  .decimalPlaces(2)
  .toNumber()

// equivalises a donation to a particular household composition
export const equivalizeIncome = (donation, household) => BigNumber(donation)
  .dividedBy(householdEquivalizationFactor(household))
  .decimalPlaces(2)
  .toNumber()

// calculate how many times the monthly median income a person's donation is
export const getMedianMultiple = donation => BigNumber(donation)
  .dividedBy(MEDIAN_INCOME/12) //divide by 12 for monthly rate
  .decimalPlaces(1)
  .toNumber()

// gold-plated way of multiplying by a decimal
export const getIncomeAfterDonating = (donation, donationPercentage) =>
  BigNumber(donation)
    .times(BigNumber(100).minus(donationPercentage).dividedBy(100))
    .decimalPlaces(2)
    .toNumber()

// the main event. takes a donation, country code and household composition,
// and returns a bunch of useful stats for making comparisons to the
// rest of the world
export const calculate = ({ donation, countryCode, exchangeRate, household }) => {
  const convertedIncome = convertIncome(donation, exchangeRate)
  console.log("Converted Income: ", convertedIncome)
  const internationalizedIncome = internationalizeIncome(convertedIncome, countryCode)
  console.log("Internationalized Income ", internationalizedIncome)
  const equivalizedIncome = equivalizeIncome(internationalizedIncome, household)
  console.log("Equivalized Income ", equivalizedIncome)
  const incomeCentile = Math.min(99, interpolateIncomeCentileByAmount(equivalizedIncome))
  console.log("Income Centile: ", incomeCentile)
  const incomeTopPercentile = BigNumber(100).minus(incomeCentile).decimalPlaces(1).toNumber()
  console.log("Income Top Percentile: ", incomeTopPercentile)
  const medianMultiple = getMedianMultiple(equivalizedIncome)
  console.log("Median multiple: ", medianMultiple)

  return {
    internationalizedIncome,
    equivalizedIncome,
    convertedIncome,
    incomeCentile,
    incomeTopPercentile,
    medianMultiple
  }
}

export const getDonationComparisonAmount = (donationAmount, comparison) =>
  Math.floor(donationAmount / comparison.cost)