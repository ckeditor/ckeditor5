---
category: framework-contributing
meta-title: Testing environment | CKEditor 5 Framework Documentation
meta-description: Test CKEditor 5 using the official testing environment. Run unit and manual tests effectively.
order: 30
modified_at: 2026-07-06
---

# Testing environment

The CKEditor&nbsp;5 testing environment lets you run the project's automated (unit) and manual tests. This article explains how to run them.

Before reading this article we recommend getting familiar with the CKEditor&nbsp;5 {@link framework/contributing/development-environment development environment}.

## Introduction

The CKEditor&nbsp;5 testing environment uses [Vitest](https://vitest.dev/) running automated tests in real browsers (the [browser mode](https://vitest.dev/guide/browser/)), while manual tests are served by a [Vite](https://vite.dev/)-based server. We created some [npm scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts) which glue all these pieces and special requirements for CKEditor together.

Each CKEditor&nbsp;5 package has its own tests suite (see for example the [engine's tests](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-engine/tests)) together with its own Vitest configuration and `test` script. Automated tests are executed directly with [pnpm](https://pnpm.io/), without any custom test runner. The custom Vitest matchers are implemented in the [`@ckeditor/ckeditor5-dev-tests`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-tests) package, and the Vite plugins powering the manual test server are implemented in the [`@ckeditor/ckeditor5-dev-manual-server`](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-manual-server) package. Both can be reused outside of `ckeditor5`.

<info-box hint>
	Both automated and manual tests support TypeScript. Simply use the `.ts` extension.
</info-box>

## Running automated tests

Automated tests are executed with the packages' own `test` scripts, run directly via pnpm. There is no dedicated test runner binary.

The root `pnpm run test` script is a thin wrapper that translates a shorthand package selection into [pnpm filters](https://pnpm.io/filtering). It accepts the following options:

* `--filter` (alias `-f`) &ndash; Comma-separated short package names selecting the packages to test. Globs are allowed, for example `-f editor-*`.
* `--coverage` (alias `-c`) &ndash; Runs the `coverage` script of the selected packages instead of `test`.
* `--attempts` &ndash; The number of attempts for each package's test run. Failed runs are retried per package. It is meant for continuous integration environments and defaults to `1`.

All remaining arguments are passed to Vitest. Positional arguments are treated by Vitest as test file filters (they match a part of the test file path). You can also pass any other [Vitest CLI option](https://vitest.dev/guide/cli.html).

You can run the automated tests for the whole repository, a single package, a directory, or a single file:

<table>
	<tr>
		<th width="30%">Scope</th>
		<th width="70%">Command</th>
	</tr>
	<tr>
		<td>The whole repository</td>
		<td><code>pnpm run test</code> (it sequentially runs the <code>test</code> script of every package)</td>
	</tr>
	<tr>
		<td>A single package</td>
		<td><code>pnpm run test -f engine</code><br>or natively: <code>pnpm --filter ckeditor5-engine run test</code></td>
	</tr>
	<tr>
		<td>Multiple packages</td>
		<td><code>pnpm run test -f editor-*,core</code></td>
	</tr>
	<tr>
		<td>A directory inside a package</td>
		<td><code>pnpm run test -f engine tests/view</code></td>
	</tr>
	<tr>
		<td>A single file</td>
		<td><code>pnpm run test -f basic-styles tests/bold.js</code></td>
	</tr>
</table>

Apart from the `test` and `coverage` scripts, each package provides the following scripts:

* `test:browser` &ndash; Runs the tests in a visible (non-headless) browser.
* `test:debug` &ndash; Runs the tests in a visible browser in the watch mode. Useful for debugging with the browser developer tools.

### Examples

Run all tests of the [`ckeditor5-core`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core/tests) package with the code coverage check:

```bash
pnpm run test -c -f core
```

Run the [engine's `view` namespace tests](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-engine/tests/view):

```bash
pnpm run test -f engine tests/view
```

Run and debug the `bold.js` tests in the [`ckeditor5-basic-styles`](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-basic-styles/tests) package in a visible browser:

```bash
pnpm --filter ckeditor5-basic-styles run test:debug tests/bold.js
```

### Custom Vitest matchers

The testing environment registers some custom [Vitest matchers](https://vitest.dev/guide/extending-matchers.html). There is no need to import them, as they are registered by default inside all tests.

#### `toEqualMarkup`

Tests whether two given strings containing markup language are equal. Unlike `expect().toEqual()`, this matcher formats the markup before showing a diff. It can be used to test HTML strings and strings containing a serialized model.

This assertion will pass:

```js
expect( `<b>foo</b>` ).toEqualMarkup( `<b>foo</b>` )
```

This assertion will throw an error:

```js
expect(
	'<paragraph>foo bXXX[]r baz</paragraph>'
).toEqualMarkup(
	'<paragraph>foo bYYY[]r baz</paragraph>'
);
```

## Running manual tests

To start the manual tests server, use the `pnpm run manual` task. It starts a [Vite](https://vite.dev/) development server available at [http://localhost:8125](http://localhost:8125).

The task accepts the standard [Vite CLI options](https://vite.dev/guide/cli.html), for example `--port`.

Debug flags are controlled with the `CK_DEBUG` environment variable. The base set of debug logs (`// @if CK_DEBUG //`) is always enabled. To uncomment additional debug code, pass a comma-separated list of flags, for example `CK_DEBUG=engine pnpm run manual` to enable the `// @if CK_DEBUG_ENGINE //` lines in the code.

### Creating a manual test

A manual test consists of 2 files:

* A `<name>.manual.html` file &ndash; a complete HTML document (with the DOCTYPE, `<head>`, and `<body>`) that you fully own. You can freely add a Content Security Policy `<meta>` tag, external scripts, `<style>`, or `<link>` tags in the `<head>`. The `.manual.html` suffix is what marks the file as a manual test.
* A `<name>.js` or `<name>.ts` file with the JavaScript or TypeScript part of the test (for example, the code initializing an editor). Reference it from the document with a `<script type="module">` tag.

Test instructions live inside the document in a `<ck-manual-header>` element &ndash; its children are rendered as a collapsible instructions panel. In the tests list, each test is identified by its file path relative to the `tests/manual/` directory.

<info-box>
	Only files with the `.manual.html` suffix are treated as manual tests. A plain `.html` file placed in a `tests/manual/` directory is treated as a static fixture (for example, content loaded into an `<iframe>`) and is never registered as a test.
</info-box>

An example `<name>.manual.html` file, which also serves as a template for new tests:

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Create a new link</title>
	<script type="module" src="./link.ts"></script>
</head>
<body>
	<ck-manual-header>
		<h2>Create a new link</h2>
		<ol>
			<li>Select a fragment of the regular text.</li>
			<li>Click the toolbar "Link" button.</li>
			<li>Check if the balloon panel attached to the selection appeared.</li>
			<li>Fill in the "Link URL" input in the panel.</li>
			<li>Click the "Save" button.</li>
			<li>Check if the selected text is converted into a link.</li>
		</ol>
	</ck-manual-header>

	<div id="editor">...</div>
</body>
</html>
```

An example script file (`link.ts`):

```ts
import { ClassicEditor, Essentials, Paragraph } from 'ckeditor5';

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ),
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
		<li><code>packages/ckeditor5-engine/tests/manual/view/focus.ts</code> &ndash; correct path.</li>
		<li><code>packages/ckeditor5-engine/tests/view/manual/focus.ts</code> &ndash; incorrect path.</li>
	</ul>
</info-box>

### Verifying all manual tests

To verify that all manual tests can be **opened** without any errors (the crawler does not execute the manual test steps, it just visits the page), you do not need to do that manually, page by page. Instead, there is a web crawler that automatically traverses the documentation and visits all pages that have been found. The crawler opens a headless Chromium browser and logs to the console any error that has been found.

To check manual tests, run:

```bash
pnpm run manual:verify
```

It builds the manual tests, starts a local preview server, and runs the crawler against it — no separate server is needed.

Read more about the crawler in the {@link framework/contributing/development-environment#verifying-documentation Verifying documentation} guide.

## Running memory leak tests

To run the memory leak tests, use the `pnpm run test:memory` command. It builds a browser bundle, starts a local server, and runs the tests in headless Chromium.

The command accepts the following arguments:

* `--editor` &ndash; A list of editor names to test. You can pass the option multiple times. Defaults to `BalloonEditor`, `ClassicEditor`, `DecoupledEditor`, `InlineEditor`, and `MultiRootEditor`.
* `--html` &ndash; The HTML file to load from `scripts/memory/assets`. Defaults to `index.html`.
* `--no-build` &ndash; Skips generating the browser build and reuses the existing editor assets.

### Examples

Run all memory leak tests:

```bash
pnpm run test:memory
```

Test only the classic and inline editors:

```bash
pnpm run test:memory --editor ClassicEditor --editor InlineEditor
```

Use a custom HTML file from `scripts/memory/assets`:

```bash
pnpm run test:memory --html my-test.html
```

Reuse existing assets:

```bash
pnpm run test:memory --no-build
```

### Interpreting the results

Each editor run consists of multiple create/destroy cycles. The warmup phase creates and destroys the editor a few times to populate caches and JIT state. The actual test then repeats the same create/destroy cycle more times while sampling memory between cycles. This makes the results less sensitive to first‑run effects and helps highlight steady growth trends.

After the run completes, the summary table reports:

* **Baseline** &ndash; The memory level after warmup. It is the reference point for the rest of the run and should already include initial cache effects.
* **Growth** &ndash; The difference between the final measurement and the baseline across repeated cycles. Use this to spot steady memory increases over time rather than one‑off spikes.
* **Tail Growth** &ndash; The spread within the last few measurements. It helps verify that memory stabilized near the end; large values suggest a still-growing footprint or high noise even after multiple cycles.
* **Status** &ndash; `OK` when both Growth and Tail Growth stay below the threshold. `Exceeds threshold` or `Error` means the run should be treated as a failure.

## Test suite and CI

To ensure the highest quality, we maintain a complete test suite with a stable 100% code coverage for each of the packages. As of September 2019, this means over 11000 tests and the number is growing. Since every package is tested separately, we implement lower-level tests for libraries and higher-level tests for end-user features.

Such an extensive test suite requires a proper continuous integration service. We use [Travis CI](https://travis-ci.com/) as a build platform. This service ensures a seamless and fast developer experience and allows us to focus on the job.

Besides automated tests, we also maintain a smaller set of manual tests. They help us verify whether something unexpected happens that might have been missed by the automated tests.

When proposing a pull request, make sure to add test(s) that verify it. Every code change should be accompanied by a test which proves that it is needed. Such a strict approach to testing ensures that we have not only 100% of code coverage (which is quite easy to achieve and gives only illusory safety) but also a high level of coverage for cases that we failed to notice initially (and might do that again in the future).
