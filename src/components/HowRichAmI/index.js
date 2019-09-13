import React from 'react'
import Grid from '@material-ui/core/Grid'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import DoneIcon from '@material-ui/icons/Done'
import Slider from '@material-ui/core/Slider'
import COUNTRIES from 'lib/calculate/data/countries.json'
import { calculate, getCurrencyCode } from 'lib/calculate'
import { FormattedNumber } from 'react-intl'
import BigNumber from 'bignumber.js'
// import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles(theme => ({
//   root: {
//     flexGrow: 1
//   }
// }))

const MAX_HOUSEHOLD_NUMBER = 10

export const parseNumericInput = input => {
  if (input === '') return ''
  const val = BigNumber(input.replace(/[^\d]/g, '')).toNumber()
  return isNaN(val) ? '' : val
}

export const validInteger = input => typeof input === 'number' && /^\d+$/.test(input.toString())

const Controls = ({ income, countryCode, household, onChange, onCalculate }) => {
  // change handlers
  const handleCountryChange = event => onChange({ countryCode: event.target.value })

  const handleIncomeChange = event => {
    const income = parseNumericInput(event.target.value)
    onChange({ income })
  }

  const handleHouseholdChange = (event, key) => {
    const val = parseNumericInput(event.target.value)
    if (typeof val === 'number' && val > MAX_HOUSEHOLD_NUMBER) return
    onChange({ household: { ...household, ...{ [key]: val } } })
  }

  return <form>
    <Grid container spacing={4}>

      <Grid item sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel htmlFor="select-country">Country</InputLabel>
          <Select onChange={handleCountryChange} value={countryCode} inputProps={{
            name: 'country'
          }}>
            {COUNTRIES.map(Country => <MenuItem key={Country.code} value={Country.code}>
              {Country.name}
            </MenuItem>)}
          </Select>
          <FormHelperText>Select your country</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel htmlFor='income'>Income</InputLabel>
          <Input
            value={income}
            id='income'
            onChange={handleIncomeChange}
            endAdornment={<InputAdornment position='end'>{getCurrencyCode(countryCode)}</InputAdornment>}
          />
          <FormHelperText>
            Enter your <strong>post-tax</strong> household income in{' '}
            {getCurrencyCode(countryCode)}
          </FormHelperText>
        </FormControl>
      </Grid>

      <Grid item sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel htmlFor='household[adults]'>Adults</InputLabel>
          <Input value={household.adults} onChange={event => handleHouseholdChange(event, 'adults')} />
          <FormHelperText>Enter the number of adults in your household</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel htmlFor='household[children]'>Children</InputLabel>
          <Input value={household.children} onChange={event => handleHouseholdChange(event, 'children')} />
          <FormHelperText>Enter the number of children in your household</FormHelperText>
        </FormControl>
      </Grid>

    </Grid>

    <Grid container justify='center' spacing={4}>
      <Grid item xs={12} sm={8} md={6}>
        <Button fullWidth color='primary' variant='contained' onClick={onCalculate}>Calculate <DoneIcon /></Button>
      </Grid>
    </Grid>
  </form>
}

const Calculation = ({ income, countryCode, household }) => {
  const { incomeCentile, medianMultiple } = calculate({ income, countryCode, household })
  return <Grid container spacing={4} justify='center'>
    <Grid item xs={12}>
      If you have a household income of{' '}
      <FormattedNumber value={income} style='currency' currency={getCurrencyCode(countryCode)} minimumFractionDigits={0} />
    </Grid>
    <Grid item sm={6}>You are in the richest {incomeCentile}% of the global population.</Grid>
    <Grid item sm={6}>Your income is more than {medianMultiple} times the global median.</Grid>
  </Grid>
}


const formatPercentage = val => `${val}%`

const DONATION_SLIDER_MARKS = [...Array(50).keys()]
  .filter(v => v % 5 === 0)
  .map(v => ({ value: v, label: formatPercentage(v) }))

const DonationCalculation = ({ income, countryCode, household, donationPercentage, onDonationPercentageChange }) => {
  const donationIncome = BigNumber(income * (100 - donationPercentage) / 100).dp(2).toNumber()
  const { incomeCentile, medianMultiple } = calculate({ income: donationIncome, countryCode, household })
  return <Grid container spacing={4} justify='center'>
    <Grid item xs={12}>If you were to donate {donationPercentage}% of your income</Grid>
    <Grid item xs={12}>
      <Slider
        value={donationPercentage}
        getAriaValueText={formatPercentage}
        aria-labelledby="discrete-slider-always"
        step={1}
        min={1}
        max={50}
        marks={DONATION_SLIDER_MARKS}
        onChange={onDonationPercentageChange}
      />
    </Grid>
    <Grid item sm={12}>
      You would have a household income of{' '}
      <FormattedNumber value={donationIncome} style='currency' currency={getCurrencyCode(countryCode)} minimumFractionDigits={0} />
    </Grid>
    <Grid item sm={6}>You would still be in the richest {incomeCentile}% of the global population.</Grid>
    <Grid item sm={6}>Your income would still be more than {medianMultiple} times the global median.</Grid>
  </Grid>
}

class HowRichAmI extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      income: 28400,
      countryCode: 'USA',
      household: {
        adults: 1,
        children: 0
      },
      donationPercentage: 10,
      showCalculations: true
    }
  }

  handleCalculate = () => {
    // const { income, countryCode, household, donationPercentage } = this.state
    // const baseCalculation = calculate({ income, countryCode, household })
    // const donationIncome = BigNumber(donationPercentage)
    //   .times((100 - donationPercentage) / 100)
    //   .decimalPlaces(0)
    //   .toNumber()
    // const donationCalculation = calculate({ income: donationIncome, countryCode, household })
    this.setState({ showCalculations: true })
  }

  handleControlsChange = newState => this.setState({
    ...newState,
    showCalculations: false
  })

  handleDonationPercentageChange = (event, donationPercentage) => this.setState({ donationPercentage })

  render = () => {
    const { showCalculations } = this.state

    return <div>
      <Controls {...this.state} onChange={this.handleControlsChange} onCalculate={this.handleCalculate}/>
      {showCalculations && <React.Fragment>
        <Calculation {...this.state} />
        <DonationCalculation {...this.state} onDonationPercentageChange={this.handleDonationPercentageChange} />
      </React.Fragment>}
    </div>
  }
}

export default HowRichAmI
