---
menu-title: Using package generator
meta-title: Using the package generator | CKEditor 5 Framework Documentation
category: package-generator
order: 41
modified_at: 2024-06-27
---

# Using the package generator

The [`ckeditor5-package-generator`](https://www.npmjs.com/package/ckeditor5-package-generator) is a tool for developers. It creates a working package with the development environment that allows writing new custom plugins for CKEditor&nbsp;5.

## Quick start

To create a new package without installing the tool, simply execute the following command:

```bash
npx ckeditor5-package-generator@latest <packageName> [--use-npm] [--use-yarn] [--plugin-name <...>] [--verbose] [--lang <js|ts>] [--installation-methods <current|current-and-legacy>]
```

The `<packageName>` argument is required and must obey these rules:

* The provided name must match the schema: `@scope/ckeditor5-*`, where [@scope](https://docs.npmjs.com/about-scopes) is the owner of the package.
* The package name must start with the `ckeditor5-` prefix.
* Allowed characters are numbers (`0-9`), lowercase letters (`a-z`) and symbols: `-` `.` `_`.

As a result of executing the command, a new directory with a package in it will be created. The directory's name will be equal to the specified package name without the `@scope` part, and it will contain an example plugin and the development environment.

Available modifiers for the command are:

* `--use-npm` &ndash; use `npm` to install dependencies in the newly created package.
* `--use-yarn` &ndash; use `yarn` to install dependencies in the newly created package.
* `--plugin-name` &ndash; define the plugin name to be different from the package name.
* `--lang` &ndash; (values: `js` | `ts`) choose whether the created package should use JavaScript or TypeScript. If omitted, the script will ask the user to choose manually.
* `--verbose` &ndash; (alias: `-v`) print additional logs about the current executed task.
* `--installation-methods` &ndash; (values: `current` | `current-and-legacy`) choose which installation methods of CKEditor 5 do you want to support? If omitted, the script will ask the user to choose manually.

## Choosing the method

Currently, a package can be generated in one of two modes of supported installation methods for CKEditor&nbsp;5 :
* The package will only support the current installation methods if the value for the `--installation-methods` flag is set to `current`. This approach makes it easier to create CKEditor&nbsp;5 plugin at the cost of not supporting the old installation methods.
* The package generator creates bundles for both the current installation methods and {@link getting-started/legacy-getting-started/quick-start legacy installation methods} if the value for the `--installation-methods` flag is set to `current-and-legacy`.

## Using the package

After successfully creating a directory with the new package, enter it by executing the following command:

```bash
# Assuming that your package was created with `ckeditor5-foo` as its name.
cd ckeditor5-foo
```

Then, run the test environment for the plugin by executing the following command:

```bash
npm run start
```

Now the plugin can be seen within the example editor.

You can check out what is available inside your package depending on the language you used:
* {@link framework/development-tools/package-generator/javascript-package JavaScript}
* {@link framework/development-tools/package-generator/typescript-package TypeScript}

## Migration

If you have used the [`ckeditor5-package-generator`](https://www.npmjs.com/package/ckeditor5-package-generator) (version `1.1.0` or lower) to generate and develop your own plugins for CKEditor&nbsp;5 and now you want to migrate to the newest installations methods used by CKEditor&nbsp;5 please visit the {@link updating/nim-migration/migration-to-new-installation-methods Migrating CKEditor&nbsp;5 to new installation methods} guide. You will find an instruction there that will guide you step by step through all things that need to be changed.
