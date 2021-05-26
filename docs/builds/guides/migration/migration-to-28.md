---
category: builds-migration
menu-title: Migration to v28.x
order: 96
---

# Migration to CKEditor 5 v28.0.0

For the entire list of changes introduced in version 28.0.0, see the [changelog for CKEditor 5 v28.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#2800-2021-05-31).

### Imports non-DLL core packages

Previously, imports in your modules could look like the following:

```js
// Importing the default module.
import BasicStyles from '@ckeditor/ckeditor5-basic-styles/src/index';

// And destructuring plugins from the module.
const { Bold, Italic } = BasicStyles;
```

Starting from `v28.0.0`, all packages export a module instead of the default object. So, the import statement should look like the following:

```js
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles/src/index';
```

If you imported anything from the `src/index.js` file from one of the following packages:

* [@ckeditor/ckeditor5-adapter-ckfinder](https://npmjs.org/package/@ckeditor/ckeditor5-adapter-ckfinder)
* [@ckeditor/ckeditor5-alignment](https://npmjs.org/package/@ckeditor/ckeditor5-alignment)
* [@ckeditor/ckeditor5-autoformat](https://npmjs.org/package/@ckeditor/ckeditor5-autoformat)
* [@ckeditor/ckeditor5-autosave](https://npmjs.org/package/@ckeditor/ckeditor5-autosave)
* [@ckeditor/ckeditor5-basic-styles](https://npmjs.org/package/@ckeditor/ckeditor5-basic-styles)
* [@ckeditor/ckeditor5-block-quote](https://npmjs.org/package/@ckeditor/ckeditor5-block-quote)
* [@ckeditor/ckeditor5-ckfinder](https://npmjs.org/package/@ckeditor/ckeditor5-ckfinder)
* [@ckeditor/ckeditor5-cloud-services](https://npmjs.org/package/@ckeditor/ckeditor5-cloud-services)
* [@ckeditor/ckeditor5-code-block](https://npmjs.org/package/@ckeditor/ckeditor5-code-block)
* [@ckeditor/ckeditor5-easy-image](https://npmjs.org/package/@ckeditor/ckeditor5-easy-image)
* [@ckeditor/ckeditor5-editor-balloon](https://npmjs.org/package/@ckeditor/ckeditor5-editor-balloon)
* [@ckeditor/ckeditor5-editor-classic](https://npmjs.org/package/@ckeditor/ckeditor5-editor-classic)
* [@ckeditor/ckeditor5-editor-decoupled](https://npmjs.org/package/@ckeditor/ckeditor5-editor-decoupled)
* [@ckeditor/ckeditor5-editor-inline](https://npmjs.org/package/@ckeditor/ckeditor5-editor-inline)
* [@ckeditor/ckeditor5-essentials](https://npmjs.org/package/@ckeditor/ckeditor5-essentials)
* [@ckeditor/ckeditor5-font](https://npmjs.org/package/@ckeditor/ckeditor5-font)
* [@ckeditor/ckeditor5-heading](https://npmjs.org/package/@ckeditor/ckeditor5-heading)
* [@ckeditor/ckeditor5-highlight](https://npmjs.org/package/@ckeditor/ckeditor5-highlight)
* [@ckeditor/ckeditor5-horizontal-line](https://npmjs.org/package/@ckeditor/ckeditor5-horizontal-line)
* [@ckeditor/ckeditor5-html-embed](https://npmjs.org/package/@ckeditor/ckeditor5-html-embed)
* [@ckeditor/ckeditor5-image](https://npmjs.org/package/@ckeditor/ckeditor5-image)
* [@ckeditor/ckeditor5-indent](https://npmjs.org/package/@ckeditor/ckeditor5-indent)
* [@ckeditor/ckeditor5-language](https://npmjs.org/package/@ckeditor/ckeditor5-language)
* [@ckeditor/ckeditor5-link](https://npmjs.org/package/@ckeditor/ckeditor5-link)
* [@ckeditor/ckeditor5-list](https://npmjs.org/package/@ckeditor/ckeditor5-list)
* [@ckeditor/ckeditor5-markdown-gfm](https://npmjs.org/package/@ckeditor/ckeditor5-markdown-gfm)
* [@ckeditor/ckeditor5-media-embed](https://npmjs.org/package/@ckeditor/ckeditor5-media-embed)
* [@ckeditor/ckeditor5-mention](https://npmjs.org/package/@ckeditor/ckeditor5-mention)
* [@ckeditor/ckeditor5-page-break](https://npmjs.org/package/@ckeditor/ckeditor5-page-break)
* [@ckeditor/ckeditor5-paste-from-office](https://npmjs.org/package/@ckeditor/ckeditor5-paste-from-office)
* [@ckeditor/ckeditor5-remove-format](https://npmjs.org/package/@ckeditor/ckeditor5-remove-format)
* [@ckeditor/ckeditor5-restricted-editing](https://npmjs.org/package/@ckeditor/ckeditor5-restricted-editing)
* [@ckeditor/ckeditor5-special-characters](https://npmjs.org/package/@ckeditor/ckeditor5-special-characters)
* [@ckeditor/ckeditor5-table](https://npmjs.org/package/@ckeditor/ckeditor5-table)
* [@ckeditor/ckeditor5-watchdog](https://npmjs.org/package/@ckeditor/ckeditor5-watchdog)
* [@ckeditor/ckeditor5-word-count](https://npmjs.org/package/@ckeditor/ckeditor5-word-count)

You need to update your code.
