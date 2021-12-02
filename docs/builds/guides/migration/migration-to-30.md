
---
category: builds-migration
menu-title: Migration to v30.x
order: 94
---

# Migration to CKEditor 5 v30.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 30.0.0, see the [changelog for CKEditor 5 v30.0.0](https://github.com/ckeditor/ckeditor5/blob/master/CHANGELOG.md#3000-2021-09-27).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v30.0.0.

### Viewport (toolbar) offset config change

Starting from v30.0.0, the {@link module:core/editor/editorconfig~EditorConfig#toolbar `EditorConfig#toolbar.viewportTopOffset`} config is deprecated.

The new {@link module:core/editor/editorconfig~EditorConfig#ui `EditorConfig#ui.viewportOffset`} editor config allows to set `viewportOffset` from every direction.

```js
const config = {
	ui: {
		viewportOffset: { top: 10, right: 10, bottom: 10, left: 10 }
	}
}
```

Here is the exact change you would need to introduce for proper integration with the new {@link module:core/editor/editorconfig~EditorConfig#ui `EditorConfig#ui.viewportOffset`} config change:

```js
// Before v30.0.0
ClassicEditor
    .create( ..., {
        // ...
        toolbar: {
            items: [ ... ],
			viewportTopOffset: 100
        }
    } )

// Since v30.0.0
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
