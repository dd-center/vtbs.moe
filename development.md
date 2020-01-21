# 开发 vtbs.moe

#### 安装依赖:

```shell
git submodule init
git submodule update
npm install
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

See [Configuration Reference](https://cli.vuejs.org/config/).

### 后端API

#### 编译Typescript

```shell
npm run tsc
```

#### 运行

```sh
node index
```

* Socket 服务端口: `8001`
* Vtuber/Vup 列表 见 [api/vtbs.js](api/vtbs.js)

#### 其他

* 把数据库导出为 json 文件: `node script/db2json`