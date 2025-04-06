# Shortcode 后端集成

## 后端有提供接口如下：

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/sc/tags?type=ShortCode"
{"data":[["xhs","小红书"]]}

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/sc/search?type=ShortCode&count=10&offset=0&order=desc&q=tags%3Axhs%20OR%20tags%3A小红书"
{"data":[{"uuid":"98b64ab7-27a4-48d6-9083-da9ae9af093c","status":"public","namespace":"ShortCode","id":1,"slug":"cardbanner","hash":"","timestamp":1743726576000,"updated":1743726636122,"name":"cardBanner","template":"\u003cstyle\u003e\r\n.cardbanner {\r\n    font-family: Arial, sans-serif;\r\n            padding: 40px;\r\n            background-color: #f5f5f5;\r\n            max-width: 1080px;\r\n            margin: 0 auto;\r\n}\r\n\r\n.cardbanner .header {\r\n   display: flex;\r\n            justify-content: space-between;\r\n            align-items: flex-start;\r\n            margin-bottom: 100px;\r\n}\r\n\r\n.cardbanner .logo {\r\n    font-size: 24px;\r\n    font-weight: bold;\r\n}\r\n\r\n.cardbanner .avatar {\r\n    width: 60px;\r\n            height: 60px;\r\n            font-size: 40px;\r\n            border-radius: 50%; /* 让图片变成圆形 */\r\n            object-fit: cover; /* 确保图片填充整个圆形 */\r\n            display: block;\r\n}\r\n\r\n.cardbanner .main-title {\r\n    font-size: 52px;\r\n            font-weight: bold;\r\n            margin-bottom: 20px;\r\n            line-height: 1.2;\r\n}\r\n\r\n.cardbanner .subtitle {\r\n    font-size: 65px;\r\n            font-weight: bold;\r\n            background: linear-gradient(transparent 60%, #FFB6C1 40%);\r\n            display: inline-block;\r\n            margin-bottom: 15px;\r\n            letter-spacing: 15px;\r\n}\r\n\r\n.cardbanner .description {\r\n    font-size: 23px;\r\n            color: #666;\r\n            margin-bottom: 45px;\r\n}\r\n\r\n.cardbanner .new-label {\r\n    position: relative;\r\n            display: inline-block;\r\n            margin-top: 60px;\r\n            transform: rotate(-10deg);\r\n            width: 100%;\r\n}\r\n\r\n.cardbanner .new-tag {\r\n    background: #4169E1;\r\n            color: white;\r\n            padding: 10px 20px;\r\n            border-radius: 15px;\r\n            position: absolute;  /* 绝对定位 */\r\n            right: 0;  /* 让它紧贴 .new-label 右侧 */\r\n            top: 50%;  /* 垂直居中 */\r\n            transform: translateY(-50%) rotate(30deg);  /* 保持旋转但居中 */\r\n            display: inline-block;\r\n            font-weight: bold;\r\n            font-size: 28px;\r\n            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.cardbanner .new-tag::after {\r\n    content: \"!!\";\r\n    color: white;\r\n    margin-left: 5px;\r\n}\r\n\r\n.cardbanner .footer {\r\n     margin-top: 174px;\r\n            display: flex;\r\n            justify-content: space-between;\r\n            font-size: 20px;\r\n            color: #333;\r\n}\r\n\r\n.cardbanner .footer span {\r\n    margin: 0 10px;\r\n}\r\n\r\n.cardbanner .divider {\r\n    color: #999;\r\n}\r\n      \u003c/style\u003e\r\n      \u003cdiv class=\"cardbanner\"\u003e\r\n        \u003cdiv class=\"header\"\u003e\r\n          \u003cdiv class=\"logo\"\u003e{{ .Get \"logo\" }}\u003c/div\u003e\r\n          \u003cdiv class=\"avatar\"\u003e\r\n           \u003cimg class=\"avatar\" src='{{ .Get \"avatar\" }}' alt=\"头像\"\u003e\r\n          \u003c/div\u003e\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"main-title\"\u003e\r\n          {{ .Get \"mainTitle\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"subtitle\"\u003e\r\n          {{ .Get \"subtitle\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"description\"\u003e\r\n          {{ .Get \"description\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"new-label\"\u003e\r\n          \u003cdiv class=\"new-tag\"\u003e{{ .Get \"newTagText\" }}\u003c/div\u003e\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"footer\"\u003e\r\n        {{ $topics := split (.Get \"footerContent\") \",\" }}\r\n        {{ range $index, $topic := $topics }}\r\n            {{ if gt $index 0 }} \u003cspan class=\"divider\"\u003e|\u003c/span\u003e {{ end }}\r\n            {{ $topic }}\r\n        {{ end }}\r\n        \u003c/div\u003e\r\n      \u003c/div\u003e","example":"{{\u003c cardBanner\r\n    logo=\"不黑学长\"\r\n    avatar=\"/images/avatar.png\"\r\n    mainTitle=\"让完播率\u003e50% (3/3)\"\r\n    subtitle=\"6种文案公式\"\r\n    description=\"爆款拆解/爆款要素/文案结构\"\r\n    newTagText=\"全新整理\"\r\n    footerContent=\"运营技巧,爆款选题,文案写作,数据复盘\"\r\n/\u003e}}","asset":"/api/uploads/d66e65ad754f15723096c1156d043cbe/2025/04/1743726636150-1.jpg","tags":["xhs","小红书"],"width":1080,"height":1440}]}

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/scs?type=ShortCode&count=10&offset=0&order=desc"
{"data":[{"uuid":"98b64ab7-27a4-48d6-9083-da9ae9af093c","status":"public","namespace":"ShortCode","id":1,"slug":"cardbanner","hash":"","timestamp":1743726576000,"updated":1743726636122,"name":"cardBanner","template":"\u003cstyle\u003e\r\n.cardbanner {\r\n    font-family: Arial, sans-serif;\r\n            padding: 40px;\r\n            background-color: #f5f5f5;\r\n            max-width: 1080px;\r\n            margin: 0 auto;\r\n}\r\n\r\n.cardbanner .header {\r\n   display: flex;\r\n            justify-content: space-between;\r\n            align-items: flex-start;\r\n            margin-bottom: 100px;\r\n}\r\n\r\n.cardbanner .logo {\r\n    font-size: 24px;\r\n    font-weight: bold;\r\n}\r\n\r\n.cardbanner .avatar {\r\n    width: 60px;\r\n            height: 60px;\r\n            font-size: 40px;\r\n            border-radius: 50%; /* 让图片变成圆形 */\r\n            object-fit: cover; /* 确保图片填充整个圆形 */\r\n            display: block;\r\n}\r\n\r\n.cardbanner .main-title {\r\n    font-size: 52px;\r\n            font-weight: bold;\r\n            margin-bottom: 20px;\r\n            line-height: 1.2;\r\n}\r\n\r\n.cardbanner .subtitle {\r\n    font-size: 65px;\r\n            font-weight: bold;\r\n            background: linear-gradient(transparent 60%, #FFB6C1 40%);\r\n            display: inline-block;\r\n            margin-bottom: 15px;\r\n            letter-spacing: 15px;\r\n}\r\n\r\n.cardbanner .description {\r\n    font-size: 23px;\r\n            color: #666;\r\n            margin-bottom: 45px;\r\n}\r\n\r\n.cardbanner .new-label {\r\n    position: relative;\r\n            display: inline-block;\r\n            margin-top: 60px;\r\n            transform: rotate(-10deg);\r\n            width: 100%;\r\n}\r\n\r\n.cardbanner .new-tag {\r\n    background: #4169E1;\r\n            color: white;\r\n            padding: 10px 20px;\r\n            border-radius: 15px;\r\n            position: absolute;  /* 绝对定位 */\r\n            right: 0;  /* 让它紧贴 .new-label 右侧 */\r\n            top: 50%;  /* 垂直居中 */\r\n            transform: translateY(-50%) rotate(30deg);  /* 保持旋转但居中 */\r\n            display: inline-block;\r\n            font-weight: bold;\r\n            font-size: 28px;\r\n            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.cardbanner .new-tag::after {\r\n    content: \"!!\";\r\n    color: white;\r\n    margin-left: 5px;\r\n}\r\n\r\n.cardbanner .footer {\r\n     margin-top: 174px;\r\n            display: flex;\r\n            justify-content: space-between;\r\n            font-size: 20px;\r\n            color: #333;\r\n}\r\n\r\n.cardbanner .footer span {\r\n    margin: 0 10px;\r\n}\r\n\r\n.cardbanner .divider {\r\n    color: #999;\r\n}\r\n      \u003c/style\u003e\r\n      \u003cdiv class=\"cardbanner\"\u003e\r\n        \u003cdiv class=\"header\"\u003e\r\n          \u003cdiv class=\"logo\"\u003e{{ .Get \"logo\" }}\u003c/div\u003e\r\n          \u003cdiv class=\"avatar\"\u003e\r\n           \u003cimg class=\"avatar\" src='{{ .Get \"avatar\" }}' alt=\"头像\"\u003e\r\n          \u003c/div\u003e\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"main-title\"\u003e\r\n          {{ .Get \"mainTitle\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"subtitle\"\u003e\r\n          {{ .Get \"subtitle\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"description\"\u003e\r\n          {{ .Get \"description\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"new-label\"\u003e\r\n          \u003cdiv class=\"new-tag\"\u003e{{ .Get \"newTagText\" }}\u003c/div\u003e\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"footer\"\u003e\r\n        {{ $topics := split (.Get \"footerContent\") \",\" }}\r\n        {{ range $index, $topic := $topics }}\r\n            {{ if gt $index 0 }} \u003cspan class=\"divider\"\u003e|\u003c/span\u003e {{ end }}\r\n            {{ $topic }}\r\n        {{ end }}\r\n        \u003c/div\u003e\r\n      \u003c/div\u003e","example":"{{\u003c cardBanner\r\n    logo=\"不黑学长\"\r\n    avatar=\"/images/avatar.png\"\r\n    mainTitle=\"让完播率\u003e50% (3/3)\"\r\n    subtitle=\"6种文案公式\"\r\n    description=\"爆款拆解/爆款要素/文案结构\"\r\n    newTagText=\"全新整理\"\r\n    footerContent=\"运营技巧,爆款选题,文案写作,数据复盘\"\r\n/\u003e}}","asset":"/api/uploads/d66e65ad754f15723096c1156d043cbe/2025/04/1743726636150-1.jpg","tags":["xhs","小红书"],"width":1080,"height":1440}]}

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/sc?type=ShortCode&status=&id=1"
{"data":[{"uuid":"98b64ab7-27a4-48d6-9083-da9ae9af093c","status":"public","namespace":"ShortCode","id":1,"slug":"cardbanner","hash":"","timestamp":1743726576000,"updated":1743726636122,"name":"cardBanner","template":"\u003cstyle\u003e\r\n.cardbanner {\r\n    font-family: Arial, sans-serif;\r\n            padding: 40px;\r\n            background-color: #f5f5f5;\r\n            max-width: 1080px;\r\n            margin: 0 auto;\r\n}\r\n\r\n.cardbanner .header {\r\n   display: flex;\r\n            justify-content: space-between;\r\n            align-items: flex-start;\r\n            margin-bottom: 100px;\r\n}\r\n\r\n.cardbanner .logo {\r\n    font-size: 24px;\r\n    font-weight: bold;\r\n}\r\n\r\n.cardbanner .avatar {\r\n    width: 60px;\r\n            height: 60px;\r\n            font-size: 40px;\r\n            border-radius: 50%; /* 让图片变成圆形 */\r\n            object-fit: cover; /* 确保图片填充整个圆形 */\r\n            display: block;\r\n}\r\n\r\n.cardbanner .main-title {\r\n    font-size: 52px;\r\n            font-weight: bold;\r\n            margin-bottom: 20px;\r\n            line-height: 1.2;\r\n}\r\n\r\n.cardbanner .subtitle {\r\n    font-size: 65px;\r\n            font-weight: bold;\r\n            background: linear-gradient(transparent 60%, #FFB6C1 40%);\r\n            display: inline-block;\r\n            margin-bottom: 15px;\r\n            letter-spacing: 15px;\r\n}\r\n\r\n.cardbanner .description {\r\n    font-size: 23px;\r\n            color: #666;\r\n            margin-bottom: 45px;\r\n}\r\n\r\n.cardbanner .new-label {\r\n    position: relative;\r\n            display: inline-block;\r\n            margin-top: 60px;\r\n            transform: rotate(-10deg);\r\n            width: 100%;\r\n}\r\n\r\n.cardbanner .new-tag {\r\n    background: #4169E1;\r\n            color: white;\r\n            padding: 10px 20px;\r\n            border-radius: 15px;\r\n            position: absolute;  /* 绝对定位 */\r\n            right: 0;  /* 让它紧贴 .new-label 右侧 */\r\n            top: 50%;  /* 垂直居中 */\r\n            transform: translateY(-50%) rotate(30deg);  /* 保持旋转但居中 */\r\n            display: inline-block;\r\n            font-weight: bold;\r\n            font-size: 28px;\r\n            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.cardbanner .new-tag::after {\r\n    content: \"!!\";\r\n    color: white;\r\n    margin-left: 5px;\r\n}\r\n\r\n.cardbanner .footer {\r\n     margin-top: 174px;\r\n            display: flex;\r\n            justify-content: space-between;\r\n            font-size: 20px;\r\n            color: #333;\r\n}\r\n\r\n.cardbanner .footer span {\r\n    margin: 0 10px;\r\n}\r\n\r\n.cardbanner .divider {\r\n    color: #999;\r\n}\r\n      \u003c/style\u003e\r\n      \u003cdiv class=\"cardbanner\"\u003e\r\n        \u003cdiv class=\"header\"\u003e\r\n          \u003cdiv class=\"logo\"\u003e{{ .Get \"logo\" }}\u003c/div\u003e\r\n          \u003cdiv class=\"avatar\"\u003e\r\n           \u003cimg class=\"avatar\" src='{{ .Get \"avatar\" }}' alt=\"头像\"\u003e\r\n          \u003c/div\u003e\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"main-title\"\u003e\r\n          {{ .Get \"mainTitle\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"subtitle\"\u003e\r\n          {{ .Get \"subtitle\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"description\"\u003e\r\n          {{ .Get \"description\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"new-label\"\u003e\r\n          \u003cdiv class=\"new-tag\"\u003e{{ .Get \"newTagText\" }}\u003c/div\u003e\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"footer\"\u003e\r\n        {{ $topics := split (.Get \"footerContent\") \",\" }}\r\n        {{ range $index, $topic := $topics }}\r\n            {{ if gt $index 0 }} \u003cspan class=\"divider\"\u003e|\u003c/span\u003e {{ end }}\r\n            {{ $topic }}\r\n        {{ end }}\r\n        \u003c/div\u003e\r\n      \u003c/div\u003e","example":"{{\u003c cardBanner\r\n    logo=\"不黑学长\"\r\n    avatar=\"/images/avatar.png\"\r\n    mainTitle=\"让完播率\u003e50% (3/3)\"\r\n    subtitle=\"6种文案公式\"\r\n    description=\"爆款拆解/爆款要素/文案结构\"\r\n    newTagText=\"全新整理\"\r\n    footerContent=\"运营技巧,爆款选题,文案写作,数据复盘\"\r\n/\u003e}}","asset":"/api/uploads/d66e65ad754f15723096c1156d043cbe/2025/04/1743726636150-1.jpg","tags":["xhs","小红书"],"width":1080,"height":1440}]}

