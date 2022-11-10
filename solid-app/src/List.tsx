import { Component, For } from 'solid-js';
import styles from './List.module.css';

const List: Component<{results: Result[]}> = (props) => {
  const openFile = (path: string) => {
    window.vscode.postMessage({ command: 'openFile', path });
  };

  return (
    <For each={props.results}>
      {(result) => 
        <div class={styles['result']} onClick={() => openFile(result.uri.path)}>
          {result.preview.text}
        </div>
      }
    </For>
  );
};

export default List;