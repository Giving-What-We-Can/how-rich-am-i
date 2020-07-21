import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { withSegment } from 'components/Segment'
import { getUrl } from 'lib/utils'

const { REACT_APP_SITE_TITLE } = process.env

const Page = ({ analytics, children, title, canonical }) => {
  analytics.page()
  return <>
    <Helmet>
      <title>{title && `${title} | `}{REACT_APP_SITE_TITLE}</title>
      {canonical && <link rel='canonical' href={getUrl(canonical)} />}
    </Helmet>
    {children}
  </>
}

Page.propTypes = {
  analytics: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.node,
  title: PropTypes.string,
  canonical: PropTypes.string
}

export default withSegment(Page)
