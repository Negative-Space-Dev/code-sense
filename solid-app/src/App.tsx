import { Component, createEffect, Show, on, type JSX } from 'solid-js';
import { createStore } from "solid-js/store";
import vscode from 'vscode';
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextField,
  vsCodePanels,
  vsCodePanelTab,
  vsCodePanelView,
} from "@vscode/webview-ui-toolkit";
import { minimatch } from 'minimatch';

import List from "./List";
import styles from './App.module.css';
import importPatterns from './importPatterns';
import { countResults } from './utils';
import { CustomTextSearchMatch, FileDefinition } from './types';

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTextField(),
  vsCodePanels(),
  vsCodePanelTab(),
  vsCodePanelView(),
);

const [state, setState] = createStore({
  intoResults: [] as CustomTextSearchMatch[],
  intoResultsLoading: 0,
  outofResults: [] as CustomTextSearchMatch[],
  outofResultsLoading: 0,
  workspace: null as vscode.WorkspaceFolder[] | null,
  activeEditor: null as vscode.TextEditor | null,
});

const clearIntoResults = () => setState({ intoResults: [], intoResultsLoading: 0 });
const clearOutofResults = () => setState({ outofResults: [], outofResultsLoading: 0 });

window.addEventListener('message', event => {
  const message = event.data; // The JSON data our extension sent

  if (message.result) {
    // console.log('result', message.for, message.result, message.activeEditor);
    // Square bracket notation is used to access the correct results properties from state
    if ('done' in message) return setState(state =>
      ({ [`${message.for}ResultsLoading`]: state[`${message.for as 'into' | 'outof'}ResultsLoading`] - 1 }));


    if (state.activeEditor?.document.fileName.includes(message.activeEditor))
      setState(state => ({
        [`${message.for}Results`]: [...state[`${message.for as 'into' | 'outof'}Results`], message.result].sort((a, b) => {
          if (a.ranges[0][0].line < b.ranges[0][0].line) return -1;
          if (a.ranges[0][0].line > b.ranges[0][0].line) return 1;
          return 0;
        })
      }));
  }
  else if (message.workspace) {
    setState(state => ({ workspace: message.workspace }));
    console.log(state.workspace);
  }
  else if (message.activeEditor) {
    setState(state => ({ activeEditor: message.activeEditor }));
    console.log(state.activeEditor);
  }
});

window.vscode.postMessage({ command: 'getWorkspace' });
window.vscode.postMessage({ command: 'getActiveEditor' });

const $jsonScript = document.querySelector('script#vs-seti-icon-theme') as HTMLScriptElement | null;
if (!$jsonScript) throw new Error('vs-seti-icon-theme script not found');
fetch($jsonScript.src)
  .then(res => res.json())
  .then(data => {
    console.log('vscode seti date', data);
    window['vs-seti-icon-theme'] = data;
  });


const fileDefinitionMatch = (filepath: string, fileDefinition: FileDefinition) => !!filepath.match(new RegExp(`.*\/${fileDefinition.folder}\/.*\.${fileDefinition.extension || '.*'}`));

const getCurrentFilePath = () => {
  if (!state.activeEditor || !state.workspace) return null;
  const workspacePath = state.workspace[0].uri.path;
  const editorPath = state.activeEditor.document.uri.path;
  return editorPath.replace(workspacePath, '');
};

const matchedIntoImportPatterns = () => {
  const currentFilePath = getCurrentFilePath();
  if (!currentFilePath) return [];
  return importPatterns.filter(pattern => fileDefinitionMatch(currentFilePath, pattern.fileDefinition));
};

const matchedOutofImportPatterns = () => {
  const currentFilePath = getCurrentFilePath();
  if (!currentFilePath) return [];
  return importPatterns.filter(pattern => fileDefinitionMatch(currentFilePath, pattern.fileDefinition));
};

