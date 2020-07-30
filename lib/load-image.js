export default async function load(src){
  return new Promise(resolve=>{
    let img = new Image
    img.onload = function(){
      resolve(img)
    }
    img.src = src
  })
}