import {
  Num,
  Vector2,
} from '@nekobird/rocket';
import SimplexNoise from 'simplex-noise';

export const SNOW_DEFAULT_CONFIG = {
  mass: 1,
  maximumSpeed: 10,
  startingX: 0,
  startingY: 0,
  initialVelocityX: 0,
  initialVelocityY: 0,
  initialAngleVelocity: 0.05,
  initialAngle: 0.1,
  seedX: 0,
  seedY: 0,
  radius: 10,
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
        .normalize()
        .multiply(-friction)
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
    const force = new Vector2(x * 0.5, y * 0.01);
    this.applyForce(force);
  }

  attract(position) {
    const directionForce = Vector2.subtract(this.position, position);
    const distance = directionForce.magnitude;

    if (distance < 400 && distance > 30) {      
      const G = 2;
      const mass = 1000;
      const strength = (G * mass * this.config.mass) / (distance * distance);
      // const strength = 1;

      directionForce.normalize();
      directionForce.multiply(-strength);
      directionForce.multiply(3);
      this.applyForce(directionForce);
    }
  }

  repulse(position) {
    const directionForce = Vector2.subtract(this.position, position);
    const distance = directionForce.magnitude;

    if (distance < 500) {      
      const G = 3;
      const mass = 1000;
      const strength = (G * mass * this.config.mass) / (distance * distance);
      // const strength = 1;

      directionForce.normalize();
      directionForce.multiply(strength);

      directionForce.multiply(10000);

      this.applyForce(directionForce);
    }
  }

  update() {
    this.life--;

    if (this.life <= 0) {
      this.die();
    }

    this.velocity.add(this.acceleration).limit(10);
    this.position.add(this.velocity);
    this.acceleration.multiply(0);

    this.angleVelocity += this.angleAcceleration;
    this.angleVelocity = Num.clamp(this.angleVelocity, -0.1, 0.1);
    this.angle += this.angleVelocity;

    if (this.position.y > this.snowfall.canvasElement.height) {
      this.position.x = Math.random() * this.snowfall.canvasElement.width;
      this.position.y = -10;
      this.velocity.multiply(0);
    }
  }
}