/* eslint-env jest */
import {
  interpolateIncomeCentileByAmount,
  interpolateIncomeAmountByCentile,
  MEDIAN_INCOME,
  getCurrencyCode,
  householdEquivalizationFactor,
  internationalizeIncome,
  equivalizeIncome,
  convertIncome,
  getMedianMultiple,
  getIncomeAfterDonating,
  calculate,
  getDonationComparisonAmount
} from './'

import COMPARISONS from './data/comparisons.json'

describe('income centile interpolation', () => {
  test('interpolateIncomeCentileByAmount is sane', () => {
    const centile = interpolateIncomeCentileByAmount(21000)
    expect(centile).toBeGreaterThan(90)
  })

  test('interpolateIncomeAmountByCentile is sane', () => {
    const amount = interpolateIncomeAmountByCentile(95)
    expect(amount).toBeGreaterThan(25000)
  })

  test('median income is sane', () => {
    expect(MEDIAN_INCOME).toBeGreaterThan(2800)
    expect(MEDIAN_INCOME).toBeLessThan(2900)
  })

})

describe('currencies', () => {
  test('currency code lookup is sane', () => {
    expect(getCurrencyCode('AUS')).toBe('AUD')
    expect(getCurrencyCode('USA')).toBe('USD')
    expect(getCurrencyCode('TWN')).toBe('TWD')
  })
  test('invalid country codes fail gracefully', () => {
    expect(getCurrencyCode('XKX')).toBe(undefined)
  })
})

describe('householdEquivalizationFactor', () => {
  test('one adult', () => {
    expect(householdEquivalizationFactor({ adults: 1 })).toBe(1)
  })
  test('two adults', () => {
    expect(householdEquivalizationFactor({ adults: 2 })).toBe(1.7)
  })
  test('three adults', () => {
    expect(householdEquivalizationFactor({ adults: 3 })).toBe(2.4)
  })
  test('one adult, two children', () => {
    expect(householdEquivalizationFactor({ adults: 1, children: 2 })).toBe(2)
  })
  test('two adults, five children', () => {
    expect(householdEquivalizationFactor({ adults: 2, children: 5 })).toBe(4.2)
  })
})

describe('internationalise income', () => {
  test('20 EUR in Germany is sane', () => {
    const german20EUR = internationalizeIncome(20, 'DEU')
    expect(german20EUR).toBeGreaterThan(20)
    expect(german20EUR).toBeLessThan(30)
  })
  test('10000 Japanese Yen is sane', () => {
    const jpy = internationalizeIncome(10000, 'JPN')
    expect(jpy).toBeGreaterThan(90)
    expect(jpy).toBeLessThan(110)
  })
})

test('equivalizeIncome', () => {
  // 1 adult 2 children should be an equivalization factor of 2
  const equivalizedIncome = equivalizeIncome(10000, { adults: 1, children: 2 })
  expect(equivalizedIncome).toBe(5000)
})

test('getMedianMultiple', () => {
  expect(getMedianMultiple(30000)).toBe(10.6)
})

test('getIncomeAfterDonating', () => {
  expect(getIncomeAfterDonating(30000, 10)).toBe(27000)
})

describe('convert currency', () => {
  test('10000 Australian dollars', () => {
    expect(convertIncome(10000, 'AUS')).toBe(7719.53)
  })
})

describe('calculate', () => {
  test('median household in the UK', () => {
    const income = 28400
    const countryCode = 'GBR'
    const household = { adults: 1, children: 1 }
    const result = calculate({ income, countryCode, household })
    const {
      internationalizedIncome,
      equivalizedIncome,
      convertedIncome,
      incomeCentile,
      incomeTopPercentile,
      medianMultiple
    } = result
    // Results are for datasets as of 2019-09-11. If you update the datasets,
    // hand-calculate these values before running the tests again!!!
    expect(internationalizedIncome).toBe(41230.05)
    expect(equivalizedIncome).toBe(27486.7)
    expect(convertedIncome).toBe(39155.82)
    expect(incomeCentile).toBe(94.4)
    expect(incomeTopPercentile).toBe(5.6)
    expect(medianMultiple).toBe(9.7)
  })

  test('median household in Singapore', () => {
    const income = 53000
    const countryCode = 'SGP'
    const household = { adults: 1, children: 1 }
    const result = calculate({ income, countryCode, household })
    const {
      internationalizedIncome,
      equivalizedIncome,
      convertedIncome,
      incomeCentile,
      incomeTopPercentile,
      medianMultiple
    } = result
    // Results are for datasets as of 2019-09-11. If you update the datasets,
    // hand-calculate these values before running the tests again!!!
    expect(internationalizedIncome).toBe(61666.88) // income / 0.859456454258084
    expect(equivalizedIncome).toBe(41111.25) // internationalizedIncome / 1.5
    expect(convertedIncome).toBe(39992.58) // income / 1.325245889
    expect(incomeCentile).toBe(97.6)
    expect(incomeTopPercentile).toBe(2.4)
    expect(medianMultiple).toBe(14.6)
  })

  test('median tops out at 99th percential', () => {
    const income = 284000000
    const countryCode = 'GBR'
    const household = { adults: 1, children: 1 }
    const result = calculate({ income, countryCode, household })
    const {
      incomeCentile
    } = result
    expect(incomeCentile).toBe(99)
  })

})

test('getDonationComparisonAmount', () => {
  const comparison = COMPARISONS.filter(c => c.id === 'bednets')[0]
  expect(getDonationComparisonAmount(3000, comparison)).toBe(476)
})
