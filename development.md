# 开发 vtbs.moe

#### 前置要求

- node 版本最新, 推荐 `14.10.1`

Windows 可能需要先安装 `win-node-env`
```shell
npm install -g win-node-env
```

#### 安装依赖:

```shell
git submodule update --init --recursive
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
