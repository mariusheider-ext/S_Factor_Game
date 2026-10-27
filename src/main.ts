import './styles.css';
import { App } from './flow/app';

const root = document.getElementById('app');
if (root) new App(root).boot();
