import React, { createContext } from 'react'
import PropTypes from 'prop-types'
// import { withRouter } from 'react-router-dom'

const analyticsNoOp = prop => console.warn(`Call to analytics.${prop}() failed. Analytics has not been loaded. Check you have provided a valid write key to Segment.`)

const handler = {
  get: (target, prop, receiver) => () => analyticsNoOp(prop)
}

const noAnalytics = new Proxy({}, handler)

const SegmentContext = createContext({ analytics: noAnalytics })
SegmentContext.displayName = 'SegmentProvider'
const { Provider, Consumer } = SegmentContext

export const SegmentProvider = ({ writeKey, ...props }) => {
  let analytics = noAnalytics
  if (writeKey && window.analytics) {
    analytics = window.analytics
    analytics.load(writeKey)
  }
  return <Provider value={{ analytics }} {...props} />
}

SegmentProvider.propTypes = {
  writeKey: PropTypes.string.isRequired
}

// eslint-disable-next-line react/display-name
export const withSegment = WrappedComponent => props => <Consumer>
  {value => <WrappedComponent {...value} {...props} />}
</Consumer>
