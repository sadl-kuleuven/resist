// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

 // https://resist-tool-v13.web.app/#/home  'https://sadl-kuleuven.github.io/RESIST/#/home'  'http://localhost:4200/#/home'

export const environment = {
  production: false,
  base_url: 'https://sadl-kuleuven.github.io/resist/#/home',
  cases_json_url: 'https://raw.githubusercontent.com/sadl-kuleuven/resist/main/src/assets/cases.json'
 //cases_json_url: 'assets/cases.json'
};
