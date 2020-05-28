---
category: api-reference
---

# CKEditor 5 file upload utilities

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-upload.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload)

This package implements various file upload utilities for CKEditor 5.

## Documentation

See the {@link module:upload/filerepository~FileRepository} plugin documentation.

## Upload Adapters

This repository contains the following upload adapters:

* {@link module:upload/adapters/base64uploadadapter~Base64UploadAdapter `Base64UploadAdapter`} - A plugin that converts images inserted into the editor into [Base64 strings](https://en.wikipedia.org/wiki/Base64) in the {@link builds/guides/integration/saving-data editor output}.
* {@link module:upload/adapters/simpleuploadadapter~SimpleUploadAdapter `SimpleUploadAdapter`} - A plugin that uploads images inserted into the editor to your server using the [`XMLHttpRequest`](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) API.

## Installation

```bash
npm install --save @ckeditor/ckeditor5-upload
```

## Contribute

The source code of this package is available on GitHub in https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-upload.

## External links

* [`@ckeditor/ckeditor5-upload` on npm](https://www.npmjs.com/package/@ckeditor/ckeditor5-upload)
* [`ckeditor/ckeditor5-upload` on GitHub](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-upload)
* [Issue tracker](https://github.com/ckeditor/ckeditor5/issues)
* [Changelog](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md)
