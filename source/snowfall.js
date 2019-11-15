import {
  DOMUtil,
  DOMTraverse,
  Viewport,
  Ticker,
  Vector2,
  Num,
} from '@nekobird/rocket';
import Snow from './snow';

export const SNOWFALL_DEFAULT_CONFIG = {
  targetElement: null,
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
      this.canvasElement.width = Viewport.width;
      this.canvasElement.height = Viewport.height;
    }
  }

  spawn() {
    if (this.snows.length < 1000) {
      const mass = 0.5 + Math.random();
      const snow = new Snow(
        {
          startingX: Math.random() * Viewport.width,
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
      this.snows[i].swirlAt(this.pointerPosition);
      this.snows[i].update();
    }

    this.draw(c);
  }

  draw() {
    if (this.context) {
      this.context.clearRect(
        0, 0,
        this.canvasElement.width, this.canvasElement.height,
      );

      for (let i = 0; i < this.snows.length; i++) {
        const snow = this.snows[i];
        
        const radius = snow.config.radius;

        this.context.beginPath();
        const { x, y } = snow.position;
        this.context.arc(x, y, radius, 0, Math.PI * 2);
        this.context.fillStyle = 'white';
        this.context.fill();
      }
    }
  }

  listen() {
    window.addEventListener('mousemove', event => {
      this.pointerPosition.x = event.pageX;
      this.pointerPosition.y = event.pageY;
    });
  }
}