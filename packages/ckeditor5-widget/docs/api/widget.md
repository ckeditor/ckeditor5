---
category: api-reference
---

# CKEditor 5 widget API

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-widget.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)

This package implements widget API for CKEditor 5.

The API consists of a couple of primitives and helpers which make it easy to implement rich content units such as images with caption.

## Documentation

Browse the API documentation of this package by using the module tree on the left.

<info-box>
	The widget API is proposed in a very different way than what you might remember from CKEditor 4. It is just a set of utils which allows you to implement typical object-like entities. Most of the work actually happens in the {@link api/engine engine} and this API's role is only to properly conduct the engine.

	Therefore, this is just one of the ways how widgets can be proposed. We expect this API to change (grow) and for now, the only available documentation is in the {@link module:image/image/imageengine~ImageEngine}'s code (which is the only widget API consumer for now).
</info-box>

## Installation

```bash
npm install --save @ckeditor/ckeditor5-widget
```

## Contribute

The source code of this package is available on GitHub in https://github.com/ckeditor/ckeditor5-widget.

## External links

* [`@ckeditor/ckeditor5-widget` on npm](https://www.npmjs.com/package/@ckeditor/ckeditor5-widget)
* [`ckeditor/ckeditor5-widget` on GitHub](https://github.com/ckeditor/ckeditor5-widget)
* [Issue tracker](https://github.com/ckeditor/ckeditor5-widget/issues)
* [Changelog](https://github.com/ckeditor/ckeditor5-widget/blob/master/CHANGELOG.md)
