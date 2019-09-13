import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import Slider from '@material-ui/core/Slider'
import COUNTRIES from 'lib/calculate/data/countries.json'
import { calculate, getCurrencyCode, getDonationComparisonAmount } from 'lib/calculate'
import { FormattedNumber } from 'react-intl'
import BigNumber from 'bignumber.js'
import { COMPARISONS, getMedianMultiple } from '../../lib/calculate'
import ChartistGraph from 'react-chartist'
import Legend from "chartist-plugin-legend"
import { withStyles } from '@material-ui/core/styles'

const MAX_HOUSEHOLD_NUMBER = 10
const GRID_SPACING = 4

export const getCountryName = countryCode => {
  const country = COUNTRIES.filter(c => c.code === countryCode)[0]
  return country ? country.name : null
}

export const parseNumericInput = input => {
  if (input === '') return ''
  const val = BigNumber(input.replace(/[^\d]/g, '')).toNumber()
  return isNaN(val) ? '' : val
}

export const validCountry = input => COUNTRIES.some(country => country.code === input)
export const validInteger = input => typeof input === 'number' && /^\d+$/.test(input.toString())
export const greaterThanZero = input => typeof input === 'number' && input > 0

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

  const isValid = [
    validCountry(countryCode),
    validInteger(income) && greaterThanZero(income),
    validInteger(household.adults) && greaterThanZero(household.adults),
    validInteger(household.children)
  ].every(a => a)
  return <form>
    <Grid container spacing={GRID_SPACING}>

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

    <Grid container justify='center' spacing={GRID_SPACING}>
      <Grid item xs={12} sm={8} md={6}>
        <Button fullWidth color='primary' variant='contained' disabled={!isValid} onClick={onCalculate}>Calculate <CheckCircleIcon /></Button>
      </Grid>
    </Grid>
  </form>
}

const formatPercentage = val => `${val}%`

const MAX_DONATION_SLIDER_VALUE = 50
const DONATION_SLIDER_MARKS = [...Array(MAX_DONATION_SLIDER_VALUE).keys()]
  .filter(v => v % 5 === 0)
  .map(v => ({ value: v, label: formatPercentage(v) }))

const pieChartOptions = {
  donut: true,
  labelDirection: 'explode',
}
const PieChart = ({ data }) => {
  return <ChartistGraph className='ct-minor-seventh' type='Pie' data={data} options={pieChartOptions} />
}

const getIncomeCentileData = ({ incomeCentile }) => ({
  series: [
    100 - incomeCentile,
    incomeCentile
  ],
  labels: [
    'People richer than you',
    "People you're richer than"
  ]
})

const getMedianMultipleData = ({ medianMultiple }) => ({
  labels: ["Median person's income", 'Your income'],
  series: [
    [1, medianMultiple]
  ]
})

const barChartOptions = {}
const BarChart = ({ data }) => {
  return <ChartistGraph className='ct-minor-seventh' type='Bar' data={data} options={barChartOptions} />
}

const Calculation = ({ income, countryCode, household }) => {
  try {
    const { incomeCentile, medianMultiple } = calculate({ income, countryCode, household })
    if (incomeCentile <= 50) {
      return <Grid item xs={12}><Typography>
        Your income is below the global median.
      </Typography></Grid>
    }
    const incomeCentileData = getIncomeCentileData({ incomeCentile })

    return <Grid container spacing={4} justify='center'>
      <Grid item xs={12}>
        <Typography>
          If you have a household income of{' '}
          <FormattedNumber value={income} style='currency' currency={getCurrencyCode(countryCode)} minimumFractionDigits={0} />
        </Typography>
      </Grid>
      <Grid item sm={6}>
        <PieChart data={incomeCentileData} />
        <Typography>You are in the richest {incomeCentile}% of the global population.</Typography>
      </Grid>
      <Grid item sm={6}>
        <BarChart data={getMedianMultipleData({ medianMultiple })} />
        <Typography>Your income is more than {medianMultiple} times the global median.</Typography>
      </Grid>
    </Grid>
  } catch (err) {
    console.warn(err)
    return <Grid item xs={12}><Typography>
      Sorry, we don't have data for {getCountryName(countryCode)}
    </Typography></Grid>
  }
}

