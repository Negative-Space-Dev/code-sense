import * as vscode from 'vscode';

interface FileDefinition {
  folder: string;
  extension?: string;
}

interface CustomTextSearchMatch extends vscode.TextSearchMatch {
  outOfUris: vscode.Uri[];
}