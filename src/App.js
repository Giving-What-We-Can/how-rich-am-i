import React from 'react';
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { IntlProvider } from 'react-intl'

import HowRichAmI from 'components/HowRichAmI'

const theme = createMuiTheme({})

  const App = () => <ThemeProvider theme={theme}>
    <IntlProvider defaultLocale='en'>
      <Router>
        <Route path='/' exact component={HowRichAmI} />
      </Router>
    </IntlProvider>
</ThemeProvider>

export default App
