import Snowfall from './snowfall';

import './styles.scss';

import image1 from './snow-0.png';
import image2 from './snow-0.png';
import image3 from './snow-0.png';

import ghost1 from './1.png';
import ghost2 from './2.png';

console.log(ghost1);
const viewElement = document.getElementById('view');

const snowfall = new Snowfall({
  targetElement: viewElement,
  maximumNumberOfSnowParticles: 600,
  startingLife: 400,
  snowParticleImages: [
    ghost1,
    ghost2,
    image3,
  ],
});

snowfall.initialize();