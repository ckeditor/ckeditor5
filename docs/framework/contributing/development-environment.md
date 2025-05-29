---
category: framework-contributing
meta-title: Development environment | CKEditor 5 Framework Documentation
order: 20
modified_at: 2022-09-29
---

# Development environment

The CKEditor&nbsp;5 codebase is divided into multiple [npm](http://npmjs.com/) packages. The main package is [`ckeditor5`](https://github.com/ckeditor/ckeditor5) which installs all project dependencies and various development-related resources such as:

* the testing environment setup,
* configuration for [Yarn](https://yarnpkg.com/),
* translation management tools,
* documentation generator,
* and release tools.

The main package's GitHub repository also [hosts all other CKEditor5 sub-packages](https://github.com/ckeditor/ckeditor5/tree/master/packages).

You can find all the official packages listed in the [CKEditor&nbsp;5 repository's README](https://github.com/ckeditor/ckeditor5#packages).

<info-box info>
	Before version **19.0.0** CKEditor&nbsp;5 was developed in a multi-repository architecture. If you would like to work with an older multi-repository release, please refer to the <a href="https://ckeditor.com/docs/ckeditor5/19.0.0/framework/guides/contributing/development-environment.html" data-cke-crawler-skip>older Development environment guide</a> for multi-repository oriented instructions.
</info-box>

## Requirements

To start developing CKEditor&nbsp;5 you will require:

* [Node.js](https://nodejs.org/en/) 22.0.0+
* [Git](https://git-scm.com/)

## Setting up the CKEditor development environment

First, you need to install [Yarn](https://yarnpkg.com/) to use it for dependency management.

It is best to install it globally in your system for easier use later on:

```
npm install -g yarn
```

**Note:** [Read how to avoid using `sudo` to install packages globally](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md) or use [nvm](https://github.com/creationix/nvm).

Then clone the [CKEditor&nbsp;5 repository](https://github.com/ckeditor/ckeditor5):

```
git clone https://github.com/ckeditor/ckeditor5.git
cd ckeditor5
```

And install all CKEditor&nbsp;5 packages from the [npm registry](http://npmjs.com/).

```
yarn install
```

## Running tests

To run tests, you need to use the `test` and `manual` tasks.

```
yarn run test --watch --coverage --source-map --files=engine
```

or, shorter:

```
yarn run test -- -wcs --files=engine
```

This command will run the [`ckeditor5-engine`](https://github.com/ckeditor/ckeditor5-engine) package's tests.

**Note:** It is not possible to run tests of all packages with code coverage at once because the size of the project (the number of test files and source modules) exceeds webpack's capabilities (it runs out of memory).

To create a server for manual tests use the `manual` task:

```
yarn run manual
```

To help test localized editors, the task accepts two optional configurations: `--language="en"` and `--additionalLanguages="ar,pl,..."`. The former sets the main language used by test editors. By default it is `"en"` and in most scenarios, you do not need to change it. The latter brings more languages to manual tests, which is helpful for example,when working with {@link getting-started/setup/ui-language#righttoleft-rtl-languages-support right–to–left languages in the user interface}.

You can read more about the {@link framework/contributing/testing-environment Testing environment}.

## Building DLLs

Some manual tests require DLL builds. To learn more about DLL builds, read the {@link getting-started/advanced/dll-builds DLL builds guide}. They do not have to be updated every time, unless you want to check changes in the DLL builds specifically. Running `yarn run manual` will prompt you to optionally run the build. To build them manually, you need to run the `dll:build` task:

```
yarn run dll:build
```

This task accepts the following arguments:

* `--verbose` &ndash; Displays the full output of the scripts, including the webpack output. *Errors are displayed even if this argument is not used.*
* `--dev` &ndash; Enables `development` mode in webpack and disables the code minimization which makes it easier to read the output.

## Generating documentation

To build the documentation, you need to run the `docs` task:

```
yarn run docs
```

The documentation will be available in `build/docs/`.

This task accepts the following arguments:

* `--skip-api` &ndash; Skips building the API documentation (which takes the majority of the total time).
* `--skip-snippets` &ndash; Skips building live snippets.
* `--skip-validation` &ndash; Skips the final link validation.
* `--skip-guides` &ndash; Skips building all guides except the `index.md` files which allows navigating over the partially built documentation.
* `--guides=guide-name` &ndash; Guides to build. Accepts glob patterns that are matched against guide names. Examples:

	```
	--guides=image         // matches roughly "*image*"
	--guides="features/*"  // matches roughly "*features/*"
	--guides=features/image
	```

* `--watch` &ndash; Runs the documentation generator in a watch mode. It covers guides but it does not cover API docs.
* `--production` &ndash; Minifies the assets and performs other actions which are unnecessary during CKEditor&nbsp;5 development.
* `--verbose` &ndash; Prints out more information.

```
yarn run docs --skip-api
```

After building documentation, you can quickly start an HTTP server to serve them:

```
yarn run docs:serve
```

### Verifying documentation

To verify that all pages in our documentation can be opened without any errors, you do not need to do that manually, page by page. Instead, there is a web crawler that automatically traverses the documentation and it visits all pages that have been found. The crawler opens a headless Chromium browser and logs to the console any error that has been found.

To check pages in the documentation, build it (`yarn run docs`), serve it (`yarn run docs:serve`), and then run the crawler:

```
yarn run docs:verify
```

<info-box>
	By default, the crawler scans `http://fake.ckeditor.com:8080`, so you need to adjust your hosts file first.
</info-box>

The crawler collects and opens all links from the documentation, except the API and assets.

The crawler accepts the following arguments:

* `--url` (alias `-u`) &ndash; The URL to start crawling. This argument is required. Thanks to it you can verify for example,a deployed documentation.
* `--depth` (alias `-d`) &ndash; A number that defines how many nested page levels should be examined. Infinity by default.
* `--exclude` (alias `-e`) &ndash; A string with URL exclusion &ndash; links that match the excluded part are skipped. You can define multiple exclusions by providing multiple `--exclude` (or `-e`) arguments. Not specifying a value removes default exclusions, if any. Nothing is excluded by default, but the `docs:verify` script has some predefined ones.
* `--concurrency` (alias `-c`) &ndash; Number of concurrent pages (browser tabs) to be used during the scan. By default all links are opened one by one, sequentially (concurrency is 1).
* `--quit` (alias `-q`) &ndash; A boolean argument that specifies, whether the scan should be terminated as soon as the first error is found. Disabled by default, so all found links are scanned regardless of whether they have errors or not.

For example, to check the documentation without the default exclusions (the API and assets links), using only 2 concurrent pages and terminate the scan as soon as first error is found, run this command:

```
yarn run docs:verify -e -c 2 -q
```

#### Defining exclusions for web crawler

The crawler supports exclusions provided as text patterns, which are then searched for in the error messages as substrings. This pattern is just a plain text, not a regular expression. When a pattern (substring) is found, such an error is ignored - it is not listed after the finished scan and it does not mark the entire scan as failed. Only non-ignored errors are logged at the end of the scan.

The pattern for ignoring an error must be defined in `<meta>` tag on a page, where an error occurs. This `<meta>` tag must have `x-cke-crawler-ignore-patterns` name and `content` value provided as JSON object, where:

* Each key is the error type, that can be detected by the crawler.
* Each value is the text or an array of texts, that are used for finding a match in error messages. The special wildcard value `*` can be used to ignore all errors for a given error type.

The following error types are supported: `uncaught-exception`, `request-failure`, `response-failure`, `console-error`, `navigation-error` and `page-crash`:

* `uncaught-exception` &ndash; As the name suggests, these are uncaught exceptions from the page.
* `request-failure` &ndash; This error occurs, when the request has not been sent (for example, it was blocked by the browser) or has not received any response (for example, due to a timeout or in case the remote server is unreachable). HTTP error responses, such as 404 or 500, are considered successful ones from the HTTP standpoint. Such requests will not be logged as request failures but as response failures.
* `response-failure` &ndash; Each HTTP response with a status code equal to or greater than 400 is treated as a failed one.
* `console-error` &ndash; All `console.error()` calls are treated as an error.
* `navigation-error` &ndash; The navigation error may happen, when:
	* There is an SSL error (for example,in the case of a self-signed certificate or an expired one).
	* The target URL is invalid.
	* The timeout is exceeded during navigation to a page, so the `load` event is not emitted (for example, due to an infinite loop in the JavaScript code).
* `page-crash` &ndash; The general page malfunction, that does not fit other categories (like running out of RAM).

| Error&nbsp;type      | Example              |
|----------------------|----------------------|
| `uncaught-exception` | `"uncaught-exception": "ckeditor-duplicated-modules"`<br> This pattern ignores only the `ckeditor-duplicated-modules` exception. |
| `request-failure`    | `"request-failure": "missing-file.jpg"`<br> All requests containing the `missing-file.jpg` in the URL are ignored. |
| `response-failure`   | `"response-failure": "HTTP response status code: 401"`<br> All requests requiring authorization are ignored. |
| `console-error`      | `"console-error": "Example error message"`<br> All console errors containing "Example error message" substring are ignored. |
| `navigation-error`   | `"navigation-error": "Navigation timeout of 15000 ms exceeded"`<br> Links, which are not completely loaded, are ignored. |
| `page-crash`         | `"page-crash": "Error: Page crashed!"`<br> This general text pattern ignores all page crashes. |

These patterns are simply added as keys and values in a JSON object to the `<meta>` tag on a page, where they should be active:

```html
<meta name="x-cke-crawler-ignore-patterns" content='{
	"page-crash": "Error: Page crashed!",
	"uncaught-exception": "ckeditor-duplicated-modules",
	"console-error": "Example error message"
}'>
```

The pattern (regardless of the type of error) does not have to be a string, but can also be defined as an array of strings (patterns) to ignore many different errors:

```html
<meta name="x-cke-crawler-ignore-patterns" content='{
	"console-error": [ "Error 1", "Error 2", "Error 3" ]
}'>
```

To ignore all errors, use the special wildcard value `*`:

```html
<meta name="x-cke-crawler-ignore-patterns" content='{
	"console-error": "*"
}'>
```

In addition to the possibility of defining exclusions in the `<meta>` tag, it is also possible to specify that the link cannot be visited by the crawler by adding a `data-cke-crawler-skip` attribute:

```html
<a href="path/to/page" data-cke-crawler-skip>No entry for crawler, sorry</a>
```

## Generating content styles

It is possible to generate a style sheet containing content styles brought by all CKEditor&nbsp;5 features. To do that, execute:

```
yarn docs:content-styles
```

The style sheet will be saved in the `build/content-styles` folder.

To learn more, refer to the {@link getting-started/advanced/content-styles Content styles} guide.

## Additional information for contributors

### SVG icons

By default, CKEditor&nbsp;5 supports SVG icons found in the `ckeditor5-*/theme/icons` folders. Unfortunately, most of the SVG editing software produces the output with comments, obsolete tags, and complex paths, which bloats the DOM and makes the builds heavy for no good reason.

To remove the excess data and prevent [certain issues](https://github.com/ckeditor/ckeditor5-ui/issues/245), **you should optimize all new icons before adding them to the code base**. To do that, you can use the `clean-up-svg-icons` script in the [root of the project](#setting-up-the-ckeditor-development-environment), a wrapper for the [SVGO](https://github.com/svg/svgo) tool:

```
cd path/to/ckeditor5

# Optimize all SVG files in the folder.
npm run clean-up-svg-icons path/to/icons/*.svg

# Optimize a single SVG file.
npm run clean-up-svg-icons path/to/icon/icon.svg
```

The script reduces the icon size up to 70%, depending on the software used to create it and the general complexity of the image.

**Note**: You may still need to tweak the source code of the SVG files manually after using the script:

* Sometimes SVGO leaves empty (transparent) groups `<g>...</g>`. They should be removed from the source and running `clean-up-svg-icons` again usually does that.
* Make sure the number of `<path>` elements is minimal. Merge paths whenever possible in the image processor before saving the file.
