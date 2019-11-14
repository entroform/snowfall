import { Vector2, Num } from '@nekobird/rocket';
import SimplexNoise from 'simplex-noise';

export const SNOW_DEFAULT_CONFIG = {
  mass: 1,
  maximumSpeed: 10,
  startingX: 0,
  startingY: 0,
  initialVelocityX: 0,
  initialVelocityY: 0,
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
        .multiply(-friction);

      this.applyForce(force);
    }
  }

  applyLateralEntropy(t) {
    const { seedX, seedY } = this.config;
    const x = this.simplex.noise2D(seedX + t, seedY)
    const y = this.simplex.noise2D(seedX, seedY + t)
    const force = new Vector2(x * 0.5, y * 0.01);
    this.applyForce(force);
  }

  swirlAt(position) {
    const force = Vector2
      .getDirection(this.position, position).multiply(0.28);
    this.applyForce(force)
  }

  update() {
    this.life--;

    if (this.life <= 0) {
      this.die();
    }

    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.multiply(0);

    this.angleVelocity += this.angleAcceleration;
    this.angleVelocity = Num.clamp(this.angleVelocity, -0.1, 0.1);
    this.angle += this.angleVelocity;

    if (this.position.y > this.snowfall.canvasElement.height) {
      this.position.y = -10;
      this.velocity.multiply(0);
    }
  }

  die() {

  }
}