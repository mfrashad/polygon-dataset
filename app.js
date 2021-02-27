const p5 = require('node-p5');
const fs = require('fs');

const WIDTH = 256
const HEIGHT = 256
const CENTER = WIDTH/2
const OUTER_RADIUS = WIDTH/2
const INNER_RADIUS = OUTER_RADIUS/2
const OUTPUT_DIR = 'polygon'



const ANOMALY_COLORS = ['blue', 'green', 'lime']
const NORMAL_COLORS = ['red', 'yellow', 'pink', 'grey', 'purple', 'magenta', 'aqua']
const NORMAL_TEXTURES = [
  'textures/woven.png',
  'textures/diagonal-striped-brick.png',
  'textures/basketball.png',
  'textures/vaio.png',
  'textures/3px-tile.png'
]
const ANOMALY_TEXTURES = ['textures/wood-pattern.png']

let anomaly_shapes = ['circle', 'star10', 'poly3']
let normal_shapes = ['square', 'poly4', 'star4', 'poly6', 'star6', 'poly8', 'star8']

// for (i=4; i<=6; i++){
//   normal_shapes.push(`poly${i}`)
//   normal_shapes.push(`star${i}`)
// }


let resourcesToPreload = {}

for(x of NORMAL_TEXTURES){
  resourcesToPreload[x] = p5.loadImage(x)
}

for(x of ANOMALY_TEXTURES){
  resourcesToPreload[x] = p5.loadImage(x)
}

function apply_texture(p, texture_image){
  p.loadPixels()
  let alpha_mask = []
  for (i=0; i < p.pixels.length; i+= 4){
    r = p.pixels[i]
    g = p.pixels[i+1]
    b = p.pixels[i+2]
    a = p.pixels[i+3]

    if (r == 255 && g == 255 & b == 255){
      alpha_mask.push(0)
    } else {
      alpha_mask.push(1)
    }
  }
  p.image(texture_image, 0, 0, WIDTH, HEIGHT)
  p.loadPixels()
  for (i=0; i < alpha_mask.length; i++){
    p.pixels[i*4+3] *= alpha_mask[i]
  }
  p.updatePixels()
}

function generate_combinations(p, canvas, shapes1, shapes2, colors1, colors2, textures, texture_names, anomaly="", prefix='') {
  console.log(shapes1.length)
  console.log(colors1.length)
  n_combination = shapes1.length * shapes2.length * colors1.length * (colors2.length) * textures.length
  console.log(`Combinations: ${shapes1.length} * ${shapes2.length} * ${colors1.length} * ${colors2.length} * ${textures.length} = ${n_combination}`)
  for (outer_shape of shapes1) {
    for (inner_shape of shapes2){
      for(outer_color of colors1) {
        for (inner_color of colors2) {
          if(inner_color == outer_color){
            continue
          }
          for ([i, img_texture] of textures.entries()) {
            texture_name = texture_names[i]
            generate(p, outer_shape, inner_shape, OUTER_RADIUS, INNER_RADIUS, outer_color, inner_color, img_texture)
            const filename = `${prefix}outer_${outer_color}_${outer_shape}_inner_${inner_color}_${inner_shape}_texture_${texture_name}`
            p.saveCanvas(canvas, `${OUTPUT_DIR}/images/${filename}`, 'png')
              //.then(() =>console.log(`Saved ${filename}`))
              .catch(console.error)
            
            generate_mask(p, canvas, inner_shape, true, `${OUTPUT_DIR}/masks/inner`, filename)
            generate_mask(p, canvas, outer_shape, false, `${OUTPUT_DIR}/masks/outer`, filename)
            if (anomaly != ""){
              anomaly_shape = anomaly == 'inner' ? inner_shape : outer_shape
              generate_mask(p, canvas, anomaly_shape,  anomaly == 'inner', `${OUTPUT_DIR}/anomaly_masks`, filename)
            }
            

          }
        }
      }
    }
  }
}

function generate(p, outer_shape, inner_shape, outer_size, inner_size, outer_color, inner_color, img_texture) {
  p.background(255)
  p.fill(p.color(outer_color))
  draw_shape(p, outer_shape, outer_size)
  p.fill(p.color(inner_color))
  draw_shape(p, inner_shape, inner_size)
  apply_texture(p, img_texture)
}

