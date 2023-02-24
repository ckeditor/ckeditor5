CKEditor 5 [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Check%20out%20CKEditor%205%20on%20GitHub&url=https%3A%2F%2Fgithub.com%2Fckeditor%2Fckeditor5)
===================================

[![npm version](https://badge.fury.io/js/ckeditor5.svg)](https://www.npmjs.com/package/ckeditor5)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5?branch=master)
[![Build Status](https://travis-ci.com/ckeditor/ckeditor5.svg?branch=master)](https://app.travis-ci.com/github/ckeditor/ckeditor5)
![Dependency Status](https://img.shields.io/librariesio/release/npm/ckeditor5)

[![Join newsletter](https://img.shields.io/badge/join-newsletter-00cc99.svg)](http://eepurl.com/c3zRPr)
[![Follow twitter](https://img.shields.io/badge/follow-twitter-00cc99.svg)](https://twitter.com/ckeditor)

CKEditor 5 is an ultra-modern JavaScript rich text editor with MVC architecture, custom data model and virtual DOM. It is written from scratch in ES6 and has excellent webpack support. It provides every type of WYSIWYG editing solution imaginable with extensive collaboration support. From editors similar to Google Docs and Medium, to Slack or Twitter like applications, all of which is possible within a single editing framework. As a market leader, it is constantly expanded and updated.

![A composition of screenshots presenting various features of CKEditor 5 rich text editor](https://user-images.githubusercontent.com/1099479/179190754-f4aaf2b3-21cc-49c4-a454-8de4a00cc70e.jpg)

## Table of contents

* [Quick start](#quick-start)
   * [CKEditor 5 Online builder](#ckeditor-5-online-builder)
   * [CKEditor 5 predefined builds](#ckeditor-5-predefined-builds)
   * [Other CKEditor 5 installation methods](#ckeditor-5-advanced-installation)
* [Documentation and FAQ](#documentation-and-faq)
* [Releases](#releases)
* [CKEditor 5 features](#editing-and-collaboration-features)
* [Contributing and project organization](#contributing-and-project-organization)
   * [Ideas and discussions](#ideas-and-discussions)
   * [Development](#development)
   * [Reporting issues and feature requests](#reporting-issues-and-feature-requests)
* [License](#license)

## Quick start

### CKEditor 5 Online builder

The easies way to start using CKEditor 5 with all the functions and features you need, is preparing a customized build with the [Online builder](https://ckeditor.com/ckeditor-5/online-builder/). All you need to do is choose the preferred predefined build as a base, add all the required plugins and download the ready package that can be then used out of the box. Refer to the [Online builder Quick start](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html#creating-custom-builds-with-online-builder) guide to follow this installation path.

### CKEditor 5 predefined builds

CKEditor 5 predefined builds are a set of ready-to-use rich text editors. Every such build provides a single type of editor with a set of features and a default configuration.

The following CKEditor 5 predefined builds are currently available:

* [Classic editor](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#classic-editor)
* [Inline editor](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#inline-editor)
* [Balloon editor](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#balloon-editor)
* [Balloon block editor](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#balloon-block-editor)
* [Document editor](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#document-editor)

#### Example installation

Creating an editor using a CKEditor 5 build is very simple and can be described in two steps:

1. Load the desired editor via the `<script>` tag.
2. Call the static `create()` method to create the editor.

In your HTML page add an element that CKEditor should replace:

```html
<div id="editor"></div>
```

Load the classic editor build (you can choose between [CDN](https://cdn.ckeditor.com/#ckeditor5), [npm](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#npm) and [zip downloads](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#zip-download)):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/36.0.1/classic/ckeditor.js"></script>
```

Call the [`ClassicEditor.create()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_editor-classic_classiceditor-ClassicEditor.html#static-function-create) method:

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

To find out how to start with other builds check the [Predefined builds](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html) guide in the CKEditor 5 documentation.

### CKEditor 5 advanced installation

For more advanced users, or those who need to integrate CKEditor 5 with their own applications, we have prepared several other, advanced methods to do it. You can [integrate the editor from source](https://ckeditor.com/docs/ckeditor5/latest/installation/advanced/alternative-setups/integrating-from-source-webpack.html), use [DLL builds](https://ckeditor.com/docs/ckeditor5/latest/installation/advanced/alternative-setups/dll-builds.html) or utilize some of the pre-made integrations with popular [JavaScript frameworks](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/frameworks/overview.html), like [Angular](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/frameworks/angular.html), [React](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/frameworks/react.html) or [Vue](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/frameworks/vuejs-v3.html).

#### CKEditor 5 Framework

CKEditor 5 builds allow you to quickly and easily initialize one of the many types of editors in your application. At the same time, CKEditor 5 is also a framework for creating custom-made rich text editing solutions.

To find out how to start building your own editor from scratch go to the [CKEditor 5 Framework overview](https://ckeditor.com/docs/ckeditor5/latest/framework/index.html) section of CKEditor 5 documentation.

## Documentation and FAQ

An extensive, vast documentation dedicated to all thing CKEditor 5-related is available handy. You will find basic guides that will help you kick off your project, advanced deep-dive tutorials to tailor it your specific needs and help sections with solutions and answers to any of your possible questions. To find out more see the following [CKEditor 5 documentation](https://ckeditor.com/docs/ckeditor5/latest/index.html) sections:

* [Installing CKEditor 5](https://ckeditor.com/docs/ckeditor5/latest/installation/index.html)
* [CKEditor 5 features documentation](https://ckeditor.com/docs/ckeditor5/latest/features/index.html)
* [CKEditor 5 examples](https://ckeditor.com/docs/ckeditor5/latest/examples/index.html)
* [Updating CKEditor 5](https://ckeditor.com/docs/ckeditor5/latest/updating/index.html)
* [Getting CKEditor 5 support](https://ckeditor.com/docs/ckeditor5/latest/support/index.html)
* [CKEditor 5 Framework documentation](https://ckeditor.com/docs/ckeditor5/latest/framework/index.html)
* [API documentation](https://ckeditor.com/docs/ckeditor5/latest/api/index.html)

For FAQ please go to the [CKEditor Ecosystem help center](https://support.ckeditor.com/hc/en-us).
For a high-level overview of the project see the [CKEditor Ecosystem website](https://ckeditor.com).

## Releases

Follow the [CKEditor 5 changelog](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md) for release details and check out the CKEditor 5 release blog posts on the [CKSource blog](https://ckeditor.com/blog/?category=releases&tags=CKEditor-5) for important release highlights and additional information.

## Editing and collaboration features

The CKEditor 5 Framework offers access to plethora of various plugins, supporting [all kinds of editing features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html).

From collaborative editing support providing comments and tracking changes, through editing tools that let users control the content looks and structure such as tables, lists, font styles, to accessibility helpers and multi-language support - CKEditor 5 is easily extendable and customizable. Special duty features like Markdown input and output and source editing, or export to PDF and Word provide solutions for users with diverse and specialized needs and demands. Images and videos are easily supported and CKEditor 5 offers various upload and storage systems to manage these.

The number of options and the easiness of customization and adding new ones makes the editing experience even better for any potential environments and professional backgrounds.

Refer to the [CKEditor 5 Features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html) documentation for details.

## Contributing and project organization

### Ideas and discussions

The development repository of CKEditor 5 is located at [https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5). This is the best place for bringing opinions and contributions. Letting the core team know if they are going in the right or wrong direction is great feedback and will be much appreciated!

### Development

CKEditor 5 is a modular, multi-package, [monorepo](https://en.wikipedia.org/wiki/Monorepo) project. It consists of several packages that create the editing framework, based on which the feature packages are implemented.

The [`ckeditor5`](https://github.com/ckeditor/ckeditor5) repository is the place that centralizes the development of CKEditor 5. It bundles different packages into a single place, adding the necessary helper tools for the development workflow, like the builder and the test runner. [Basic information on how to set up the development environment](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/development-environment.html) can be found in the documentation.

See the [official contributors' guide](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/contributing.html) to learn how to contribute your code to the project.

### Reporting issues and feature requests

Each repository handles its issues independently. However, it is recommended to report issues in [this repository](https://github.com/ckeditor/ckeditor5/issues) unless you know to which specific repository the issue belongs.

Read more on the [Getting support](https://ckeditor.com/docs/ckeditor5/latest/support/getting-support.html) guide.

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the `LICENSE.md` file or [https://ckeditor.com/legal/ckeditor-oss-license](https://ckeditor.com/legal/ckeditor-oss-license).
