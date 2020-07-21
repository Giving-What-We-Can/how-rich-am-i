import React, { createContext } from 'react'
import PropTypes from 'prop-types'
// import { withRouter } from 'react-router-dom'

const SegmentContext = createContext({})
SegmentContext.displayName = 'SegmentProvider'

export const SegmentProvider = ({ writeKey, ...props }) => {
  let analytics = null
  if (writeKey && window.analytics) {
    analytics = window.analytics
    analytics.load(writeKey)
  }
  return <SegmentContext.Provider value={{ analytics }} {...props} />
}

SegmentProvider.propTypes = {
  writeKey: PropTypes.string.isRequired
}

export const withSegment = WrappedComponent => props => <SegmentContext.Consumer>
  {value => <WrappedComponent {...value} {...props} />}
</SegmentContext.Consumer>
