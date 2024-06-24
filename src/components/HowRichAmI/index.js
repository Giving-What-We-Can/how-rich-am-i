import React from 'react'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Container from '@material-ui/core/Container'
import Divider from '@material-ui/core/Divider'
import { withRouter } from 'react-router-dom'
import qs from 'qs'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import InputAdornment from '@material-ui/core/InputAdornment'
import FormHelperText from '@material-ui/core/FormHelperText'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import SvgIcon from '@material-ui/core/SvgIcon'
import Slider from '@material-ui/core/Slider'
import Hidden from '@material-ui/core/Hidden'

import COUNTRIES from 'lib/calculate/data/countries.json'
import { FormattedNumber } from 'react-intl'
import BigNumber from 'bignumber.js'
import { COMPARISONS, MEDIAN_INCOME, calculate, getCurrencyCode, getDonationComparisonAmount, convertIncome } from '../../lib/calculate'
import ChartistGraph from 'react-chartist'
import { withStyles } from '@material-ui/core/styles'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import MainMenu from 'components/Menus/MainMenu'
import PageWrapper from 'components/Page'
import { Page } from 'components/Contentful'

const MAX_HOUSEHOLD_NUMBER = 10
const GRID_SPACING = 4
const CTA_URL = 'https://www.givingwhatwecan.org/best-charities-to-donate-to-2022'

const CenteredInput = withStyles({
  input: {
    textAlign: 'center'
  }
})(Input)

const ThemedSlider = withStyles(theme => ({
  root: {
    color: theme.palette.orange[300]
  }
}))(Slider)

export const getCountryName = countryCode => {
  const country = COUNTRIES.filter(c => c.code === countryCode)[0]
  return country ? country.name : null
}

export const parseNumericInput = input => {
  if (input === '') return ''
  const val = BigNumber(input.replace(/,/g, '').replace(/^(\d+).*/g, '$1')).toNumber()
  return isNaN(val) ? '' : val
}

export const validCountry = input => COUNTRIES.some(country => country.code === input)
export const validInteger = input => typeof input === 'number' && /^\d+$/.test(input.toString())
export const greaterThanZero = input => typeof input === 'number' && input > 0

const controlsStyles = theme => ({
  root: {
    margin: theme.spacing(GRID_SPACING, 0)
  }
})

const validateSettings = ({ income, countryCode, household }) => [
  validCountry(countryCode),
  validInteger(income) && greaterThanZero(income),
  validInteger(household.adults) && greaterThanZero(household.adults),
  validInteger(household.children)
].every(a => a)

const Controls = withStyles(controlsStyles)(({ income, countryCode, household, onChange, onCalculate, classes }) => {
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

  const isValid = validateSettings({ income, countryCode, household })

  return <form className={classes.root}>
    <Grid container spacing={GRID_SPACING}>

      <Grid item xs={12} sm={6} md={3}>
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

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel htmlFor='income'>Income</InputLabel>
          <CenteredInput
            value={income}
            id='income'
            onChange={handleIncomeChange}
            endAdornment={<InputAdornment position='end'>{getCurrencyCode(countryCode)}</InputAdornment>}
          />
          <FormHelperText>
            Enter your annual <strong>post-tax</strong> household income in{' '}
            {getCurrencyCode(countryCode)}
          </FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel htmlFor='household[adults]'>Adults</InputLabel>
          <CenteredInput value={household.adults} onChange={event => handleHouseholdChange(event, 'adults')} />
          <FormHelperText>Enter the number of adults in your household</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel htmlFor='household[children]'>Children</InputLabel>
          <CenteredInput value={household.children} onChange={event => handleHouseholdChange(event, 'children')} />
          <FormHelperText>Enter the number of children in your household</FormHelperText>
        </FormControl>
      </Grid>

    </Grid>

    <Grid container justify='center' spacing={GRID_SPACING}>
      <Grid item xs={12} sm={8} md={6}>
        <Button size='large' color='primary' variant='contained' disabled={!isValid} onClick={onCalculate}>Calculate</Button>
      </Grid>
    </Grid>
  </form>
})

