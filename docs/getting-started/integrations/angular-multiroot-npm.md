---
menu-title: Multi-root integration
meta-title: Using CKEditor 5 with Angular rich text editor multi-root component from npm | CKEditor 5 Documentation
meta-description: Install, integrate, and configure CKEditor 5 using the Angular multi-root component with npm.
category: angular-npm
order: 20
modified_at: 2026-11-05
---

# Integrating CKEditor&nbsp;5 with Angular rich text multi-root editor component from npm

This page focuses on describing the usage of the multi-root editor in Angular applications. For other editor types, see the {@link getting-started/integrations/angular-default-npm default Angular integration}.

<info-box experimental>
	The Angular multi-root editor integration is in early access. Its API is not stable and may change in any release without a major version bump.
</info-box>

<info-box hint>
	The multi-root editors in Angular are supported since version 13.1.0 of this package.
</info-box>

## Quick start

This guide assumes you already have an Angular project. To create such a project, you can use Angular CLI. Refer to the [Angular documentation](https://angular.dev/tools/cli) to learn more.

Install the [CKEditor&nbsp;5 WYSIWYG editor component for Angular](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular) and the {@link getting-started/setup/editor-types#multi-root-editor multi-root editor type}.

```bash
npm install ckeditor5 @ckeditor/ckeditor5-angular
```

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from npm:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

Import the `CKEditorMultiRootComponent` (or the whole `CKEditorModule`) into your component and use the `<ckeditor-multi-root>` tag in its template:

```angular-ts
// app.component.ts

import { Component } from '@angular/core';
import { CKEditorMultiRootComponent, type MultiRootEditorData } from '@ckeditor/ckeditor5-angular';
import { MultiRootEditor, Essentials, Paragraph, Bold, Italic, type EditorConfig } from 'ckeditor5';

@Component( {
	selector: 'app-root',
	imports: [ CKEditorMultiRootComponent ],
	template: `
		<ckeditor-multi-root
			[editor]="Editor"
			[config]="config"
			[(data)]="data"
		/>
	`
} )
export class AppComponent {
	public Editor = MultiRootEditor;

	public config: EditorConfig = {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Paragraph, Bold, Italic ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ]
	};

	public data: MultiRootEditorData = {
		intro: '<h1>Angular multi-root editor</h1>',
		content: '<p>Hello from CKEditor&nbsp;5 multi-root!</p>'
	};
}
```

Remember to import the editor styles, for example, by adding `node_modules/ckeditor5/dist/ckeditor5.css` to the `styles` array in `angular.json`.

Without any content inside, the `<ckeditor-multi-root>` component renders the toolbar followed by the editables of all roots. When `config.menuBar.isVisible` is set to `true`, it renders the menu bar above the toolbar, too.

### Custom layout

To place the toolbar, the menu bar, and the editables yourself, put them inside the `<ckeditor-multi-root>` component. The `<ckeditor-multi-root-toolbar>`, `<ckeditor-multi-root-menu-bar>`, and `<ckeditor-multi-root-editable>` components take the editor from the `<ckeditor-multi-root>` component they are placed in. Use a template reference variable to reach the list of roots:

```angular-html
<ckeditor-multi-root
	#multiRoot
	[editor]="Editor"
	[config]="config"
	[(data)]="data"
	[(rootsAttributes)]="rootsAttributes"
>
	<header>
		<ckeditor-multi-root-menu-bar />
		<ckeditor-multi-root-toolbar />
	</header>

	@for ( rootName of multiRoot.roots(); track rootName ) {
		<section class="root">
			<ckeditor-multi-root-editable [rootName]="rootName" />
		</section>
	}
</ckeditor-multi-root>
```

Import the `CKEditorMultiRootToolbarComponent`, `CKEditorMultiRootMenuBarComponent`, and `CKEditorMultiRootEditableComponent` standalone components, or the `CKEditorModule` that exports all of them.

These components can also be placed outside of the `<ckeditor-multi-root>` component, for example, to render the toolbar in the header of your application. In such case, pass the editor instance received in the `ready` event to their `editor` property:

```angular-html
<ckeditor-multi-root-toolbar [editor]="editorInstance" />
```

An editable outside of the `<ckeditor-multi-root>` component does not follow the roots of the editor by itself. When the editor detaches a root, for example on undo, the editable of that root stays on the page. To show one editable for each attached root, loop over the `roots()` signal of the component. A template reference variable gives access to it:

```angular-html
<ckeditor-multi-root #multiRoot [editor]="Editor" [config]="config" [(data)]="data">
	<ckeditor-multi-root-toolbar />
</ckeditor-multi-root>

<main>
	@for ( rootName of multiRoot.roots(); track rootName ) {
		<ckeditor-multi-root-editable [editor]="multiRoot.instance()" [rootName]="rootName" />
	}
</main>
```

## Supported `@Input` properties

The `<ckeditor-multi-root>` component supports the following `@Input` properties:

* `editor: MultiRootEditor` (required) &ndash; The {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} constructor to use.
* `config: EditorConfig` &ndash; The editor configuration. See the {@link getting-started/setup/configuration Configuration} guide.
* `data: Record<string, string>` &ndash; The data of the editor: the HTML of each root, keyed by the root name. Bind it with `[(data)]` to keep it in sync with the editor. Setting a new object updates the editor: the roots missing from the editor are added, the roots missing from the object are detached, and the changed roots get the new data. See the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide. When the editor starts with other roots or other content than this object, for example because real-time collaboration loads the document from the server, the component emits the data of the editor.
* `rootsAttributes: Record<string, Record<string, unknown>>` &ndash; The attributes of each root, keyed by the root name. Bind it with `[(rootsAttributes)]` to keep it in sync with the editor. The editor keeps its own attributes in the roots, too (their names start with `$`, for example, `$rootEditableOptions`). They are left alone when missing from the object. The emitted object can contain `null` for a registered attribute that the root does not have.
* `disabled: boolean` &ndash; The editor is switched to read-only mode if the property is set to `true`.
* `disableTwoWayDataBinding: boolean` &ndash; Allows disabling the two-way data binding mechanism between the editor state and the `data` and `rootsAttributes` objects to improve editor efficiency. When it is set back to `false`, the data and the attributes that changed in the meantime are emitted. The default value is `false`.

The `<ckeditor-multi-root-editable>` component supports the following `@Input` properties:

* `rootName: string` (required) &ndash; The name of the root to render.
* `editableOptions: MultiRootEditableOptions` &ndash; Describes the editable element (`element`, `placeholder`, and `label`). It takes precedence over the options stored in the root by `addRoot()`.
* `editor: MultiRootEditor` &ndash; The editor whose root to render. Not needed inside the `<ckeditor-multi-root>` component.

The `<ckeditor-multi-root-toolbar>` and `<ckeditor-multi-root-menu-bar>` components support the `editor` property only, which is not needed inside the `<ckeditor-multi-root>` component.

## Supported `@Output` properties

The `<ckeditor-multi-root>` component supports the following `@Output` properties:

* `ready` &ndash; Fires when the editor is ready, with the {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} instance.
* `editorChange` &ndash; Fires when the editor data has changed, including roots being added or detached. See the {@link module:engine/model/document~ModelDocument#event:change:data `editor.model.document#change:data`} event.
* `blur` &ndash; Fires when the editing view of the editor is blurred. See the {@link module:engine/view/document~ViewDocument#event:blur `editor.editing.view.document#blur`} event.
* `focus` &ndash; Fires when the editing view of the editor is focused. See the {@link module:engine/view/document~ViewDocument#event:focus `editor.editing.view.document#focus`} event.
* `error` &ndash; Fires when the editor fails to start or reports an error while running. Without a listener, the error is logged to the console.
* `dataChange` &ndash; Fires with the new data when the content of the editor changes. It makes `[(data)]` work.
* `rootsAttributesChange` &ndash; Fires with the new attributes when the attributes of the roots change. It makes `[(rootsAttributes)]` work.

The `editorChange`, `blur`, and `focus` events emit an object with the `event` ({@link module:utils/eventinfo~EventInfo `EventInfo`}) and the `editor` properties, the same as in the {@link getting-started/integrations/angular-default-npm#supported-output-properties default integration}.

A reported error does not stop the editor. Its state may no longer be consistent, so do not leave the error unhandled. Nothing is restarted and no data is restored for you, so what happens next is your application's decision. The {@link getting-started/setup/error-handling error handling} guide covers the options.

## Component API

Reach the `<ckeditor-multi-root>` component with a template reference variable or `viewChild()` to use the following API:

* `instance: Signal<MultiRootEditor | null>` &ndash; The editor, once it is ready.
* `editorInstance: MultiRootEditor | null` &ndash; The same editor, as a plain property.
* `roots: Signal<ReadonlyArray<string>>` &ndash; The names of the attached roots. It is updated when a root is added or detached, also by undo or by other users in real-time collaboration. Before the editor is ready, it lists the keys of `data`.
* `addRoot( options ): Promise<void>` &ndash; Adds a root to the editor. It accepts an options object with `name`, `data`, `attributes`, `modelElement` (for example, `'$inlineRoot'`), `isUndoable` (`true` by default), `title`, `description`, and `editableOptions` (`element`, `placeholder`, and `label` of the editable element). It waits for the editor if it is not ready yet.
* `removeRoot( name ): Promise<void>` &ndash; Detaches a root from the editor. Detaching can be undone. It waits for the editor if it is not ready yet.

## Two-way data binding

By default, the two-way data binding is enabled. It means that every change done in the editor is automatically applied in the object bound with `[(data)]`. It works the same way for attributes &ndash; bind them with `[(rootsAttributes)]` to keep your application state up-to-date. Only the roots touched by a change are read from the editor again.

<info-box>
	Two-way data binding may lead to performance issues with large editor content. In such cases, it is recommended to disable it by setting the `disableTwoWayDataBinding` property to `true`. When this is disabled, you will need to handle data synchronization manually if it is needed.

	The recommended approach for achieving this is based on utilizing the {@link features/autosave autosave plugin}. The second approach involves providing the `editorChange` event listener, which is called on each editor update.
</info-box>

## How to?

### Adding and removing roots dynamically

Use the `addRoot()` and `removeRoot()` methods of the component to manage roots from event handlers. An editable is rendered for a new root by the default layout, or by your `@for` loop over `roots()`.

```angular-html
<ckeditor-multi-root #multiRoot [editor]="Editor" [config]="config" [(data)]="data">
	<button (click)="addSidebar( multiRoot )">Add sidebar</button>
	<button (click)="multiRoot.removeRoot( 'sidebar' )">Remove sidebar</button>

	<ckeditor-multi-root-toolbar />

	@for ( rootName of multiRoot.roots(); track rootName ) {
		<ckeditor-multi-root-editable [rootName]="rootName" />
	}
</ckeditor-multi-root>
```

```angular-ts
public async addSidebar( multiRoot: CKEditorMultiRootComponent ): Promise<void> {
	await multiRoot.addRoot( {
		name: 'sidebar',
		data: '<p>Sidebar content</p>',
		attributes: { order: 30 },
		editableOptions: {
			element: 'section',
			placeholder: 'Type the sidebar content...',
			label: 'Sidebar'
		}
	} );
}
```

The `editableOptions.element` field accepts a tag name string (`'section'`, `'article'`) or a descriptor object with `name`, `classes`, `styles`, and `attributes`. The editable options are stored in the root, so the editable keeps its shape after undo and for other users in real-time collaboration.

You can also add and remove roots by setting a new `data` object. Roots added this way can have their attributes set in `rootsAttributes`.

### Mixing standard and inline roots

A multi-root editor can host both standard and inline roots in the same document. Set `modelElement` to `'$inlineRoot'` for any root that should accept only inline content (text, bold, italic, links) instead of blocks. This is useful for titles, captions, or single-line fields combined with a block-based body.

```ts
await multiRoot.addRoot( {
	name: 'title',
	data: 'Document title',
	modelElement: '$inlineRoot',
	editableOptions: {
		element: 'h1',
		placeholder: 'Enter title...'
	}
} );
```

Without `modelElement: '$inlineRoot'`, only the host tag changes &ndash; the schema still permits blocks inside the root.

## Contributing and reporting issues

The source code of rich text editor component for Angular is available on GitHub in [https://github.com/ckeditor/ckeditor5-angular](https://github.com/ckeditor/ckeditor5-angular).

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
