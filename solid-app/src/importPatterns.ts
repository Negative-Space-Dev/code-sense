export default [
  {
    name: 'snippet import',
    fileDefinition: {
      folder: 'snippets',
      extension: 'liquid',
    },
    conditions: [
      {
        regex: (filename: string) => `\\{%-?\\s*(render|include)\\s*('|")${filename}('|")[\\s\\S\n]*?-?%\\}`,
        include: '**/**.liquid',
      }
    ]
  },
  {
    name: 'section import',
    fileDefinition: {
      folder: 'sections',
      extension: 'liquid',
    },
    conditions: [
      {
        regex: (filename: string) => `\\{%-?\\s*section\\s*('|")${filename}('|")[\\s\\S\n]*?-?%\\}`,
        include: '**/**.liquid',
      },
      {
        regex: (filename: string) => `"type": "${filename}"`,
        include: '**/templates/**.json'
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
        regex: (filename: string) => `('|")${filename}(?<extension>\\..*|)('|")\\s*\\|\\s*asset_url`,
        customFilenameFunc: (path: string, fullFilename: string, filename: string) => fullFilename.replace('.liquid', ''),
        include: '**/**.liquid',
      }
    ]
  }
];
