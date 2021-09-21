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
import Button from '@material-ui/core/Button'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import SvgIcon from '@material-ui/core/SvgIcon'
import Slider from '@material-ui/core/Slider'
import AssessmentIcon from '@material-ui/icons/Assessment'
import COUNTRIES from 'lib/calculate/data/countries.json'
import { calculate, getDonationComparisonAmount, convertIncome } from 'lib/calculate'
import { FormattedNumber } from 'react-intl'
import BigNumber from 'bignumber.js'
import { COMPARISONS, MEDIAN_INCOME } from '../../lib/calculate'
import ChartistGraph from 'react-chartist'
import { withStyles } from '@material-ui/core/styles'

import PageWrapper from 'components/Page'

import { Page } from 'components/Contentful'

import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
// standalone
import AppBar from '@material-ui/core/AppBar'

const MAX_HOUSEHOLD_NUMBER = 10
const GRID_SPACING = 4

const SpacedDivider = withStyles(theme => ({
  root: {
    marginTop: theme.spacing(GRID_SPACING),
    marginBottom: theme.spacing(GRID_SPACING)
  }
}))(Divider)

const CenteredInput = withStyles({
  input: {
    textAlign: 'center'
  }
})(Input)

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

  return <form className={classes.root} >
    <Grid container spacing={GRID_SPACING} style={{ display: 'flex', justifyContent: 'center' }}>
      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel htmlFor='income'>Inntekt</InputLabel>
          <CenteredInput
            value={income}
            id='income'
            onChange={handleIncomeChange}
            endAdornment={<InputAdornment position='end'>{'kr'}</InputAdornment>}
          />
          <FormHelperText>
            Oppgi total inntekt <strong>etter skatt</strong> for husholdningen din. En gjennomsnittlig inntekt i Norge reduseres med ca 25% etter skatt.
          </FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel htmlFor='household[adults]'>Voksne</InputLabel>
          <CenteredInput value={household.adults} onChange={event => handleHouseholdChange(event, 'adults')} />
          <FormHelperText>Oppgi antall voksne i husholdningen din</FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <FormControl fullWidth>
          <InputLabel htmlFor='household[children]'>Barn</InputLabel>
          <CenteredInput value={household.children} onChange={event => handleHouseholdChange(event, 'children')} />
          <FormHelperText>Oppgi antall barn i husholdningen din</FormHelperText>
        </FormControl>
      </Grid>

    </Grid>

    <Grid container justify='center' spacing={GRID_SPACING}>
      <Grid item xs={12} sm={8} md={6}>
        <Button fullWidth color='primary' variant='contained' style={{ textTransform: 'none' }} disabled={!isValid} onClick={onCalculate}>Vis meg hvor rik jeg er  <CheckCircleIcon style={{ marginLeft: '5px' }} /></Button>
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

const getIncomeCentileData = ({ incomeCentile, incomeTopPercentile }) => ({
  series: [
    incomeTopPercentile,
    incomeCentile
  ],
  labels: [
    `Personer rikere enn deg (${incomeTopPercentile.toString().replace('.', ',')}%)`,
    `Personer du er rikere enn (${incomeCentile.toString().replace('.', ',')}%)`
  ]
})

