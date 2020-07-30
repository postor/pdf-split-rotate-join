export default function pdf2images(file, options = {}) {
  let { type, quality, scale } = {
    type: 'image/png',
    quality: 0.92,
    scale: 1,
    ...options
  }
  return new Promise((resolve) => {
    let fileReader = new FileReader()
    fileReader.onload = async () => {
      let loadingTask = pdfjsLib.getDocument(fileReader.result)
      let pdf = await loadingTask.promise
      let rtn = await Promise.all(new Array(pdf.numPages).fill(0).map(async (x, i) => {
        let pageNum = i + 1
        let page = await pdf.getPage(pageNum)
        return page2image(page, scale, type, quality)
      }))
      resolve(rtn)
    }
    fileReader.readAsArrayBuffer(file);
  })
}

async function page2image(page, scale, type, quality) {
  var viewport = page.getViewport({ scale: scale })
  var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d')
  var renderContext = { canvasContext: ctx, viewport: viewport }

  canvas.height = viewport.height
  canvas.width = viewport.width

  await page.render(renderContext).promise
  return canvas.toDataURL(type, quality)
}