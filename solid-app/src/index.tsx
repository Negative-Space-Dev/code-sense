/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';

declare global {
  interface Window { 
    acquireVsCodeApi: Function;
    vscode: { postMessage: Function };
  }
}

render(() => <App />, document.getElementById('root') as HTMLElement);
