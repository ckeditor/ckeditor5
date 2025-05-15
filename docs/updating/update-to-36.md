---
category: update-guides
meta-title: Update to version 36.x | CKEditor 5 Documentation
menu-title: Update to v36.x
order: 88
modified_at: 2022-12-14
---

# Update to CKEditor&nbsp;5 v36.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v36.0.0

_Released on January 25, 2023._

For the entire list of changes introduced in version 36.0.0, see the [release notes for CKEditor&nbsp;5 v36.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v36.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v36.0.0.

### Importing `EditorUI` class

The `EditorUI` class was moved from the `@ckeditor/ckeditor5-core` to the `@ckeditor/ckeditor5-ui` package. Thus, it is enough to update imports (depending on the format used):

* from `'ckeditor5/src/core'` to `'ckeditor5/src/ui'`
* from `'@ckeditor/ckeditor5-core/src/editor/editorui'` to `'@ckeditor/ckeditor5-ui/src/editorui/editorui'`

**Before**:

```js
import { EditorUI } from '@ckeditor/ckeditor5-core/src/editor/editorui';

export default class MyEditorUI extends EditorUI {}
```

**After**:

```js
import { EditorUI } from '@ckeditor/ckeditor5-ui/src/editorui/editorui';

export default class MyEditorUI extends EditorUI {}
```