### 图片展示

其中图片的 asset 字段是图片的 URL，是原图地址。 根目录是 http://127.0.0.1:1314 ， 也就是说我们要根据当前环境来选取。
另外，当显示图片缩略图的时候，不用显示图片原图，而是用以下链接：
"http://127.0.0.1:1314/image/100/200"
其中 100 是宽， 200 是高，我们需要根据返回的后端数据的里的 width 和 height 进行等比综小，以高效显示缩略图，提高用户浏览体验。
当点击缩略图，显示图片原图时，则调用 asset 字段并展示原始图片。

### 图片搜索

后端使用的是 bleve , 也是一个搜索引擎，需要先创建一个 bleve 索引，然后再进行搜索。
```go
q := bleve.NewQueryStringQuery(query)
```
所以我们需要把搜索条件按 bleve string query 的要求进行拼装。
如果我要查找 tags 为 xhs 或者 tags 为 小红书 的图片，那么搜索条件是示例如下:

q=name%3Axhs%20OR%20tags%3A小红书

### 接口缓存

所有接口都有缓存机制：

➜  ~ curl -v GET "http://127.0.0.1:1314/api/sc/tags?type=ShortCode"
* Could not resolve host: GET
* shutting down connection #0
  curl: (6) Could not resolve host: GET
