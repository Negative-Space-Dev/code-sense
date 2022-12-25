/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';
import { VscodeSetiIconData } from './types';

declare global {
  interface Window { 
    acquireVsCodeApi: Function;
    vscode: { postMessage: Function };
    ['vs-seti-icon-theme']: VscodeSetiIconData;
  }
}

render(() => <App />, document.getElementById('root') as HTMLElement);
