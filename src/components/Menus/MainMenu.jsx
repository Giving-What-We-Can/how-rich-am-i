import React from 'react'
import PropTypes from 'prop-types'
import menuData from 'givingwhatwecan-org-menu.json'
import Button from '@material-ui/core/Button'
import Popper from '@material-ui/core/Popper'
import Paper from '@material-ui/core/Paper'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import { makeStyles } from '@material-ui/styles'

const ROOT_DOMAIN = 'https://www.givingwhatwecan.org'

const mainMenuData = menuData.filter(item => item.fields.slug === 'main')[0]

const isRelativeLink = uri => /^\//.test(uri)
const getAbsoluteUrl = uri => isRelativeLink(uri) ? `${ROOT_DOMAIN}${uri}` : uri

const contentTypes = {
  '26J6GQmztOEEcEYyeKgQ4M': 'menu',
  '6na899NofSMMwaMkWoKiAA': 'page',
  '1u3TTG03qc6o4qwmOCYMyQ': 'link'
}

const getContentType = sys => contentTypes[sys.contentType.sys.id]

const getPath = ({ slug, parent }) => {
  if (parent) {
    return `${getPath(parent.fields)}/${slug}`
  }
  return `/${slug}`
}

const getAbsolutePath = (...args) => getAbsoluteUrl(getPath(...args))

const useStyles = makeStyles(theme => ({
  popover: {
    zIndex: theme.zIndex.appBar + 10,
    '& .MuiButton-root': {
      textTransform: 'none'
    }
  }
}))

const DropdownMenu = ({ title, childItems }) => {
  const [anchorEl, setAnchorEl] = React.useState(null)
  const classes = useStyles()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return <>
    <Button style={{ textTransform: 'none' }} color='inherit' aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>{title}</Button>
      <Popper anchorEl={anchorEl} open={Boolean(anchorEl)} className={classes.popover} placement='bottom-start'>
        <ClickAwayListener onClickAway={handleClose}>
          <Paper>
            <MenuList
              id="simple-menu"
            >
              {childItems
                .filter(({ fields }) => fields)
                .map(({ sys, fields }) => <MenuItem component={Button} key={sys.id} href={getAbsolutePath(fields)}>
                  {fields.shortTitle || fields.title}
                </MenuItem>
                )
              }
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
  </>
}

DropdownMenu.propTypes = {
  title: PropTypes.string.isRequired,
  childItems: PropTypes.array.isRequired
}

const getMenuItem = ({ sys, fields }) => {
  switch (getContentType(sys)) {
    case 'menu':
      return <DropdownMenu key={sys.id} title={fields.title} childItems={fields.children} />
    case 'page':
      return <Button
        style={{ textTransform: 'none' }}
        color='inherit'
        key={sys.id}
        href={getAbsolutePath(fields)}
        rel='noopener noreferrer'
      >{fields.shortTitle || fields.title}</Button>
    case 'link':
      return <Button
        style={{ textTransform: 'none' }}
        color='inherit'
        key={sys.id}
        href={getAbsoluteUrl(fields.linkURL)}
        target={isRelativeLink(fields.linkURL) ? undefined : '_blank'}
        rel='noopener noreferrer'
      >{fields.title}</Button>
    default:
      return null
  }
}

getMenuItem.propTypes = {
  sys: PropTypes.objectOf({
    id: PropTypes.string
  }).isRequired,
  fields: PropTypes.objectOf({
    title: PropTypes.string,
    shortTitle: PropTypes.string,
    children: PropTypes.array,
    linkURL: PropTypes.string
  }).isRequired
}

const MainMenu = () => <>
  {mainMenuData.fields.children.map(getMenuItem).filter(a => a)}
</>

export default MainMenu
