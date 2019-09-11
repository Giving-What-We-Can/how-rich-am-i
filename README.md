# How Rich Am I?

A calculator to determine how rich you are compared to the rest of the world.

_This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). See their site for docs._


## Data Sources and Import

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
