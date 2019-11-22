import {
  scrollTop,
  prependChild,
  hasDescendant,
  loadImageFromSource,
} from '@nekobird/doko';

import {
  random,
} from '@nekobird/piko';

import Ticker from '@nekobird/ticker';

import { Vector2 } from '@nekobird/vector2';

import Snow from './snow';

export const SNOWFALL_DEFAULT_CONFIG = {
  targetElement: null,
  resolutionMultiplier: 2,
  maximumNumberOfSnowParticles: 300,
  snowParticleImages: [],
  dragCoefficient: 0.0075,
  numberOfTicksBeforeSpawn: 8,
  insertCanvasElement: (canvasElement, targetElement) => {
    prependChild(
      targetElement,
      canvasElement,
    );
  },
  prepareCanvasElement: function(canvasElement) {
    canvasElement.style.width = '100vw';
    canvasElement.style.height = '100vh';
    canvasElement.style.maxWidth = '100%';
    canvasElement.style.maxHeight = '100%';
    canvasElement.style.margin = '0';
  },
};

export default class Snowfall {
  constructor(config) {
    this.config = {...SNOWFALL_DEFAULT_CONFIG};
    this.setConfig(config);

    this.ticker = new Ticker({
      loopForever: true,
      onTick: (...args) => this.tick.apply(this, args),
    });

    this.snows = [];
    this.snowParticleImages = [];
  }

  setConfig(config) {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }
  }

  initialize() {
    this.createCanvasElement();
    this.insertCanvasElement();

    if (this.config.snowParticleImages.length > 0) {
      Promise.all(
        this.config.snowParticleImages.map(image => {
          return loadImageFromSource(image)
            .then(data => {
              this.snowParticleImages.push(data.image);
              return Promise.resolve();
            });
        })
      ).then(() => this.ticker.start());

      this.listen();
    }
  }

  createCanvasElement() {
    this.canvasElement = document.createElement('canvas');
    this.context = this.canvasElement.getContext('2d');
  }

  insertCanvasElement() {
    if (
      this.config.targetElement
      && this.canvasElement
      && !hasDescendant(
        this.config.targetElement,
        this.canvasElement
      )
    ) {
      this.config.insertCanvasElement(this.canvasElement, this.config.targetElement);

      this.config.prepareCanvasElement(this.canvasElement);
      this.resizeCanvas();
    }
  }

  resizeCanvas() {
    const m = this.config.resolutionMultiplier;
    this.canvasElement.width  = this.canvasElement.offsetWidth  * m;
    this.canvasElement.height = this.canvasElement.offsetHeight * m;
  }

  spawn() {
    if (this.snows.length < this.config.maximumNumberOfSnowParticles) {
      const mass = 0.5 + Math.random();
      const snow = new Snow(
        {
          startingX: Math.random() * this.canvasElement.offsetWidth,
          startingY: -50,
          initialVelocityX: (Math.random() - 0.5) * 4,
          initialVelocityY: 0,
          initialAngleVelocity: (Math.random() - 0.5) * 0.2,
          initialAngle: Math.random() + 0.1,
          radius: random([40, 50], true),
          mass,
          seedX: Math.random() * 1000,
          seedY: Math.random() * 1000,
          imageType: random(this.snowParticleImages.length - 1),
          startingOpacity: Math.random(),
          startingLife: 1000,
        },
        this,
      );

      this.snows.push(snow);
    }
  }

  tick(data) {
    if (data[2] % this.config.numberOfTicksBeforeSpawn === 0) {
      this.spawn();
    }

    for (let i = 0; i < this.snows.length; i++) {
      this.snows[i].applyGravity(Vector2.down());
      this.snows[i].applyLateralEntropy(data[2] * 0.01);
      this.snows[i].applyFriction(1);
      this.snows[i].applyDragForce(this.config.dragCoefficient);
      this.snows[i].update();
    }

    this.draw(data[2]);
  }

  draw() {
    if (this.context) {
      const m = this.config.resolutionMultiplier;

      this.context.clearRect(
        0, 0,
        this.canvasElement.width, this.canvasElement.height,
      );

      for (let i = 0; i < this.snows.length; i++) {
        const snow = this.snows[i];
        
        const radius = snow.config.radius * m;

        const { x, y } = snow.position;

        this.context.save();

        this.context.translate(x * m, y * m);
        this.context.rotate(snow.angle);
        this.context.transform(1, 0, 0, 1, 0, 0);
        this.context.translate(-x * m, -y * m);

        this.context.beginPath();
        const size = radius * m;

        this.context.globalAlpha = snow.opacity;

        // this.context.globalAlpha = 1;
        this.context.drawImage(
          this.snowParticleImages[snow.config.imageType],
          x * m - (size / 2),
          y * m - (size / 2),
          size,
          size,
        );
        // this.context.arc(x, y, radius, 0, Math.PI * 2);
        // this.context.fillStyle = 'white';
        this.context.fill();

        this.context.restore();
      }
    }
  }

  resizeHandler() {
    const m = this.config.resolutionMultiplier;
    this.canvasElement.width  = this.canvasElement.offsetWidth  * m;
    this.canvasElement.height = this.canvasElement.offsetHeight * m;
  }

  scrollHandler() {
    scrollTop()
  }

  listen() {
    window.addEventListener('resize', this.resizeHandler.bind(this));
  }
}

window.Snowfall = Snowfall;