const getMedianChartData = ({ equivalizedIncome }) => ({
  labels: ['Global medianinntekt', 'Din inntekt'],
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
    color: 'black',
    fontSize: '2rem',
    fontWeight: 700
  },
  subMainText: {
    color: theme.palette.primary.main,
    fontSize: '1rem'

  },
  chartText: {
    color: 'theme.palette.primary.main',
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

function formatCurrency(currencyString) {
  return parseFloat(currencyString).toFixed(parseInt(currencyString) < 90 ? 1 : 0)
    .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
    .replace(',', ' ')
    .replace(',', ' ')
}

function formatDecimalsNOK(currencyString) {
  return parseFloat(currencyString).toFixed(parseInt(currencyString) < 90 ? 1 : 0)
    .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
    .replace(',', ' ')
    .replace('.', ',')
}

const Calculation = withStyles(calculationStyles)(({ income, countryCode, household, classes }) => {
  try {
    const { incomeCentile, incomeTopPercentile, medianMultiple, equivalizedIncome } = calculate({ income, countryCode, household })
    if (incomeCentile <= 50) {
      return <Grid container spacing={GRID_SPACING}>
        <Grid item xs={12}>
          <Typography paragraph>
            Beklager, men inntekten du har oppgitt er lavere enn den globale medianinntekten.
            Vi har kun data for inntekter som er høyere den globale medianen.{' '}
          </Typography>
        </Grid>
      </Grid>
    }
    const incomeCentileData = getIncomeCentileData({ incomeCentile, incomeTopPercentile })

    return (
      <Grid container spacing={4} justify='center' className={classes.root}>
        <Grid item xs={12}>
          <Typography className={classes.mainText}>
            Hvis husholdningen din har en inntekt på{' '}
            <p style={{ margin: '0px', wordBreak: 'keep-all', display: 'inline-block' }}>{formatCurrency(income)} kr</p>
          </Typography>
          <Typography className={classes.subMainText}>
            (i en husholdning på {household.adults} voks{household.adults > 1 ? 'ne' : 'en'}
            {household.children > 0 && <span>
              {' '}og {household.children} barn{household.children > 1 ? '' : ''}
            </span>}
            )
          </Typography>
        </Grid>
        <Grid item sm={6}>
          <PieChart data={incomeCentileData} />
          <Typography className={classes.chartText}>Du er blant verdens <em>{incomeTopPercentile.toString().replace('.', ',')}%</em> rikeste</Typography>
        </Grid>
        <Grid item sm={6}>
          <BarChart data={getMedianChartData({ equivalizedIncome })} />
          <Typography className={classes.chartText}>Inntekten din er <em>{medianMultiple.toString().replace('.', ',')}</em> ganger den globale medianen</Typography>
          <Typography variant='caption'>
            Inntekt vist i husholdnings-ekvivalerte{' '}
            <Link href='https://en.wikipedia.org/wiki/International_United_States_dollar' target='_blank' rel='noreferrer'>
              internasjonale dollar (I$)
            </Link>
          </Typography>
        </Grid>
      </Grid>
    )
  } catch (err) {
    console.warn(err)
    return <Grid item xs={12}><Typography>
      Sorry, we {"don't"} have data for {getCountryName(countryCode)}
    </Typography></Grid>
  }
})

const formatPercentage = val => `${val}%`

const MAX_DONATION_SLIDER_VALUE = 99
const DONATION_SLIDER_MARKS = [...Array(MAX_DONATION_SLIDER_VALUE + 10).keys()]
  .filter(v => v % 10 === 0)
  .map(v => ({ value: v, label: formatPercentage(v) }))
DONATION_SLIDER_MARKS[0].label = '1%'
DONATION_SLIDER_MARKS.pop()
DONATION_SLIDER_MARKS.push({ value: 99, label: '100%' })

export const getDonationIncome = (income, donationPercentage) => BigNumber(income * (100 - donationPercentage) / 100).dp(2).toNumber()
export const getDonationValue = (income, donationPercentage) => BigNumber(income).minus(getDonationIncome(income, donationPercentage)).dp(2).toNumber()

const AirbnbSlider = withStyles({
  root: {
    color: '#8D5400',
    height: 30,
    paddingTop: 0
  },
  thumb: {
    height: 40,
    width: 40,
    backgroundColor: '#fff',
    border: '1px solid #fb8f29',
    marginTop: -10,
    marginLeft: -20,
    boxShadow: '#ebebeb 0 2px 2px',
    '&:focus, &:hover, &$active': {
      boxShadow: '#ccc 0 2px 3px 1px'
    },
    '& .bar': {
      // display: inline-block !important;
      height: 15,
      width: 3,
      backgroundColor: '#fb8f29',
      marginLeft: 1,
      marginRight: 1
    }
  },
  active: {},
  track: {
    height: 20
  },
  rail: {
    color: '#8A8A8A',
    opacity: 0.5,
    height: 20
  },
  mark: {
    height: 20,
    borderRadius: 0,
    width: 3
  },
  markLabel: {
    fontSize: 14,
    color: 'black',
    marginLeft: 5
  }
})(Slider)

function AirbnbThumbComponent(props) {
  return (
    <span {...props}>
      <span className="bar" />
      <span className="bar" />
      <span className="bar" />
    </span>
  )
}

const DonationCalculation = withStyles(calculationStyles)(({ income, countryCode, household, donationPercentage, onDonationPercentageChange, classes }) => {
  try {
    const donationIncome = getDonationIncome(income, donationPercentage)
    const donationAmount = income - donationIncome
    const { incomeCentile, incomeTopPercentile, medianMultiple, equivalizedIncome } = calculate({ income: donationIncome, countryCode, household })
    const convertedIncome = convertIncome(income, countryCode)
    const donationValue = getDonationValue(convertedIncome, donationPercentage)

    return (
      <Grid container spacing={4} justify='center' className={classes.root}>
        {income >= 29500 && (
          <Grid item xs={12}>
            <Typography className={classes.mainText}>
              Hvis du hadde donert {donationPercentage}% av inntekten din ...
            </Typography>
          </Grid>
        )}
        {income >= 29500 && (
          <Grid item xs={12}>
            <AirbnbSlider
              value={donationPercentage}
              getAriaValueText={formatPercentage}
              step={1}
              min={1}
              max={MAX_DONATION_SLIDER_VALUE}
              marks={DONATION_SLIDER_MARKS}
              onChange={onDonationPercentageChange}
              ThumbComponent={AirbnbThumbComponent}
            />
          </Grid>
        )}
        {incomeCentile >= 50 && (
          <Grid container spacing={4} justify='center' className={classes.root}>
            <Grid item sm={12}>
              <Typography className={classes.mainText} style={{ marginTop: '30px', textAlign: 'center' }}>
                ... ville husholdningen din fortsatt hatt en inntekt på{' '}
                <p style={{ margin: '0px', wordBreak: 'keep-all', display: 'inline-block' }}>{formatCurrency(donationIncome)} kr,</p>
                {' '}
                <br />
                i tillegg {' '}
                {formatCurrency(donationAmount)} kr
                i donasjoner …
              </Typography>
            </Grid>

            <Grid item sm={6}>
              <PieChart data={getIncomeCentileData({ incomeCentile, incomeTopPercentile })} />
              <Typography className={classes.chartText}>Du er blant verdens <em>{incomeTopPercentile.toString().replace('.', ',')}%</em> rikeste</Typography>
            </Grid>
            <Grid item sm={6}>
              <BarChart data={getMedianChartData({ equivalizedIncome })} />
              <Typography className={classes.chartText}>Inntekten din er <em>{medianMultiple.toString().replace('.', ',')}</em> ganger den globale medianen</Typography>
              <Typography variant='caption'>
                Inntekt vist i husholdnings-ekvivalerte{' '}
                <Link href='https://en.wikipedia.org/wiki/International_United_States_dollar' target='_blank' rel='noreferrer'>
                  internasjonale dollar (I$)
                </Link>
              </Typography>
            </Grid>
            <Grid container spacing={GRID_SPACING} justify='center' className={classes.root}>
              <Grid item sm={12}>
                <DonationComparisons value={donationValue} />
              </Grid>
            </Grid>
          </Grid>
        )}
        {incomeCentile < 50 && (
          <h3>Vi har dessverre ikke tall for inntekter lavere enn den globale medianinntekten, vennligst prøv å redusere donasjonsprosenten.</h3>
        )}
      </Grid>
    )
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
    color: '#000'
  },
  svgIcon: {
    width: '100%',
    maxWidth: 150,
    height: '100%',
    maxHeight: 150
  }
})
const DONATION_COMPARISON_PLACEHOLDER = '%%'
const DonationComparison = withStyles(donationComparisonStyles)(({ value, comparison, classes }) => {
  const parts = comparison.description.split(DONATION_COMPARISON_PLACEHOLDER)
  const elements = [
    parts[0],
    <strong key='comparison-value'>{formatDecimalsNOK(getDonationComparisonAmount(value, comparison))} </strong>,
    parts[1]
  ].map((el, i) => <span key={i}>{el}</span>)
  return <Grid spacing={GRID_SPACING} container className={classes.root}>
    <Grid item xs={6} className={classes.iconContainer} style={{ paddingRight: '0px', paddingLeft: '40px' }}>
      <SvgIcon
        color='primary'
        viewBox={comparison.icon.viewBox || '0 0 1000 1000'}
        width="80%" height="80%"
        preserveAspectRatio="xMidYMid meet"
        className={classes.svgIcon}
      >
        {comparison.icon.paths.map(path => <path d={path} key={path} />)}
      </SvgIcon>
    </Grid>
    <Grid item xs={6} className={classes.textContainer} style={{ paddingLeft: '0px' }}>
      <Typography color='primary' className={classes.comparisonText}>
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
    color: theme.palette.primary.main,
    fontSize: '2rem',
    fontWeight: 700
  }
})

const DonationComparisons = withStyles(donationComparisonsStyles)(({ value, classes }) => <Grid container spacing={GRID_SPACING} justify='center'>
  <Grid item xs={12}>
    <Typography className={classes.mainText} style={{ marginTop: '50px', color: '#000' }}>… og hvert år kunne donasjonene dine ført til enten…</Typography>
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
  }
})

