import Snowfall from './snowfall';

import './styles.scss';

import image1 from './snow-0.png';
import image2 from './snow-0.png';
import image3 from './snow-0.png';

const viewElement = document.getElementById('view');

const snowfall = new Snowfall({
  targetElement: viewElement,
  maximumNumberOfSnowParticles: 1000,
  snowParticleImages: [
    image1, image2, image3,
  ],
});

snowfall.initialize();