import { Component, For } from 'solid-js';
import Result from './Result';
import vscode from 'vscode';
import { 
  provideVSCodeDesignSystem, 
  vsCodeProgressRing
} from "@vscode/webview-ui-toolkit";
import { countResults } from './utils';
import { CustomTextSearchMatch } from './types';

provideVSCodeDesignSystem().register(
  vsCodeProgressRing(),
);

const List: Component<{results: CustomTextSearchMatch[], resultsLoading: number, workspace: vscode.WorkspaceFolder[] | null}> = (props) => {
  

  return (
    <div>
      <p style="display: flex; gap: 5px;">
        <span>Results: {countResults(props.results)}</span> 
        {props.resultsLoading ? 
          <>loading <vscode-progress-ring style="width: 15px; height: 15px; display: inline-flex;"></vscode-progress-ring></> : 
          'DONE' }
      </p>

      <For each={props.results}>
        {(result) => <Result result={result} workspace={props.workspace}/>}
      </For>
    </div>
  );
};

export default List;