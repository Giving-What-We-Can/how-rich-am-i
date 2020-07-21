const { REACT_APP_SITE_DOMAIN } = process.env

export const getUrl = path => `${REACT_APP_SITE_DOMAIN}${path}`