const Heading = withStyles(headingStyles)(({ classes }) => <header className={classes.root}>
  <Typography variant='h2'>Hvor rik er jeg?</Typography>
  <Typography variant='subtitle1'>Finn ut hvor rik du er sammenlignet med resten av verden. Er du blant verdens rikeste?</Typography>
</header>)

const Methodology = () => <Page showTitle={false} slug='how-rich-am-i-methodology' />

const methodologyDialogStyles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(GRID_SPACING)
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(GRID_SPACING / 2),
    top: theme.spacing(GRID_SPACING / 2),
    color: theme.palette.grey[500]
  }
})

const MethodologyDialog = withStyles(methodologyDialogStyles)(({ open, onClose, classes }) =>
  <Dialog onClose={onClose} open={open} aria-labelledby='methodology-title' className={classes.root}>
    <DialogTitle disableTypography >
      <Typography id='methodology-title' variant='h3'>Metode og datakilder</Typography>
      <Typography id='methodology-title' variant='h5'>Levert av Giving What We Can</Typography>
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

const creditsStyles = theme => ({
  root: {
    margin: theme.spacing() * 2
  }
})
const Credits = withStyles(creditsStyles)(({ classes }) => <div className={classes.root}>
  <Typography>

  </Typography>
</div>)

Credits.propTypes = {
  classes: PropTypes.object
}

const callToActionStyles = theme => ({
  logoBackground: {
    height: 130,
    width: 130,
    backgroundColor: theme.palette.primary.main,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const CallToAction = withStyles(callToActionStyles)(({ classes }) => <Grid container spacing={GRID_SPACING} justify='center'>
  <Grid item xs={8} display="flex" justifyContent="center" alignItems="center">
    <Grid container spacing={GRID_SPACING} >
      <Grid item xs={12}>

        <a href="https://gieffektivt.no/gi#doner" target="_blank" rel="noopener noreferrer">
          <button style={{ width: '150px', height: '80px', border: 'none', backgroundColor: '#fb8f29', color: 'white', fontSize: '30px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '35px' }}>Gi nå</button>
        </a>
        <Typography paragraph>Denne kalkulatoren er utviklet av <a href='https://www.givingwhatwecan.org' target="_blank" rel="noopener noreferrer" style={{ color: '#fb8f29' }}>
          Giving What We Can</a>, en global organisasjon hvor medlemmene donerer minst 10% av sin årlige lønn til effektive organisasjoner. Følg{' '}
          <a href='https://www.givingwhatwecan.org' target="_blank" rel="noopener noreferrer" style={{ color: '#fb8f29' }}>denne linken</a>{' '}
          for å lese mer og bli medlem, og bli gjerne med i Facebook-gruppen <a href='https://www.facebook.com/groups/GWWCNorge' target="_blank" rel="noopener noreferrer" style={{ color: '#fb8f29' }}>for norske medlemmer her</a>!</Typography>
      </Grid>
    </Grid>
  </Grid>
</Grid>)

const styles = theme => ({
  container: {
    textAlign: 'center',
    '& .ct-chart-donut, .ct-chart-pie': {
      '& .ct-label': {
        fill: '#000',
        color: '#FFF',
        fontSize: '1rem',
        fontWeight: 700,
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
        stroke: theme.palette.secondary.main
      },
      '& .ct-slice-pie': {
        fill: theme.palette.secondary.main
      },
      '& .ct-bar': {
        stroke: theme.palette.primary.main
      }
    },
    '& .ct-series-b': {
      '& .ct-slice-donut, .ct-slice-bar': {
        stroke: theme.palette.primary.main
      },
      '& .ct-slice-pie': {
        fill: theme.palette.primary.main
      },
      '& .ct-bar': {
        stroke: theme.palette.primary.main
      }
    }
  }
})

class _HowRichAmI extends React.PureComponent {
  constructor(props) {
    super(props)
    const qsSettings = this.getSettingsFromQueryString(props)
    const settings = {
      income: '',
      countryCode: 'NOR',
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
    console.log(location.pathname)
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

  componentDidUpdate(prevProps) {
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
      <SpacedDivider variant='middle' />
      <Controls {...this.state} onChange={this.handleControlsChange} onCalculate={this.handleCalculate} />
      {showCalculations && <React.Fragment>
        <SpacedDivider variant='middle' />
        <Calculation {...this.state} />
        <DonationCalculation {...this.state} onDonationPercentageChange={this.handleDonationPercentageChange} />
        <SpacedDivider variant='middle' />
        <CallToAction />
        <SpacedDivider variant='middle' />
        {standalone && <Button variant='contained' onClick={() => this.setShowMethodologyDialog(true)}>
          Metode og datakilder <AssessmentIcon />
        </Button>}
      </React.Fragment>}
      {standalone && <Credits />}
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
  logoBackground: {
    marginRight: theme.spacing() * 2
  },
  menuTitle: {
    flexGrow: 1
  },
  menuWrapper: {
  },
  menu: {}
})

export const HowRichAmIStandalone = withStyles(standaloneStyles)(({ classes }) => <PageWrapper title='gieffektivt' canonical='/how-rich-am-i'>
  <Container fixed className={classes.root}>
    <AppBar position='fixed'>

    </AppBar>
    <div className={classes.content}>
      <HowRichAmI standalone />
    </div>
  </Container>
</PageWrapper>)
