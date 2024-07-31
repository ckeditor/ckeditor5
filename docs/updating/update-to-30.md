---
category: update-guides
meta-title: Update to version 30.x | CKEditor 5 Documentation
menu-title: Update to v30.x
order: 94
---

# Update to CKEditor&nbsp;5 v30.x

<info-box>
	When updating your CKEditor&nbsp;5 installation, ensure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

## Update to CKEditor&nbsp;5 v30.0.0

_Released on September 29, 2021._

For the entire list of changes introduced in version 30.0.0, see the [release notes for CKEditor&nbsp;5 v31.0.0](https://github.com/ckeditor/ckeditor5/releases/tag/v31.0.0).

Below are the most important changes that require your attention when upgrading to CKEditor&nbsp;5 v30.0.0.

### Viewport (toolbar) offset configuration change

Starting from v30.0.0, the {@link module:core/editor/editorconfig~EditorConfig#toolbar `EditorConfig#toolbar.viewportTopOffset`} configuration is deprecated.

The new {@link module:core/editor/editorconfig~EditorConfig#ui `EditorConfig#ui.viewportOffset`} option allows to set `viewportOffset` from every direction.

```js
const config = {
	ui: {
		viewportOffset: { top: 10, right: 10, bottom: 10, left: 10 }
	}
}
```

Here is the exact change you need to introduce for proper integration with the new {@link module:core/editor/editorconfig~EditorConfig#ui `EditorConfig#ui.viewportOffset`} configuration change:

```js
// Before v30.0.0.
ClassicEditor
	.create( ..., {
		// ...
		toolbar: {
			items: [ ... ],
			viewportTopOffset: 100
		}
	} )

// Since v30.0.0.
ClassicEditor
	.create( ..., {
		// ...
		toolbar: {
			items: [ ... ]
		},
		ui: {
			viewportOffset: {
				top: 100
			}
		}
	} )
```
