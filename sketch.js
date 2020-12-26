const WIDTH = 256
const HEIGHT = 256
const CENTER = WIDTH/2
const OUTER_RADIUS = WIDTH - 20
const INNER_RADIUS = OUTER_RADIUS/2
const OUTPUT_DIR = 'result'

console.log(CENTER)

const ANOMALY_COLORS = ['blue']
const NORMAL_COLORS = ['red', 'yellow', 'brown', 'green', 'pink', 'grey', 'orange', 'purple', 'black']
const NORMAL_TEXTURES = [
  'textures/arabesque.png',
  'textures/argyle.png',
  'textures/basketball.png',
  'textures/black-scales.png',
  'textures/black-thread.png',
  'textures/dark-mosaic.png',
  'textures/dark-wood.png',
  'textures/diagmonds.png',
]

const ANOMALY_TEXTURES = ['textures/football-no-lines.png']


let anomaly_shapes = ['circle']
let normal_shapes = []

for (i=3; i<=8; i++){
  normal_shapes.push(`poly${i}`)
  normal_shapes.push(`star${i}`)
}

let anomaly_colors = []
let normal_colors = []

let normal_textures = []
let anomaly_textures = []

let current_canvas

function setup() {
  for (x of ANOMALY_COLORS){
    anomaly_colors.push(color(x))
  }
  for (x of NORMAL_COLORS){
    normal_colors.push(color(x))
  }

  current_canvas = createCanvas(WIDTH, HEIGHT);
  stroke(255)
  //generate_data(normal_shapes, normal_shapes, normal_colors, normal_colors, normal_textures)
  
  noLoop()
}

function preload(){
  
  for(x of NORMAL_TEXTURES){
    img = loadImage(x)
    normal_textures.push(img)
  }

  for(x of ANOMALY_TEXTURES){
    img = loadImage(x)
    anomaly_textures.push(img)
  }
}

function draw() {
  background(255);
  generate_combinations(normal_shapes, normal_shapes, normal_colors, normal_colors, normal_textures)
  //generate('poly5', 'star8', 80, 50, normal_colors[1], normal_colors[0], normal_textures[5])
  // saveCanvas(`${OUTPUT_DIR}/test`, 'png')
  // fill(normal_colors[1])
  // ellipse(CENTER, CENTER, 100, 100);
  // fill(normal_colors[3])
  // polygon(CENTER, CENTER, 40, 3)
  // fill(normal_colors[4])
  // star(CENTER, CENTER, 30, 10, 20)
  
  
}

function apply_texture(texture_image){
  loadPixels()
  let alpha_mask = []
  for (i=0; i < pixels.length; i+= 4){
    r = pixels[i]
    g = pixels[i+1]
    b = pixels[i+2]
    a = pixels[i+3]

    if (r == 255 && g == 255 & b == 255){
      alpha_mask.push(0)
    } else {
      alpha_mask.push(1)
    }
  }
  image(texture_image, 0, 0, WIDTH, HEIGHT)
  loadPixels()
  for (i=0; i < alpha_mask.length; i++){
    pixels[i*4+3] *= alpha_mask[i]
  }
  updatePixels()
}

function generate_combinations(shapes1, shapes2, colors1, colors2, textures) {
  console.log(shapes1.length)
  console.log(colors1.length)
  n_combination = shapes1.length * shapes2.length * colors1.length * colors2.length * textures.length
  console.log(n_combination)
  for (outer_shape of shapes1) {
    for (inner_shape of shapes2){
      for([i, outer_color] of colors1.entries()) {
        for ([j, inner_color] of colors2.entries()) {
          for ([l, img_texture] of textures.entries()) {
            generate(outer_shape, inner_shape, OUTER_RADIUS, INNER_RADIUS, outer_color, inner_color, img_texture)
            saveCanvas(`${NORMAL_COLORS[i]}_${outer_shape}_${NORMAL_COLORS[j]}_${inner_shape}_texture${l}`, 'png')
          }
        }
      }
    }
  }
}

function generate(outer_shape, inner_shape, outer_size, inner_size, outer_color, inner_color, img_texture) {
  background(255)
  fill(outer_color)
  draw_shape(outer_shape, outer_size)
  fill(inner_color)
  draw_shape(inner_shape, inner_size)
  apply_texture(img_texture)
}

function draw_shape(shape, radius, x=CENTER, y=CENTER) {
  let n = 3
  if (shape == 'circle') {
    circle(x, y, radius)
  }
  else if (shape.startsWith('poly')){
    n = shape.split('poly').pop()
    polygon(x, y, radius, n)
  }
  else if (shape.startsWith('star')){
    n = shape.split('star').pop()
    star(x, y, radius, radius/2, n)
  }
}

function polygon(x, y, radius, npoints) {
  let angle = p.TWO_PI / npoints;
  beginShape();
  for (let a = 0; a < p.TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function star(x, y, radius1, radius2, npoints) {
  let angle = p.TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < p.TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}