function generate_mask(p, canvas, shape, inner, dir, filename){
  p.background('black')
  p.fill(p.color('white'))
  let radius
  radius = inner ? INNER_RADIUS : OUTER_RADIUS
  draw_shape(p, shape, radius)
  p.saveCanvas(canvas, `${dir}/${filename}`, 'png')
              //.then(() =>console.log(`Saved ${filename}`))
              .catch(console.error)
}

function draw_shape(p, shape, radius, x=CENTER, y=CENTER) {
  let n = 3
  if (shape == 'circle') {
    p.circle(x, y, radius)
  }
  else if (shape == 'square'){
    p.square(x - (radius/2), y - (radius/2), radius)
  }
  else if (shape.startsWith('poly')){
    n = shape.split('poly').pop()
    polygon(p, x, y, radius, n)
  }
  else if (shape.startsWith('star')){
    n = shape.split('star').pop()
    star(p, x, y, radius, radius/2, n)
  }
}

function polygon(p, x, y, radius, npoints) {
  let angle = p.TWO_PI / npoints;
  p.beginShape();
  for (let a = 0; a < p.TWO_PI; a += angle) {
    let sx = x + p.cos(a) * radius;
    let sy = y + p.sin(a) * radius;
    p.vertex(sx, sy);
  }
  p.endShape(p.CLOSE);
}

function star(p, x, y, radius1, radius2, npoints) {
  let angle = p.TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  p.beginShape();
  for (let a = 0; a < p.TWO_PI; a += angle) {
    let sx = x + p.cos(a) * radius2;
    let sy = y + p.sin(a) * radius2;
    p.vertex(sx, sy);
    sx = x + p.cos(a + halfAngle) * radius1;
    sy = y + p.sin(a + halfAngle) * radius1;
    p.vertex(sx, sy);
  }
  p.endShape(p.CLOSE);
}


function sketch(p, preloaded) {
  let normal_textures = []
  let anomaly_textures = []
  let normal_texture_names = []
  let anomaly_texture_names = []

  for(x of NORMAL_TEXTURES){
    normal_textures.push(preloaded[x])
    // Get filename without extension, replace - with _
    normal_texture_names.push(x.split("/")[1].split('.')[0].replace(/-/g, ""))
  }
  for(x of ANOMALY_TEXTURES){
    anomaly_textures.push(preloaded[x])
    anomaly_texture_names.push(x.split("/")[1].split('.')[0].replace(/-/g, ""))
  }

  console.log(anomaly_texture_names)
  console.log(normal_texture_names)

  p.setup = () => {

    let canvas = p.createCanvas(WIDTH, HEIGHT);

    fs.mkdirSync(`${OUTPUT_DIR}/images`, { recursive: true })
    fs.mkdirSync(`${OUTPUT_DIR}/masks/inner`, { recursive: true })
    fs.mkdirSync(`${OUTPUT_DIR}/masks/outer`, { recursive: true })
    fs.mkdirSync(`${OUTPUT_DIR}/anomaly_masks`, { recursive: true })
    // Create normal images


    

    for (anomaly of anomaly_shapes) {
      console.log(`Generating anomalies: ${anomaly}`)
      generate_combinations(p, canvas, normal_shapes, [anomaly], ['red', 'yellow', 'pink'], NORMAL_COLORS, normal_textures, normal_texture_names, anomaly='inner', prefix='anomaly_')
    }
    for (anomaly of ANOMALY_COLORS) {
      console.log(`Generating anomalies: ${anomaly}`)
      generate_combinations(p, canvas, normal_shapes, normal_shapes, ['red', 'yellow', 'pink'], [anomaly], normal_textures, normal_texture_names, anomaly='inner', prefix='anomaly_')
    }
    for (anomaly of anomaly_textures) {
      console.log('Generating anomalies: textures')
      generate_combinations(p, canvas, normal_shapes, normal_shapes, ['red', 'yellow', 'pink'], NORMAL_COLORS, [anomaly], anomaly_texture_names, anomaly='outer', prefix='anomaly_')
    }

    generate_combinations(p, canvas, normal_shapes, normal_shapes, NORMAL_COLORS, NORMAL_COLORS, normal_textures, normal_texture_names, prefix='normal_')

    //Create outlier images
    // for (i=0; i<anomaly_shapes.length; i++){
    //   generate_combinations(p, canvas, normal_shapes[i], anomaly_shapes[i], NORMAL_COLORS, NORMAL_COLORS, NORMAL_TEXTURES)
    // }

    p.noLoop();
  }
}

let p5Instance = p5.createSketch(sketch, resourcesToPreload);