// Send find commands for current active file import patterns
createEffect(on(() => state.activeEditor, () => {
  clearIntoResults();
  clearOutofResults();

  const currentFilePath = getCurrentFilePath();
  if (!currentFilePath) return;
  const fullFilename = currentFilePath.includes('/') ? currentFilePath.split('/').pop() : currentFilePath;
  if (!fullFilename) return;
  const filename = fullFilename.includes('.') ? fullFilename.split('.').splice(0, fullFilename.split('.').length - 1).join('.') : fullFilename;
  if (!filename) return;

  for (const importPattern of matchedIntoImportPatterns()) {
    for (const condition of importPattern.conditions) {
      setState(state => ({ intoResultsLoading: state.intoResultsLoading + 1 }));
      window.vscode.postMessage({
        command: 'find',
        for: 'into',
        activeEditor: currentFilePath,
        textSearchQuery: {
          pattern: condition.regex('customFilenameFunc' in condition ?
            condition.customFilenameFunc(currentFilePath, fullFilename, filename) :
            filename
          ),
          isRegExp: true
        },
        textSearchOptions: {
          ...('include' in condition && { include: condition.include }),
        }
      });
    }
  }


  for (const importPattern of importPatterns) {
    for (const condition of importPattern.conditions) {
      if (!minimatch(currentFilePath.slice(1), condition.include)) continue;
      setState(state => ({ outofResultsLoading: state.outofResultsLoading + 1 }));
      window.vscode.postMessage({
        command: 'find',
        for: 'outof',
        activeEditor: currentFilePath,
        fileDefinition: importPattern.fileDefinition,
        textSearchQuery: {
          pattern: condition.regex('(?<filename>[A-Za-z0-9-_,\\s]+)'),
          isRegExp: true
        },
        textSearchOptions: {
          include: currentFilePath.slice(1),
        }
      });
    }
  }
}));

let panel: JSX.IntrinsicElements["vscode-panels"] | undefined;

createEffect(() => {
  // console.log("HIT");
  if (state.intoResultsLoading || state.outofResultsLoading) return;
  // console.log('panel', panel);
  if (!panel) return;
  // console.log('panel.activeTabIndex', panel.activeTabIndex);
  if (panel.activeTabIndex === 0 && state.intoResults.length === 0 && state.outofResults.length > 0)
    panel.querySelector('vscode-panel-tab#tab-2').click();
  else if (panel.activeTabIndex === 1 && state.outofResults.length === 0 && state.intoResults.length > 0)
    panel.querySelector('vscode-panel-tab#tab-1').click();
});


const App: Component = () => {
  return (
    <div class={styles.App}>
      {/* <div>intoResultsLoading {state.intoResultsLoading}</div>
      <div>outofResultsLoading {state.outofResultsLoading}</div> */}
      <vscode-panels ref={panel}>
        <vscode-panel-tab id="tab-1">ACTIVE FILE USED IN {`(${countResults(state.intoResults)})`}</vscode-panel-tab>
        <vscode-panel-tab id="tab-2">
          ACTIVE FILE USES {`(${countResults(state.outofResults)})`}
        </vscode-panel-tab>

        <vscode-panel-view id="view-1">
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
            <div>{getCurrentFilePath()}</div>

            <Show when={matchedIntoImportPatterns().length === 0}>
              <div>
                No import patterns found for current file
              </div>
            </Show>

            <List results={state.intoResults} resultsLoading={state.intoResultsLoading} workspace={state.workspace} />
          </div>
        </vscode-panel-view>

        <vscode-panel-view id="view-2">
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
            <div>{getCurrentFilePath()}</div>

            <Show when={matchedOutofImportPatterns().length === 0}>
              <div>
                No import patterns found for current file
              </div>
            </Show>

            <List results={state.outofResults} resultsLoading={state.outofResultsLoading} workspace={state.workspace} />
          </div>
        </vscode-panel-view>

      </vscode-panels>
    </div>
  );
};

export default App;