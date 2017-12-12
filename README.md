CKEditor 5 [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Check%20out%20CKEditor%205%20on%20GitHub%20&url=https://github.com/ckeditor/ckeditor5)
===================================

[![Join the chat at https://gitter.im/ckeditor/ckeditor5](https://badges.gitter.im/ckeditor/ckeditor5.svg)](https://gitter.im/ckeditor/ckeditor5?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/ckeditor/ckeditor5.svg?branch=master)](https://travis-ci.org/ckeditor/ckeditor5)
[![Dependency Status](https://img.shields.io/david/ckeditor/ckeditor5.svg)](https://david-dm.org/ckeditor/ckeditor5)
[![devDependency Status](https://img.shields.io/david/dev/ckeditor/ckeditor5.svg)](https://david-dm.org/ckeditor/ckeditor5?type=dev)

A set of ready to use rich text editors created with a powerful framework. Made with real-time collaborative editing in mind.

![CKEditor 5 Classic editor build screenshot](https://github.com/ckeditor/ckeditor5/blob/master/.github/ckeditor%205%20classic%20screeshot.png)

## Table of contents

* [Quick start](#quick-start)
   * [CKEditor 5 Builds](#ckeditor-5-builds)
   * [CKEditor 5 Framework](#ckeditor-5-framework)
* [Documentation and FAQ](#documentation-and-faq)
* [Contributing and project organization](#contributing-and-project-organization)
   * [Ideas and discussions](#ideas-and-discussions)
   * [Development](#development)
   * [Reporting issues and feature requests](#reporting-issues-and-feature-requests)
* [Releases](#releases)
* [Packages](#packages)
   * [Core libraries](#core-libraries)
   * [Editors](#editors)
   * [Features](#features)
   * [Themes](#themes)
   * [Builds](#builds)
* [License](#license)

## Quick start

### CKEditor 5 Builds

CKEditor 5 Builds are a set of ready to use rich text editors. Every "build" provides a single type of editor with a set of features and a default configuration.

The following CKEditor 5 Builds are currently available:

* [Classic editor](https://docs.ckeditor.com/ckeditor5/latest/builds/guides/overview.html#Classic-editor)
* [Inline editor](https://docs.ckeditor.com/ckeditor5/latest/builds/guides/overview.html#Inline-editor)
* [Balloon editor](https://docs.ckeditor.com/ckeditor5/latest/builds/guides/overview.html#Balloon-editor)

#### Example

Creating an editor using a CKEditor 5 build is very simple and can be described in two steps:

1. Load the desired editor via the `<script>` tag.
2. Call the static `create()` method to create the editor.

In your HTML page add an element that CKEditor should replace:

```html
<textarea name="content" id="editor"></textarea>
```

Load the classic editor build (here [CDN](https://cdn.ckeditor.com/) location is used):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/<version>/classic/ckeditor.js"></script>
```

Call the [`ClassicEditor.create()`](https://docs.ckeditor.com/ckeditor5/latest/api/module_editor-classic_classiceditor-ClassicEditor.html#create) method:

```html
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

* [Second alpha release of CKEditor 5 v1.0.0](https://ckeditor.com/blog/Second-alpha-release-of-CKEditor-5-v1.0.0/) (<time datetime="2017-11-14T12:52:18Z"><i>Nov 14, 2017</i></time>)
* [First alpha release of CKEditor 5 v1.0.0](https://ckeditor.com/blog/First-alpha-release-of-CKEditor-5-v1.0.0/) (<time datetime="2017-10-03T13:09:29Z"><i>Oct 3, 2017</i></time>)
* [11th developer preview of CKEditor 5](https://ckeditor.com/blog/11th-developer-preview-of-CKEditor-5-available/) (<time datetime="2017-09-03T19:35:48Z"><i>Sep 3, 2017</i></time>)
* [10th developer preview of CKEditor 5 available](https://ckeditor.com/blog/10th-developer-preview-of-CKEditor-5-available/) (<time datetime="2017-05-07T21:57:04Z"><i>May 7, 2017</i></time>)
* [9th developer preview of CKEditor 5 available](https://ckeditor.com/blog/9th-developer-preview-of-CKEditor-5-available/) (<time datetime="2017-04-05T17:58:27Z"><i>Apr 5, 2017</i></time>)

For more CKEditor 5 release blog posts [browse the CKEditor blog](https://ckeditor.com/blog/?category=releases&tags=CKEditor-5).

## Packages

### Core libraries

<table>
<thead>
	<tr>
		<th width="30%">Name</th>
		<th width="15%">Version</th>
		<th width="55%">Description</th>
	</tr>
</thead>
<tbody>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-engine"><code>@ckeditor/ckeditor5-engine</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-engine"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-engine.svg" alt="@ckeditor/ckeditor5-engine npm package badge"></a>
	</td>
	<td>
		The editing engine.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-core"><code>@ckeditor/ckeditor5-core</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-core"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-core.svg" alt="@ckeditor/ckeditor5-core npm package badge"></a>
	</td>
	<td>
		The core editor architecture.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-ui"><code>@ckeditor/ckeditor5-ui</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-ui"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-ui.svg" alt="@ckeditor/ckeditor5-ui npm package badge"></a>
	</td>
	<td>
		The editor UI library.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-utils"><code>@ckeditor/ckeditor5-utils</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-utils"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-utils.svg" alt="@ckeditor/ckeditor5-utils npm package badge"></a>
	</td>
	<td>
		The editor utilities library.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-upload"><code>@ckeditor/ckeditor5-upload</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-upload"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-upload.svg" alt="@ckeditor/ckeditor5-upload npm package badge"></a>
	</td>
	<td>
		Introduces the file upload utilities.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-widget"><code>@ckeditor/ckeditor5-widget</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-widget"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-widget.svg" alt="@ckeditor/ckeditor5-widget npm package badge"></a>
	</td>
	<td>
		Introduces the widget API.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-cloudservices"><code>@ckeditor/ckeditor5-cloudservices</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-cloudservices"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-cloudservices.svg" alt="@ckeditor/ckeditor5-cloudservices npm package badge"></a>
	</td>
	<td>
		CKEditor 5's Cloud Services integration layer.
	</td>
</tr>

</tbody>
</table>

### Editors

<table>
<thead>
	<tr>
		<th width="30%">Name</th>
		<th width="15%">Version</th>
		<th width="55%">Description</th>
	</tr>
</thead>
<tbody>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-editor-classic"><code>@ckeditor/ckeditor5-editor-classic</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-classic"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-editor-classic.svg" alt="@ckeditor/ckeditor5-editor-classic npm package badge"></a>
	</td>
	<td>
		The classic editor implementation.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-editor-inline"><code>@ckeditor/ckeditor5-editor-inline</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-inline"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-editor-inline.svg" alt="@ckeditor/ckeditor5-editor-inline npm package badge"></a>
	</td>
	<td>
		The inline editor implementation.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-editor-balloon"><code>@ckeditor/ckeditor5-editor-balloon</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-editor-balloon"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-editor-balloon.svg" alt="@ckeditor/ckeditor5-editor-balloon npm package badge"></a>
	</td>
	<td>
		The balloon editor (Medium-like) implementation.
	</td>
</tr>

</tbody>
</table>

### Features

<table>
<thead>
	<tr>
		<th width="30%">Name</th>
		<th width="15%">Version</th>
		<th width="55%">Description</th>
	</tr>
</thead>
<tbody>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-adapter-ckfinder"><code>@ckeditor/ckeditor5-adapter-ckfinder</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-adapter-ckfinder"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-adapter-ckfinder.svg" alt="@ckeditor/ckeditor5-adapter-ckfinder npm package badge"></a>
	</td>
	<td>
		Introduces the <a href="https://ckeditor.com/ckeditor-4/ckfinder/">CKFinder</a> adapter for features which require upload capabilities.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-autoformat"><code>@ckeditor/ckeditor5-autoformat</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-autoformat"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-autoformat.svg" alt="@ckeditor/ckeditor5-autoformat npm package badge"></a>
	</td>
	<td>
		Introduces the autoformatting feature. Replaces predefined characters with a corresponding format (e.g. <code>**foo**</code> becomes bolded <code>&lt;strong&gt;foo&lt;/strong&gt;</code>).
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-basic-styles"><code>@ckeditor/ckeditor5-basic-styles</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-basic-styles"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-basic-styles.svg" alt="@ckeditor/ckeditor5-basic-styles npm package badge"></a>
	</td>
	<td>
		Introduces the bold, italic, underline and code features.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-block-quote"><code>@ckeditor/ckeditor5-block-quote</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-block-quote"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-block-quote.svg" alt="@ckeditor/ckeditor5-block-quote npm package badge"></a>
	</td>
	<td>
		Introduces the block quote feature.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-clipboard"><code>@ckeditor/ckeditor5-clipboard</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-clipboard"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-clipboard.svg" alt="@ckeditor/ckeditor5-clipboard npm package badge"></a>
	</td>
	<td>
		Introduces the clipboard integration.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-enter"><code>@ckeditor/ckeditor5-enter</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-enter"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-enter.svg" alt="@ckeditor/ckeditor5-enter npm package badge"></a>
	</td>
	<td>
		Introduces the Enter key feature.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-easy-image"><code>@ckeditor/ckeditor5-easy-image</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-easy-image"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-easy-image.svg" alt="@ckeditor/ckeditor5-easy-image npm package badge"></a>
	</td>
	<td>
		Introduces Easy Image with Cloud Services feature.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-heading"><code>@ckeditor/ckeditor5-heading</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-heading"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-heading.svg" alt="@ckeditor/ckeditor5-heading npm package badge"></a>
	</td>
	<td>
		Introduces the heading feature.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-image"><code>@ckeditor/ckeditor5-image</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-image"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-image.svg" alt="@ckeditor/ckeditor5-image npm package badge"></a>
	</td>
	<td>
		Introduces the image feature. Supports image styles and captioning.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-link"><code>@ckeditor/ckeditor5-link</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-link"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-link.svg" alt="@ckeditor/ckeditor5-link npm package badge"></a>
	</td>
	<td>
		Introduces the link feature.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-list"><code>@ckeditor/ckeditor5-list</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-list"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-list.svg" alt="@ckeditor/ckeditor5-list npm package badge"></a>
	</td>
	<td>
		Introduces numbered and bulleted lists feature.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-markdown-gfm"><code>@ckeditor/ckeditor5-markdown-gfm</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-markdown-gfm"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-markdown-gfm.svg" alt="@ckeditor/ckeditor5-markdown-gfm npm package badge"></a>
	</td>
	<td>
		Introduces GitHub-flavored Markdown data processor.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-paragraph"><code>@ckeditor/ckeditor5-paragraph</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-paragraph"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-paragraph.svg" alt="@ckeditor/ckeditor5-paragraph npm package badge"></a>
	</td>
	<td>
		Introduces the paragraph feature.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-typing"><code>@ckeditor/ckeditor5-typing</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-typing"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-typing.svg" alt="@ckeditor/ckeditor5-typing npm package badge"></a>
	</td>
	<td>
		Introduces typing and deleting features.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-undo"><code>@ckeditor/ckeditor5-undo</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-undo"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-undo.svg" alt="@ckeditor/ckeditor5-undo npm package badge"></a>
	</td>
	<td>
		Introduces the undo feature.
	</td>
</tr>

</tbody>
</table>

### Themes

<table>
<thead>
	<tr>
		<th width="30%">Name</th>
		<th width="15%">Version</th>
		<th width="55%">Description</th>
	</tr>
</thead>
<tbody>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-theme-lark"><code>@ckeditor/ckeditor5-theme-lark</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-theme-lark"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-theme-lark.svg" alt="@ckeditor/ckeditor5-theme-lark npm package badge"></a>
	</td>
	<td>
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
		<th width="30%">Name</th>
		<th width="15%">Version</th>
		<th width="55%">Description</th>
	</tr>
</thead>
<tbody>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-build-classic"><code>@ckeditor/ckeditor5-build-classic</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-build-classic.svg" alt="@ckeditor/ckeditor5-build-classic npm package badge"></a>
	</td>
	<td>
		The classic editor build.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-build-inline"><code>@ckeditor/ckeditor5-build-inline</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-build-inline.svg" alt="@ckeditor/ckeditor5-build-inline npm package badge"></a>
	</td>
	<td>
		The inline editor build.
	</td>
</tr>

<tr>
	<td>
		<a href="https://github.com/ckeditor/ckeditor5-build-balloon"><code>@ckeditor/ckeditor5-build-balloon</code></a>
	</td>
	<td>
		<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon"><img src="https://img.shields.io/npm/v/@ckeditor/ckeditor5-build-balloon.svg" alt="@ckeditor/ckeditor5-build-balloon npm package badge"></a>
	</td>
	<td>
		The balloon editor (Medium-like) build.
	</td>
</tr>

</tbody>
</table>

## License

Licensed under the GPL, LGPL and MPL licenses, at your choice. For full details about the license, please check the LICENSE.md file.
