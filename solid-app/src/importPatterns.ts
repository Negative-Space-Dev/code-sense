export default [
  {
    name: 'snippet import',
    fileDefinition: {
      folder: 'snippets',
      extension: 'liquid',
    },
    conditions: [
      {
        regex: (filename: string) => `(render|include)\\s*('|")${filename}('|")`,
        include: '**/**.liquid',
      },
    ],
  },
  {
    name: 'section import',
    fileDefinition: {
      folder: 'sections',
      extension: 'liquid',
    },
    conditions: [
      {
        regex: (filename: string) => `section\\s*('|")${filename}('|")`,
        include: '**/**.liquid',
      },
      {
        regex: (filename: string) => `"type": "${filename}"`,
        include: '**/templates/**.json',
      },
    ],
  },
  {
    name: 'section group import',
    fileDefinition: {
      folder: 'sections',
      extension: 'json',
    },
    conditions: [
      {
        regex: (filename: string) => `sections\\s*('|")${filename}('|")`,
        include: '**/**.liquid',
      }
    ],
  },
  {
    name: 'asset import',
    fileDefinition: {
      folder: 'assets',
    },
    conditions: [
      {
        regex: (filename: string) =>
          `('|")${filename}(?<extension>\\..*|)('|")\\s*\\|\\s*asset_url`,
        customFilenameFunc: (path: string, fullFilename: string, filename: string) =>
          fullFilename.replace('.liquid', ''),
        include: '**/**.liquid',
      },
    ],
  },
];
