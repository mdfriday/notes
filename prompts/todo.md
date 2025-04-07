# v0.1.0 待办事项

在 v0.1.0 版本里需要包含以下功能：

1. 用户可以选择模板并创建项目
2. 用户可以打开已有项目
3. 用户可以查找图片素材
4. 用户可以下载项目生成的图片
5. 用户可以调整画布背景最小宽度到0
6. 用户可以自定义画布背景颜色
7. 用户可以调整画布渲染主题样式，同时需隔离模板渲染样式，互不影响

## 项目源码结构说明

```text
src
├── components        // UI 组件 (可按功能或模块细分子目录)
├── config            // 项目配置
├── core              // 核心逻辑
│   ├── contexts      // 应用级状态和共享数据 (Project 相关信息、认证、主题等)
│   ├── services      // 封装后端 API 调用
│   ├── state         // 应用级状态管理 (Redux, Zustand, Recoil 等)
│   ├── utils         // 通用工具函数 (HTTP 请求、数据处理、格式化等)
│   └── project  // 创建一个新的子目录，用于存放与项目相关的核心逻辑
│       ├── contexts
│       │   └── projectContext.tsx // 或者 projectState.tsx，根据侧重命名
│       ├── services
│       │   └── index.ts         // (如果需要，可以进一步细分 services)
│       └── shortcode
│           ├── services
│           │   └── shortcodeApiService.ts // 将 shortcodeApiService 移到这里
│           └── utils
│               └── shortcodeUtils.ts    // (如果需要，存放短代码相关的工具函数)
├── hooks             // 全局通用 Hooks
├── layouts           // 布局组件
├── locales           // 国际化
├── pages             // 顶层页面路由组件 (容器组件)
├── assets            // 静态资源 (images, fonts, etc.)
│   ├── images
│   ├── fonts
│   └── ...
├── styles            // 全局样式
├── types             // 全局通用类型定义
└── router            // 路由配置
```


## 模板缓存

我们提供给用户模板渲染的服务，我们的模板有模板内容和模板样例。
用户使用模板的场景有如下三种：

1. 新建项目，并选择模板
2. 打开已有项目
3. 用户可以直接写出模板

这三种场景下的模板渲染的逻辑是相同的。
都是先注册模板，再渲染包含了模板的项目，也就是 markdown 文件。

所以我们需要提供一个模板缓存，用户可以直接从缓存中获取已经渲染过的 markdown 文件。

当用户打开我们的 Web 服务，并打开了一个项目里的 markdown 文件。
这时，我们需要用包 @mdfriday/shortcode 进行 markdown 解析，从解析结果里，我们可以知道，当前 markdown 文件包含了哪些 shortcode。
通过些 shortcode 的名字信息，我们可以先从本地缓存中获取 shortcode 的所有详细信息，这些信息都是之前从后端获取的。
这样，我们就可以将这些模板信息，提前注册到 @mdfriday/shortcode 中，当我们对 markdown 进行渲染时，就能正确识别出这些 shortcode，并渲染。
当缓存中没有找到这些 shortcode 时，就需要调用后端，通过名字来查找这些 shortcode 的详细信息，然后保存到缓存中，并注册到 @mdfriday/shortcode 里，再进行渲染。



