import {
  DOMUtil,
  DOMTraverse,
  Viewport,
  Ticker,
  Vector2,
  debounce,
} from '@nekobird/rocket';
import Snow from './snow';

export const SNOWFALL_DEFAULT_CONFIG = {
  targetElement: null,
  resolutionMultiplier: 2,
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
  }

  setConfig(config) {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }
  }

  initialize() {
    this.createCanvasElement();
    this.insertCanvasElement();
    this.ticker.start();
    this.listen();
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

      this.canvasElement.style.width = '100vw';
      this.canvasElement.style.height = '100vh';
      this.canvasElement.style.maxWidth = '100%';
      this.canvasElement.style.maxHeight = '100%';
      this.canvasElement.style.margin = '0';

      this.resizeCanvas();
    }
  }

  resizeCanvas() {
    const { resolutionMultiplier } = this.config;
    this.canvasElement.width = Viewport.width * resolutionMultiplier;
    this.canvasElement.height = Viewport.height * resolutionMultiplier;
  }

  spawn() {
    if (this.snows.length < 1000) {
      const mass = 0.5 + Math.random();
      const snow = new Snow(
        {
          startingX: Math.random() * this.canvasElement.width,
          startingY: -10,
          initialVelocityX: (Math.random() - 0.5) * 4,
          initialVelocityY: 0,
          radius: mass * 2,
          mass,
          seedX: Math.random() * 1000,
          seedY: Math.random() * 1000,
        },
        this,
      );

      this.snows.push(snow);
    }
  }

  tick(n, c) {
    this.spawn();

    for (let i=0; i < this.snows.length; i++) {
      this.snows[i].applyGravity(new Vector2(0, 1));
      this.snows[i].applyLateralEntropy(c * 0.01) 
      this.snows[i].applyFriction(1);

      if (this.mouseIsDown) {
        this.snows[i].attract(this.pointerPosition);
      }
      if (this.explode) {
        this.snows[i].repulse(this.pointerPosition);
      }

      this.snows[i].update();
    }
    this.explode = false;

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

        this.context.beginPath();
        const { x, y } = snow.position;
        this.context.arc(x, y, radius, 0, Math.PI * 2);
        this.context.fillStyle = 'white';
        this.context.fill();
      }
    }
  }

  resizeHandler() {
    const m = this.config.resolutionMultiplier;
    this.canvasElement.width = Viewport.width * m;
    this.canvasElement.height = Viewport.height * m;
  }

  listen() {
    window.addEventListener('mousemove', event => {
      const m = this.config.resolutionMultiplier;
      this.pointerPosition.x = event.pageX * m;
      this.pointerPosition.y = event.pageY * m;
    });

    window.addEventListener('mousedown', () => this.mouseIsDown = true);

    window.addEventListener('mouseup', () => {
      this.mouseIsDown = false;
      this.explode = true;
    });

    window.addEventListener('resize', this.resizeHandler.bind(this));
  }
}