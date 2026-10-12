# 开发 vtbs.moe

#### 前置要求

- Node.js `20.19+` 或 `22.12+`，推荐 Node.js 22 LTS
- 前端使用 Vue 2.7 + Vite


#### 安装依赖:

```shell
git submodule update --init --recursive
npm ci
```

### 前端

#### Compiles and hot-reloads for development

```shell
npm run serve
```

#### Compiles and minifies for production

```shell
npm run build
```

#### Customize configuration

配置位于 `vite.config.js`，参考 [Vite 配置文档](https://vite.dev/config/)。

`npm run build:vue` 只构建前端，`npm run build` 仍先编译后端 TypeScript。
`npm run preview` 可预览 `dist` 中的构建结果。
开发服务器使用端口 8080，继续通过现有 CDN 配置连接 WebSocket。

### 后端API

#### 编译Typescript (Watch)

```sh
npm run dev
```

#### 编译Typescript

```shell
npm run tsc
```

#### 运行 (MOCK)

```sh
node api/mock
```

会自动mock以下repo:

* <https://github.com/dd-center/state-center>
* <https://github.com/dd-center/DDatHome-nodejs>
* <https://github.com/dd-center/Cluster-center>

#### 运行

```sh
node index.cjs
```

* Socket 服务端口: `8001`

#### 其他

* 把数据库导出为 json 文件: `node script/db2json`
