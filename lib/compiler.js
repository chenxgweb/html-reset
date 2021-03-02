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
    }

    async getSource(modulePath) {
        // 获取内容
        fs.mkdirSync('dist')
        let content = fs.readFileSync(modulePath, "utf8");
        const style = content.substring(content.indexOf('<style>') + new String('<style>').length, content.indexOf('</style>'))
        fs.writeFileSync('dist/index.css', style)
        // css 添加前缀
        fs.readFile('./dist/index.css', (err, css) => {
            postcss([precss, autoprefixer])
                .process(css, { from: './dist/index.css', to: './dist/index.css' })
                .then(result => {
                    fs.writeFile('./dist/index.css', result.css, () => true)
                })
        })

        const js = content.substring(content.indexOf('<script>') + new String('<script>').length, content.indexOf('</script>'))
        fs.writeFileSync('dist/home.js', js)
        // js 语法转换
        let result = await babel.transformFileAsync("./dist/home.js");
        fs.writeFileSync('./dist/home.js', result.code)

        let b = browserify();
        b.add('./dist/home.js');
        b.bundle()
            .pipe(fs.createWriteStream('./dist/index.js'))
            .on('finish', () => {
                // 流 finish 方法
                fs.unlinkSync('./dist/home.js')
            })
        const head = content.substring(content.indexOf('<head>') + new String('<head>').length, content.indexOf('</head>'))

        const body = content.substring(content.indexOf('<body>') + new String('<body>').length, content.indexOf('</body>'))

        const newContent = `<!DOCTYPE html><html lang="en"><head>${head}</head> <link href="./index.css" rel="stylesheet" type="text/css"/><body>${body}</body><script type="text/javascript" src="./index.js" charset="utf-8"></script></html>`

        fs.writeFileSync('dist/index.html', newContent)
    }

    run() {
        this.getSource(path.resolve(this.root, this.entry));
    }
}

module.exports = Compiler;


