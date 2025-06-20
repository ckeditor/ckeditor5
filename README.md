## Modified Packages

This fork includes customizations to the following CKEditor 5 packages:

### `packages/ckeditor5-build-classic`

The main package used in the FlockjayReact repository with the following additional plugins:

-   **[@phudak/ckeditor5-emoji](https://github.com/phudak3/ckeditor5-emoji)** - Emoji picker integration
-   **[@flockjay/ckeditor5-video](https://github.com/Flockjay/ckeditor5-video)** - Video plugin
-   **[@flockjay/ckeditor5-audio](https://github.com/Flockjay/ckeditor5-audio)** - Audio plugin
-   **[@flockjay/ckeditor5-file-upload](https://github.com/Flockjay/ckeditor5-file-upload)** - File upload plugin

### `packages/ckeditor5-image`

Extended to handle file uploads beyond just images. The logic is implemented in `packages/ckeditor5-image/src/imageupload/imageuploadui.ts`:

-   **Video files** → Uses `@flockjay/ckeditor5-video` plugin to embed video iframes
-   **Audio files** → Uses `@flockjay/ckeditor5-audio` plugin to embed audio iframes
-   **Other files** → Uses `@flockjay/ckeditor5-file-upload` plugin to embed as links

### `packages/ckeditor5-media-embed`

Enhanced to support iframe embedding for various media links. The implementation can be found in `packages/ckeditor5-media-embed/src/mediaembedediting.ts`.

**Supported platforms:**

-   **Video platforms:** YouTube, Vimeo, Dailymotion, Flockjay platform videos
-   **Social media:** Instagram, Twitter, Facebook, Flickr
-   **Audio platforms:** Spotify, Gong, Fireflies.AI, Fireflies.AI soundbites
-   **Productivity tools:** Google Docs/Slides/Spreadsheets, Loom
-   **Maps:** Google Maps
-   **Other:** GIF files
-   **Custom:** FJLink (Flockjay learning content) - embedded as library cards using the [Flockjay/embed](https://github.com/Flockjay/embed) repository

### [@flockjay/ckeditor5-video](https://github.com/Flockjay/ckeditor5-video)

This repository handles embedding uploaded video files in CKEditor 5.

**Changes made:**

-   **Dependency upgrades:** Updated to CKEditor 5 version 39.0.0 - [Upgrade version to 39.0.0](https://github.com/Flockjay/ckeditor5-video/commit/8406e28f7399d43b24fd5137b2dc2fa712cc0293)
-   **Enhanced functionality:**
    -   Added `data-document-id` support for video processing - [Include data document id](https://github.com/laurentDellaNegra/ckeditor5-video/commit/464bb11ceae5efd1101c0ff92ed6acf5ea010a1e)
    -   Added `poster` attribute support - [Include poster](https://github.com/laurentDellaNegra/ckeditor5-video/commit/b4e54453fa94b52802cf7226a28e3359cc00c0ae)
-   **Bug fixes:**
    -   [Fixed video matcher](https://github.com/Flockjay/ckeditor5-video/commit/31e93ba51e56ecb02786c9d3a82e5651e1a7fe49)
    -   [Fixed "cannot read parent of null" error](https://github.com/Flockjay/ckeditor5-video/commit/ca20e4007e6273dcb6080a26554dee873c6cf8cd)

### [@flockjay/ckeditor5-audio](https://github.com/Flockjay/ckeditor5-audio)

This repository handles embedding uploaded audio files in CKEditor 5.

**Changes made:**

-   **Dependency upgrades:** Updated to CKEditor 5 version 39.0.0 - [Upgrade version to 39.0.0](https://github.com/Flockjay/ckeditor5-audio/commit/a91927a34295c5c7479a3c6d2ca5d79b7569f440)
-   **API compatibility:** Fixed to use `findOptimalInsertionRange` instead of deprecated `findOptimalInsertionPosition` function - [Use findOptimalInsertionRange](https://github.com/Flockjay/ckeditor5-audio/commit/6d7c4b84b293a06854535130998fddb088835e57)
-   **Bug fixes:**
    -   [Fixed undefined reading isEmpty](https://github.com/Flockjay/ckeditor5-audio/commit/135b7abd1d3397314ca1ef672353a951f6d28de4)
    -   [Fixed copy-paste problem](https://github.com/Flockjay/ckeditor5-audio/commit/df9ccab57290233e4e7be3b77a8078f90953786a)

### [@flockjay/ckeditor5-file-upload](https://github.com/Flockjay/ckeditor5-file-upload)

This repository handles embedding uploaded files in CKEditor 5.

**Changes made:**

-   **Dependency upgrades:** Updated to CKEditor 5 version 39.0.0 - [Upgrade version to 39.0.0](https://github.com/Flockjay/ckeditor5-file-upload/commit/3e3186f7960ba3f60853c528cba24a474474f4c7)
-   **Enhanced functionality:** [Set linkHref from default URL](https://github.com/Flockjay/ckeditor5-file-upload/commit/142c227a27b341f53100d155a43f27c93a045ee6)
-   **Bug fixes:**
    -   [Fixed drag and drop issue](https://github.com/Flockjay/ckeditor5-file-upload/commit/8eee70876f65f9605b7e1e586c6d06c9e257f376)

## Development

### Testing

To run tests for the modified packages, run the following command in the root directory:

```bash
yarn run manual --files=build-classic|image|media-embed
```

**Example:** If you made changes to `packages/ckeditor5-media-embed/src/mediaembedediting.ts`, run:

```bash
yarn run manual --files=media-embed
```

Then test your changes at http://localhost:8125/

### Building

After implementing your changes, rebuild the `ckeditor5-build-classic` package:

```bash
cd packages/ckeditor5-build-classic
yarn run build
```

The build files will be generated in the `packages/ckeditor5-build-classic/build` directory. You can discard the `translations` directory and only commit the `ckeditor.js` and `ckeditor.js.map` files.

### Frontend Integration

After building and merging changes:

1. Update the commit hash in your frontend application to use the latest version
2. Reinstall the CKEditor 5 library:
    ```bash
    yarn install --ignore-scripts
    yarn start:dev
    ```

# CKEditor&nbsp;5 [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Check%20out%20CKEditor%205%20on%20GitHub&url=https%3A%2F%2Fgithub.com%2Fckeditor%2Fckeditor5)

[![npm version](https://badge.fury.io/js/ckeditor5.svg)](https://www.npmjs.com/package/ckeditor5)
[![Coverage Status](https://coveralls.io/repos/github/ckeditor/ckeditor5/badge.svg?branch=master)](https://coveralls.io/github/ckeditor/ckeditor5?branch=master)
[![Build Status](https://travis-ci.com/ckeditor/ckeditor5.svg?branch=master)](https://app.travis-ci.com/github/ckeditor/ckeditor5)
![TypeScript Support](https://badgen.net/badge/Built%20With/TypeScript/blue)

[![Join newsletter](https://img.shields.io/badge/join-newsletter-00cc99.svg)](http://eepurl.com/c3zRPr)
[![Follow Twitter](https://img.shields.io/badge/follow-twitter-00cc99.svg)](https://twitter.com/ckeditor)

CKEditor&nbsp;5 is an ultra-modern JavaScript rich-text editor with MVC architecture, a custom data model, and virtual DOM. It is written from scratch in TypeScript and has excellent webpack and Vite support. It provides every type of WYSIWYG editing solution imaginable with extensive collaboration support. From editors similar to Google Docs and Medium to Slack or Twitter-like applications, all is possible within a single editing framework. As a market leader, it is constantly expanded and updated.

![A composition of screenshots presenting various features of CKEditor 5 rich text editor](https://user-images.githubusercontent.com/1099479/179190754-f4aaf2b3-21cc-49c4-a454-8de4a00cc70e.jpg)

## Table of contents

-   [CKEditor&nbsp;5 ](#ckeditor-5-)
    -   [Table of contents](#table-of-contents)
    -   [Quick start](#quick-start)
        -   [CKEditor&nbsp;5 online builder](#ckeditor-5-online-builder)
        -   [CKEditor&nbsp;5 predefined builds](#ckeditor-5-predefined-builds)
            -   [Example installation](#example-installation)
        -   [TypeScript support](#typescript-support)
        -   [CKEditor&nbsp;5 advanced installation](#ckeditor-5-advanced-installation)
            -   [CKEditor&nbsp;5 Framework](#ckeditor-5-framework)
    -   [Documentation and FAQ](#documentation-and-faq)
    -   [Releases](#releases)
    -   [Editing and collaboration features](#editing-and-collaboration-features)
    -   [Contributing and project organization](#contributing-and-project-organization)
        -   [Ideas and discussions](#ideas-and-discussions)
        -   [Development](#development)
        -   [Reporting issues and feature requests](#reporting-issues-and-feature-requests)
    -   [License](#license)

## Quick start

### CKEditor&nbsp;5 online builder

The easiest way to start using CKEditor&nbsp;5 with all the features you need, is to prepare a customized build with the [online builder](https://ckeditor.com/ckeditor-5/online-builder/). All you need to do is choose the preferred predefined build as a base, add all the required plugins, and download the ready-to-use package. Refer to the [Online builder Quick start](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/quick-start.html#creating-custom-builds-with-online-builder) guide to follow this installation path.

### CKEditor&nbsp;5 predefined builds

CKEditor&nbsp;5 predefined builds are a set of ready-to-use rich text editors. Every build provides a single type of editor with a set of features and a default configuration.

The following CKEditor&nbsp;5 predefined builds are currently available:

-   [Classic editor](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#classic-editor)
-   [Inline editor](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#inline-editor)
-   [Balloon editor](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#balloon-editor)
-   [Balloon block editor](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#balloon-block-editor)
-   [Document editor](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#document-editor)

#### Example installation

Creating an editor using a CKEditor&nbsp;5 build is very simple and can be described in two steps:

1. Load the desired editor via the `<script>` tag.
2. Call the static `create()` method to create the editor.

In your HTML page, add an element that CKEditor should replace:

```html
<div id="editor"></div>
```

Load the classic editor build (you can choose between the [CDN](https://cdn.ckeditor.com/#ckeditor5), [npm](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#npm), and [zip downloads](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html#zip-download)):

```html
<script src="https://cdn.ckeditor.com/ckeditor5/39.0.0/classic/ckeditor.js"></script>
```

Call the [`ClassicEditor.create()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_editor-classic_classiceditor-ClassicEditor.html#static-function-create) method:

```html
<script>
	ClassicEditor.create(document.querySelector("#editor")).catch((error) => {
		console.error(error);
	});
</script>
```

You're ready to go!

To find out how to start with other builds, check the [Predefined builds](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/predefined-builds.html) guide in the CKEditor&nbsp;5 documentation.

### TypeScript support

CKEditor&nbsp;5 is a TypeScript project. Starting from v37.0.0, it offers native type definitions. Check out our dedicated guide to read more about [TypeScript support](https://ckeditor.com/docs/ckeditor5/latest/installation/working-with-typescript.html).

### CKEditor&nbsp;5 advanced installation

For more advanced users or those who need to integrate CKEditor&nbsp;5 with their applications, we have prepared several other, advanced methods to do it. You can:

-   Integrate the editor from source [using webpack](https://ckeditor.com/docs/ckeditor5/latest/installation/advanced/alternative-setups/integrating-from-source-webpack.html) or [Vite](https://ckeditor.com/docs/ckeditor5/latest/installation/advanced/alternative-setups/integrating-from-source-vite.html)
-   Use [DLL builds](https://ckeditor.com/docs/ckeditor5/latest/installation/advanced/alternative-setups/dll-builds.html)
-   Use some of the pre-made integrations with popular [JavaScript frameworks](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/frameworks/overview.html):
    -   [Angular](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/frameworks/angular.html)
    -   [React](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/frameworks/react.html)
    -   [Vue](https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/frameworks/vuejs-v3.html)

#### CKEditor&nbsp;5 Framework

CKEditor&nbsp;5 builds allow you to quickly and easily initialize one of the many types of editors in your application. At the same time, CKEditor&nbsp;5 is also a framework for creating custom-made rich text editing solutions.

To find out how to start building your editor from scratch go to the [CKEditor&nbsp;5 Framework overview](https://ckeditor.com/docs/ckeditor5/latest/framework/index.html) section of the CKEditor&nbsp;5 documentation.

## Documentation and FAQ

Extensive documentation dedicated to all things CKEditor&nbsp;5-related is available. You will find basic guides that will help you kick off your project, advanced deep-dive tutorials to tailor the editor to your specific needs, and help sections with solutions and answers to any of your possible questions. To find out more refer to the following [CKEditor&nbsp;5 documentation](https://ckeditor.com/docs/ckeditor5/latest/index.html) sections:

-   [Installing CKEditor&nbsp;5](https://ckeditor.com/docs/ckeditor5/latest/installation/index.html)
-   [CKEditor&nbsp;5 features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html)
-   [CKEditor&nbsp;5 examples](https://ckeditor.com/docs/ckeditor5/latest/examples/index.html)
-   [Updating CKEditor&nbsp;5](https://ckeditor.com/docs/ckeditor5/latest/updating/index.html)
-   [Getting CKEditor&nbsp;5 support](https://ckeditor.com/docs/ckeditor5/latest/support/index.html)
-   [CKEditor&nbsp;5 Framework](https://ckeditor.com/docs/ckeditor5/latest/framework/index.html)
-   [API documentation](https://ckeditor.com/docs/ckeditor5/latest/api/index.html)

For FAQ please go to the [CKEditor Ecosystem help center](https://support.ckeditor.com/hc/en-us).
For a high-level overview of the project see the [CKEditor Ecosystem website](https://ckeditor.com).

## Releases

Follow the [CKEditor&nbsp;5 changelog](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md) for release details and check out the CKEditor&nbsp;5 release blog posts on the [CKSource blog](https://ckeditor.com/blog/?category=releases&tags=CKEditor-5) for important release highlights and additional information.

## Editing and collaboration features

The CKEditor&nbsp;5 Framework offers access to a plethora of various plugins, supporting [all kinds of editing features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html).

From collaborative editing support providing comments and tracking changes, through editing tools that let users control the content looks and structure such as tables, lists, font styles, to accessibility helpers and multi-language support - CKEditor&nbsp;5 is easily extensible and customizable. Special duty features like Markdown input and output and source editing, or export to PDF and Word provide solutions for users with diverse and specialized needs. Images and videos are easily supported and CKEditor&nbsp;5 offers various upload and storage systems to manage these.

The number of options and the ease of customization and adding new ones make the editing experience even better for any environment and professional background.

Refer to the [CKEditor&nbsp;5 Features](https://ckeditor.com/docs/ckeditor5/latest/features/index.html) documentation for details.

## Contributing and project organization

### Ideas and discussions

The development repository of CKEditor&nbsp;5 is located at [https://github.com/ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5). This is the best place for bringing opinions and contributions. Letting the core team know if they are going in the right or wrong direction is great feedback and will be much appreciated!

### Development

CKEditor&nbsp;5 is a modular, multi-package, [monorepo](https://en.wikipedia.org/wiki/Monorepo) project. It consists of several packages that create the editing framework, based on which the feature packages are implemented.

The [`ckeditor5`](https://github.com/ckeditor/ckeditor5) repository is the place that centralizes the development of CKEditor&nbsp;5. It bundles different packages into a single place, adding the necessary helper tools for the development workflow, like the builder and the test runner. [Basic information on how to set up the development environment](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/development-environment.html) can be found in the documentation.

See the [official contributors' guide](https://ckeditor.com/docs/ckeditor5/latest/framework/contributing/contributing.html) to learn how to contribute your code to the project.

### Reporting issues and feature requests

Report issues in [the `ckeditor5` repository](https://github.com/ckeditor/ckeditor5/issues). Read more on the [Getting support](https://ckeditor.com/docs/ckeditor5/latest/support/getting-support.html) guide.

## License

Licensed under the terms of [GNU General Public License Version 2 or later](http://www.gnu.org/licenses/gpl.html). For full details about the license, please check the `LICENSE.md` file or [https://ckeditor.com/legal/ckeditor-oss-license](https://ckeditor.com/legal/ckeditor-oss-license).
