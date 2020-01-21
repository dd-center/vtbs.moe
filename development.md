# 开发 vtbs.moe

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

#### 设置环境env:

在本地开发时，如果只运行api，那需要设置MOCK:

```shell
export MOCK=true
```

之后打开api就会自动mock以下repo:

<https://github.com/dd-center/state-center>

<https://github.com/dd-center/DDatHome-nodejs>

<https://github.com/dd-center/Cluster-center>

#### 编译Typescript

```shell
npm run tsc
```

#### 运行

```sh
node index
```

* Socket 服务端口: `8001`

#### 其他

* 把数据库导出为 json 文件: `node script/db2json`