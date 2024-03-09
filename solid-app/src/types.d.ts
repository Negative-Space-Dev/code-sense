import * as vscode from 'vscode';

interface VscodeSetiIconData {
  file: string;
  fileExtensions: {
    [key: string]: string;
  }
  iconDefinitions: {
    [key: string]: {
      fontCharacter: string;
      fontColor: string;
    };
  }
  languageIds: {
    [key: string]: string;
  }
}

interface FileDefinition {
  folder: string;
  extension?: string;
}

interface LinePosition {
  line: number;
  character: number;
}

type Range = [LinePosition, LinePosition];

interface CustomTextSearchMatch {
  uri: vscode.Uri;
  outOfUris?: vscode.Uri[];
  ranges: Range[];
  preview: {
    matches: Range[];
    text: string;
  }
}
