/* eslint-env jest */
// import React from 'react'
// import ReactDOM from 'react-dom'
import { parseNumericInput, validInteger } from './'

describe('parseNumericInput', () => {
  test('handle regular numbers', () => {
    expect(parseNumericInput('22')).toBe(22)
  })

  test('handle strings with numbers in them', () => {
    expect(parseNumericInput('22test5')).toBe(225)
  })

  test('handle strings with letter "e"', () => {
    expect(parseNumericInput('22e5')).toBe(225)
  })
})


describe('validation', () => {
  test('validInteger', () => {
    expect(validInteger(1234)).toBe(true)
    expect(validInteger(1234.3)).toBe(false)
    expect(validInteger("1234")).toBe(false)
  })
})
