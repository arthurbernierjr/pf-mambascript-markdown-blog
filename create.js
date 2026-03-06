const fs = require('fs');
const path = require('path');
const api = `${__dirname}/api`
const apiStatic = `${__dirname}/api_static`
const apiPillar = `${__dirname}/api-pillar`
const json = `${__dirname}/json`
const jsonStatic = `${__dirname}/json_static`
const jsonPillar = `${__dirname}/json_pillar`
const matter = require('gray-matter');
const showdown  = require('showdown'),
    converter = new showdown.Converter()
converter.setOption('tables', true)

async function build (api, json, all) {
  const posts = []
  fs.readdir(api, (err, files) => {
    files.forEach(file => {
      const filePath = `${api}/${file}`;
      if (fs.statSync(filePath).isDirectory()) {
        return;
      }
      console.log(file, typeof file)
      const processedFile = matter.read(filePath)
      processedFile.content = converter.makeHtml(processedFile.content)
      processedFile._id = file.split('.')[0]
      const jsonedFile = JSON.stringify(processedFile)
      fs.writeFile( `${json}/${file.split('.')[0]}.json`, jsonedFile, {}, (err, success) => {
          if(err){
            console.log(err)
          }else{
            console.log(success)
          }
      })
      posts.push(processedFile)
    });
    if(all){
      const jsonPosts = JSON.stringify(posts)
      fs.writeFile( `${json}/all.json`, jsonPosts, {}, (err, success) => {
          if(err){
            console.log(err)
          }else{
            console.log(success)
          }
      })
    }
  })
  return Promise.resolve('success')
}

build(api, json, true).then(() => build(apiStatic, jsonStatic, false)).then(() => build(apiPillar, jsonPillar, false))
