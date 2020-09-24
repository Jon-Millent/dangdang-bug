#!/usr/bin/env node

const DD = require('./work/dd')
const argv = process.argv

if(argv.length <= 2) {
  console.log(`
  help
  
  dangdang [epubID] [token]
  
  @epubID[required]
  @token 如果不传只能下载试读章节
  
  [more]
  更多帮助请访问 https://github.com/Jon-Millent/dangdang-bug
  `)
  return
}

argv.forEach((item, index)=> {
  if(item === 'null') {
    argv[index] = null
  }
})

let dd = new DD({
  epubID: argv[2],
  token: argv[3] || '',
  mode: argv[4] || 'normal'
})

dd.bug()
