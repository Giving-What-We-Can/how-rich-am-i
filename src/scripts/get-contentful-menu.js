require('dotenv').config({ silent: true })
const contentful = require('contentful')
const fs = require('mz/fs')
const path = require('path')
const deepFilter = require('deep-filter-object')

const { REACT_APP_CONTENTFUL_SPACE, REACT_APP_CONTENTFUL_ACCESS_TOKEN } = process.env
const MENU_CONTENT_TYPE_ID = '26J6GQmztOEEcEYyeKgQ4M'
const MENU_SLUGS = ['main', 'footer-menu']

const OUTPUT_FILE = path.join(__dirname, '..', 'givingwhatwecan-org-menu.json')

const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: REACT_APP_CONTENTFUL_SPACE,
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: REACT_APP_CONTENTFUL_ACCESS_TOKEN
})

// we can't filter the nested fields of included contentful items at a granular level
// but we don't want them in the final JSON, because that'll bloat our package size
// this array enumerates fields that we want to get rid of
const excludedFields = [
  'contents',
  'environment',
  'revision',
  'createdAt',
  'updatedAt',
  'space',
  'featuredImage',
  'redirects',
  'ogImage',
  'menuOrder',
  'navigation',
  'template',
  'type',
  'linkType',
  'locale',
  'topLevelMenu'
]

const filterItems = items => items
  .map(item => deepFilter(item, ['*', ...excludedFields.map(field => `!${field}`)]))
  .map(item => {
    if (item.fields && item.fields.children) item.fields.children = filterItems(item.fields.children)
    return item
  })

const getMenus = async () => client.getEntries({
  content_type: MENU_CONTENT_TYPE_ID,
  'fields.slug[in]': MENU_SLUGS.join(','),
  // include full details for nested links so that we can build full paths
  include: 4
}).then(res => res.items)

;(async () => {
  try {
    const menus = await getMenus()
    // this JSON will be included in our final bundle, so remove the large content-based fields
    const menusFiltered = filterItems(menus)
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(menusFiltered, null, 2))
  } catch (err) {
    console.error(err)
  }
})()
