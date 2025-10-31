---
category: features
title: Restricted editing
menu-title: Restricted editing
meta-title: Restricted editing | CKEditor 5 Documentation
meta-description: Enable restricted editing in CKEditor 5 to limit content changes to specific regions, ensuring control and document integrity.
badges: [ premium ]
---

The restricted editing feature introduces two modes: the standard editing mode and the restricted editing mode. Users working in the restricted editing mode cannot change the content, except for parts marked as editable.

{@snippet getting-started/unlock-feature}

## Demo

The demo below lets you emulate both the standard editing mode and the restricted editing mode.

Start by creating a template of the document in the standard editing mode. Select a section of the text and use the enable editing toolbar button {@icon @ckeditor/ckeditor5-icons/theme/icons/content-unlock.svg Enable editing} to turn a selected area into an editable region or remove an existing one.

Then switch to the restricted editing mode to see how the editable and non-editable regions behave.

<info-box tip>
	Use <kbd>Tab</kbd> to navigate from one editable region to another (and <kbd>Shift</kbd>+<kbd>Tab</kbd> to move back) in the restricted mode.
</info-box>

**Mode:**

<div class="u-flex-horizontal u-gap-5">
	<ck:checkbox id="mode-standard" type="radio" name="editor-restriction-mode" value="standard" label="Standard" checked />
	<ck:checkbox id="mode-restricted" type="radio" name="editor-restriction-mode" value="restricted" label="Restricted" />
</div>

{@snippet features/restricted-editing}

<snippet-footer>
	This demo presents a limited set of features. Visit the {@link examples/builds/full-featured-editor feature-rich editor example} to see more in action.
</snippet-footer>

## Additional feature information

The restricted editing feature enables two editing modes:

* **Standard editing mode** &ndash; In this mode the user can edit the content and choose regions that should be editable in the restricted editing mode.
* **Restricted editing mode** &ndash; When you initialize the editor in this mode, the user can edit the content only within the regions chosen by the user in the standard editing mode. There changes allowed withing these fields can be configured.

There are two types of editable fields: inline and block.

