---
menu-title: Using package generator
meta-title: Create a CKEditor 5 package with package generator | CKEditor 5 Framework Documentation
meta-description: Learn how to scaffold a Vite-based CKEditor 5 package, answer the generator prompts, and start building your plugin.
category: package-generator
order: 41
modified_at: 2026-03-24
---

# Create a CKEditor 5 package with package generator

The [`ckeditor5-package-generator`](https://www.npmjs.com/package/ckeditor5-package-generator) scaffolds a Vite-based package for custom CKEditor&nbsp;5 plugins. It gives you a starter plugin, a sample editor, tests, linting, translation tooling, and build scripts for npm and direct browser usage.

<info-box important>
	This guide describes the current Vite-based templates. If you are updating a package created with the older webpack-based generator, follow the {@link updating/nim-migration/custom-plugins Migrating custom plugins} guide instead.
</info-box>

## What the generator gives you

JavaScript and TypeScript packages share the same development flow. Right after generation, you get:

* A starter plugin in `src/`.
* A local sample app in `sample/`, powered by Vite.
* Unit tests in `tests/`, powered by Vitest.
* Theme files in `theme/` for icons and CSS.
* Translation helpers in `lang/` and `scripts/`.
* Build scripts that create an npm package build and browser-ready files in `dist/`.

The TypeScript template also adds `src/augmentation.ts`, `tsconfig.json`, `tsconfig.build.json`, `typings/`, and generated declaration files.

## Generate a package

You can run the generator without any arguments. If you do not pass some values on the command line, the CLI asks for them interactively:

```bash
npx ckeditor5-package-generator
```

This guide uses the following example names:

| Example value       | What it represents                                     |
| ------------------- | ------------------------------------------------------ |
| `ckeditor5-callout` | The package name entered in the generator.             |
| `ckeditor5-callout` | An example package name and generated directory name.  |
| `Callout`           | The default plugin class name for `ckeditor5-callout`. |
| `CKCallout`         | The suggested UMD global name for `ckeditor5-callout`. |

Your actual names depend on the package name and on the values you confirm or pass for `--plugin-name` and `--global-name`.

The package name can use either of these formats:

* `@<scope>/ckeditor5-<name>`
* `ckeditor5-<name>`

Allowed characters are numbers (`0-9`), lowercase letters (`a-z`), and symbols: `-` `.` `_`.

The generator creates a new directory named after the package without the scope part. For example, both `ckeditor5-callout` and `@scope/ckeditor5-callout` create the `ckeditor5-callout/` directory.

### Useful options

| Option                                | What it changes                                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--lang js` or `--lang ts`            | Pre-fills the programming language. If omitted, the generator asks interactively.                                                                                                                      |
| `--plugin-name <name>`                | Pre-fills the plugin class name.                                                                                                                                                                       |
| `--global-name <name>`                | Pre-fills the UMD global name used by `dist/browser/index.umd.js`. If omitted, the generator still asks for it and suggests a name based on package name, such as `CKCallout` for `ckeditor5-callout`. |
| `--package-manager <npm\|yarn\|pnpm>` | Pre-fills the package manager choice. If omitted, the generator asks for it when multiple package managers are available; otherwise it uses `npm`.                                                     |
| `--verbose`                           | Prints additional progress logs.                                                                                                                                                                       |

## Start developing the package

Enter the generated directory and start the sample app:

```bash
cd ckeditor5-callout
npm run start
```

The exact command prefix depends on the package manager you selected. The generated scripts are the same regardless of whether you run them with `npm`, `pnpm`, or `yarn`.

The most common scripts are:

| Command                            | What it does                                                |
| ---------------------------------- | ----------------------------------------------------------- |
| `npm run start`                    | Starts the Vite sample app with live reload.                |
| `npm run test`                     | Runs the unit tests with Vitest.                            |
| `npm run test:debug`               | Runs Vitest in Node inspector mode.                         |
| `npm run lint`                     | Runs ESLint on the package sources.                         |
| `npm run stylelint`                | Runs Stylelint on `theme/**/*.css`.                         |
| `npm run build`                    | Creates the npm and browser builds in `dist/`.              |
| `npm run translations:synchronize` | Updates translation files from the current source messages. |
| `npm run translations:validate`    | Checks translation metadata without changing files.         |

When you start editing the generated package, the usual places to work in are:

* `src/` for the plugin code and public exports.
* `sample/index.[js|ts]` for the local editor setup used during development.
* `tests/` for unit tests.
* `theme/` for icons and CSS.
* `ckeditor5-metadata.json` for plugin metadata used by CKEditor&nbsp;5 tooling.

<info-box tip>
	Keep `.js` extensions in relative imports, even in TypeScript files. The generated template uses that pattern on purpose so the emitted ESM files stay valid.
</info-box>

## Build and integrate the package

Run `npm run build` when you want to publish the package or load it directly in the browser. The generator creates two kinds of output:

* An npm-oriented ESM build in `dist/`.
* A browser-oriented ESM and UMD build in `dist/browser/`.

See the {@link framework/development-tools/package-generator/build-output-and-integration Build output and integration} guide to learn what each file is for and how to use it with the {@link getting-started/integrations/quick-start npm or ZIP quick start} guide or the {@link getting-started/integrations-cdn/quick-start CDN quick start} guide.

## Next steps

* Follow the {@link tutorials/creating-simple-plugin-timestamp Creating a basic plugin} tutorial to build a real plugin on top of the generated template.
* Read the {@link framework/deep-dive/localization localization} guide before adding translations.
* Use the {@link framework/development-tools/package-generator/build-output-and-integration Build output and integration} guide when you are ready to publish or embed the package.
