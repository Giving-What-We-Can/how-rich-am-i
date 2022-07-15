import React from 'react'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core'
import CssBaseline from '@material-ui/core/CssBaseline'
import { IntlProvider } from 'react-intl'
import { ContentfulClient, ContentfulProvider } from 'react-contentful'
import Router from './Router'
import { SegmentProvider } from 'components/Segment'

const {
  REACT_APP_CONTENTFUL_SPACE,
  REACT_APP_CONTENTFUL_ACCESS_TOKEN,
  REACT_APP_SEGMENT_WRITE_KEY
} = process.env

const primaryColor = '#BA175B'
const secondaryColor = '#F1D1DE'
const textColor = '#222222'
const sliderHeight = 12

const theme = createMuiTheme({
  palette: {
    primary: {
      main: primaryColor
    },
    secondary: {
      main: secondaryColor
    },
    background: {
      default: '#FFF'
    },
    text: {
      default: '#222222'
    },
    yellow: {
      100: '#FAE2D5',
      400: '#E86F2B',
    },
    orange: {
      100: '#F5D9D0',
      300: '#E36A45',
      400: '#CC4115',
    },
    red: {
      100: '#F1D4D6',
      400: '#BA2934',
    },
    pink: {
      100: '#F8D7DC',
      400: '#DA3552',
    },
    purple: {
      100: '#F1D1DE',
      400: '#BA175B',
    },
  },
  typography: {
    fontFamily: ['Source Sans Pro', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
    h1: { color: textColor, fontWeight: '700' },
    h2: { color: textColor, fontWeight: '700' },
    h3: { color: textColor, fontWeight: '700' },
    h4: { color: textColor, fontWeight: '700' },
    h5: { color: textColor }
  },
  overrides: {
    MuiSlider: {
      rail: {
        height: sliderHeight
      },
      track: {
        height: sliderHeight
      },
      mark: {
        height: sliderHeight
      },
      markLabel: {
        top: sliderHeight * 2.5
      },
      thumb: {
        height: sliderHeight * 2,
        width: sliderHeight * 2
      }
    }
  }
})

const contentfulClient = new ContentfulClient({
  space: REACT_APP_CONTENTFUL_SPACE,
  accessToken: REACT_APP_CONTENTFUL_ACCESS_TOKEN
})

const App = () => <>
  <ThemeProvider theme={theme}>
    <ContentfulProvider client={contentfulClient} locale='en'>
      <IntlProvider locale='en' defaultLocale='en'>
        <CssBaseline />
        <SegmentProvider writeKey={REACT_APP_SEGMENT_WRITE_KEY}>
          <Router />
        </SegmentProvider>
      </IntlProvider>
    </ContentfulProvider>
  </ThemeProvider>
</>

export default App
