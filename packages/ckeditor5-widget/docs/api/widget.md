---
category: api-reference
---

# CKEditor&nbsp;5 widget API

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-widget.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)

This package implements the widget API for CKEditor&nbsp;5.

The API consists of a few primitives and helpers that make it easy to implement rich content units such as images with captions.

## Documentation

Browse the API documentation of this package by using the module tree on the left.

The widget API consists of two layers:

* The {@link module:widget/widget~Widget} plugin that enables base support for this feature. Usually, your plugin which implements a specific widget will define its reliance on the `Widget` plugin via its {@link module:core/plugin~PluginStaticMembers.requires `Plugin.requires`} property.
* The {@link module:widget/utils~toWidget `toWidget()`} and {@link module:widget/utils~toWidgetEditable `toWidgetEditable()`} functions. You need to use them during the conversion to make a specific element either a widget or its nested editable. See their documentation for more details.

Besides these mentioned core functionalities, this package implements the following utilities:

* The {@link module:widget/widgettoolbarrepository~WidgetToolbarRepository `WidgetToolbarRepository`} plugin which exposes a nice API for registering widget toolbars.
* A few helper functions for managing widgets in the {@link module:widget/utils `@ckeditor/ckeditor5-widget/utils`} module.

<info-box>
	The widget API is proposed in a different way than it was in CKEditor 4. It is just a set of utilities that allow you to implement typical object-like entities. Most of the work actually happens in the {@link api/engine engine} and this API's only role is to control it.
</info-box>

## Installation

This package is part of our open-source aggregate package.

```bash
npm install ckeditor5
```

## Contribute

The source code of this package is available on GitHub in [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-widget](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-widget).

## External links

* [`@ckeditor/ckeditor5-widget` on npm](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)
* [`ckeditor/ckeditor5-widget` on GitHub](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-widget)
* [Issue tracker](https://github.com/ckeditor/ckeditor5/issues)
* [Changelog](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md)
