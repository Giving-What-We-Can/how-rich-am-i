import { currencies } from 'countryinfo'
import { single as interpolate } from 'simple-interpolation'
import INCOME_CENTILES from './data/income_centiles.json'
import PPP_CONVERSION from './data/ppp_conversion.json'
import EXCHANGE_RATES from './data/exchange_rates.json'
import COMPARISONS from './data/comparisons.json'
import BigNumber from 'bignumber.js'
export { COMPARISONS }

// data interpolation
const interpolateIncomeCentile = interpolate(
  INCOME_CENTILES.map(centile => ({ x: centile.percentage, y: centile.international_dollars }))
)

export const interpolateIncomeCentileByAmount = amount => BigNumber(interpolateIncomeCentile({ y: amount }))
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

// calculate how to adjust for household size using OECD equivalised income
// the weightings are for first adult, subsequent adults and children respectively:
//   1, 0.7, 0.5
export const householdEquivalizationFactor = ({ adults = 0, children = 0 }) =>
  (
    (adults === 1
      ? BigNumber(1)
      : BigNumber(adults).times(0.7).plus(0.3)
    ).plus(
      (BigNumber(children).dividedBy(2))
    )
  ).toNumber()

// PPP conversion - returns an amount in I$
export const internationalizeIncome = (income, countryCode) => BigNumber(income)
  .dividedBy(PPP_CONVERSION[countryCode].factor)
  .decimalPlaces(2)
  .toNumber()

// Exchange rate currency conversion, returns an amount in USD
export const convertIncome = (income, countryCode) => BigNumber(income)
  .dividedBy(EXCHANGE_RATES[countryCode].rate)
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
  const convertedIncome = convertIncome(income, countryCode)
  const incomeCentile = Math.min(99, interpolateIncomeCentileByAmount(equivalizedIncome))
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
  Math.floor(donationAmount / comparison.cost)
