# Code Sense

# Install

## This extension uses a Proposed API and requires extra steps to install


### 1. Download latest `code-sense-X.X.X.vsix` file and install using the "Installe from VSIX..." option in the extensions menu

![image](https://github.com/Negative-Space-Dev/code-sense/assets/25469167/96d26b9c-6c3f-47ac-ae24-8cf43f25172b)


### 2. Enable proposed APIs for this extension

- Open the command pallette (Ctrl+Shift+P) and enter `Preferences: Configure Runtime Arguments`
- Add the following to the list of arguments

```json
{
    ...
    "enable-proposed-api": ["negative-space.code-sense"]
}
```

### 3. Restart VSCode


# Start 

## Use the command pallette to run `Code Sense: Start code sense`

