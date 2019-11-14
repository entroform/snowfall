import Snowfall from './snowfall';

import './styles.scss';

const viewElement = document.getElementById('view');

const snowfall = new Snowfall({
  targetElement: viewElement,
});

snowfall.initialize();