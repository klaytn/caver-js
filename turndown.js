const TurndownService = require('turndown')
const fs = require('fs')

const turndownService = new TurndownService()
turndownService.remove('nav')

// out directory will have HTML files which is generated from jsdoc
const docsDirectory = `${__dirname}/out`
const mdDirectory = `${docsDirectory}/md`

const files = fs.readdirSync(docsDirectory)

if (!fs.existsSync(mdDirectory)) fs.mkdirSync(mdDirectory)

for (const file of files) {
    // Converts only HTML files
    if (!file.endsWith('.html') || file === 'index.html') continue

    // Converts a HTML file
    let markdown = turndownService.turndown(fs.readFileSync(`${docsDirectory}/${file}`).toString())
    markdown = markdown.replace(/.html|_/g, '.md')

    // Writes a Markdown result to md file
    fs.writeFileSync(`${mdDirectory}/${file.replace('html', '')}md`, markdown)
}
