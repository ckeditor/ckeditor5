---
menu-title: Using package generator
category: package-generator
order: 41
modified_at: 2022-08-16
---

# Using the package generator

The [`ckeditor5-package-generator`](https://www.npmjs.com/package/ckeditor5-package-generator) is a tool for developers. It creates a working package with the development environment that allows writing new custom plugins for CKEditor 5.

## Quick start

To create a new package without installing the tool, simply execute the following command:

```bash
npx ckeditor5-package-generator <packageName> [--dev] [--verbose] [--use-npm] [--use-yarn] [--name]
```

The `<packageName>` argument is required and must obey these rules:

* The provided name must match the schema: `@scope/ckeditor5-*`, where [@scope](https://docs.npmjs.com/about-scopes) is the owner of the package.
* The package name must start with the `ckeditor5-` prefix.
* Allowed characters are numbers (`0-9`), lowercase letters (`a-z`) and symbols: `-` `.` `_`.

As a result of executing the command, a new directory with a package in it will be created. The directory's name will be equal to the specified package name without the `@scope` part, and it will contain an example plugin and the development environment.

Available modifiers for the command are:

* `--verbose` &ndash; (alias: `-v`) whether to prints additional logs about the current executed task.
* `--dev` &ndash; whether to execute in the development mode. It means that the `@ckeditor/ckeditor5-package-tools` will not be installed from npm, but from the local file system.
* `--use-npm` &ndash; whether to use `npm` to install dependencies in a newly created package.
* `--use-yarn` &ndash; whether to use `yarn` to install dependencies in a newly created package.
* `--name` &ndash; allows class name to be different from the package name.

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

* {@link framework/guides/package-generator/javascript-package JavaScript}
* {@link framework/guides/package-generator/typescript-package TypeScript}
