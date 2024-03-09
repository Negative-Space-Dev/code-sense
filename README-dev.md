# Code Sense

### Use command pallet to run code-sense.start

## Dev

### 1) Run build for solid app

```
cd solid-app
bun run build
```

### 2) Run extension

From VSCode, press F5

### 3) Open build extension

```
bun run vscode:prepublish
```

### 4) Create VSIX file

#### 4.1) Install vsce

```
bun install -g @vscode/vsce
```

#### 4.2) Create VSIX file

```
vsce package
```

