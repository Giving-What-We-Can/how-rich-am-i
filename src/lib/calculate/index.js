import { currencies } from 'countryinfo'
import interpolate from 'linear-interpolator'
import INCOME_CENTILES from './data/income_centiles.json'
import PPP_CONVERSION from './data/ppp_conversion.json'
import EXCHANGE_RATES from './data/exchange_rates.json'
import COMPARISONS from './data/comparisons.json'
import BigNumber from 'bignumber.js'
export { COMPARISONS }

const interpolateIncomeCentileByAmountInterpolator = interpolate(
  INCOME_CENTILES.map(centile => ([centile.daily_2017_dollars * 365, centile.percentile]))
)

const interpolateIncomeAmountByCentileInterpolator = interpolate(
  INCOME_CENTILES.map(centile => ([centile.percentile, centile.daily_2017_dollars * 365]))
)

export const interpolateIncomeCentileByAmount = amount => BigNumber(interpolateIncomeCentileByAmountInterpolator(amount))
  .decimalPlaces(1)
  .toNumber()

export const interpolateIncomeAmountByCentile = centile => BigNumber(interpolateIncomeAmountByCentileInterpolator(centile))
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

export const householdEquivalizationFactor = ({ adults = 0, children = 0 }) =>
  Number(adults) + Number(children)

// PPP conversion - returns an amount in I$
export const internationalizeIncome = (income, countryCode) => BigNumber(income)
  .dividedBy(PPP_CONVERSION[countryCode])
  .decimalPlaces(2)
  .toNumber()

// Exchange rate currency conversion, returns an amount in USD
export const convertIncome = (income, currencyCode) => BigNumber(income)
  .dividedBy(EXCHANGE_RATES[currencyCode].rate)
  .decimalPlaces(2)
  .toNumber()

// equivalises an income to a particular household composition
export const equivalizeIncome = (income, household) => BigNumber(income)
  .dividedBy(householdEquivalizationFactor(household))
  .decimalPlaces(2)
  .toNumber()

// calculate how many times the median income a person's income is
export const getMedianMultiple = income => BigNumber(income)
  .dividedBy(MEDIAN_INCOME)
  .decimalPlaces(1)
  .toNumber()

// gold-plated way of multiplying by a decimal
export const getIncomeAfterDonating = (income, donationPercentage) =>
  BigNumber(income)
    .times(BigNumber(100).minus(donationPercentage).dividedBy(100))
    .decimalPlaces(2)
    .toNumber()

// the main event. takes an income, country code and household composition,
// and returns a bunch of useful stats for making comparisons to the
// rest of the world
export const calculate = ({ income, countryCode, household }) => {
  const internationalizedIncome = internationalizeIncome(income, countryCode)
  const equivalizedIncome = equivalizeIncome(internationalizedIncome, household)
  const convertedIncome = convertIncome(income, getCurrencyCode(countryCode))
  const incomeCentile = Math.min(99.9, interpolateIncomeCentileByAmount(equivalizedIncome))
  const incomeTopPercentile = BigNumber(100).minus(incomeCentile).decimalPlaces(1).toNumber()
  const medianMultiple = getMedianMultiple(equivalizedIncome)

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
  (donationAmount / comparison.cost).toFixed(comparison.fractionDigits)
