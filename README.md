# How Rich Am I?

A calculator to determine how rich you are compared to the rest of the world.

_This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). See their site for docs._

## Methodology



The estimated income percentiles used in this calculator can be [found here](https://docs.google.com/spreadsheets/d/1OSiA2dnbvZ5pUti2DO_HJU8phyfCDC-hNz5McTVcEnM/edit#gid=2139097862).

The calculator was last updated in mid-2019. It is currently based on data from the 2015 working paper [The Future of Worldwide Income Distribution](https://web.archive.org/web/20160518000924/https:/www.piie.com/sites/default/files/publications/wp/wp15-7.pdf) by Tomáš Hellebrandt and Paolo Mauro of the Peterson Institute for International Economics. Raw data from the paper is [available here](https://web.archive.org/web/20160518000857/https:/www.piie.com/sites/default/files/publications/wp/data/wp15-7.xlsx). We use an adjusted version of the data presented in Figure 5 of the paper. Our adjustment calculations can be [found here](https://drive.google.com/open?id=17_XiLHc6g8FRPa5ukiU-YjGByHbCV_Jr).

Hellebrandt and Mauro present (a) an estimate of the global individual income distribution in 2013 (in some cases using data collected before 2013 and adjusted for estimated growth up to 2013) and (b) a forecast of the global individual income distribution in 2035. To roughly account for economic growth between 2013 and 2019, we estimate 2019 income at a given percentile to be 73% its 2013 value plus 27% its 2035 forecast. That is, we linearly interpolate between 2013 values and 2035 forecasts. (Since income growth is more likely to follow a roughly exponential curve, we expect that this interpolation overestimates global 2019 incomes, and thus underestimates the user’s income percentile.) Finally, income figures from Hellebrandt and Mauro are presented in 2011 USD, adjusted for purchasing power parity at the national level. We therefore increase dollar figures by 13.4% to account for [US inflation](https://www.usinflationcalculator.com/inflation/consumer-price-index-and-annual-percent-changes-from-1913-to-2008/) from mid-2011 to mid-2019.

Following Hellebrandt and Mauro, we define individual income to be household income divided by household size.

Please note that there are many problems with all underlying source data attempting to estimate the global income distribution—some of these are [discussed here](https://web.archive.org/web/20190708070656/https://80000hours.org/2017/04/how-accurately-does-anyone-know-the-global-distribution-of-income/). Any figures should therefore be taken with a grain of salt and treated as best guesses rather than established facts. [Other attempts](https://ourworldindata.org/global-economic-inequality) to estimate global income distribution get different, though broadly similar, results.


## Other Data Sources + Import Instructions

### PPP Conversion Data

[PPP data is from the World Bank](https://data.worldbank.org/indicator/PA.NUS.PPP?view=chart)

To sanitize the data for use in this application
- Convert CSV to JSON (e.g. using csv2json or https://www.csvjson.com/csv2json)
- use [jq](https://stedolan.github.io/jq/) to turn JSON into a useable object, selecting the most recent year for which there is data:
  `jq 'map( { (."Country Code"|tostring):  . | to_entries | map(select(.key | match("\\d{4}"))) | map(select(.value | length > 0)) | select(length > 0) | sort_by(.key) | reverse | map({factor: .value, year: .key}) | .[0] } ) | add'`
- Save the result to `./data/ppp_conversion.json`

### Exchange rate data

Exchange rate data is from the [World Bank Global Economic Monitor dataset](https://databank.worldbank.org/source/global-economic-monitor-(gem)),

The export used the "Exchange rate, new LCU per USD extended backward, period average" series, including all countries (but excluding country groupings), and selecting whole years back to 2010.

To sanitise:
- Convert CSV to JSON (e.g. using csv2json or https://www.csvjson.com/csv2json)
- use [jq](https://stedolan.github.io/jq/) to turn JSON into a useable object, selecting the most recent year for which there is data:
  `jq 'map( { (."Country Code"|tostring):  . | to_entries | map(select(.key | match("\\d{4}\\s\\[\\d{4}\\]"))) | map(select(.value | length > 0)) | map(select(.value != "..")) | select(length > 0) | sort_by(.key) | reverse | map({rate: .value, year: .key}) | .[0] } ) | add'`
- Use your favourite text editor to change the `year` values from `2018 [2018]` to just `2018`

### Other country data

Other country data, including mapping from countries to currency codes is provided by the [`country-data` package](https://www.npmjs.com/package/country-data).

## Credits

Income centile calculations by [Phil Trammell](https://philiptrammell.com/) and [Rob Wiblin](http://www.robwiblin.com/), code by [Sam Deere](https://app.effectivealtruism.org/funds), based on prior art by Jacob Hilton.
