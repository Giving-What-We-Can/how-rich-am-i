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

const primaryColor = '#6c0000'
const secondaryColor = '#edede5'
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
    }
  },
  typography: {
    fontFamily: ['Source Sans Pro', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
    h1: { color: primaryColor, fontWeight: '700' },
    h2: { color: primaryColor, fontWeight: '700' },
    h3: { color: primaryColor, fontWeight: '700' },
    h4: { color: primaryColor, fontWeight: '700' },
    h5: { color: primaryColor }
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
