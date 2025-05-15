---
category: update-guides
meta-title: Update to version 28.x | CKEditor 5 Documentation
menu-title: Update to v28.x
order: 96
modified_at: 2021-06-01
---

# Update to CKEditor&nbsp;5 v28.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v28.0.0

_Released on June 7, 2021._

For the entire list of changes introduced in version 28.0.0, see the [release notes for CKEditor&nbsp;5 v28.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v28.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v28.0.0.

### Imports from index files of non-DLL core packages

Starting from v26.0.0, you could use the `src/index.js` files present in all packages to simplify the import rules.

However, prior to v28.0.0, in some packages, the `src/index.js` file was exporting one object instead of multiple tokens, so the import rule looked as shown:

```js
// Importing the default export.
import BasicStyles from '@ckeditor/ckeditor5-basic-styles/src/index';

// And destructuring plugins from the module.
const { Bold, Italic } = BasicStyles;
```

Starting from v28.0.0, all the packages use multiple exports so you can import the plugins directly:

```js
import { Bold, Italic } from '@ckeditor/ckeditor5-basic-styles/src/index';
```

The list of affected packages:

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
