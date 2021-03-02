const fs = require("fs");
const path = require("path");
const autoprefixer = require('autoprefixer')
const postcss = require('postcss')
const precss = require('precss')
const babel = require('@babel/core')
const browserify = require('browserify');

class Compiler {
    constructor(config) {
        this.config = config;
        this.entry = config.entry;
        this.root = process.cwd();
        this.dc = './dist/index.css'
        this.dh = './dist/home.js'
    }

    async getSource(modulePath) {
        let isExists = await this.getStat('dist');
        if (!isExists) {
            fs.mkdirSync('dist')
        }
        let content = fs.readFileSync(modulePath, "utf8");
        const style = content.substring(content.indexOf('<style>') + new String('<style>').length, content.indexOf('</style>'))
        fs.writeFileSync(this.dc, style)
        fs.readFile(this.dc, (err, css) => {
            postcss([precss, autoprefixer])
                .process(css, { from: this.dc, to: this.dc })
                .then(result => {
                    fs.writeFile(this.dc, result.css, () => true)
                })
        })
        const js = content.substring(content.indexOf('<script>') + new String('<script>').length, content.indexOf('</script>'))
        fs.writeFileSync(this.dh, js)
        let result = await babel.transformFileAsync(this.dh);
        fs.writeFileSync(this.dh, result.code)
        let b = browserify();
        b.add(this.dh);
        b.bundle()
            .pipe(fs.createWriteStream('./dist/index.js'))
            .on('finish', () => {
                fs.unlinkSync(this.dh)
            })
        const head = content.substring(content.indexOf('<head>') + new String('<head>').length, content.indexOf('</head>'))

        const body = content.substring(content.indexOf('<body>') + new String('<body>').length, content.indexOf('</body>'))

        const newContent = `<!DOCTYPE html><html lang="en"><head>${head}</head> <link href="./index.css" rel="stylesheet" type="text/css"/><body>${body}</body><script type="text/javascript" src="./index.js" charset="utf-8"></script></html>`

        fs.writeFileSync('dist/index.html', newContent)
    }

    getStat(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(stats);
                }
            })
        })
    }

    run() {
        this.getSource(path.resolve(this.root, this.entry));
    }
}

module.exports = Compiler;


