# Photos 页面后端集成

## 后端有提供接口如下：

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/images?type=Image&count=10&offset=0&order=desc"
{"data":[{"uuid":"efd6c43b-161d-4008-a9ab-cd7e22e4d66a","status":"public","namespace":"Image","id":1,"slug":"name","hash":"","timestamp":1743471048000,"updated":1743471048797,"name":"name","asset":"/api/uploads/d66e65ad754f15723096c1156d043cbe/2025/04/screencapture-notes-sunwei-xyz-zh-2025-03-24-081335.png","tags":["Test"],"width":1905,"height":1311}]}

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/image/search?type=Image&count=10&offset=0&order=desc&q=name%3ATest%20OR%20tags%3ATest"
{"data":[{"uuid":"efd6c43b-161d-4008-a9ab-cd7e22e4d66a","status":"public","namespace":"Image","id":1,"slug":"name","hash":"","timestamp":1743471048000,"updated":1743471048797,"name":"name","asset":"/api/uploads/d66e65ad754f15723096c1156d043cbe/2025/04/screencapture-notes-sunwei-xyz-zh-2025-03-24-081335.png","tags":["Test"],"width":1905,"height":1311}]}

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/image/tags?type=Image"
{"data":[["Test"]]}

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
如果我要查找 name 为 name 且 tags 为 Test 的图片，那么搜索条件是示例如下:

q=name%3ATest%20OR%20tags%3ATest

### 接口缓存

所有接口都有缓存机制：

➜  mdfriday curl -v -X GET "http://127.0.0.1:1314/api/image/tags?type=Image"
Note: Unnecessary use of -X or --request, GET is already inferred.
*   Trying 127.0.0.1:1314...
* Connected to 127.0.0.1 (127.0.0.1) port 1314
> GET /api/image/tags?type=Image HTTP/1.1
> Host: 127.0.0.1:1314
> User-Agent: curl/8.7.1
> Accept: */*
>
* Request completely sent off
  < HTTP/1.1 200 OK
  < Access-Control-Allow-Headers: Accept, Authorization, Content-Type
  < Access-Control-Allow-Origin: *
  < Cache-Control: max-age=2592000, public
  < Content-Type: application/json
  < Etag: MTc0MzU2MzU2OA==
  < Vary: Accept-Encoding
  < Date: Wed, 02 Apr 2025 07:34:24 GMT
  < Content-Length: 20
  <
  {"data":[["Test"]]}
* Connection #0 to host 127.0.0.1 left intact

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

## 页面展示

用户进入图片页面后，需要按以下步骤进行加载数据：

- 加载图片标签
- 加载图片列表

### 加载图片标签操作的后端集成逻辑

需要调用以下接口：

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/image/tags?type=Image"
{"data":[["Test"]]}

这样我们就获取了所有的图片标签。可以展示在图片页面，供大家选择，快速过滤图片。

### 加载图片列表操作的后端集成逻辑

需调用以下接口：

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/images?type=Image&count=10&offset=0&order=desc"
{"data":[{"uuid":"efd6c43b-161d-4008-a9ab-cd7e22e4d66a","status":"public","namespace":"Image","id":1,"slug":"name","hash":"","timestamp":1743471048000,"updated":1743471048797,"name":"name","asset":"/api/uploads/d66e65ad754f15723096c1156d043cbe/2025/04/screencapture-notes-sunwei-xyz-zh-2025-03-24-081335.png","tags":["Test"],"width":1905,"height":1311}]}

该接口会返回最新的10张图片。
并且支持分页操作，当用户下拉时，可以获取下一页更多图片。

## 用户操作

进入图片页面，用户可以进行下列操作：

- 搜索图片
- 选择标签，快速过滤图片
- 根据搜索条件，或者是标签过滤条件，下拉加载更多图片

### 搜索图片的后端交互逻辑

用户进入图片页面，可以通过搜索框来查找图片，当用户输入信息时，我们会从 name 和 tags 两个字段来搜索图片。

如下所示：

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/image/search?type=Image&count=10&offset=0&order=desc&q=name%3ATest%20OR%20tags%3ATest"
{"data":[{"uuid":"efd6c43b-161d-4008-a9ab-cd7e22e4d66a","status":"public","namespace":"Image","id":1,"slug":"name","hash":"","timestamp":1743471048000,"updated":1743471048797,"name":"name","asset":"/api/uploads/d66e65ad754f15723096c1156d043cbe/2025/04/screencapture-notes-sunwei-xyz-zh-2025-03-24-081335.png","tags":["Test"],"width":1905,"height":1311}]}

并且该搜索接口，是支持分页查询的，当用户下拉页面时，可以获取下一页更多图片。

### 选择标签的后端交互逻辑

标签支持多选，用户可以选择多个标签，快速过滤图片。
下面是选择了 Test 和 Test1 两个标签的后端请求：

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/image/search?type=Image&count=10&offset=0&order=desc&q=tags%3ATest1%20OR%20tags%3ATest"
{"data":[{"uuid":"efd6c43b-161d-4008-a9ab-cd7e22e4d66a","status":"public","namespace":"Image","id":1,"slug":"name","hash":"","timestamp":1743471048000,"updated":1743471048797,"name":"name","asset":"/api/uploads/d66e65ad754f15723096c1156d043cbe/2025/04/screencapture-notes-sunwei-xyz-zh-2025-03-24-081335.png","tags":["Test"],"width":1905,"height":1311}]}

当用重置了标签选项后，则会返回所有的图片。调用如下接口：

➜  mdfriday curl -X GET "http://127.0.0.1:1314/api/images?type=Image&count=10&offset=0&order=desc"
{"data":[{"uuid":"efd6c43b-161d-4008-a9ab-cd7e22e4d66a","status":"public","namespace":"Image","id":1,"slug":"name","hash":"","timestamp":1743471048000,"updated":1743471048797,"name":"name","asset":"/api/uploads/d66e65ad754f15723096c1156d043cbe/2025/04/screencapture-notes-sunwei-xyz-zh-2025-03-24-081335.png","tags":["Test"],"width":1905,"height":1311}]}

根据页面加载逻辑和用户操作逻辑，生成代码。