*   Trying 127.0.0.1:1314...
* Connected to 127.0.0.1 (127.0.0.1) port 1314
* using HTTP/1.x
> GET /api/sc/tags?type=ShortCode HTTP/1.1
> Host: 127.0.0.1:1314
> User-Agent: curl/8.12.1
> Accept: */*
>
* Request completely sent off
  < HTTP/1.1 200 OK
  < Access-Control-Allow-Headers: Accept, Authorization, Content-Type
  < Access-Control-Allow-Origin: *
  < Cache-Control: max-age=2592000, public
  < Content-Type: application/json
  < Etag: MTc0MzcyODA2Mg==
  < Vary: Accept-Encoding
  < Date: Sat, 05 Apr 2025 23:50:34 GMT
  < Content-Length: 31
  <
  {"data":[["xhs","小红书"]]}
* Connection #1 to host 127.0.0.1 left intact

该接口会返回所有的图片标签。我们可以显示在页面上。
该接口提供了缓存机制:

```go
if match := req.Header.Get("If-None-Match"); match != "" {
if strings.Contains(match, etag) {
res.WriteHeader(http.StatusNotModified)
return
}
}
```
我们需要在请求字段中加入 If-None-Match: MTc0MzU2MzU2OA== 。 也就是 Etag 的值。这样后端会进行判断，如果没有变化，就会返回 304 Not Modified。

## 创建项目模板页面展示

用户点击创建项目，进入模板选择页面后，需要按以下步骤进行加载数据：

- 加载 shortcode 所有的标签，并将其动态显示在新建模板的 tab 栏
- 默认选中第一个标签
- 显示选中标签的所有 shortcode 搜索结果

### 加载 shortcode 所有标签的模板后端接口集成逻辑

需要调用以下接口：

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/sc/tags?type=ShortCode"
{"data":[["xhs","小红书"]]}

这样我们就获取了所有的 shortcode 标签。可以展示在项目新创建 model 页面的 tab 栏。

### 加载选中标签的 shortcode 列表页面，以方便用户选择模板

需调用以下接口：

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/sc/search?type=ShortCode&count=10&offset=0&order=desc&q=tags%3Axhs"
{"data":[{"uuid":"98b64ab7-27a4-48d6-9083-da9ae9af093c","status":"public","namespace":"ShortCode","id":1,"slug":"cardbanner","hash":"","timestamp":1743726576000,"updated":1743726636122,"name":"cardBanner","template":"\u003cstyle\u003e\r\n.cardbanner {\r\n    font-family: Arial, sans-serif;\r\n            padding: 40px;\r\n            background-color: #f5f5f5;\r\n            max-width: 1080px;\r\n            margin: 0 auto;\r\n}\r\n\r\n.cardbanner .header {\r\n   display: flex;\r\n            justify-content: space-between;\r\n            align-items: flex-start;\r\n            margin-bottom: 100px;\r\n}\r\n\r\n.cardbanner .logo {\r\n    font-size: 24px;\r\n    font-weight: bold;\r\n}\r\n\r\n.cardbanner .avatar {\r\n    width: 60px;\r\n            height: 60px;\r\n            font-size: 40px;\r\n            border-radius: 50%; /* 让图片变成圆形 */\r\n            object-fit: cover; /* 确保图片填充整个圆形 */\r\n            display: block;\r\n}\r\n\r\n.cardbanner .main-title {\r\n    font-size: 52px;\r\n            font-weight: bold;\r\n            margin-bottom: 20px;\r\n            line-height: 1.2;\r\n}\r\n\r\n.cardbanner .subtitle {\r\n    font-size: 65px;\r\n            font-weight: bold;\r\n            background: linear-gradient(transparent 60%, #FFB6C1 40%);\r\n            display: inline-block;\r\n            margin-bottom: 15px;\r\n            letter-spacing: 15px;\r\n}\r\n\r\n.cardbanner .description {\r\n    font-size: 23px;\r\n            color: #666;\r\n            margin-bottom: 45px;\r\n}\r\n\r\n.cardbanner .new-label {\r\n    position: relative;\r\n            display: inline-block;\r\n            margin-top: 60px;\r\n            transform: rotate(-10deg);\r\n            width: 100%;\r\n}\r\n\r\n.cardbanner .new-tag {\r\n    background: #4169E1;\r\n            color: white;\r\n            padding: 10px 20px;\r\n            border-radius: 15px;\r\n            position: absolute;  /* 绝对定位 */\r\n            right: 0;  /* 让它紧贴 .new-label 右侧 */\r\n            top: 50%;  /* 垂直居中 */\r\n            transform: translateY(-50%) rotate(30deg);  /* 保持旋转但居中 */\r\n            display: inline-block;\r\n            font-weight: bold;\r\n            font-size: 28px;\r\n            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);\r\n}\r\n\r\n.cardbanner .new-tag::after {\r\n    content: \"!!\";\r\n    color: white;\r\n    margin-left: 5px;\r\n}\r\n\r\n.cardbanner .footer {\r\n     margin-top: 174px;\r\n            display: flex;\r\n            justify-content: space-between;\r\n            font-size: 20px;\r\n            color: #333;\r\n}\r\n\r\n.cardbanner .footer span {\r\n    margin: 0 10px;\r\n}\r\n\r\n.cardbanner .divider {\r\n    color: #999;\r\n}\r\n      \u003c/style\u003e\r\n      \u003cdiv class=\"cardbanner\"\u003e\r\n        \u003cdiv class=\"header\"\u003e\r\n          \u003cdiv class=\"logo\"\u003e{{ .Get \"logo\" }}\u003c/div\u003e\r\n          \u003cdiv class=\"avatar\"\u003e\r\n           \u003cimg class=\"avatar\" src='{{ .Get \"avatar\" }}' alt=\"头像\"\u003e\r\n          \u003c/div\u003e\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"main-title\"\u003e\r\n          {{ .Get \"mainTitle\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"subtitle\"\u003e\r\n          {{ .Get \"subtitle\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"description\"\u003e\r\n          {{ .Get \"description\" }}\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"new-label\"\u003e\r\n          \u003cdiv class=\"new-tag\"\u003e{{ .Get \"newTagText\" }}\u003c/div\u003e\r\n        \u003c/div\u003e\r\n\r\n        \u003cdiv class=\"footer\"\u003e\r\n        {{ $topics := split (.Get \"footerContent\") \",\" }}\r\n        {{ range $index, $topic := $topics }}\r\n            {{ if gt $index 0 }} \u003cspan class=\"divider\"\u003e|\u003c/span\u003e {{ end }}\r\n            {{ $topic }}\r\n        {{ end }}\r\n        \u003c/div\u003e\r\n      \u003c/div\u003e","example":"{{\u003c cardBanner\r\n    logo=\"不黑学长\"\r\n    avatar=\"/images/avatar.png\"\r\n    mainTitle=\"让完播率\u003e50% (3/3)\"\r\n    subtitle=\"6种文案公式\"\r\n    description=\"爆款拆解/爆款要素/文案结构\"\r\n    newTagText=\"全新整理\"\r\n    footerContent=\"运营技巧,爆款选题,文案写作,数据复盘\"\r\n/\u003e}}","asset":"/api/uploads/d66e65ad754f15723096c1156d043cbe/2025/04/1743726636150-1.jpg","tags":["xhs","小红书"],"width":1080,"height":1440}]}

列表卡片中，展示返回的数据中的 asset 字段。
图片的展示并不是按照原 width, height 来展示，这样会让加载速度变慢。
而是用图片缩略图的方式来展示：
"http://127.0.0.1:1314/image/100/200"
其中的 100 是宽， 200 是高，我们按返回的真实 width, height 等比缩小来动态生成缩略图。

该接口会返回最新的10个拥有相同标签的 shortcode。
并且支持分页操作，当用户下拉时，可以获取下一页更多图片。

## 用户选中 shortcode 后的页面逻辑

用户浏览 shortcode 列表，并选中 shortcode 模版后。
我们将为用户创建项目，并把返回数字中的 example 字段内容写入项目的 index.md 文件中。
同时，将内样例容展示在 markdown 编辑区，并实时渲染在预览区。

渲染逻辑的代码样例如下：

```typescript

// Create a Shortcode instance
const shortcode = new Shortcode();

const cardBannerMetadata = {
id: 1,
name: "cardBanner",
template: `<style>
        style example...
      </style>
      <div class="cardbanner">
        shortcode template example
      </div>`,
// Optional fields
uuid: "98b64ab7-27a4-48d6-9083-da9ae9af093c",
tags: ["banner", "card"]
};

const res = shortcode.registerShortcode(cardBannerMetadata)
console.log("--- res", res)

const parseMarkdown = async () => {

    // Step 1: Replace shortcodes with placeholders
    const withPlaceholders = shortcode.stepRender(markdown);

    // Step 2: Process with markdown renderer
    const htmlContent = await markedInstance.parse(withPlaceholders)

    // Step 3: Final rendering
    const parsedHTML =  shortcode.finalRender(htmlContent);

    const wrappedHTML = wrapWithContainer(replaceImgSrc(parsedHTML));

    setInlineStyledHTML(inlineStyles(wrappedHTML, articleStyle));
};

parseMarkdown();

```

其中， cardBannerMetadata 来自于我们请求后端所获取到的数据，我们自己需要维护好 shortcode 实例的创建时机：

```typescript
// Create a Shortcode instance
const shortcode = new Shortcode();
```

这是一个全局实例，当用户打开浏览器并访问站点时，我们就需要帮助用户创建好，这样用户就可以一直重用这个实例。

在需要注册用户选中的 shortcode 模板时，注册模板时，我们会用到返回数据中的 template 字段：

```typescript
const res = shortcode.registerShortcode(cardBannerMetadata)
```
