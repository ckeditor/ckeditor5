---
category: framework-contributing
meta-title: Testing environment | CKEditor 5 Framework Documentation
order: 30
modified_at: 2022-09-07
---

# Testing environment

Before reading this article we recommend getting familiar with the CKEditor&nbsp;5 {@link framework/contributing/development-environment development environment}.

## Introduction

The CKEditor&nbsp;5 testing environment uses a popular setup with [Karma](https://karma-runner.github.io), [webpack](https://webpack.github.io/), [babel-loader](https://github.com/babel/babel-loader) and [Istanbul](https://github.com/gotwarlost/istanbul). We created some [npm scripts](https://docs.npmjs.com/cli/run-script) which glue all these pieces and special requirements for CKEditor together.

Each CKEditor&nbsp;5 package has its own tests suite (see for example the [engine's tests](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-engine/tests)). However, the test runner is available in the root of the [`ckeditor5`](https://github.com/ckeditor/ckeditor5) repository which is the central development environment. The actual code of the test runner is implemented in the [`@ckeditor/ckeditor5-dev-tests`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-tests) package and can be reused outside of `ckeditor5`.

<info-box hint>
	Both automated and manual tests support TypeScript. Simply use the `.ts` extension.
</info-box>

## Running automated tests

To run the automated tests, use the `yarn run test [<args>...]` command.

It accepts the following arguments that must be passed after the `--` option:

* `--watch` (alias `-w`) &ndash; Whether to watch the files and execute tests whenever any file changes.
* `--source-map` (alias `-s`) &ndash; Whether to generate useful source maps for the code.
* `--coverage` (alias `-c`) &ndash; Whether to generate code coverage.
* `--verbose` (alias `-v`) &ndash; Allows switching on webpack logs.
* `--files` &ndash; Specifies test files to run. See the [Rules for using the `--files` option](#rules-for-using-the-files-option) section.
* `--browsers` &ndash; Browsers that will be used to run the tests. Defaults to `Chrome`.
* `--port` &ndash; Specifies the port for the server to use. Defaults to `9876`.
* `--identity-file="/path/to/file.js"` (alias `-i`) &ndash; Path to the file containing the license key(s) for closed–source features.

### Examples

Run all tests with the code coverage check of the [`ckeditor5-core`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core/tests) package:

```
yarn run test -c --files=core
```

Run and watch with the code coverage check the [engine's `view` namespace tests](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-engine/tests/view) and all the tests in [`ckeditor5-typing`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-typing/tests):

```
yarn run test -cw --files=engine/view/,typing
```

Run and watch the `bold*.js` tests in the [`ckeditor5-basic-styles`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-basic-styles/tests) package:

```
yarn run test -w --files=basic-styles/bold*
```

### Custom Chai assertions

The testing environment allows for some custom `Chai` assertions. There is no need to import them, as they are imported by default inside all tests.

#### `equalMarkup`

Tests whether two given strings containing markup language are equal. Unlike `expect().to.equal()` from the Chai assertion library, this assertion formats the markup before showing a diff. It can be used to test HTML strings and strings containing a serialized model.

This assertion will pass:

```js
expect( `<b>foo</b>` ).to.equalMarkup( `<b>foo</b>` )
```

This assertion will throw an error:

```js
expect(
	'<paragraph>foo bXXX[]r baz</paragraph>'
).to.equalMarkup(
	'<paragraph>foo bYYY[]r baz</paragraph>'
);
```

#### `attribute`

Asserts that the target has an attribute with the given key name. See {@link module:engine/model/documentselection~DocumentSelection#hasAttribute hasAttribute}.

```js
expect( selection ).to.have.attribute( 'linkHref' );
```

When an optional `value` is provided, `.attribute` also asserts that the attribute's value is equal to the given `value`. See {@link module:engine/model/documentselection~DocumentSelection#getAttribute getAttribute}.

```js
expect( selection ).to.have.attribute( 'linkHref', 'example.com' );
```

Negations work as well.

```js
expect( selection ).to.not.have.attribute( 'linkHref' );
```


## Running manual tests

To start the manual tests server, use the `yarn run manual` task. After calling this command, you may be asked if you want to re-create the DLL builds. You do not have to re-create the DLL builds each time you run the manual tests. Do it only if you want to check your changes in those tests that require the DLL builds.

<info-box hint>
	You can read more about the DLL builds in a {@link getting-started/advanced/dll-builds dedicated guide}.
</info-box>

The `yarn run manual` task accepts the following options:

* `--files` &ndash; Specifies test files to run. See the [Rules for using the `--files` option](#rules-for-using-the-files-option) section.
* `--language="pl"` &ndash; The main language built into all test editors, passed to the [CKEditor&nbsp;5 translations plugin](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-translations). Check out the {@link getting-started/setup/ui-language UI language guide} to learn more. If unspecified, `'en'` is passed to the test runner.
* `--additional-languages="ar,pl,..."` &ndash; Specifies extra languages passed to the [CKEditor&nbsp;5 translations plugin](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-translations). Check out the {@link getting-started/setup/ui-language UI language guide} to learn more.
* `--debug` (alias `-d`) &ndash; Allows specifying custom debug flags. For example, the `--debug engine` option uncomments the `// @if CK_DEBUG_ENGINE //` lines in the code. Note that by default `--debug` is set to `true` even if you did not specify it. This enables the base set of debug logs (`// @if CK_DEBUG //`) which should always be enabled in the testing environment. You can completely turn off the debug mode by setting the `--debug false` option.
* `--port` &ndash; Specifies the port for the server to use. Defaults to `8125`.
* `--identity-file="/path/to/file.js"` (alias `-i`) &ndash; Path to the file containing the license key(s) for closed–source features.
* `--dll` &ndash; An optional flag that allows creating the DLL builds automatically without asking the user for confirmation. If `true` (meaning that the `--dll` flag is provided), DLL builds are created automatically if they are required by test files. You can negate the logic to never create DLL builds and not ask the user by providing the `--no-dll` flag. Defaults to `null`, so the user will be asked for confirmation.
* `--disable-watch` &ndash; It is enabled by default when there are no `--files` specified. This is due to high RAM memory usage when running watchers on all files. Disabling watch mode causes the files to no longer be rebuilt automatically when changed.

It starts the server available at [http://localhost:8125](http://localhost:8125).

### Creating a manual test

A manual test consists of 3 files:

* A `<name>.md` file with the test description.
* A `<name>.js` or `<name>.ts` file with the JavaScript or TypeScript part of the test (for example, the code initializing an editor).
* A `<name>.html` file with the HTML part of the test. It does not need to be an entire HTML page (with the DOCTYPE, etc.). It can include just the HTML elements that you want to define.

All 3 files are combined and create a single manual test.

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
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
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
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

<info-box>
	The <code>manual/</code> test directories should always be located in the root of the <code>tests/</code> directories.
	<ul>
		<li><code>packages/ckeditor5-engine/tests/manual/view/focus.js</code> &ndash; correct path.</li>
		<li><code>packages/ckeditor5-engine/tests/view/manual/focus.js</code> &ndash; incorrect path.</li>
	</ul>
</info-box>

### Verifying all manual tests

To verify that all manual tests can be **opened** without any errors (the crawler does not execute the manual test steps, it just visits the page), you do not need to do that manually, page by page. Instead, there is a web crawler that automatically traverses the documentation and visits all pages that have been found. The crawler opens a headless Chromium browser and logs to the console any error that has been found.

To check manual tests, start the server (`yarn manual --files=XYZ`), and then run the crawler:

```
yarn run manual:verify
```

Read more about the crawler in the {@link framework/contributing/development-environment#verifying-documentation Verifying documentation} guide.

## Rules for using the `--files` option

The `--files` (alias `-f`) option is used by both the manual and automated tests, and it accepts the following types of patterns:

<table>
	<tr>
		<th width="25%">Patterns</th>
		<th width="75%">Result</th>
	</tr>
	<tr>
		<td><code>ckeditor5</code></td>
		<td>Run all tests of the root <a href="https://github.com/ckeditor/ckeditor5/tree/master/tests"><code>ckeditor5</code></a> package.</td>
	</tr>
	<tr>
		<td><code>core</code></td>
		<td>Run all tests of the <a href="https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core/tests"><code>ckeditor5-core</code></a> package.</td>
	</tr>
	<tr>
		<td><code>editor-*</code></td>
		<td>Run all tests of the <code>editor-*</code> packages. (<code>ckeditor5-editor-classic</code>, <code>ckeditor5-editor-balloon</code> etc.)</td>
	</tr>
	<tr>
		<td><code>!core</code></td>
		<td>Run all tests <b>except</b> those of the <a href="https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core/tests"><code>ckeditor5-core</code></a> package.</td>
	</tr>
	<tr>
		<td><code>!(core|engine)</code></td>
		<td>Run all tests <b>except</b> those of the <a href="https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core/tests"><code>ckeditor5-core</code></a> <b>and</b> the <a href="https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-engine/tests"><code>ckeditor5-engine</code></a> packages. Any number of packages can be excluded.</td>
	</tr>
	<tr>
		<td><code>engine/view/</code></td>
		<td>Run all tests of the <a href="https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-engine/tests/view"><code>ckeditor5-engine</code></a> package located in the <code>./packages/ckeditor5-engine/tests/view/</code> directory.</td>
	</tr>
	<tr>
		<td><code>core/editor/utils/</code></td>
		<td>Run all tests of the <a href="https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core/tests/editor/utils"><code>ckeditor5-core</code></a> package located in the <code>./packages/ckeditor5-core/tests/editor/utils/</code> directory.</td>
	</tr>
	<tr>
		<td><code>basic-styles/bold</code></td>
		<td>Run all tests with the filename <code>bold.js</code> in the <a href="https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-basic-styles/tests"><code>ckeditor5-basic-styles</code></a> package.</td>
	</tr>
	<tr>
		<td><code>basic-styles/bold*</code></td>
		<td>
			Run all tests matching the filename pattern <code>bold*.js</code> in the <a href="https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-basic-styles/tests"><code>ckeditor5-basic-styles</code></a> package:
			<ul>
				<li><code>./packages/ckeditor5-basic-styles/tests/bold.js</code></li>
				<li><code>./packages/ckeditor5-basic-styles/tests/bold/boldediting.js</code></li>
				<li><code>./packages/ckeditor5-basic-styles/tests/bold/boldui.js</code></li>
			</ul>
		</td>
	</tr>
	<tr>
		<td><code>ckeditor5,list/list/,style/*grid*</code></td>
		<td>Sum of all arguments separated by a comma <code>,</code>. This one can use any combination of argument types. Note that since it is a sum, using multiple <code>!foo</code> excluding arguments might not work as expected.</td>
	</tr>
</table>

<info-box>
	You can use multiple arguments separated by a comma <code>,</code> to have the sum of the outputs compiled.

	All of the patterns support the <code>*</code> wildcard.
</info-box>

## Test suite and CI

To ensure the highest quality, we maintain a complete test suite with a stable 100% code coverage for each of the packages. As of September 2019, this means over 11000 tests and the number is growing. Since every package is tested separately, we implement lower-level tests for libraries and higher-level tests for end-user features.

Such an extensive test suite requires a proper continuous integration service. We use [Travis CI](https://travis-ci.com/) as a build platform. This service ensures a seamless and fast developer experience and allows us to focus on the job.

Besides automated tests, we also maintain a smaller set of manual tests. They help us verify whether something unexpected happens that might have been missed by the automated tests.

When proposing a pull request, make sure to add test(s) that verify it. Every code change should be accompanied by a test which proves that it is needed. Such a strict approach to testing ensures that we have not only 100% of code coverage (which is quite easy to achieve and gives only illusory safety) but also a high level of coverage for cases that we failed to notice initially (and might do that again in the future).
