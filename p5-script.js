function setup() {
  createCanvas(750, 750);
  angleMode(RADIANS);
}

function draw() {
  background(220);
  // strokeWeight(1);
  const base = [200, 100]
  const baseRadius = 50
  const star = [300, 300]
  const starRadius = 100
  let white = color(255, 255,255);
  fill(white);
  circle(...base, baseRadius*2)
  circle(...star, starRadius*2)
  
  
  const distance = Math.sqrt((base[0]-star[0])*(base[0]-star[0])+(base[1]-star[1])*(base[1]-star[1]))
  
  const angle = Math.acos(Math.abs(starRadius-baseRadius)/distance)
  
  const slope = (star[1]-base[1])/(star[0]-base[0])
  const baseAngle = Math.atan(slope) 
  
  text(`${angle}`, 400, 50, 100, 50)
  let c = color(255, 204, 0);
  fill(c);
  arc(...star, starRadius*2, starRadius*2, PI+baseAngle, PI+baseAngle-angle)
  arc(...base, baseRadius*2, baseRadius*2, PI+baseAngle, PI+baseAngle-angle)
  
  text(`${Math.cos(-angle)}`, 400,100,100,100)
  const pointC = [starRadius*Math.sin(-angle)+star[0], starRadius*Math.cos(-angle)+star[1]]
  const pointF = [baseRadius*Math.sin(-angle)+base[0], baseRadius*Math.cos(-angle)+base[1]]
  
  
  fill('black')
  line(...base,...star)
  fill('red')
  line(...pointC, ...pointF)
  
}