const DonationCalculation = ({ income, countryCode, household, donationPercentage, onDonationPercentageChange }) => {
  try {
    const donationIncome = BigNumber(income * (100 - donationPercentage) / 100).dp(2).toNumber()
    const donationValue = BigNumber(income).minus(donationIncome).dp(2).toNumber()
    const { incomeCentile, medianMultiple, convertedIncome } = calculate({ income, countryCode, household })
    if (incomeCentile <= 50) return null
    return <Grid container spacing={GRID_SPACING} justify='center'>
      <Grid item xs={12}><Typography>If you were to donate {donationPercentage}% of your income</Typography></Grid>
      <Grid item xs={12}>
        <Slider
          value={donationPercentage}
          getAriaValueText={formatPercentage}
          aria-labelledby="discrete-slider-always"
          step={1}
          min={1}
          max={MAX_DONATION_SLIDER_VALUE}
          marks={DONATION_SLIDER_MARKS}
          onChange={onDonationPercentageChange}
        />
      </Grid>
      <Grid item sm={12}>
        <Typography>
          You would have a household income of{' '}
          <FormattedNumber value={donationIncome} style='currency' currency={getCurrencyCode(countryCode)} minimumFractionDigits={0} />,{' '}
          making{' '}
          <FormattedNumber value={donationValue} style='currency' currency={getCurrencyCode(countryCode)} minimumFractionDigits={0} />{' '}
          in donations.
        </Typography>
      </Grid>
      <Grid item sm={6}>
        <PieChart data={getIncomeCentileData({ incomeCentile })} />
        <Typography>
        You would still be in the richest {incomeCentile}% of the global population.
        </Typography>
      </Grid>
      <Grid item sm={6}>
        <BarChart data={getMedianMultipleData({ medianMultiple })} />
        <Typography>
        Your income would still be more than {medianMultiple} times the global median.
        </Typography>
      </Grid>
      <Grid item sm={12}>
        <DonationComparisons value={convertedIncome} />
      </Grid>
    </Grid>
  } catch (err) {
    console.warn(err)
    return null
  }
}

const DONATION_COMPARISON_PLACEHOLDER = '%%'
const DonationComparison = ({ value, comparison }) => {
  const parts = comparison.description.split(DONATION_COMPARISON_PLACEHOLDER)
  const elements = [
    parts[0],
    <FormattedNumber value={getDonationComparisonAmount(value, comparison)} />,
    parts[1]
  ].map((el, i) => <span key={i}>{el}</span>)
  return <div>
    <Typography>{elements}</Typography>
  </div>
}

const DonationComparisons = ({ value }) => <Grid container spacing={GRID_SPACING}>
  <Grid item xs={12}><Typography>And each year your donations could fund</Typography></Grid>
  {COMPARISONS.map(Comparison => <Grid item xs={4} key={Comparison.id}>
    <DonationComparison value={value} comparison={Comparison} />
  </Grid>)}
</Grid>

const Heading = props => <header>
  <Typography variant='h2'>How Rich Am I?</Typography>
  <Typography variant='subtitle1'>Find out how rich you are compared to the rest of the world</Typography>
</header>

const styles = theme => ({
  container: {
    textAlign: 'center',
    '& .ct-chart-donut': {
      '& .ct-label': {
        fontSize: '1rem'
      }
    },
    '& .ct-series-a': {
      '& .ct-slice-donut, .ct-slice-bar': {
        stroke: theme.palette.secondary.dark
      },
      '& .ct-bar': {
        stroke: theme.palette.primary.main
      }
    },
    '& .ct-series-b': {
      '& .ct-slice-donut, .ct-slice-bar': {
        stroke: theme.palette.secondary.main
      },
      '& .ct-bar': {
        stroke: theme.palette.primary.main
      }
    },
    // '& .ct-legend': {
    //   position: 'relative',
    //   zIndex: 10,
    //   '& li': {
    //     position: 'relative',
    //     paddingLeft: 23,
    //     marginBottom: 3
    //   },
    //   '& li: before': {
    //     width: 12,
    //     height: 12,
    //     position: 'absolute',
    //     left: 0,
    //     content: '',
    //     border: '3px solid transparent',
    //     borderRadius: 2
    //   },
    //   '& li.inactive:before': {
    //     background: 'transparent'
    //   },
    //   '&.ct-legend-inside': {
    //     position: 'absolute',
    //     top: 0,
    //     right: 0
    //   },
    //   '.ct-series-a:before': {
    //     backgroundColor: theme.palette.primary.main,
    //     borderColor: theme.palette.primary.main
    //   }
    // }
  }
})

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
    const { classes } = this.props
    // const classes = useStyles()
    return <div className={classes.container}>
      <Heading />
      <Controls {...this.state} onChange={this.handleControlsChange} onCalculate={this.handleCalculate}/>
      {showCalculations && <React.Fragment>
        <Calculation {...this.state} />
        <DonationCalculation {...this.state} onDonationPercentageChange={this.handleDonationPercentageChange} />
      </React.Fragment>}
    </div>
  }
}

export default withStyles(styles)(HowRichAmI)
