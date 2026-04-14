import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './firebase';
import App from './App.tsx';
import './index.css';

const mountNode =
  document.getElementById('app') ??
  document.getElementById('root') ??
  (() => {
    const node = document.createElement('div');
    node.id = 'app';
    document.body.appendChild(node);
    return node;
  })();

createRoot(mountNode).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
