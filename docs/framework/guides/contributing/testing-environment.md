---
category: framework-contributing
order: 20
---

# Testing environment

Before reading this article we recommend reading about the {@link framework/guides/contributing/development-environment Development environment}.

## Introduction

The CKEditor 5 testing environment uses a pretty popular setup with [Karma](https://karma-runner.github.io), [Webpack](https://webpack.github.io/), [babel-loader](https://github.com/babel/babel-loader) and [Istanbul](https://github.com/gotwarlost/istanbul). We created a bunch of [gulp](https://github.com/gulpjs/gulp) tasks which glue all these pieces and special requirements for CKEditor together.

<info-box>
	We are [considering dropping gulp and switching to npm scripts](https://github.com/ckeditor/ckeditor5/issues/473), so please do not be surprised that both methods are in use now.
</info-box>

Each CKEditor package has its own tests suite (see e.g. the [engine's tests](https://github.com/ckeditor/ckeditor5-engine/tree/master/tests)), however, the test runner is available in the [`ckeditor5`](https://github.com/ckeditor/ckeditor5) package, which is a central development environment. The actual code of the test runner is implemented in [`@ckeditor/ckeditor5-dev-tests`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-tests) package and can be easily reused outside `ckeditor5`.

## Running automated tests

In order to run the automated tests use the `gulp test` task.

It accepts the following arguments:

* `--watch` (alias `-w`) – Whether to watch the files and execute tests whenever any file changes.
* `--source-map` (alias `-s`) – Whether to generate the source maps.
* `--coverage` (alias `-c`) – Whether to generate code coverage.
* `--verbose` (alias `-v`) – Allows switching on Webpack's logs.
* `--files` – Specify tests files to run. Accepts a package name or a glob. Read more about the [rules for converting `--files` option to glob pattern](https://github.com/ckeditor/ckeditor5-dev/tree/master/packages/ckeditor5-dev-tests#rules-for-converting---files-option-to-glob-pattern).
* `--browsers` – Browsers which will be used to run the tests. Defaults to `Chrome`.

### Examples

Run all tests with code coverage check of the [`ckeditor5-core`](https://github.com/ckeditor/ckeditor5-core) package:

```
gulp test -c --files=core
```

Run and watch the [engine's `view` namespace tests](https://github.com/ckeditor/ckeditor5-engine/tree/master/tests/view) and all the tests in [`ckeditor5-typing`](https://github.com/ckeditor/ckeditor5-typing):

```
gulp test -cw --files=engine/view,typing
```

Run the `bold*.js` tests in the [`ckeditor5-basic-styles`](https://github.com/ckeditor/ckeditor5-basic-styles) package:

```
gulp test -cw --files=basic-styles/bold*.js
```

## Running manual tests

In order to start a manual tests server use the `gulp test:manual` task.

It accepts `--source-map` (alias `-s`) option.

It starts a server available at http://localhost:8125.

### Creating a manual test

A manual test consists of 3 files:

* A `<name>.md` file with the test description.
* A `<name>.js` file with the JS part of the test (e.g. code initializing an editor).
* A `<name>.html` file with the HTML part of the test. It doesn't need to be an entire HTML page (with the doctype, etc.), it can be just these HTML elements which you want to define.

All 3 files are combined together and create a single manual test.

Example Markdown file:

```md
## Create a new link

1. Select a fragment of regular text.
2. Click the toolbar "Link" button.
3. Check if the balloon panel attached to the selection appeared.
4. Fill in the "Link URL" input in the panel.
5. Click the "Save" button.
6. Check if the selected text is converted into a link.
```

Example HTML file:

```html
<head>
    <style>
        /*
          Some additional styles which this test needs.
          And yes – the test builder will merge this tag with head defined in a template.
        */
    </style>
</head>

<div id="editor">...</div>
```

Example JS file:

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
