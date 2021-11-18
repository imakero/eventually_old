const fs = require('fs')
const https = require('https')

export const fileExists = (path) => {
  try {
    return fs.existsSync(path)
  } catch (error) {
    console.error(error)
  }
}

export const downloadFile = async (url, path) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      const fileStream = fs.createWriteStream(path)
      res.pipe(fileStream)

      fileStream.on('error', (error) => {
        console.error('error')
        reject()
      })

      fileStream.on('finish', () => {
        fileStream.close()
        resolve()
      })
    })
  })
}
