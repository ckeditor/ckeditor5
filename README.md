CKEditor 5 [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Check%20out%20CKEditor%205%20on%20GitHub%20&url=https://github.com/ckeditor/ckeditor5)
===================================
A set of ready to use rich text editors created with a powerful framework. Made with real-time collaborative editing in mind.

![CKEditor 5 Classic editor build screenshot](https://github.com/ckeditor/ckeditor5/blob/master/.github/ckeditor%205%20classic%20screeshot.png)

[![Join the chat at https://gitter.im/ckeditor/ckeditor5](https://badges.gitter.im/ckeditor/ckeditor5.svg)](https://gitter.im/ckeditor/ckeditor5?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/ckeditor/ckeditor5.svg?branch=master)](https://travis-ci.org/ckeditor/ckeditor5)
[![Dependency Status](https://img.shields.io/david/ckeditor/ckeditor5.svg)](https://david-dm.org/ckeditor/ckeditor5)
[![devDependency Status](https://img.shields.io/david/dev/ckeditor/ckeditor5.svg)](https://david-dm.org/ckeditor/ckeditor5?type=dev)

## Table of contents

- [Quick start](#quick-start)
  -  [CKEditor 5 Builds](#ckeditor-5-builds)
     - [Classic editor](#classic-editor)
  -  [CKEditor 5 Framework](#ckeditor-5-framework)
- [Documentation and FAQ](#documentation-and-faq)
- [Contributing and project organization](#contributing-and-project-organization)
  - [Ideas and discussions](#ideas-and-discussions)
  - [Development](#development)
  - [Reporting issues and feature requests](#reporting-issues-and-feature-requests)
- [Releases](#releases)
- [Packages](#packages)
  - [Core libraries](#core-libraries)
  - [Editors](#editors)
  - [Features](#features)
  - [Themes](#themes)
  - [Builds](#builds)
- [License](#license)

## Quick start

### CKEditor 5 Builds

CKEditor 5 Builds are a set of ready to use rich text editors. Every "build" provides a single type of editor with a set of features and a default configuration.

The following CKEditor 5 Builds are currently available:
- [Classic editor](https://docs.ckeditor.com/ckeditor5/latest/builds/guides/overview.html#Classic-editor)
- [Inline editor](https://docs.ckeditor.com/ckeditor5/latest/builds/guides/overview.html#Inline-editor)
- [Balloon editor](https://docs.ckeditor.com/ckeditor5/latest/builds/guides/overview.html#Balloon-editor)

#### Classic editor

Creating an editor using a CKEditor 5 build is very simple and can be described in two steps:
1. Load the desired editor via the <script> tag.
2. Call the static create() method to create the editor.

In your HTML page add an element that CKEditor should replace:

`<textarea name="content" id="editor"></textarea>`

Load CKEditor 5, the classic editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

`<script src="https://cdn.ckeditor.com/ckeditor5/1.0.0-alpha.2/classic/ckeditor.js"></script>`

Call the [ClassicEditor.create()](https://docs.ckeditor.com/ckeditor5/latest/api/module_editor-classic_classiceditor-ClassicEditor.html#create) method:

```
<script>
    ClassicEditor
        .create( document.querySelector( '#editor' ) )
        .catch( error => {
            console.error( error );
        } );
</script>
```

You’re ready to go!

To find out how to start with other builds please go to the [quick start section of CKEditor 5 documentation](https://docs.ckeditor.com/ckeditor5/latest/builds/guides/quick-start.html).

### CKEditor 5 Framework

CKEditor 5 Builds allow you to quickly and easily initialize one of the many types of editors in your application. At the same time, CKEditor 5 is also a framework for creating custom-made rich text editing solutions.

To find out how to start building your own editor from scratch go to [CKEditor 5 Framework overview section of CKEditor 5 documentation](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/overview.html). 

## Documentation and FAQ

To find out more see the following [CKEditor 5 documentation](https://docs.ckeditor.com/ckeditor5/latest/index.html) sections:

* [API documentation](https://docs.ckeditor.com/ckeditor5/latest/api/index.html)
* [CKEditor 5 Framework documentation](https://docs.ckeditor.com/ckeditor5/latest/framework/index.html)
* [CKEditor 5 Builds documentation](https://docs.ckeditor.com/ckeditor5/latest/builds/index.html)
* [CKEditor 5 Features documentation](https://docs.ckeditor.com/ckeditor5/latest/features/index.html)
* [CKEditor 5 Examples](https://docs.ckeditor.com/ckeditor5/latest/examples/index.html)

The documentation is far from being complete and will be constantly evolving (as will the editor) until it is ready for v1.0.0.

For FAQ please go to the [CKEditor Ecosystem help center](https://support.ckeditor.com/hc/en-us).
For a high-level overview of the project see the [CKEditor Ecosystem website](https://ckeditor.com).

## Contributing and project organization

### Ideas and discussions

The main development repository of CKEditor 5 is located at [https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5). This is the best place for bringing opinions and contributions. Letting the core team know if they are going in the right or wrong direction is great feedback and will be much appreciated!

### Development

CKEditor 5 is a modular, multi-package, multi-repository project. It consists of a several packages which create the editing framework, based on which the feature packages are implemented.

The [ckeditor5](https://github.com/ckeditor/ckeditor5) repository is the place that centralizes the development of CKEditor 5. It bundles different packages into a single place, adding the necessary helper tools for the development workflow, like the builder and the test runner. [Basic information on how to set up the development environment](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/contributing/development-environment.html) can be found in the documentation.

### Reporting issues and feature requests

Each repository independently handles its issues. However, it's recommended to report issues in [this repository](https://github.com/ckeditor/ckeditor5/issues) unless you know to which specific repository the issue belongs.

Read more in the [Support](https://docs.ckeditor.com/ckeditor5/latest/framework/guides/support/getting-support.html) page.

## Releases

The latest five releases:

* [Second alpha release of CKEditor 5 v1.0.0](https://ckeditor.com/blog/Second-alpha-release-of-CKEditor-5-v1.0.0/)
* [First alpha release of CKEditor 5 v1.0.0](https://ckeditor.com/blog/First-alpha-release-of-CKEditor-5-v1.0.0/)
* [11th developer preview of CKEditor 5](https://ckeditor.com/blog/11th-developer-preview-of-CKEditor-5-available/)
* [10th developer preview of CKEditor 5 available](https://ckeditor.com/blog/10th-developer-preview-of-CKEditor-5-available/)
* [9th developer preview of CKEditor 5 available](https://ckeditor.com/blog/9th-developer-preview-of-CKEditor-5-available/)

For more CKEditor 5 release blog posts [browse the CKEditor blog](https://ckeditor.com/blog/?category=releases&tags=CKEditor-5).

## Packages

### Core libraries

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
		The editor utilities library.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-utils"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-utils.svg" alt="ckeditor5-utils npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-utils"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-utils/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-utils/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-utils.svg" alt="ckeditor5-utils coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-upload"><code>@ckeditor/ckeditor5-upload</code></a>
		<br>
		Introduces the file upload utilities.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-upload"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-upload.svg" alt="ckeditor5-upload npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-upload"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-upload/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-upload/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-upload.svg" alt="ckeditor5-upload coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-widget"><code>@ckeditor/ckeditor5-widget</code></a>
		<br>
		Introduces the widget API.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-widget"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-widget.svg" alt="ckeditor5-widget npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-widget"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-widget/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-widget/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-widget.svg" alt="ckeditor5-widget coverage badge"></a>
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

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-editor-balloon"><code>@ckeditor/ckeditor5-editor-balloon</code></a>
		<br>
		The balloon editor (Medium-like) implementation.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-editor-balloon.svg" alt="ckeditor5-editor-balloon npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-editor-balloon"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-editor-balloon/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-editor-balloon/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-editor-balloon.svg" alt="ckeditor5-editor-balloon coverage badge"></a>
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
		<a href="https://github.com/ckeditor/ckeditor5-adapter-ckfinder"><code>@ckeditor/ckeditor5-adapter-ckfinder</code></a>
		<br>
		Introduces the <a href="https://ckeditor.com/ckeditor-4/ckfinder/">CKFinder</a> adapter for features which require upload capabilities.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-adapter-ckfinder.svg" alt="ckeditor5-adapter-ckfinder npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-adapter-ckfinder"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-adapter-ckfinder/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-adapter-ckfinder/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-adapter-ckfinder.svg" alt="ckeditor5-adapter-ckfinder coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-autoformat"><code>@ckeditor/ckeditor5-autoformat</code></a>
		<br>
		Introduces the autoformatting feature. Replaces predefined characters with a corresponding format (e.g. <code>**foo**</code> becomes bolded <code>&lt;strong&gt;foo&lt;/strong&gt;</code>).
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
		Introduces the bold, italic, underline and code features.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-basic-styles.svg" alt="ckeditor5-basic-styles npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-basic-styles"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-basic-styles/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-basic-styles/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-basic-styles.svg" alt="ckeditor5-basic-styles coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-block-quote"><code>@ckeditor/ckeditor5-block-quote</code></a>
		<br>
		Introduces the block quote feature.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-block-quote.svg" alt="ckeditor5-block-quote npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-block-quote"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-block-quote/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-block-quote/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-block-quote.svg" alt="ckeditor5-block-quote coverage badge"></a>
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
		Introduces the Enter key feature.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-enter"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-enter.svg" alt="ckeditor5-enter npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-enter"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-enter/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-enter/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-enter.svg" alt="ckeditor5-enter coverage badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-easy-image"><code>@ckeditor/ckeditor5-easy-image</code></a>
		<br>
		Introduces Easy Image with Cloud Services feature.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-easy-image.svg" alt="ckeditor5-easy-image npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-easy-image"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-easy-image/master.svg" alt="build status badge"></a>
		<a href="https://codeclimate.com/github/ckeditor/ckeditor5-easy-image/coverage"><img src="https://img.shields.io/codeclimate/coverage/github/ckeditor/ckeditor5-easy-image.svg" alt="ckeditor5-easy-image coverage badge"></a>
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
		Introduces GitHub-flavored Markdown data processor.
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
		The Lark theme.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-theme-lark.svg" alt="ckeditor5-theme-lark npm package badge"></a>
		<a href="https://travis-ci.org/ckeditor/ckeditor5-theme-lark"><img src="https://img.shields.io/travis/ckeditor/ckeditor5-theme-lark/master.svg" alt="build status badge"></a>
	</td>
</tr>

</tbody>
</table>

### Builds

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
		<a href="https://github.com/ckeditor/ckeditor5-build-classic"><code>@ckeditor/ckeditor5-build-classic</code></a>
		<br>
		The classic editor build.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-build-classic.svg" alt="ckeditor5-build-classic npm package badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-build-inline"><code>@ckeditor/ckeditor5-build-inline</code></a>
		<br>
		The inline editor build.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-build-inline.svg" alt="ckeditor5-build-inline npm package badge"></a>
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-build-balloon"><code>@ckeditor/ckeditor5-build-balloon</code></a>
		<br>
		The balloon editor (Medium-like) build.
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-build-balloon.svg" alt="ckeditor5-build-balloon npm package badge"></a>
	</td>
</tr>

</tbody>
</table>

## License

Licensed under the GPL, LGPL and MPL licenses, at your choice. For full details about the license, please check the LICENSE.md file.
