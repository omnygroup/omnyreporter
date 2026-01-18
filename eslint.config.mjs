import omnyConfig from '@omnygroup/eslint';

const projectPaths = ['./tsconfig.json', './tsconfig.vite.json', './tsconfig.test.json'];

const configs = (Array.isArray(omnyConfig) ? omnyConfig : [omnyConfig]).map(cfg => {
  if (!cfg) return cfg;
  
  if (cfg.languageOptions?.parserOptions?.project === true) {
    return {
      ...cfg,
      languageOptions: {
        ...cfg.languageOptions,
        parserOptions: {
          ...cfg.languageOptions.parserOptions,
          project: projectPaths,
        },
      },
    };
  }
  
  return cfg;
});

export default configs;

