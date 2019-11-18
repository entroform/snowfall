import {
  Num,
  Vector2,
} from '@nekobird/rocket';
import SimplexNoise from 'simplex-noise';

export const SNOW_DEFAULT_CONFIG = {
  initialAngle: 0.1,
  initialAngleVelocity: 0.05,
  initialVelocityX: 0,
  initialVelocityY: 0,
  mass: 1,
  maximumSpeed: 100,
  radius: 10,
  seedX: 0,
  seedY: 0,
  startingX: 0,
  startingY: 0,
  imageType: 0,
  startingOpacity: 1,
  startingLife: 2000,
};

export default class Snow {
  constructor(config, snowfall) {
    this.config = {...SNOW_DEFAULT_CONFIG};

    this.setConfig(config);

    this.position = new Vector2(
      this.config.startingX,
      this.config.startingY,
    );
    this.velocity = new Vector2(
      this.config.initialVelocityX,
      this.config.initialVelocityY,
    );
    this.acceleration = new Vector2();

    this.angleAcceleration = 0;
    this.angleVelocity = this.config.initialAngleVelocity;
    this.angle = this.config.initialAngle;

    this.opacity = this.config.startingOpacity;
    this.life = this.config.startingLife;

    this.simplex = new SimplexNoise();

    this.snowfall = snowfall;
  }

  setConfig(config) {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }
  }

  applyForce(force) {
    force.divide(this.config.mass);
    this.acceleration.add(force);
  }

  applyFriction(frictionCoefficient) {
    const friction = this.config.frictionCoefficient || frictionCoefficient;

    if (friction !== 0) {
      const force = this.velocity
        .clone()
        .multiply(-1)
        .normalize()
        .multiply(friction)
        .multiply(this.config.mass);
      this.applyForce(force);
    }
  }

  applyGravity(gravity) {
    this.applyForce(gravity.multiply(this.config.mass));
  }

  applyLateralEntropy(t) {
    const { seedX, seedY } = this.config;
    const x = this.simplex.noise2D(seedX + t, seedY)
    const y = this.simplex.noise2D(seedX, seedY + t)
    const force = new Vector2(x * 0.2, y * 0.01);
    this.applyForce(force);
  }

  applyDragForce(dragCoefficient) {
    const speed = this.velocity.magnitude;
    const dragMagnitude = dragCoefficient * speed * speed;
    const drag = Vector2.clone(this.velocity);
    drag.multiply(-1);
    drag.normalize();
    drag.multiply(dragMagnitude);
    this.applyForce(drag);
  }

  attract(position) {
    const directionForce = Vector2.subtract(
      this.position,
      position
    );
    const distance = directionForce.magnitude;

    if (distance < 10000) {
      const G = 2;
      const mass = 1000;
      const strength = (G * mass * this.config.mass) / (distance * distance);
      // const strength = 1;
      directionForce.normalize();
      directionForce.multiply(-strength);
      directionForce.multiply(3);
      this.applyForce(
        new Vector2(Math.cos(distance), Math.sin(distance))
      );
    }
  }

  repulse(position) {
    const directionForce = Vector2.subtract(this.position, position);
    const distance = directionForce.magnitude;

    directionForce.normalize();
    directionForce.multiply(10000);

    this.applyForce(directionForce);
  }

  update() {
    this.life--;

    this.velocity.add(this.acceleration).limit(10);
    this.position.add(this.velocity);
    this.acceleration.multiply(0);

    this.angleVelocity += this.angleAcceleration;
    this.angleVelocity = Num.clamp(this.angleVelocity, -0.01, 0.01);
    this.angle += this.angleVelocity;

    this.opacity = Num.transform(
      this.life,
      [this.config.startingLife, 0],
      [this.config.startingOpacity, 0],
    );

    // Reset Snow after it reach a certain point.
    if (
      this.position.y > this.snowfall.canvasElement.height
      || this.life <= 0
    ) {
      this.position.x = Math.random() * this.snowfall.canvasElement.offsetWidth;
      this.position.y = -50;
      this.life = this.config.startingLife;
      this.opacity = this.config.startingOpacity;
      this.velocity.multiply(0);
    }
  }
}