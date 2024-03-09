import { Component, For, JSX } from 'solid-js';
import styles from './Result.module.css';
import vscode from 'vscode';
import { LinePosition, CustomTextSearchMatch, Range } from './types';

const openFile = (path: string, range?: Range) => {
  window.vscode.postMessage({ 
    command: 'openFile', 
    path, 
    range: range ? JSON.parse(JSON.stringify(range)) : null
  });
};

const formatPreview = (result: CustomTextSearchMatch, matchIndex: number) => {
  const match = ('length' in result.preview.matches) ? 
    result.preview.matches[matchIndex] : result.preview.matches;
  const range = ('length' in result.ranges) ? 
    result.ranges[matchIndex] : result.ranges;
  const start = match[0]; 
  const end = match[1];
  let cursor = { line: start.line, character: 0 } as LinePosition;
  const textLines = result.preview.text.split('\n');
  const lineNumbers = [];
  for (let line = range[0].line + 1; line <= range[1].line + 1; line++) 
    lineNumbers.push(<><span class={styles['line-number']}>{line}</span><br/></>);


  const lineSlice = (start: LinePosition, end: LinePosition) => {
    let output = '';

    if (start.line > end.line) throw Error('Start line cannot be greater than end line');
    if (start.line === end.line) 
      output = textLines[start.line].slice(start.character, end.character);
    else {
      output += textLines[start.line].slice(start.character) + '\n';
      for (let i = start.line + 1; i < end.line; i++) output += textLines[i] + '\n';
      output += textLines[end.line].slice(0, end.character) + '\n';
    }
    return output.replaceAll('\t', '  ');
  };
  
  const before = lineSlice(cursor, start);
  const matchContent = lineSlice(start, end);
  const after = lineSlice(end, { line: end.line, character: textLines[end.line].length });
  return (
    <>
      <div class={styles['preview-text']}>{lineNumbers}</div>
      <div class={styles['preview-text']}>{before}<mark>{matchContent}</mark>{after}</div>
    </>
  );

};

const formatFile = (filePath: string, workspace: vscode.WorkspaceFolder[] | null) => { 
  return (workspace !== null) ? filePath.replace(workspace[0].uri.path, '') : filePath;
};

const languageIcon = (filePath: string) => {
  if (!window['vs-seti-icon-theme']) return '';
  
  try {
    const extension = filePath.split('.').reverse()[0];
    const iconDefinition = window['vs-seti-icon-theme'].iconDefinitions[
      window['vs-seti-icon-theme'].fileExtensions[extension] || window['vs-seti-icon-theme'].languageIds[extension]
    ];
    // Convert icon from Hex to Decimal and use Unicode character for string
    const fontCharacterConverted = String.fromCodePoint(parseInt(iconDefinition.fontCharacter.replace('\\', ''), 16));
    const iconJsx = <span class="vscode-icon" style={{color: iconDefinition.fontColor}}>{fontCharacterConverted}</span>;
    return iconJsx;
  } catch (err) {
    console.log(err);
    return '';
  }
};


const ResultLine: Component<{result: CustomTextSearchMatch, matchIndex: number, workspace: vscode.WorkspaceFolder[] | null}> = (props) => {
  console.log('RESULT', props.result);
  let uri: vscode.Uri | null;
  if (props.result.outOfUris) uri = props.result.outOfUris[props.matchIndex];
  else uri = props.result.uri;

  if (!uri) return null;

  return (
    <div class={styles['result']}>
      <p class={styles['file']} onClick={() => uri && (props.result.outOfUris ? openFile(uri.path) : openFile(uri.path, props.result.ranges[props.matchIndex]))}>
        {languageIcon(uri.path)}{formatFile(uri.path, props.workspace)}
      </p>
      <div class={styles['preview']}>{formatPreview(props.result, props.matchIndex || 0)}</div>
    </div>
  );
};

const Result: Component<{result: CustomTextSearchMatch, workspace: vscode.WorkspaceFolder[] | null}> = (props) => {
  return (
    <For each={props.result.ranges}>
      {(range, index) => <ResultLine result={props.result} matchIndex={index()} workspace={props.workspace}/>}
    </For>
  );
};

export default Result;
