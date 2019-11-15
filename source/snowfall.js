import {
  DOMUtil,
  DOMTraverse,
  Viewport,
  Ticker,
  Vector2,
  DOMImage,
  Num,
} from '@nekobird/rocket';
import Snow from './snow';

export const SNOWFALL_DEFAULT_CONFIG = {
  targetElement: null,
  resolutionMultiplier: 2,
  maximumNumberOfSnowParticles: 1000,
  snowParticleImages: [],
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
      onTick: (...args) => this.tick.apply(this, args)
    });

    this.snows = [];
    this.pointerPosition = new Vector2();
    this.mouseIsDown = false;
    this.images = [];

    this.orientationVector = new Vector2(0, 1);
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
          return DOMImage.loadImageFromSource(image).then(data => {
            this.images.push(data.image);
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
      && !DOMTraverse.hasDescendant(
        this.config.targetElement,
        this.canvasElement
      )
    ) {
      DOMUtil.prependChild(
        this.config.targetElement,
        this.canvasElement,
      );

      this.config.prepareCanvasElement(this.canvasElement);
      this.resizeCanvas();
    }
  }

  resizeCanvas() {
    const { resolutionMultiplier } = this.config;
    this.canvasElement.width = Viewport.width * resolutionMultiplier;
    this.canvasElement.height = Viewport.height * resolutionMultiplier;
  }

  spawn() {
    if (this.snows.length < this.config.maximumNumberOfSnowParticles) {
      const mass = 0.5 + Math.random();
      const snow = new Snow(
        {
          startingX: Math.random() * this.canvasElement.width,
          startingY: -10,
          initialVelocityX: (Math.random() - 0.5) * 4,
          initialVelocityY: 0,
          initialAngleVelocity: (Math.random() - 0.5) * 0.2,
          initialAngle: Math.random() + 0.1,
          radius: mass * 5 + 2,
          mass,
          seedX: Math.random() * 1000,
          seedY: Math.random() * 1000,
          imageType: Num.random(this.images.length - 1),
          opacity: Math.random(),
        },
        this,
      );

      this.snows.push(snow);
    }
  }

  tick(n, c) {
    this.spawn();

    for (let i=0; i < this.snows.length; i++) {

      this.snows[i].applyGravity(this.orientationVector);

      this.snows[i].applyLateralEntropy(c * 0.01) 
      this.snows[i].applyFriction(1);

      this.snows[i].update();
    }

    this.draw(c);
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
        this.context.globalAlpha = snow.config.opacity;
        // this.context.globalAlpha = 1;
        this.context.drawImage(
          this.images[snow.config.imageType],
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
    this.canvasElement.width = Viewport.width * m;
    this.canvasElement.height = Viewport.height * m;
  }

  listen() {
    window.addEventListener('resize', this.resizeHandler.bind(this));
  }
}

window.Snowfall = Snowfall;