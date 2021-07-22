function setup() {
  createCanvas(750, 750);
  angleMode(RADIANS);
}

function draw() {
  background(220);
  // strokeWeight(1);
  const base = [200, 100];
  const baseRadius = 50;
  const star = [300, 300];
  const starRadius = 100;
  const enemyBase = [400, 500];
  const enemyBaseRadius = 50;
  let white = color(255, 255, 255);
  fill(white);
  circle(...base, baseRadius * 2);
  circle(...star, starRadius * 2);
  circle(...enemyBase, enemyBaseRadius * 2);

  // const distance = Math.sqrt(
  //   (base[0] - star[0]) * (base[0] - star[0]) +
  //     (base[1] - star[1]) * (base[1] - star[1])
  // );

  // const angle = Math.acos(Math.abs(starRadius - baseRadius) / distance);

  // const slope = (star[1] - base[1]) / (star[0] - base[0]);
  // const baseAngle = Math.atan(slope);

  // text(`${angle}`, 400, 50, 100, 50);
  // let c = color(255, 204, 0);
  // fill(c);
  // arc(
  //   ...star,
  //   starRadius * 2,
  //   starRadius * 2,
  //   PI + baseAngle,
  //   PI + baseAngle - angle
  // );
  // arc(
  //   ...base,
  //   baseRadius * 2,
  //   baseRadius * 2,
  //   PI + baseAngle,
  //   PI + baseAngle - angle
  // );

  // text(`${Math.cos(-angle)}`, 400, 100, 100, 100);
  // const pointC = [
  //   starRadius * Math.sin(-angle) + star[0],
  //   starRadius * Math.cos(-angle) + star[1],
  // ];
  // const pointF = [
  //   baseRadius * Math.sin(-angle) + base[0],
  //   baseRadius * Math.cos(-angle) + base[1],
  // ];

  const bitangents = calcExternalBitangents(base, baseRadius, star, starRadius);

  fill('black');
  line(...base, ...star);

  bitangents.forEach(([posA, posB]) => line(...posA, ...posB));

  const star_enemy = calcExternalBitangents(
    enemyBase,
    enemyBaseRadius,
    star,
    starRadius
  );

  star_enemy.forEach(([posA, posB]) => line(...posA, ...posB));
}

function calcExternalBitangents(aPos, aRadius, bPos, bRadius) {
  const distance = Math.sqrt(
    (aPos[0] - bPos[0]) * (aPos[0] - bPos[0]) +
      (aPos[1] - bPos[1]) * (aPos[1] - bPos[1])
  );
  const angle = Math.acos(Math.abs(bRadius - aRadius) / distance);

  const slope = -(aPos[0] - bPos[0]) / (aPos[1] - bPos[1]);
  const baseAngle = Math.atan(slope);

  const bPosA = [
    bRadius * Math.sin(-angle) + bPos[0],
    bRadius * Math.cos(-angle) + bPos[1],
  ];
  const bPosB = [
    bRadius * Math.sin(-baseAngle + Math.PI - angle) + bPos[0],
    bRadius * Math.cos(-baseAngle + Math.PI - angle) + bPos[1],
  ];
  const aPosA = [
    aRadius * Math.sin(-angle) + aPos[0],
    aRadius * Math.cos(-angle) + aPos[1],
  ];
  const aPosB = [
    aRadius * Math.sin(-baseAngle + Math.PI - angle) + aPos[0],
    aRadius * Math.cos(-baseAngle + Math.PI - angle) + aPos[1],
  ];

  return [
    [aPosA, bPosA],
    [aPosB, bPosB],
  ];
}

const MOVE = 20;
function getMovementAcrossCircle(pos, cPos, radius) {
  // calc the angle of movement
  const angle = 2 * Math.asin(MOVE / radius);
  // chord = radius * sin(angle/2)
  // chord/radius = sin(angle/2)
  // asin(chord/radius)=angle/2
  // angle = 2* asin(chord/radius)
}
