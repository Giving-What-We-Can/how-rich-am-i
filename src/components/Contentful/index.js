import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-contentful'
import Markdown from 'components/Markdown'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/styles'

const pageStyles = theme => ({
  loading: {
    textAlign: 'center'
  }
})

export const Page = withStyles(pageStyles)(({ slug, showTitle = true, classes }) => <Query contentType='6na899NofSMMwaMkWoKiAA' query={{ 'fields.slug': slug }}>
  {({ data, error, fetched, loading }) => {
    if (loading || !fetched) {
      return <div className={classes.loading}><CircularProgress /></div>
    }

    if (error) {
      console.error(error)
      return <p>Error loading page</p>
    }

    if (!data) {
      return <p>Page does not exist.</p>
    }

    // See the Contentful query response
    const Page = data.items[0]
    console.log(Page)
    // Process and pass in the loaded `data` necessary for your page or child components.
    return <div>
      {showTitle && <Typography variant='h2'>{Page.fields.title}</Typography>}
      <Markdown>{Page.fields.contents}</Markdown>
    </div>
  }}
</Query>)

Page.propTypes = {
  showTitle: PropTypes.bool,
  slug: PropTypes.string.isRequired,
  classes: PropTypes.object
}
