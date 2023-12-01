# How Rich Am I?

A calculator to determine how rich you are compared to the rest of the world.

The [How Rich Am I Calculator](https://howrichami.givingwhatwecan.org/how-rich-am-i) is a project of [Giving What We Can](https://www.givingwhatwecan.org/).

_This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). See their site for docs._

## Methodology

The estimated income percentiles used in this calculator can be [found here](https://github.com/owid/notebooks/tree/main/PabloArriagada/global_distribution_giving_what_we_can).

The calculator was last updated in 2023.

Please note that there are many problems with all underlying source data attempting to estimate the global income distribution—some of these are [discussed here](https://web.archive.org/web/20190708070656/https://80000hours.org/2017/04/how-accurately-does-anyone-know-the-global-distribution-of-income/). Any figures should therefore be taken with a grain of salt and treated as best guesses rather than established facts. [Other attempts](https://ourworldindata.org/global-economic-inequality) to estimate global income distribution get different, though broadly similar, results.


## Other Data Sources + Import Instructions

### PPP Conversion Data

[PPP data is from the World Bank](https://data.worldbank.org/indicator/PA.NUS.PRVT.PP?view=chart)


### Exchange rate data

Exchange rate data is from [Open Exchange Rates](https://openexchangerates.org/), updated in 2023

### Other country data

Other country data, including mapping from countries to currency codes is provided by the [`country-data` package](https://www.npmjs.com/package/country-data).

### Cost of intervention data

Estimates of costs of different interventions was used from [2020 GiveWell cost-effectiveness analysis — version 1](https://docs.google.com/spreadsheets/d/1BmFwVYeGMkpys6hG0tnfHyq__ZFZf-bmXYLSHODGpLY/edit?usp=sharing).

## Credits

Previous income centile calculations by [Phil Trammell](https://philiptrammell.com/) and [Rob Wiblin](http://www.robwiblin.com/), code by [Sam Deere](https://app.effectivealtruism.org/funds), based on prior art by Jacob Hilton.
