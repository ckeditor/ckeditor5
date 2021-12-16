---
category: features
modified_at: 2021-11-15
---

# Read-only support

{@snippet features/read-only-build}

The editor can be set into a read-only mode by changing the value of the {@link module:core/editor/editor~Editor#isReadOnly `Editor#isReadOnly`} property.

The read-only mode may have several applications. It may be used to impose user-based access restriction, where a selected user or a group of users is only allowed to access the content for evaluation purposes but not change it.

The feature may also be used to view content that should not be edited, like financial reports, software logs or reprinted stories. While not editable, this content will still be accessible for copying or for screen readers.

<info-box>
	See also the {@link features/restricted-editing restricted editing feature} that lets you define which parts of a document can be editable for a group of users with limited editing rights, leaving the rest of the content non-editable to them. You can also read the [dedicated blog post](https://ckeditor.com/blog/feature-of-the-month-restricted-editing-modes/) about write-restricted editor modes.
</info-box>

## Demo

Use the demo below to toggle between editing modes and test the feature. Some features, like exports or search, are still functional even in the read-only mode. While the search is available, the replace function, however, is disabled, as changing the content is blocked.

{@snippet features/read-only}

<info-box>
	You can see that after switching to read-only mode, some of the toolbar items are still active and functional. It happens thanks to the {@link module:core/command~Command#affectsData `affectsData` property}. For most of the plugins, it is set to `true` by default, which makes them inactive when entering read-only mode. However, for those plugins that do not make any changes in the model &ndash; do not affect the content &ndash; it is set to `false`, thus allowing to still make use of them in modes with restricted user write permissions.
</info-box>

## Hiding toolbar in read-only mode

Some use cases might require hiding the editor toolbar when entering the read-only mode. This can be achieved easily with the following code:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
	} )
	.then( editor => {
		const toolbarElement = editor.ui.view.toolbar.element;

		editor.on( 'change:isReadOnly', ( evt, propertyName, isReadOnly ) => {
			if ( isReadOnly ) {
				toolbarElement.style.display = 'none';
			} else {
				toolbarElement.style.display = 'flex';
			}
		} );
	} )
	.catch( error => {
		console.log( error );
	} );
```

When the button is clicked, the property `editor.isReadOnly` is set to `true`. This triggers the code showed above, which in turn hides the toolbar using CSS styles. After clicking the button once more and setting `editor.isReadOnly` to `false`, the toolbar is visible again. This approach will work both for classic and decoupled editors.

Use the demo below to see this code in action, toggle read-only mode together with the editor's toolbar with the dedicated button.

{@snippet features/read-only-hide-toolbar}

## Related features

There are more features that help control user permissions in the WYSIWYG editor:

* {@link features/restricted-editing Restricted editing} &ndash; Define editable areas of the document for users with restricted editing rights.
* {@link features/comments-only-mode Comments-only mode} &ndash; Users can add comments to any part of the content instead of editing it directly.
