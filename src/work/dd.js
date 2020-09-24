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
  }

  sleep(time) {
    return new Promise(resolve => {
      setTimeout(()=>{
        resolve()
      }, time)
    })
  }

  async bug() {
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

      console.log(`获取信息成功: \n ${iNeedInfo.title} \n 准备开始下载`)

      let chapterMap = mediaData.chapterMap

      const bar = new ProgressBar('下载中 [:bar] :rate/bps :percent 预计剩余:etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: mediaData.totalPages
      });

      // 迭代
      let chapterMapIndex = 0
      let nowTargetChapter = chapterMap['chapterId' + chapterMapIndex]
      let locationIndex = 0

      while (nowTargetChapter) {

        let bookLib = {
          chapterID: nowTargetChapter.chapterID,
          originalChapterID: nowTargetChapter.originalChapterID,
          pageCount: nowTargetChapter.pageCount,
          pagenum: nowTargetChapter.pagenum,
          children: []
        }

        for(let page = 0; page < nowTargetChapter.pageCount; page ++) {
          let bookListInfo = await getPcChapterInfo({
            epubID: this.config.epubID,
            chapterID: bookLib.chapterID,
            pageIndex: page,
            locationIndex,
            token: this.config.token
          })
          locationIndex++
          bar.tick(1);
          if(bookListInfo.isSuccess) {
            bookLib.children.push(
              bookListInfo.data
            )
          }
        }

        this.saveJson(`chapter-${chapterMapIndex}.js`, bookLib)
        this.saveHtml(chapterMapIndex)

        chapterMapIndex++
        nowTargetChapter = chapterMap['chapterId' + chapterMapIndex]

        // 休息
        await this.sleep(1000)
      }
      console.log('下载完成')
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
