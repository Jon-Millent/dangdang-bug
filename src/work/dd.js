const { getPcChapterInfo, getPcMediaInfo } = require('../request')
const fs = require('fs')
const path = require('path')
const ProgressBar = require('progress')

class Dd {
  /*
  * @config
  * {
  *   epubID: [required],
  *   token: ''
  * }
  * */
  constructor(config) {
    this.config = config
    this.htmlTemplate = fs.readFileSync(path.join(__dirname, '../', 'template/read.html' )).toString('utf-8')
    this.baseDir = process.cwd()

    this.saveConfig = {
      dataDir: path.join(this.baseDir, '/data'),
      htmlDir: this.baseDir
    }

    this.mode = {
      'slow': {
        every: 1000,
        last: 5000,
        label: 'slow',
        error_sleep: 10000
      },
      'normal': {
        every: 600,
        last: 2000,
        label: 'normal',
        error_sleep: 6000
      },
      'fast': {
        every: 0,
        last: 1000,
        label: 'fast',
        error_sleep: 1000
      }
    }

    this.targetMode = this.mode[this.config.mode] || this.mode['normal']
  }

  sleep(time) {
    return new Promise(resolve => {
      setTimeout(()=>{
        resolve()
      }, time)
    })
  }

  getCacheDownloadIndex() {
    let dir = fs.readdirSync(this.saveConfig.htmlDir)
    let max = -1

    dir.forEach(item=> {
      if(item.indexOf('chapter') !== -1) {
        let num = item.replace('chapter-', '').replace('.html', '')
        max = Math.max( max, parseInt(num) )
      }
    })
    return max > -1 ? max : null
  }

  async bug() {

    // 获取当前目录是否有下载的文件, 以便判断断点续下
    let cacheDownloadIndex = this.getCacheDownloadIndex()

    console.log('>下载模式: ' + this.targetMode.label + '\n')

    let mediaInfo = await getPcMediaInfo({
      epubID: this.config.epubID,
      token: this.config.token
    })

    if(mediaInfo.isSuccess) {
      const mediaData = mediaInfo.data

      let iNeedInfo = {
        title: mediaData.mediaVo.title,
        cover: mediaData.mediaVo.coverPic,
      }

      console.log(`>获取信息成功: \n 《${iNeedInfo.title}》 \n 准备开始下载\n`)

      let chapterMap = mediaData.chapterMap

      const bar = new ProgressBar('下载中 [:bar] :rate/bps :percent 预计剩余:etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: mediaData.totalPages
      });

      // 迭代
      let chapterMapIndex = cacheDownloadIndex || 0
      let nowTargetChapter = chapterMap['chapterId' + chapterMapIndex]
      let locationIndex = 0

      // 如果有本地下载记录, locationIndex需要迭代增加
      if(chapterMapIndex > 0) {
        locationIndex = chapterMapIndex
        console.log('*检测到本地下载记录, 继续下载.\n')
      }

      while (nowTargetChapter) {

        let bookLib = {
          chapterID: nowTargetChapter.chapterID,
          originalChapterID: nowTargetChapter.originalChapterID,
          pageCount: nowTargetChapter.pageCount,
          pagenum: nowTargetChapter.pagenum,
          children: []
        }

        for(let page = 0; page < nowTargetChapter.pageCount; page ++) {

          // 当前是否下载成功
          let itemDownloadDown = false

          while (!itemDownloadDown) {
            let bookListInfo = await getPcChapterInfo({
              epubID: this.config.epubID,
              chapterID: bookLib.chapterID,
              pageIndex: page,
              locationIndex,
              token: this.config.token
            })

            if(bookListInfo.isSuccess) {
              itemDownloadDown = true
              locationIndex++
              bar.tick(1);
              bookLib.children.push(
                bookListInfo.data
              )
            } else {

              if(bookListInfo.status) {
                console.log(`\n下载失败可能是以下原因: token到期或者没权限`)
                console.log(`\n错误信息:\n`)
                console.log(bookListInfo)
                console.log(`\n你可以请截图到github: https://github.com/Jon-Millent/dangdang-bug/issues`)
                nowTargetChapter = null
                itemDownloadDown = true
                return
              } else {
                // console.log('频率 + 重试')
                await this.sleep(this.targetMode.error_sleep)
              }

            }
          }
          await this.sleep(this.targetMode.every)
        }

        this.saveJson(`chapter-${chapterMapIndex}.js`, bookLib)
        this.saveHtml(chapterMapIndex)

        chapterMapIndex++
        nowTargetChapter = chapterMap['chapterId' + chapterMapIndex]

        // 休息
        await this.sleep(this.targetMode.last)
      }

      console.log('\n下载完成, （￣︶￣）↗　')
    } else{
      console.log('获取图书信息失败')
      console.log( mediaInfo)
    }
  }

  saveHtml(chapterId) {
    fs.writeFileSync(
      path.join(this.saveConfig.htmlDir, 'chapter-' + chapterId + '.html'),
      this.htmlTemplate.replace(
        '${title}', 'chapter-' + chapterId
      ).replace(
        '${dataName}', `chapter-${chapterId}.js`
      )
    )
  }

  saveJson(fileName, Obj) {
    if(!fs.existsSync(this.saveConfig.dataDir)) {
      fs.mkdirSync(this.saveConfig.dataDir, { recursive: true });
    }
    fs.writeFileSync(this.saveConfig.dataDir + '/' + fileName, 'window.book = ' + JSON.stringify(Obj))
  }

}

module.exports = Dd
