处理单个html,重新编译html的css 和 js。给css添加前缀,转换js语法

### 使用
```
npm install html-reset  --save

```


```javascript

const HtmlReset = require('html-reset') 
new HtmlReset({ entry:'./index.html' }).run()

```

##### .babelrc

```json
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "useBuiltIns": "usage",
                "corejs": {
                    "version": 3
                },
                "targets": {
                    "browsers": [
                        "> 1%",
                        "last 2 versions",
                    ]
                }
            }
        ]
    ]
}

```

##### .browserslistrc
```json
> 1%
last 2 versions
```



