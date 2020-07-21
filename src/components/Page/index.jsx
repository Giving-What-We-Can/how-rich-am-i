import React from 'react'
import PropTypes from 'prop-types'
import { withSegment } from 'components/Segment'

const Page = ({ analytics, children }) => {
  console.log('Page loaded')
  analytics.page()
  return <>{children}</>
}

Page.propTypes = {
  analytics: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.node
}

export default withSegment(Page)
