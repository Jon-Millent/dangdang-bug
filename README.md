# dangdang-bug

离线下载当当html格式图书,支持离线阅读,html转pdf阅读  

![version](https://img.shields.io/github/package-json/v/jon-millent/dangdang-bug.svg)
  
## 优点
* 30m左右的html格式图书压缩后大约3m左右
* 电脑离线阅读
* 转换pdf后可以在ipad上做笔记
* 支持断点下载
* 免费图书可直接下载

## 须知
本程序适用于以下场景

* 您已经购买过该云图书
* 您需要离线阅读的需求
* 您不会私自分享,侵犯著作人权利

## 安装
```shell script
npm install dangdang-bug -g
```

## 使用
```shell script
dangdang [epubID] [token] [mode]
```
* epubID 是电子书阅读时候的ID,您在阅读的时候可以在url中看到  

![epubID](https://i.loli.net/2020/09/24/tdo6ZTxeWrphsl9.png)

* token 是下载完整书籍的钥匙,如果您不传token则只能下载试读章节,token可以在网页`F12`网页控制台的请求中查看到  

![token](https://i.loli.net/2020/09/24/MG4dUeLusSkVq8F.png)

* mode 下载模式, 有三种下载模式 slow | normal | fast 默认为 normal, 对于章节少的书可以用fast 或者 normal, 章节多的书请用slow

示例
```shell script
dangdang 1900016635
```

无token更改模式输入`null`
```shell script
dangdang 1900016635 null slow
```

默认下载到当前命令行运行文件目录,生成格式如下
```shell script
|-root
|-  [数据]
|-  data
|-    chapter-0.js
|-    chapter-1.js
|-    ...
|-  [阅读目录]
|-  chapter-0.html
|-  chapter-1.html
|-  ...   
```

## Q&A

#### 如何转换pdf?
直接点击书中的`打印转换pdf`按钮,使用chrome转换pdf

#### 如何合并pdf?
由于转换的pdf都是按章节一节一节的,您可以在网上使用第三方工具转换

#### 下载不完整?
由于token过期时间短,请每隔一段时间查看更新一下你输入的token

## 声明
请您遵循上述须知协议,书籍宝贵,请勿盗用  

![book](https://i.loli.net/2020/10/11/Gk59jbtEHMUWuxL.png)
