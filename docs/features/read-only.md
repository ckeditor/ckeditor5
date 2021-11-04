---
category: features
---

# Read-only support

{@snippet features/read-only-build}

The editor can be set into a read-only mode by changing the value of the {@link module:core/editor/editor~Editor#isReadOnly `Editor#isReadOnly`} property.

The read-only mode may have several applications. It may be used to impose user-based access restriction, where a selected user or a group of users is only allowed to access the content for evaluation purposes but not change it.

The feature may also be used to view content that should not be edited, like financial reports, software logs or reprinted stories. While not editable, this content will still be accessible for copying or for screen readers.

<info-box>
	See also the {@link features/restricted-editing restricted editing feature} that lets you define which parts of a document can be editable for a group of users with limited editing rights, leaving the rest of the content non-editable to them.
</info-box>

## Demo

Use the demo below to toggle between editing modes and test the feature.

{@snippet features/read-only}

<info-box>
	You can see that after switching to read-only mode, some of the toolbar items are still active and functional. This is not a bug. It happens thanks to the {@link module:core/editor/command~Command#affectsData `affectsData` property}. For most of the plugins, it is set to `true` by default, which makes them inactive when entering read-only mode. However, for those plugins that do not make any changes in the model, it is set to `false`, thus allowing to still make use of them in modes with restricted user write permissions.
</info-box>

## Hiding toolbar in read-only mode

Some use cases might require hiding the editor toolbar when entering read-only mode. This can be achieved easily with the following code:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ...
	} )
	.then( editor => {
		const toolbarContainer = editor.ui.view.stickyPanel;

		editor.on( 'change:isReadOnly', ( evt, propertyName, isReadOnly ) => {
			if ( isReadOnly ) {
				editor.ui.view.top.remove( toolbarContainer );
			} else {
				editor.ui.view.top.add( toolbarContainer );
			}
		} );
	} )
	.catch( error => {
		console.log( error );
	} );
```

When the button is clicked, the property `editor.isReadOnly` is set to `true`. This triggers the code showed above, which in turn removes the toolbar. After clicking the button again and setting `editor.isReadOnly` to `false`, the code adds the toolbar to the editor again.

Use the button below to see this code in action:

{@snippet features/read-only-hide-toolbar}

## Related features

There are more features that help control user permissions in the WYSIWYG editor:

* {@link features/restricted-editing Restricted editing} &ndash; Define editable areas of the document for users with restricted editing rights.
* {@link features/track-changes Track changes} &ndash; User changes are marked in the content and shown as suggestions in the sidebar for acceptance or rejection.
* {@link features/comments Comments} &ndash; Users can add comments to any part of the content instead of editing it directly.
