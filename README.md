## 基于webpack4的配置生成工具

使用一下plugin加速webpack编译速度：

* happypack
* dllPlugin

babel 配置包括以下：

* 使用 babel-preset-react 让其解析jsx语法
* 使用 babel-preset-stage-0（stage中最高级的套餐），让其对ES6的语法进行解析
* 使用 babel-preset-env，让其针对配置，对其加入不同的 polyfill，这里使用的是 useBuiltIns，针对我们在 base 配置中的 babel-polyfill 进行切割，针对我们在项目中使用到的不兼容的特性进行 polyfill。
* babel-plugin-transform-decorators-legacy 解析装饰器语法，也就是变量前边的@符号，如antd高阶组件中的@Form.create()
* babel-plugin-transform-class-properties 解析 class 语法

### 安装与使用

```
npm i webpack-config-tool -g
```

初始化

```
cd myapp
wct init
```

启动

```
npm run start:dll  // 如果使用dllPlugin
npm run start
```
