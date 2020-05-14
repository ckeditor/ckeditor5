---
category: framework-contributing
order: 20
---

# Testing environment

Before reading this article we recommend getting familiar with the CKEditor 5 {@link framework/guides/contributing/development-environment development environment}.

## Introduction

The CKEditor 5 testing environment uses a popular setup with [Karma](https://karma-runner.github.io), [webpack](https://webpack.github.io/), [babel-loader](https://github.com/babel/babel-loader) and [Istanbul](https://github.com/gotwarlost/istanbul). We created some [npm scripts](https://docs.npmjs.com/cli/run-script) which glue all these pieces and special requirements for CKEditor together.

Each CKEditor 5 package has its own tests suite (see for example the [engine's tests](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-engine/tests)), however, the test runner is available in the root of the [`ckeditor5`](https://github.com/ckeditor/ckeditor5) repository which is the central development environment. The actual code of the test runner is implemented in the [`@ckeditor/ckeditor5-dev-tests`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-tests) package and can be easily reused outside of `ckeditor5`.

## Running automated tests

In order to run the automated tests, use the `yarn run test [<args>...]` command.

It accepts the following arguments that must be passed after the `--` option:

* `--watch` (alias `-w`) &ndash; Whether to watch the files and execute tests whenever any file changes.
* `--source-map` (alias `-s`) &ndash; Whether to generate useful source maps for the code.
* `--coverage` (alias `-c`) &ndash; Whether to generate code coverage.
* `--verbose` (alias `-v`) &ndash; Allows switching on webpack logs.
* `--files` &ndash; Specifies test files to run. Accepts a package name or a glob. For example `--files=engine` will run tests from `ckeditor5-engine` package. Read more about the [rules for converting the `--files` option to a glob pattern](https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-tests#rules-for-converting---files-option-to-glob-pattern).
* `--browsers` &ndash; Browsers that will be used to run the tests. Defaults to `Chrome`.
* `--debug` (alias `-d`) &ndash; Allows specifying custom debug flags. For example, the `--debug engine` option uncomments the `// @if CK_DEBUG_ENGINE //` lines in the code. Note that by default `--debug` is set to `true` even if you did not specify it. This enables the base set of debug logs (`// @if CK_DEBUG //`) which should always be enabled in the testing environment. You can completely turn off the debug mode by setting the `--debug false` option.

### Examples

Run all tests with the code coverage check of the [`ckeditor5-core`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core/tests) package:

```bash
yarn run test -c --files=core
```

Run and watch the [engine's `view` namespace tests](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-engine/tests/view) and all the tests in [`ckeditor5-typing`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-typing/tests):

```bash
yarn run test -cw --files=engine/view,typing
```

Run the `bold*.js` tests in the [`ckeditor5-basic-styles`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-basic-styles/tests) package:

```bash
yarn run test -cw --files=basic-styles/bold*.js
```

## Running manual tests

In order to start the manual tests server, use the `yarn run manual` task.

The task accepts the following options:

* `--source-map` (alias `-s`) &ndash; Whether to generate useful source maps for the code.
* `--files` &ndash; Specifies test files to run. Accepts a package name or a glob. For example `--files=ckeditor5` will only run tests from the CKEditor 5 main package. Read more about the [rules for converting the `--files` option to a glob pattern](https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-tests#rules-for-converting---files-option-to-glob-pattern).
* `--additionalLanguages="ar,pl,..."` &ndash; Specifies extra languages to the [CKEditor 5 webpack plugin](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-webpack-plugin). Check out the {@link features/ui-language UI language guide} to learn more.
* `--debug` (alias `-d`) &ndash; Allows specifying custom debug flags. For example, the `--debug engine` option uncomments the `// @if CK_DEBUG_ENGINE //` lines in the code. Note that by default `--debug` is set to `true` even if you did not specify it. This enables the base set of debug logs (`// @if CK_DEBUG //`) which should always be enabled in the testing environment. You can completely turn off the debug mode by setting the `--debug false` option.
* `--port` &ndash; Specifies the port for the server to use. Defaults to `8125`.

It starts the server available at http://localhost:8125.

### Creating a manual test

A manual test consists of 3 files:

* A `<name>.md` file with the test description.
* A `<name>.js` file with the JavaScript part of the test (e.g. the code initializing an editor).
* A `<name>.html` file with the HTML part of the test. It does not need to be an entire HTML page (with the doctype, etc.). It can include just the HTML elements that you want to define.

All 3 files are combined together and create a single manual test.

An example Markdown file:

```md
## Create a new link

1. Select a fragment of the regular text.
2. Click the toolbar "Link" button.
3. Check if the balloon panel attached to the selection appeared.
4. Fill in the "Link URL" input in the panel.
5. Click the "Save" button.
6. Check if the selected text is converted into a link.
```

An example HTML file:

```html
<head>
    <style>
        /*
          Some additional styles which this test needs.
          And yes – the test builder will merge this tag with the head defined in the template.
        */
    </style>
</head>

<div id="editor">...</div>
```

An example JavaScript file:

```js
/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Essentials, Paragraph ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
```

<info-box>
	Do not forget to add all dependencies of your manual test as `devDependencies` (in `package.json`).
</info-box>

<info-box>
	We recommend using the official {@link framework/guides/development-tools#ckeditor-5-inspector CKEditor 5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Test suite and CI

To ensure the highest quality, we maintain a complete test suite with a stable 100% of code coverage for each of the packages. As of September 2019, this means over 11000 tests and the number is growing. Since every package is tested separately, we implement lower-level tests for libraries and higher-level tests for end-user features.

Such an extensive test suite requires a proper continuous integration service. We use [Travis CI](https://travis-ci.com/) as a build platform. This service ensures seamless and fast developer experience and allows us to focus on the job.

Besides automated tests, we also maintain a smaller set of manual tests. They help us verify whether something unexpected happens that might have been missed by the automated tests.

When proposing a pull request make sure to add test(s) that verifies it. Every code change should be accompanied by a test which proves that it is needed. Such a strict approach to testing ensures that we have not only 100% of code coverage (which is quite easy to achieve and gives only illusory safety) but also a high level of coverage for cases that we failed to notice initially (and might do that again in the future).
