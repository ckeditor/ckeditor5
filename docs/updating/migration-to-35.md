---
category: updating
menu-title: Migration to v35.x
order: 89
modified_at: 2022-07-18
---

# Migration to CKEditor 5 v35.x

## Migration to CKEditor 5 v35.1.0

### Changes to API providing the accessible navigation between editing roots and toolbars on <kbd>Alt</kbd>+<kbd>F10</kbd> and <kbd>Esc</kbd> keystrokes

<info-box>
	This information applies only to integrators who develop their own {@link framework/guides/custom-editor-creator editor creators} from scratch by using the {@link module:core/editor/editor~Editor} and {@link module:core/editor/editorui~EditorUI} classes as building blocks.
</info-box>

* The `enableToolbarKeyboardFocus()` helper that allowed the navigation has been removed. To bring this functionality back, use the {@link module:core/editor/editorui~EditorUI#addToolbar} method instead.
* Also, please note that editable elements are now automatically added to the {@link module:core/editor/editorui~EditorUI#focusTracker main focus tracker} and should not be added individually.

**Before**:

```js
import { EditorUI } from 'ckeditor5/src/core';

export default class MyEditorUI extends EditorUI {
	// ...

	init() {
		const view = this.view;
		const editableElement = view.editable.element;
		const toolbarViewInstance = this.view.toolbar;

		// ...

		this.setEditableElement( 'editableName', editableElement );

		this.focusTracker.add( editableElement );

		enableToolbarKeyboardFocus( {
			// ...

			toolbar: toolbarViewInstance
		} );

		// ...
	}
}
```

**After**:

```js
import { EditorUI } from 'ckeditor5/src/core';

export default class MyEditorUI extends EditorUI {
	// ...

	init() {
		const view = this.view;
		const editableElement = view.editable.element;
		const toolbarViewInstance = this.view.toolbar;

		// ...

		// Note: You should not add the editable element to the focus tracker here.
		// This is handled internally by the EditorUI#setEditableElement() method.
		this.setEditableElement( 'editableName', editableElement );

		// Note: Add the toolbar to enable Alt+F10 navigation.
		// The rest (e.g. the Esc key handling) is handled by EditorUI#setEditableElement() method.
		this.addToolbar( toolbarViewInstance );

		// ...
	}
}
```

## Migration to CKEditor 5 v35.0.0

<info-box>
	When updating your CKEditor 5 installation, make sure **all the packages are the same version** to avoid errors.

	For custom builds, you may try removing the `package-lock.json` or `yarn.lock` files (if applicable) and reinstalling all packages before rebuilding the editor. For best results, make sure you use the most recent package versions.
</info-box>

For the entire list of changes introduced in version 35.0.0, see the [changelog for CKEditor 5 v35.0.0](https://github.com/ckeditor/ckeditor5/blob/stable/CHANGELOG.md#3500-2022-07-29).

Listed below are the most important changes that require your attention when upgrading to CKEditor 5 v35.0.0.

### Important changes

#### The source element is not updated automatically after the editor destroy

The last version of CKEditor 5 changes the default behavior of the source element after the editor is destroyed (when `editor.destroy()` is called). So far, the source element was updated with the output coming from `editor.getData()`. Now, the source element becomes empty after the editor is destroyed and it is not updated anymore.

However, this behavior is configurable and could be enabled with the {@link module:core/editor/editorconfig~EditorConfig#updateSourceElementOnDestroy `updateSourceElementOnDestroy`} configuration option:

```js
ClassicEditor.create( sourceElement, {
    // ...
    updateSourceElementOnDestroy: true
} );
```

<info-box warning>
	Enabling the `updateSourceElementOnDestroy` option in your configuration, depending on the plugins you use, might have some security implications. While the editing view is secured, there might be some unsafe content in the data output, so enable this option only if you know what you are doing. Be especially careful when using the Markdown, General HTML Support and HTML embed features.
</info-box>

#### Dropdown focus is moved back to the dropdown button after choosing an option

Due to the ongoing accessibility improvements the default behavior of the {@link module:ui/dropdown/dropdownview~DropdownView dropdown UI component} has been changed. From now on, by default, after choosing an option from a dropdown (either by mouse or keyboard), the focus will be automatically moved to the dropdown button.

This default behavior of the dropdown component needs to be overridden in scenarios where the focus should be moved back to the editing area. An example of such a feature would be the "Heading" dropdown &mdash; choosing one of the options should result in the focus returning to the editing area instead of the button itself.

This behavior can be customized by using the listener on the dropdown's {@link module:ui/dropdown/dropdownview~DropdownView#event:execute `execute` event}, e.g.:

```js
// Option 1.
// If the `execute` event is delegated to the dropdown, one listener can handle both:
// executing the command (assuming the dropdown executes it) and focusing the editor editing view.
dropdownView.on( 'execute', () => {
	editor.execute( 'myCommand' );
	editor.editing.view.focus();
} );

// Option 2.
// Otherwise, a dedicated listener may need to be added.
buttonInsideADropdown.on( 'execute', () => {
	editor.execute( 'myCommand' );
} );

dropdownView.on( 'execute', () => {
	editor.editing.view.focus();
} );
```

#### There is now a TypeScript code on GitHub (and how it affects your build)

Starting from v35.0.0, the first of CKEditor 5 packages (namely: `@ckeditor/ckeditor5-utils`) is developed in TypeScript. This is the first step of [our migration to TypeScript](https://github.com/ckeditor/ckeditor5/issues/11704).

##### Whom does it affect?

It affects you **only if** you use the [source code directly from git repository (GitHub)](https://github.com/ckeditor/ckeditor5). If you use it via any other channel (npm, CDN, ZIP, etc.) this change is completely transparent for you as we publish only JavaScript code there.

##### How does it affect you?

For instance, if you happen to have a custom CKEditor 5 build that, for some reason, installs its dependencies from the git repository, you will need to update your webpack config to support the TypeScript code.

You can find the inspiration on how to change your configuration in [this commit](https://github.com/ckeditor/ckeditor5/commit/1dd4075983d97c61b1f668add764525c7fcf2a2d) (this one makes the discussed change in our builds).
