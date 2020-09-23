const { getPcChapterInfo, getPcMediaInfo } = require('../request')

class Dd {

  constructor(config) {
    this.config = config
  }

  async bug() {
    let mediaInfo = await getPcMediaInfo({
      epubID: this.config.epubID
    })

    if(mediaInfo.isSuccess) {
      const mediaData = mediaInfo.data

      let iNeedInfo = {
        title: mediaData.mediaVo.title,
        cover: mediaData.mediaVo.coverPic,
      }

      let chapterMap = JSON.parse(mediaData.chapterMap)
      console.log(mediaData, 'mediaInfo')
    }

  }
}


let a = new Dd({
  epubID: '1900642108'
})

a.bug()

module.exports = Dd
