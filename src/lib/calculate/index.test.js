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
    const centile = interpolateIncomeCentileByAmount(20000)
    expect(centile).toBe(92.4)
  })

  test('interpolateIncomeAmountByCentile is sane', () => {
    const amount = interpolateIncomeAmountByCentile(95)
    expect(amount).toBeGreaterThan(25000)
  })

  test('median income is sane', () => {
    expect(MEDIAN_INCOME).toBeGreaterThan(2700)
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
    expect(householdEquivalizationFactor({ adults: 2 })).toBe(2)
  })
  test('three adults', () => {
    expect(householdEquivalizationFactor({ adults: 3 })).toBe(3)
  })
  test('one adult, two children', () => {
    expect(householdEquivalizationFactor({ adults: 1, children: 2 })).toBe(3)
  })
  test('two adults, five children', () => {
    expect(householdEquivalizationFactor({ adults: 2, children: 5 })).toBe(7)
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
    expect(jpy).toBeGreaterThan(80)
    expect(jpy).toBeLessThan(110)
  })
})

test('equivalizeIncome', () => {
  // 1 adult 2 children should be an equivalization factor of 2
  const equivalizedIncome = equivalizeIncome(10000, { adults: 1, children: 2 })
  expect(equivalizedIncome).toBe(3333.33)
})

test('getMedianMultiple', () => {
  expect(getMedianMultiple(30000)).toBe(10.9)
})

test('getIncomeAfterDonating', () => {
  expect(getIncomeAfterDonating(30000, 10)).toBe(27000)
})

describe('convert currency', () => {
  test('10000 Australian dollars', () => {
    expect(convertIncome(10000, 'AUD')).toBe(6369.08)
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
    // Results are for datasets as of 2023. If you update the datasets,
    // hand-calculate these values before running the tests again!!!
    expect(internationalizedIncome).toBe(31041.73)
    expect(equivalizedIncome).toBe(15520.87)
    expect(convertedIncome).toBe(34638.54)
    expect(incomeCentile).toBe(89.1)
    expect(incomeTopPercentile).toBe(10.9)
    expect(medianMultiple).toBe(5.7)
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
    // Results are for datasets as of 2023. If you update the datasets,
    // hand-calculate these values before running the tests again!!!
    expect(internationalizedIncome).toBe(44812.71) // income / 1.1827002011308574
    expect(equivalizedIncome).toBe(22406.36) // internationalizedIncome / 2
    expect(convertedIncome).toBe(38803.94) // income / 1.3658405813953487
    expect(incomeCentile).toBe(93.7)
    expect(incomeTopPercentile).toBe(6.3)
    expect(medianMultiple).toBe(8.2)
  })

  // OWID PPP data does not support Russia
  // test('median household in Russia', () => {
  //   const income = 528000
  //   const countryCode = 'RUS'
  //   const household = { adults: 1, children: 1 }
  //   const result = calculate({ income, countryCode, household })
  //   const {
  //     internationalizedIncome,
  //     equivalizedIncome,
  //     convertedIncome,
  //     incomeCentile,
  //     incomeTopPercentile,
  //     medianMultiple
  //   } = result
  //   // Results are for datasets as of 2019-09-11. If you update the datasets,
  //   // hand-calculate these values before running the tests again!!!
  //   expect(internationalizedIncome).toBe(20261.14) // income / 26.059744
  //   expect(equivalizedIncome).toBe(13507.43) // internationalizedIncome / 1.5
  //   expect(convertedIncome).toBe(8876.08) // income / 59.48571323299
  //   expect(incomeCentile).toBe(84.5)
  //   expect(incomeTopPercentile).toBe(15.5)
  //   expect(medianMultiple).toBe(4.8)
  // })

  test('median tops out at 99.9th percential', () => {
    const income = 284000000
    const countryCode = 'GBR'
    const household = { adults: 1, children: 1 }
    const result = calculate({ income, countryCode, household })
    const {
      incomeCentile
    } = result
    expect(incomeCentile).toBe(99.9)
  })
})

test('getDonationComparisonAmount', () => {
  const comparison = COMPARISONS.filter(c => c.id === 'bednets')[0]
  expect(getDonationComparisonAmount(498, comparison)).toBe("101")
})

test('getDonationComparisonAmount', () => {
  const comparison = COMPARISONS.filter(c => c.id === 'lives')[0]
  expect(getDonationComparisonAmount(3541, comparison)).toBe("1.0")
})

test('getDonationComparisonAmount', () => {
  const comparison = COMPARISONS.filter(c => c.id === 'lives')[0]
  expect(getDonationComparisonAmount(3710, comparison)).toBe("1.1")
})