Controls.propTypes = {
  income: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  countryCode: PropTypes.string.isRequired,
  household: PropTypes.shape({
    adults: PropTypes.number.isRequired,
    children: PropTypes.number
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onCalculate: PropTypes.func.isRequired
}

const pieChartOptions = {
  donut: true
}
const PieChart = ({ data }) => {
  return <ChartistGraph className='ct-minor-seventh' type='Pie' data={data} options={pieChartOptions} />
}

PieChart.propTypes = {
  data: PropTypes.object.isRequired
}

const getIncomeCentileData = ({ incomeCentile, incomeTopPercentile }) => {
  if (incomeTopPercentile < 1) {
    return {
      series: [1, 99],
      labels: [
        `People richer than you (<1%)`,
        `People you’re richer than (>99%)`,
      ],
    };
  }
  return {
    series: [incomeTopPercentile, incomeCentile],
    labels: [
      `People richer than you (${incomeTopPercentile}%)`,
      `People you’re richer than (${incomeCentile}%)`,
    ],
  };
};

const getMedianChartData = ({ equivalizedIncome }) => ({
  labels: ["Median person's income", 'Your income'],
  series: [
    [MEDIAN_INCOME, equivalizedIncome]
  ]
})

const barChartOptions = {
  axisY: {
    onlyInteger: true
  }
}
const BarChart = ({ data }) => {
  return <ChartistGraph className='ct-minor-seventh' type='Bar' data={data} options={barChartOptions} />
}

BarChart.propTypes = {
  data: PropTypes.object.isRequired
}

const calculationStyles = theme => ({
  root: {
    '& em': {
      borderBottom: '1px dashed',
      borderBottomColor: theme.palette.grey[800],
      fontStyle: 'normal'
    }
  },
  mainText: {
    color: theme.palette.text.default,
    fontSize: '2rem',
    fontWeight: 700
  },
  subMainText: {
    color: theme.palette.text.default,
    fontSize: '1rem'

  },
  chartText: {
    color: theme.palette.text.default,
    fontSize: '1.25rem',
    fontWeight: 700
  }
})

// <FormattedNumber /> requires a 'style' prop, but linters treat this as a reserved word. This is a workaround
// see https://github.com/formatjs/formatjs/issues/785#issuecomment-360295980
const FormattedCurrency = ({ style = 'currency', minimumFractionDigits = 0, maximumFractionDigits = 0, ...props }) => (
  <FormattedNumber
    style={style}
    minimumFractionDigits={minimumFractionDigits}
    maximumFractionDigits={maximumFractionDigits}
    {...props}
  />
)

FormattedCurrency.propTypes = {
  style: PropTypes.string,
  minimumFractionDigits: PropTypes.number,
  maximumFractionDigits: PropTypes.number
}

const Calculation = withStyles(calculationStyles)(({ income, countryCode, household, classes }) => {
  try {
    const { incomeCentile, incomeTopPercentile, medianMultiple, equivalizedIncome } = calculate({ income, countryCode, household })
    if (incomeCentile <= 50) {
      return <Grid container spacing={GRID_SPACING}>
        <Grid item xs={12}>
          <Typography paragraph>
            Sorry, the income you entered is below the global median income.{' '}
            We only have data for incomes higher than the global median.
          </Typography>
        </Grid>
      </Grid>
    }
    const incomeCentileData = getIncomeCentileData({ incomeCentile, incomeTopPercentile })

    return <Grid container spacing={4} justify='center' className={classes.root}>
      <Grid item xs={12}>
        <Typography className={classes.mainText}>
          If you have a household income of{' '}
          <FormattedCurrency value={income} currency={getCurrencyCode(countryCode)} />
        </Typography>
        <Typography className={classes.subMainText}>
          (in a household of {household.adults} adult{household.adults > 1 ? 's' : ''}
          {household.children > 0 && <span>
            {' '}and {household.children} child{household.children > 1 ? 'ren' : ''}
          </span>}
          )
        </Typography>
      </Grid>
      <Grid item sm={6}>
        <PieChart data={incomeCentileData} />
        <Typography className={classes.chartText}>You are in the richest <em>{incomeTopPercentile < 1 ? 1 : incomeTopPercentile}%</em> of the global population</Typography>
      </Grid>
      <Grid item sm={6}>
        <BarChart data={getMedianChartData({ equivalizedIncome })} />
        <Typography className={classes.chartText}>Your income is more than <em>{medianMultiple}</em> times the global median</Typography>
        <Typography variant='caption'>
          Income shown in household-equivalised{' '}
          <Link href='https://en.wikipedia.org/wiki/International_United_States_dollar' target='_blank' rel='noreferrer'>
            international dollars (I$)
          </Link>
        </Typography>
      </Grid>
    </Grid>
  } catch (err) {
    console.warn(err)
    return <Grid item xs={12}><Typography>
      Sorry, we {"don't"} have data for {getCountryName(countryCode)}
    </Typography></Grid>
  }
})

const formatPercentage = val => `${val}%`

const MAX_DONATION_SLIDER_VALUE = 50
const DONATION_SLIDER_MARKS = [...Array(MAX_DONATION_SLIDER_VALUE).keys()]
  .filter(v => v % 5 === 0)
  .map(v => ({ value: v, label: formatPercentage(v) }))

export const getDonationIncome = (income, donationPercentage) => BigNumber(income * (100 - donationPercentage) / 100).dp(2).toNumber()
export const getDonationValue = (income, donationPercentage) => BigNumber(income).minus(getDonationIncome(income, donationPercentage)).dp(2).toNumber()

const DonationCalculation = withStyles(calculationStyles)(({ income, countryCode, household, donationPercentage, onDonationPercentageChange, classes }) => {
  try {
    const donationIncome = getDonationIncome(income, donationPercentage)
    const donationAmount = income - donationIncome
    const { incomeCentile, incomeTopPercentile, medianMultiple, equivalizedIncome } = calculate({ income: donationIncome, countryCode, household })
    const convertedIncome = convertIncome(income, countryCode)
    const donationValue = getDonationValue(convertedIncome, donationPercentage)
    if (incomeCentile <= 50) return null
    return <Grid container spacing={GRID_SPACING} justify='center' className={classes.root}>
      <Grid item xs={12}>
        <Typography className={classes.mainText}>
          If you were to donate {donationPercentage}% of your income ...
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ThemedSlider
          value={donationPercentage}
          getAriaValueText={formatPercentage}
          step={donationPercentage >= 20 ? 5 : 1}
          min={1}
          max={MAX_DONATION_SLIDER_VALUE}
          marks={DONATION_SLIDER_MARKS}
          onChange={onDonationPercentageChange}
        />
      </Grid>
      <Grid item sm={12}>
        <Typography className={classes.mainText}>
          … you would have a household income of{' '}
          <FormattedCurrency value={donationIncome} currency={getCurrencyCode(countryCode)} />,{' '}
          and would make{' '}
          <FormattedCurrency value={donationAmount} currency={getCurrencyCode(countryCode)} />{' '}
          in donations …
        </Typography>
      </Grid>
      <Grid item sm={6}>
        <PieChart data={getIncomeCentileData({ incomeCentile, incomeTopPercentile })} />
        <Typography className={classes.chartText}>
          You would still be in the richest <em>{incomeTopPercentile < 1 ? 1 : incomeTopPercentile}%</em> of the global population
        </Typography>
      </Grid>
      <Grid item sm={6}>
        <BarChart data={getMedianChartData({ equivalizedIncome })} />
        <Typography className={classes.chartText}>
          Your income would still be more than <em>{medianMultiple}</em> times the global median
        </Typography>
      </Grid>
      <Grid item sm={12}>
        <DonationComparisons value={donationValue} />
      </Grid>
    </Grid>
  } catch (err) {
    console.warn(err)
    return null
  }
})

const donationComparisonStyles = theme => ({
  textContainer: {
    '& strong': {
      display: 'inline-block',
      width: '100%',
      fontSize: '2rem'
    }
  },
  comparisonText: {
    fontSize: '1.25rem',
    color: theme.palette.text.default
  },
  svgIcon: {
    width: '100%',
    maxWidth: 150,
    height: '100%',
    maxHeight: 150,
    fill: theme.palette.orange[300]
  }
})
const DONATION_COMPARISON_PLACEHOLDER = '%%'
const DonationComparison = withStyles(donationComparisonStyles)(({ value, comparison, classes }) => {
  const parts = comparison.description.split(DONATION_COMPARISON_PLACEHOLDER)
  const elements = [
    parts[0],
    <strong key='comparison-value'><FormattedNumber value={getDonationComparisonAmount(value, comparison)} /></strong>,
    parts[1]
  ].map((el, i) => <span key={i}>{el}</span>)
  return <Grid spacing={GRID_SPACING} container className={classes.root} alignItems='center'>
    <Grid item xs={6} className={classes.iconContainer}>
      <SvgIcon
        htmlColor={classes.fill}
        viewBox={comparison.icon.viewBox || '0 0 1000 1000'}
        width="100%" height="100%"
        preserveAspectRatio="xMidYMid meet"
        className={classes.svgIcon}
      >
        {comparison.icon.paths.map(path => <path d={path} key={path} />)}
      </SvgIcon>
    </Grid>
    <Grid item xs={6} className={classes.textContainer}>
      <Typography className={classes.comparisonText}>
        {elements}
      </Typography>
    </Grid>
  </Grid>
})

DonationComparison.propTypes = {
  value: PropTypes.number.isRequired,
  comparison: PropTypes.shape({
    id: PropTypes.string.isRequired,
    cost: PropTypes.number.isRequired,
    fractionDigits: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.shape({
      paths: PropTypes.array.isRequired,
      viewBox: PropTypes.string
    }).isRequired
  }).isRequired
}

const donationComparisonsStyles = theme => ({
  mainText: {
    color: theme.palette.text.default,
    fontSize: '2rem',
    fontWeight: 700
  },
  grid: {
    margin: theme.spacing(GRID_SPACING / 3, 0, GRID_SPACING)
  }
})

const DonationComparisons = withStyles(donationComparisonsStyles)(({ value, classes }) => <Grid container spacing={GRID_SPACING} justify='center'>
  <Grid item xs={12}>
    <Typography className={classes.mainText}>… and each year your donations could fund …</Typography>
  </Grid>
  {COMPARISONS.map(Comparison => <Grid item xs={12} md={4} key={Comparison.id}>
    <DonationComparison value={value} comparison={Comparison} />
  </Grid>)}
</Grid>)

DonationComparisons.propTypes = {
  value: PropTypes.number.isRequired
}

const headingStyles = theme => ({
  root: {
    margin: theme.spacing(0, 0, GRID_SPACING)
  },
  title: {
    color: theme.palette.text.default
  }
})

const Heading = withStyles(headingStyles)(({ classes }) => <header className={classes.root}>
  <Typography variant='h2' className={classes.title}>How Rich Am{'\u00A0'}I?</Typography>
  <Typography variant='subtitle1'>Find out how rich you are compared to the rest of the world – are you on the global rich list?</Typography>
</header>)

const Methodology = () => <Page showTitle={false} slug='how-rich-am-i-methodology' />

const methodologyDialogStyles = theme => ({
  root: {
    margin: 0
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(GRID_SPACING / 2),
    top: theme.spacing(GRID_SPACING / 2),
    color: theme.palette.grey[500]
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: `${theme.spacing(0.8)}px 0 ${theme.spacing(2)}px`,
    padding: `0 ${theme.spacing(2)}px`,
  },
  footerText: {
    color: theme.palette.text.default,
    fontSize: '0.8rem',
    fontWeight: 500,
    width: 'fit-content',
    '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline'
    }
  }
})

const MethodologyDialog = withStyles(methodologyDialogStyles)(({ open, onClose, classes }) =>
  <Dialog onClose={onClose} open={open} aria-labelledby='methodology-title' className={classes.root}>
    <DialogTitle disableTypography >
      <Typography id='methodology-title' variant='h4'>Methodology</Typography>
      <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent item>
      <Methodology />
    </DialogContent>
  </Dialog>)

MethodologyDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

const MethodologyFooter = withStyles(methodologyDialogStyles)(({ onClick, classes }) => (
  <div className={classes.footer}>
    <Typography className={classes.footerText} onClick={onClick}>
      Methodology and Data Sources
    </Typography>
  </div>
))

const CallToAction = withStyles(donationComparisonsStyles)(({ classes }) => {
  const handleClick = async () => {
    if (window.analytics) {
      await window.analytics.track('HRAI Explore Top Charities Clicked', {}, {}, () => {
        window.location.href = CTA_URL
      })
    }
    window.location.href = CTA_URL
  }

  return (
    <Grid container spacing={GRID_SPACING} justify="center" className={classes.grid}>
      <Grid item xs={8}>
        <Grid container spacing={GRID_SPACING}>
          <Grid item xs={12}>
            <Typography className={classes.mainText}>
              ... if you gave to high-impact charities
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button
              color="primary"
              variant="contained"
              size="large"
              onClick={handleClick}
            >
              Explore top charities
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
})

const styles = theme => ({
  container: {
    textAlign: 'center',
    '& .ct-chart-donut, .ct-chart-pie': {
      '& .ct-label': {
        fill: '#FFF',
        color: '#FFF',
        fontSize: '1rem',
        fontWeight: 700,
        stroke: theme.palette.orange[300],
        strokeWidth: 2,
        paintOrder: 'stroke',
        strokeLinejoin: 'round',
        strokeLinecap: 'round'
      }
    },
    '& .ct-bar': {
      strokeWidth: 60
    },
    '& .ct-series-a': {
      '& .ct-slice-donut, .ct-slice-bar': {
        stroke: theme.palette.orange[100]
      },
      '& .ct-slice-pie': {
        fill: theme.palette.orange[100]
      },
      '& .ct-bar': {
        stroke: theme.palette.orange[300]
      }
    },
    '& .ct-series-b': {
      '& .ct-slice-donut, .ct-slice-bar': {
        stroke: theme.palette.orange[300]
      },
      '& .ct-slice-pie': {
        fill: theme.palette.orange[300]
      },
      '& .ct-bar': {
        stroke: theme.palette.orange[300]
      }
    }
  }
})

class _HowRichAmI extends React.PureComponent {
  constructor (props) {
    super(props)
    const qsSettings = this.getSettingsFromQueryString(props)
    const settings = {
      income: '',
      countryCode: 'USA',
      household: {
        adults: 1,
        children: 0
      },
      ...qsSettings
    }

    this.state = {
      ...settings,
      donationPercentage: 10,
      showCalculations: validateSettings({ ...settings }),
      showMethodologyDialog: false
    }

    // ensure that query string is accurate (e.g. if using legacy query vars)
    if (validateSettings(settings)) this.updateQueryString('replace')
  }

  getSettingsFromQueryString = props => {
    const { location } = props
    const settings = {}
    if (location.search) {
      const { income, countryCode, household, country, adults, children } = qs.parse(location.search.replace(/^\?/, ''))
      if (income) settings.income = parseInt(income, 10)
      if (countryCode) settings.countryCode = countryCode
      if (household) {
        settings.household = {}
        if (household.adults) settings.household.adults = parseInt(household.adults, 10)
        if (household.children) settings.household.children = parseInt(household.children, 10)
      }
      // legacy keys from GWWC website just in case
      if (!countryCode && country) settings.countryCode = country
      if (!household && (adults || children)) {
        settings.household = {}
        if (adults) settings.household.adults = parseInt(adults, 10)
        if (children) settings.household.children = parseInt(children, 10)
      }
    }
    return settings
  }

  updateQueryString = (method = 'push') => {
    const { history, location } = this.props
    const { income, countryCode, household } = this.state
    history[method]({
      pathname: location.pathname,
      search: `?${qs.stringify({ income, countryCode, household })}`
    })
  }

  handleCalculate = () => {
    if (!validateSettings({ ...this.state })) return
    this.updateQueryString()
    this.setShowCalculations(true)
  }

  handleControlsChange = newState => {
    this.setShowCalculations(false)
    this.setState({ ...newState })
  }

  handleDonationPercentageChange = async (event, donationPercentage) => {
    await this.setState({ donationPercentage })
  }

  setShowCalculations = showCalculations => this.setState({ showCalculations })

  setShowMethodologyDialog = showMethodologyDialog => this.setState({ showMethodologyDialog })

  componentDidUpdate (prevProps) {
    // update our state if we hit the back button
    if (this.props.location.search !== prevProps.location.search) {
      const settings = this.getSettingsFromQueryString(this.props)
      this.setState(settings)
    }
  }

  render = () => {
    const { showCalculations, showMethodologyDialog } = this.state

    const { classes, standalone } = this.props
    return <div className={classes.container}>
      <Heading />
      <Controls {...this.state} onChange={this.handleControlsChange} onCalculate={this.handleCalculate} />
      {showCalculations && <React.Fragment>
        <Calculation {...this.state} />
        <DonationCalculation {...this.state} onDonationPercentageChange={this.handleDonationPercentageChange} />
        <CallToAction />
        <Divider variant='middle' />
        {standalone && <MethodologyFooter onClick={() => this.setShowMethodologyDialog(true)} />}
      </React.Fragment>}
      <MethodologyDialog open={showMethodologyDialog} onClose={() => this.setShowMethodologyDialog(false)} />
    </div>
  }
}

_HowRichAmI.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
    pathname: PropTypes.string.isRequired
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  classes: PropTypes.object.isRequired,
  standalone: PropTypes.bool
}

const HowRichAmI = withStyles(styles)(
  withRouter(_HowRichAmI)
)

export default HowRichAmI

const standaloneStyles = theme => ({
  content: {
    marginTop: theme.spacing() * 12
  },
  logo: {
    maxHeight: 40
  },
  logoBackground: {
    marginRight: theme.spacing() * 5
  },
  menuToolbar: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  menuTitle: {
    flexGrow: 1,
    fontWeight: 700
  },
  menuWrapper: {
  },
  menu: {}
})

export const HowRichAmIStandalone = withStyles(standaloneStyles)(({ classes }) => (
  <PageWrapper title="How Rich Am I?" canonical="/how-rich-am-i">
    <Container fixed className={classes.root}>
      <AppBar position="fixed" color='inherit'>
        <Container fixed>
          <Toolbar disableGutters className={classes.menuToolbar}>
            <a href="https://givingwhatwecan.org">
              <div className={classes.logoBackground}>
                <img
                  className={classes.logo}
                  src="https://d33wubrfki0l68.cloudfront.net/39338ba45f09702b3455361490262a6d873a66eb/fa985/images/logos/gwwc-logo-transparent-nav-2021.png"
                  alt="GWWC logo"
                />
              </div>
            </a>
            <Hidden smDown>
              <div className={classes.menuWrapper}>
                <MainMenu className={classes.menu} />
              </div>
            </Hidden>
          </Toolbar>
        </Container>
      </AppBar>
      <div className={classes.content}>
        <HowRichAmI standalone />
      </div>
    </Container>
  </PageWrapper>
));
