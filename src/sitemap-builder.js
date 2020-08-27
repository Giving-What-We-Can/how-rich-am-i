const { SitemapStream, streamToPromise } = require('sitemap')
const fs = require('mz/fs')
const path = require('path')

const SITEMAP_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml')
// An array with your links
const links = [{ url: '/how-rich-am-i', changefreq: 'weekly', priority: 0.3 }]

// Create a stream to write to
const stream = new SitemapStream({ hostname: 'https://howrichami.givingwhatwecan.org' })

// Loop over your links and add them to your stream
links.forEach(link => stream.write(link))

// End the stream
stream.end()

// Return a promise that resolves with your XML string
;(async () => {
  try {
    const xml = await streamToPromise(stream).then(data => data.toString())
    await fs.writeFile(SITEMAP_FILE, xml)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
})()
