---
category: api-reference
---

# CKEditor 5 widget API

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-widget.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)

This package implements the widget API for CKEditor 5.

The API consists of a few primitives and helpers that make it easy to implement rich content units such as images with captions.

## Documentation

Browse the API documentation of this package by using the module tree on the left.

The widget API consists of two layers:

* The {@link module:widget/widget~Widget} plugin which enables base support for this feature. Usually, your plugin which implements a specific widget will define its reliance on the `Widget` plugin via its {@link module:core/plugin~Plugin.requires `Plugin.requires`} property.
* The {@link module:widget/utils~toWidget `toWidget()`} {@link module:widget/utils~toWidgetEditable `toWidgetEditable()`} functions which need to be used during the conversion in order to make a specific element either a widget or a widget's nested editable. See their documentation for more details.

Besides the above mentioned core functionalities, this package implements the following utils:

* The {@link module:widget/widgettoolbarrepository~WidgetToolbarRepository `WidgetToolbarRepository`} plugin which exposes a nice API for registering widget toolbars.
* A couple of helper functions for managing widgets in the {@link module:widget/utils `@ckeditor/ckeditor5-widget/utils`} module.

<info-box>
	The widget API is proposed in a very different way than it was in CKEditor 4. It is just a set of utilities that allow you to implement typical object-like entities. Most of the work actually happens in the {@link api/engine engine} and this API's role is only to properly conduct the engine.
</info-box>

## Installation

```bash
npm install --save @ckeditor/ckeditor5-widget
```

## Contribute

The source code of this package is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-widget.

## External links

* [`@ckeditor/ckeditor5-widget` on npm](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)
* [`ckeditor/ckeditor5-widget` on GitHub](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-widget)
* [Issue tracker](https://github.com/ckeditor/ckeditor5/issues)
* [Changelog](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md)