* **Inline editable fields** only allow content editing with [features enabled in the restricted mode](#enabling-commands-in-the-restricted-editing-mode). This kind of field can only hold inline content. They support only inline-type changes. Users can type, delete content, and format the text. However, no block-type editions are available. This means no splitting paragraphs (striking the <kbd>Enter</kbd> key) is allowed. Tables or block images cannot be added in this field, either.
*  **Block editable fields** enable all content editing features loaded in the editor. Content inside the block can be anything, including lists, tables, images etc. (providing these features are loaded into the editor).

You can observe it in the [demo](#demo) while switching between the inline and the block editable field &ndash; the number of active toolbar items will change.

Both block and inline fields can be inserted via the toolbar dropdown {@icon @ckeditor/ckeditor5-icons/theme/icons/content-unlock.svg Enable editing}. The availability of one or both types of fields from the toolbar [can be configured](#configuring-the-toolbar).

You can imagine a workflow where a certain group of users is responsible for creating templates of documents. At the same time, a second group of users can only fill the gaps (for example, fill in the missing data, like names, dates, product names, etc.).

By using this feature, the users of your application will be able to create template documents. In a certain way, you can use this feature to generate forms with rich-text capabilities. This kind of practical application is shown in the [How to create ready-to-print documents with CKEditor&nbsp;5 pagination feature](https://ckeditor.com/blog/How-to-create-ready-to-print-documents-with-page-structure-in-WYSIWYG-editor---CKEditor-5-pagination-feature/) blog post.

<info-box note>
	See also the {@link features/read-only read-only feature} that lets you turn the entire WYSIWYG editor into read-only mode. You can also read the [dedicated blog post](https://ckeditor.com/blog/feature-of-the-month-restricted-editing-modes/) about write-restricted editor modes.
</info-box>

## Installation

After {@link getting-started/integrations-cdn/quick-start installing the editor}, add the feature to your plugin list and toolbar configuration.

### Running the standard editing mode

To initialize the editor in the standard editing mode, add the {@link module:restricted-editing/standardeditingmode~StandardEditingMode} plugin and add the `'restrictedEditingException:dropdown'` button to the toolbar:

<code-switcher>
```js
import { ClassicEditor, StandardEditingMode } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ StandardEditingMode, /* ... */ ],
		toolbar: [ 'restrictedEditingException:dropdown', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

<info-box note>
	Please note there are available toolbar items for inline, block, and both types of editable fields. Read more in the [Configuring the tollbar](#configuring-the-toolbar) section.
</info-box>

### Running the restricted editing mode

To initialize the editor in the restricted editing mode, add the {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} plugin and add the `'restrictedEditing'` button to the toolbar:

<code-switcher>
```js
import { ClassicEditor, RestrictedEditingMode } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ RestrictedEditingMode, /* ... */ ],
		toolbar: [ 'restrictedEditing', /* ... */ ]
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```
</code-switcher>

## Configuration

You can configure which features should be available in the restricted mode. For instance, the following configuration allows the users to type, delete but also to bold text.

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		// ... Other confituration options ...
		restrictedEditing: {
			allowedCommands: [ 'bold' ]
		}
	} )
	.then( /* ... */ )
	.catch( /* ... */ );
```

<info-box warning>
	This setting only applies to inline editing fields, where only inline content inserting or editing commands are allowed. Block content commands such as `insertTable` or `enter` cannot be allowed via this setting, as they are only available in block editing fields.
</info-box>

**Note**: Typing and deleting text is always possible in restricted editing regions. For more information, check out the {@link module:restricted-editing/restrictededitingconfig~RestrictedEditingConfig `config.restrictedEditing`} documentation.

### Enabling commands in the restricted editing mode

The restricted editing mode allows modifying the editor content only in designated regions. Outside these regions, most of the editor commands are turned off by default. If you wish to enable some commands outside the restricted editing regions, you can use the {@link module:restricted-editing/restrictededitingmodeediting~RestrictedEditingModeEditing#enableCommand `RestrictedEditingModeEditing.enableCommand()`} method. You must execute this method in the {@link module:core/plugin~PluginInterface#afterInit `afterInit()`} callback of an editor plugin.

<code-switcher>
```js
import { ClassicEditor, Plugin } from 'ckeditor5';

class MyPlugin extends Plugin {
	afterInit() {
		this.editor.plugins.get( 'RestrictedEditingModeEditing' ).enableCommand( 'myCommand' );
	}
}
```
</code-switcher>

### Configuring the toolbar

When configuring the toolbar item for inserting restricted editing fields in standard mode, you can choose to provide your users with access to inline, block or both types of fields. To add these to the toolbar, you should use the following toolbar item calls, respectively: `restrictedEditingException:dropdown` (both types of fields available), `restrictedEditingException:inline`, and `restrictedEditingException:block`.

Example toolbar configuration may look like the one below:

```js
toolbar: [
	'restrictedEditingException:dropdown', '|',
	'heading', '|', 'bold', 'italic', 'link', '|',
	'bulletedList', 'numberedList', 'todolist', 'outdent', 'indent', '|',
	'blockQuote', 'insertImage', 'insertTable', '|',
	'undo', 'redo'
]
```

To configure the feature toolbar button for restricted mode, use the `restrictedEditing` call, instead. The Navigate editable regions button {@icon @ckeditor/ckeditor5-icons/theme/icons/content-lock.svg Navigate editable regions} allows for moving between previous/next editable fields.

Example toolbar configuration may look like the one below. Please note that whatever toolbar items maybe enable, the two different types of editable fields [will not support all of them.](#additional-feature-information). From the example below, inline editable fields will only support bold, italic, link, and undo, while images, tables, and list will only be available for block type fields.

```js
toolbar: {
	items: [
		'restrictedEditing', '|', 
		'heading', '|', 'bold', 'italic', `link`, '|',
		'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent', '|',
		'insertImage', 'insertTable', '|',
		'undo', 'redo'
	]
}
```

#### Legacy toolbar button

The new toolbar items were introduced with version 47.2.0. To retain full backwards compatibility, we have provided an alias toolbar item: `restrictedEditingException`. It is the old toolbar button call and it defaults to inline restricted editing field button. There is no need to change your configuration if you only want to use inline fields type.

## Related features

CKEditor&nbsp;5 has more features that help you control user permissions:

* {@link features/read-only Read-only} &ndash; Turn the entire content of the editor read-only.
* {@link features/track-changes Track changes} &ndash; Mark user changes in the content and show them as suggestions in the sidebar for acceptance or rejection.
* {@link features/comments Comments} &ndash; Users can add comments to any part of the content instead of editing it directly.

<info-box>
	Read this [CKEditor blog post](https://ckeditor.com/blog/How-to-create-ready-to-print-documents-with-page-structure-in-WYSIWYG-editor---CKEditor-5-pagination-feature/) on how to couple restricted editing with other features to create editable document templates.
</info-box>

## Common API

The {@link module:restricted-editing/standardeditingmode~StandardEditingMode} plugin registers:

* The `'restrictedEditingException'` button that lets you mark regions as editable.
* The {@link module:restricted-editing/restrictededitingexceptioncommand~RestrictedEditingExceptionCommand `'restrictedEditingException'`} command that allows marking regions as editable.

The {@link module:restricted-editing/restrictededitingmode~RestrictedEditingMode} plugin registers:

* The `'restrictedEditing'` dropdown that lets you navigate between editable regions.
* The {@link module:restricted-editing/restrictededitingmodenavigationcommand~RestrictedEditingModeNavigationCommand `'goToPreviousRestrictedEditingException'`} and `'goToNextRestrictedEditingException'` commands that allow navigating between editable regions.

<info-box>
	We recommend using the official {@link framework/development-tools/inspector CKEditor&nbsp;5 inspector} for development and debugging. It will give you tons of useful information about the state of the editor such as internal data structures, selection, commands, and many more.
</info-box>

## Real-time collaboration

When using [real-time collaboration](https://ckeditor.com/collaboration/real-time-collaborative-editing/), all the connected users should always be in the same mode. You cannot have a different list of plugins enabled among users of a single collaborative session.

## Contribute

The source code of the feature is available on GitHub at [https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-restricted-editing](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-restricted-editing).
