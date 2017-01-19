CKEditor 5 – development repository
===================================

[![Build Status](https://travis-ci.org/ckeditor/ckeditor5.svg?branch=master)](https://travis-ci.org/ckeditor/ckeditor5)
[![Dependency Status](https://img.shields.io/david/ckeditor/ckeditor5.svg)](https://david-dm.org/ckeditor/ckeditor5)
[![devDependency Status](https://img.shields.io/david/ckeditor/dev/ckeditor5.svg)](https://david-dm.org/ckeditor/ckeditor5?type=dev)

## Project Status (December 2016)

Version 0.5.0 was released on November 29, 2016. This is the 5th developer preview of the new CKEditor 5.

Read more in the [CKEditor 5 v0.5.0 release blog post](http://ckeditor.com/blog/5th-developer-preview-of-CKEditor-5-available) and check the [CKEditor 5 sample](https://ckeditor5.github.io/).

**It is not production ready** and will be followed by several releases before it reaches its first stable 1.0.0 version.

### Follow us!

* [Periodic news and updates](https://github.com/ckeditor/ckeditor5-design/labels/announcement) about the project.
* [Roadmap to 1.0.0 and beyond](https://github.com/ckeditor/ckeditor5-design/issues/172).

## Project Organization

### Design and discussions

[https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5) is the CKEditor 5 main development repository. This is the best place for bringing opinions and contributions. Letting the core team know if they are going in the right or wrong direction is great feedback and will be much appreciated!

(Note: At the early stage, most of the high-level discussions were lead in [ckeditor5-design](https://github.com/ckeditor/ckeditor5-design/issues) repository.)

### Development

CKEditor 5 is a modular, multi-package, multi-repository project. It consists of a several packages which create the editing framework, based on which the feature packages are implemented.

The [ckeditor5](https://github.com/ckeditor/ckeditor5) repository is the place that centralizes the development of CKEditor 5. It bundles different packages into a single place, adding the necessary helper tools for the development workflow, like the builder and the test runner. [Basic information on how to set up the development environment](https://github.com/ckeditor/ckeditor5/wiki/Development-Environment) can be found in the wiki pages.

### Reporting issues and feature requests

Each repository independently handles its issues. However, it's recommended to report issues in [this repository](https://github.com/ckeditor/ckeditor5/issues) unless you know to which specific repository the issue belongs.

## Packages

### Editing framework

<table>
<thead>
	<tr>
		<th>Package</th>
		<th>Status</th>
	</tr>
</thead>
<tbody>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-engine"><code>@ckeditor/ckeditor5-engine</code></a>
		<br>
		The editing engine.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-engine"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-engine.svg" alt="ckeditor5-engine npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-engine"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-engine/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-engine/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-engine.svg" alt="ckeditor5-engine coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-core"><code>@ckeditor/ckeditor5-core</code></a>
		<br>
		The core editor architecture.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-core"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-core.svg" alt="ckeditor5-core npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-core"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-core/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-core/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-core.svg" alt="ckeditor5-core coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-ui"><code>@ckeditor/ckeditor5-ui</code></a>
		<br>
		The editor UI library.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-ui"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-ui.svg" alt="ckeditor5-ui npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-ui"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-ui/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-ui/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-ui.svg" alt="ckeditor5-ui coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-utils"><code>@ckeditor/ckeditor5-utils</code></a>
		<br>
		The editor utils library.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-utils"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-utils.svg" alt="ckeditor5-utils npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-utils"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-utils/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-utils/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-utils.svg" alt="ckeditor5-utils coverage badge"></a>
	</td>
</tr>

</tbody>
</table>

### Editors

<table>
<thead>
	<tr>
		<th>Package</th>
		<th>Status</th>
	</tr>
</thead>
<tbody>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-editor-classic"><code>@ckeditor/ckeditor5-editor-classic</code></a>
		<br>
		The classic editor implementation.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-editor-classic.svg" alt="ckeditor5-editor-classic npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-editor-classic"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-editor-classic/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-editor-classic/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-editor-classic.svg" alt="ckeditor5-editor-classic coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-editor-inline"><code>@ckeditor/ckeditor5-editor-inline</code></a>
		<br>
		The inline editor implementation.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-editor-inline.svg" alt="ckeditor5-editor-inline npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-editor-inline"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-editor-inline/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-editor-inline/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-editor-inline.svg" alt="ckeditor5-editor-inline coverage badge"></a>
	</td>
</tr>

</tbody>
</table>

### Features

<table>
<thead>
	<tr>
		<th>Package</th>
		<th>Status</th>
	</tr>
</thead>
<tbody>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-autoformat"><code>@ckeditor/ckeditor5-autoformat</code></a>
		<br>
		Introduces the autoformatting feature. Replaces predefined characters with corresponding format (e.g. <code>**foo**</code> becomes bolded <code>&lt;strong&gt;foo&lt;/strong&gt;</code>).
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-autoformat.svg" alt="ckeditor5-autoformat npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-autoformat"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-autoformat/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-autoformat/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-autoformat.svg" alt="ckeditor5-autoformat coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-basic-styles"><code>@ckeditor/ckeditor5-basic-styles</code></a>
		<br>
		Introduces the bold and italic features.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-basic-styles.svg" alt="ckeditor5-basic-styles npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-basic-styles"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-basic-styles/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-basic-styles/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-basic-styles.svg" alt="ckeditor5-basic-styles coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-clipboard"><code>@ckeditor/ckeditor5-clipboard</code></a>
		<br>
		Introduces the clipboard integration.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-clipboard.svg" alt="ckeditor5-clipboard npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-clipboard"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-clipboard/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-clipboard/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-clipboard.svg" alt="ckeditor5-clipboard coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-enter"><code>@ckeditor/ckeditor5-enter</code></a>
		<br>
		Introduces the enter key feature.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-enter"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-enter.svg" alt="ckeditor5-enter npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-enter"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-enter/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-enter/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-enter.svg" alt="ckeditor5-enter coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-heading"><code>@ckeditor/ckeditor5-heading</code></a>
		<br>
		Introduces the heading feature.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-heading"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-heading.svg" alt="ckeditor5-heading npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-heading"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-heading/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-heading/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-heading.svg" alt="ckeditor5-heading coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-image"><code>@ckeditor/ckeditor5-image</code></a>
		<br>
		Introduces the image feature. Supports image styles and captioning.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-image"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-image.svg" alt="ckeditor5-image npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-image"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-image/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-image/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-image.svg" alt="ckeditor5-image coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-link"><code>@ckeditor/ckeditor5-link</code></a>
		<br>
		Introduces the link feature.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-link"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-link.svg" alt="ckeditor5-link npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-link"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-link/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-link/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-link.svg" alt="ckeditor5-link coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-list"><code>@ckeditor/ckeditor5-list</code></a>
		<br>
		Introduces numbered and bulleted lists feature.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-list"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-list.svg" alt="ckeditor5-list npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-list"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-list/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-list/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-list.svg" alt="ckeditor5-list coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-markdown-gfm"><code>@ckeditor/ckeditor5-markdown-gfm</code></a>
		<br>
		Introduces GitHub flavored Markdown data processor.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-markdown-gfm.svg" alt="ckeditor5-markdown-gfm npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-markdown-gfm"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-markdown-gfm/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-markdown-gfm/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-markdown-gfm.svg" alt="ckeditor5-markdown-gfm coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-paragraph"><code>@ckeditor/ckeditor5-paragraph</code></a>
		<br>
		Introduces the paragraph feature.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-paragraph.svg" alt="ckeditor5-paragraph npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-paragraph"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-paragraph/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-paragraph/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-paragraph.svg" alt="ckeditor5-paragraph coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-typing"><code>@ckeditor/ckeditor5-typing</code></a>
		<br>
		Introduces typing and deleting features.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-typing"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-typing.svg" alt="ckeditor5-typing npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-typing"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-typing/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-typing/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-typing.svg" alt="ckeditor5-typing coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-undo"><code>@ckeditor/ckeditor5-undo</code></a>
		<br>
		Introduces the undo feature.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-undo"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-undo.svg" alt="ckeditor5-undo npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-undo"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-undo/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-undo/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-undo.svg" alt="ckeditor5-undo coverage badge"></a>
	</td>
</tr>

</tbody>
</table>

### Themes

<table>
<thead>
	<tr>
		<th>Package</th>
		<th>Status</th>
	</tr>
</thead>
<tbody>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-theme-lark"><code>@ckeditor/ckeditor5-theme-lark</code></a>
		<br>
		The lark theme.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-theme-lark.svg" alt="ckeditor5-theme-lark npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-theme-lark"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-theme-lark/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-theme-lark/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-theme-lark.svg" alt="ckeditor5-theme-lark coverage badge"></a>
	</td>
</tr>

</tbody>
</table>

## License

Licensed under the GPL, LGPL and MPL licenses, at your choice. For full details about the license, please check the LICENSE.md file.
