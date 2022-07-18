---
category: updating
menu-title: Migration to v35.x
order: 89
modified_at: 2022-07-18
---

# Migration to CKEditor 5 v35.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 35.0.0, see the [changelog for CKEditor 5 v35.0.0](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v35.0.0.

## Important changes

### The source element is not updated automatically after the editor destroy

The last version of CKEditor 5 changes the default behaviour of a source element after the editor destroy. So far, the source element was updated with the output coming from the data pipeline. Now, the source element becomes empty after destroying the editor and it is not updated anymore. 

However, this behaviour is configurable and could be enabled with the {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`} configuration option:

```js
ClassicEditor.create( document.querySelector( '#editor' ), {
    // ...
    updateSourceElementOnDestroy: true
} );
```

<info-box warning>
Enabling the `updateSourceElementOnDestroy` option in your configuration, depending on plugins you use, might have some security implications. While the editing view is secured, there might be some unsafe content in the data output, so enable this option only if you know what you are doing. Especially, be careful when using Markdown, General HTML Support and HTML embed features 
</info-box>