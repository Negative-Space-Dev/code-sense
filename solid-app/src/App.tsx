import { Component } from 'solid-js';
import { createStore } from "solid-js/store";

import List from "./List";
import styles from './App.module.css';

const [state, setState] = createStore({
  results: [] as Result[]
});


window.addEventListener('message', event => {
  const message = event.data; // The JSON data our extension sent

  if (message.result) {
    console.log(message.result);
    setState((state) => ({ results: [...state.results, message.result] }));
  }
});

const App: Component = () => {
  let input: HTMLInputElement | undefined;
  const find = (e: KeyboardEvent | MouseEvent) => {
    if (e instanceof KeyboardEvent && e.key !== 'Enter') return;
    setState({ results: [] }); // clear results
    window.vscode.postMessage({ command: 'find', text: input && input.value });
  };
  
  return (
    <div class={styles.App}>
      <input type="text" ref={input} onKeyPress={find} />
      <button onClick={find}>Find</button>
      <List results={state.results}/>
    </div>
  );
};

export default App;