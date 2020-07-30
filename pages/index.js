import Head from 'next/head'
import { useState } from 'react'
import pdf2images from '../lib/pdf2images'
import rotateImage from '../lib/rotate-image'
import { mergeBase64 } from 'canvas-merge-images'
import useTorttledEffect from 'use-throttled-effect'


export default Index

function Index() {
  let [images, setImages] = useState([])
  let [preview, setPreview] = useState('')
  let [curPage, setCurPage] = useState(0)

  useTorttledEffect(async () => {
    if(!images.length){
      return setPreview('')      
    }
    let preview = await mergeBase64(await Promise.all(images.map(async ({ img, rotate }) => {
      return await rotateImage(img, rotate)
    })))
    setPreview(preview)
  }, 600, [images])

  return (<div className="grid-container">
    <Head>
      <script src="/js/pdf.js/pdf.min.js" />
    </Head>
    <div className="item1">
      upload pdf:{' '}<input type="file" accept="application/pdf" onChange={async e => {
        const pdf = e.target.files[0]
        if (!pdf) return
        let images = await pdf2images(pdf)
        setImages(images.map(img => ({ img, rotate: 0 })))
      }} />
    </div>
    <div className="item2">
      full preview:<br />
      {preview
        ? (<img src={preview} />)
        : 'no preview'}
    </div>
    <div className="item3">
      cur page:<br />
      {images[curPage]
        ? (<img src={images[curPage].img} style={{
          transform: `rotate(${images[curPage].rotate}deg)`
        }} />)
        : 'no selected'}
    </div>
    <div className="item4">
      pages:<br />
      {images.map(({ img, rotate }, i) => {
        return (<div key={i} style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden'
        }}>
          <img src={img} onClick={() => setCurPage(i)} style={{
            width: '100%',
            transform: `rotate(${rotate}deg)`
          }} />
          <input type="range" min={0} max={360} step={1} value={rotate} onChange={e => {
            let t = images.concat()
            t[i] = {
              img,
              rotate: e.target.value
            }
            setImages(t)
          }} />
        </div>)
      })}
    </div>

    <style jsx>{`
.item1 { grid-area: header; }
.item2 { grid-area: menu; }
.item3 { grid-area: main; }
.item4 { grid-area: right; }

.grid-container {
  display: grid;
  grid-template-areas:
    'header header header header header header'
    'menu main main main right right'
    'menu main main main right right';
  grid-gap: 10px;
  background-color: #2196F3;
  padding: 10px;
}

.grid-container > div {
  background-color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 20px 0;
  font-size: 30px;
  position: relative;
  overflow: hidden;
}`}</style>
  </div>)
}