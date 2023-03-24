---
category: features
modified_at: 2021-11-15
---

# Read-only support

{@snippet features/read-only-build}

CKEditor 5 offers an out-of-the-box read-only mode. You can use it to prevent users under certain circumstances from editing your content.

## Demo

Use the demo below to toggle between editing modes and test the feature. Some features, like exports or search, are still functional even in the read-only mode. While the search is available, the replace function, however, is disabled, as changing the content is blocked.

{@snippet features/read-only}

<info-box info>
	This demo only presents a limited set of features. Visit the {@link examples/builds/full-featured-editor full-featured editor example} to see more in action.
</info-box>

<info-box>
	You can see that after switching to read-only mode, some of the toolbar items are still active and functional. It happens thanks to the {@link module:core/command~Command#affectsData `affectsData` property}. For most of the plugins, it is set to `true` by default, which makes them inactive when entering read-only mode. However, for those plugins that do not make any changes in the model &ndash; do not affect the content &ndash; it is set to `false`, thus allowing to still make use of them in modes with restricted user write permissions.
</info-box>

## Additional feature information

<info-box info>
	This feature is available in all {@link installation/getting-started/predefined-builds#available-builds predefined builds}.
</info-box>

The feature does not require any additional plugin and the editor can be set into a read-only mode using the editor's {@link module:core/editor/editor~Editor#enableReadOnlyMode `Editor#enableReadOnlyMode()`} method.

The read-only mode may have several applications. It may be used to impose user-based access restrictions, where a selected user or a group of users is only allowed to access the content for evaluation purposes but not change it.

The feature may also be used to view content that should not be edited, like financial reports, software logs, or reprinted stories. While not editable, this content will still be accessible for copying or for screen readers.

The editor can be switched to or out of the read-only mode by many features, under various circumstances. It supports a dedicated locking mechanism for the read-only mode. This solution enables easy control over the read-only mode even when many features try to turn it on or off at the same time, without conflicting with each other. It guarantees that the user will not make the editor content editable by accident (which could lead to errors).

<info-box>
	See also the {@link features/restricted-editing restricted editing feature} that lets you define which parts of a document can be editable for a group of users with limited editing rights, leaving the rest of the content non-editable to them. You can also read the [dedicated blog post](https://ckeditor.com/blog/feature-of-the-month-restricted-editing-modes/) about write-restricted editor modes.
</info-box>

## Hiding the toolbar in the read-only mode

Some use cases might require hiding the editor toolbar when entering the read-only mode. This can be achieved easily with the following code:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// The editor's configuration.
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

When the button is clicked, the `editor.enableReadOnlyMode()` creates a lock that sets the read-only mode on the editor. This triggers the code showed above, which in turn hides the toolbar using CSS styles. After clicking the button once more, the `editor.disableReadOnlyMode()` is called, which removes the read-only lock and the editor's and the toolbar is visible again. This approach will work both for classic and decoupled editors.

Use the demo below to see this code in action, toggle read-only mode together with the editor's toolbar with the dedicated button.

{@snippet features/read-only-hide-toolbar}

## Common API

The editor provides the following API to manage the read-only mode:

* The {@link module:core/editor/editor~Editor#isReadOnly} property is a read-only, observable property that allows you to check the `isReadOnly` value and react to its changes,
* The {@link module:core/editor/editor~Editor#enableReadOnlyMode `Editor#enableReadOnlyMode( featureId )`} method turns on the read-only mode for the editor by creating a lock with given unique id.
* The {@link module:core/editor/editor~Editor#disableReadOnlyMode `Editor#disableReadOnlyMode( featureId )`} method removes the read-only lock from the editor. The editor becomes editable when no lock is present on the editor anymore.

## Related features

There are more features that help control user permissions in the WYSIWYG editor:

* {@link features/restricted-editing Restricted editing} &ndash; Define editable areas of the document for users with restricted editing rights.
* {@link features/comments-only-mode Comments-only mode} &ndash; Users can add comments to any part of the content instead of editing it directly.

## Common API

The editor provides the following API to manage the read-only mode:

* The {@link module:core/editor/editor~Editor#isReadOnly} property is a read-only, observable property that allows you to check the `isReadOnly` value and react to its changes,
* The {@link module:core/editor/editor~Editor#enableReadOnlyMode `Editor#enableReadOnlyMode( featureId )`} method turns on the read-only mode for the editor by creating a lock with given unique id.
* The {@link module:core/editor/editor~Editor#disableReadOnlyMode `Editor#disableReadOnlyMode( featureId )`} method removes the read-only lock from the editor. The editor becomes editable when no lock is present on the editor anymore.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-core).
