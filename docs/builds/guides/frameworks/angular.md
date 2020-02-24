---
menu-title: Angular component
category: builds-integration-frameworks
order: 20
---

# Rich text editor component for Angular

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-angular.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular)

CKEditor 5 consists of {@link builds/guides/overview ready-to-use editor builds} and {@link framework/guides/overview CKEditor 5 Framework} upon which the builds are based.

Currently, the CKEditor 5 component for Angular supports integrating CKEditor 5 only via builds. Integrating {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source CKEditor 5 built from source} is not possible yet due to the lack of ability to [adjust webpack configuration in `angular-cli`](https://github.com/angular/angular-cli/issues/10618).

<info-box>
	While there is no support to integrate CKEditor 5 from source yet, you can still {@link builds/guides/development/custom-builds create a custom build of CKEditor 5} and include it in your Angular application.
</info-box>

## Quick start

In your existing Angular project, install the [CKEditor 5 WYSIWYG editor component for Angular](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular):

```bash
npm install --save @ckeditor/ckeditor5-angular
```

Install one of the {@link builds/guides/overview#available-builds official editor builds} or [create a custom one](#using-a-custom-ckeditor-5-build).

Assuming that you picked [`@ckeditor/ckeditor5-build-classic`](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic):

```bash
npm install --save @ckeditor/ckeditor5-build-classic
```

Now, add `CKEditorModule` to modules whose components will be using the `<ckeditor>` component in their templates.

```ts
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@NgModule( {
	imports: [
		CKEditorModule,
		// ...
	],
	// ...
} )
```

Import the editor build in your Angular component and assign it to a `public` property to make it accessible from the template:

```ts
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component( {
	// ...
} )
export class MyComponent {
	public Editor = ClassicEditor;
	// ...
}
```

Finally, use the `<ckeditor>` tag in the template to run the rich text editor:

```html
<ckeditor [editor]="Editor" data="<p>Hello, world!</p>"></ckeditor>
```

Rebuild your application and CKEditor 5 should greet you with "Hello, world!".

### Using the Document editor build

If you want to use the {@link framework/guides/document-editor document editor build}, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create add the toolbar to the DOM manually}.

```ts
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component( {
	// ...
} )
export class MyComponent {
	public Editor = DecoupledEditor;

	public onReady( editor ) {
		editor.ui.getEditableElement().parentElement.insertBefore(
			editor.ui.view.toolbar.element,
			editor.ui.getEditableElement()
		);
	}
}
```

And then, in the template:

```html
<ckeditor [editor]="Editor" data="<p>Hello, world!</p>" (ready)="onReady($event)"></ckeditor>
```

### Using a custom CKEditor 5 build

If you want to add more plugins to the existing build or customize something that cannot be controlled with the {@link builds/guides/integration/configuration editor configuration} you should create a custom build first, using the {@link builds/guides/development/custom-builds create a custom build guide}.

You should finish the above tutorial with the generated `ckeditor.js` file (and corresponding translation files). In the next step you should copy it to the `src` directory and import it to the component file.

```ts
import * as Editor from 'path/to/the/ckeditor';

@Component( {
	// ...
} )
export class MyComponent {
	public Editor = Editor;
	// ...
}
```

Note that to allow importing JavaScript files without providing their corresponding types you need to set `allowJs` to `true` in the `tsconfig.json` file. Also, make sure that you target `ES6` or higher, otherwise you are likely to end up with [a weird transpilation error](https://github.com/ckeditor/ckeditor5-angular/issues/20) in the production build.

```json
"compilerOptions": {
	"allowJs": true,
	"target": "es2015"
	// other options
}
```

<info-box>
	If you cannot set the target higher than `es5`, try to set `"buildOptimizer": false` which will produce a bigger, but correct production build.
</info-box>

### Using the editor with collaboration plugins

The easiest way to integrate [collaboration plugins](https://ckeditor.com/docs/ckeditor5/latest/features/collaboration/collaboration.html) in an Angular application is to create a custom build first and later import it from the Angular application &mdash; see [Using a custom CKEditor 5 build](#using-a-custom-ckeditor-5-build).

For such scenario we provide a few ready-to-use integrations featuring collaborative editing in Angular applications:

- [CKEditor 5 with real-time collaboration features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-angular)

- [CKEditor 5 with the track changes feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/track-changes-for-angular)

It is not mandatory to build applications on top of the above samples, however, they should help you get started.

### Strict mode project tips

If you have the strict mode set in your project, you need to specify types for CKEditor 5 packages. Otherwise you will get the `Could not find a declaration file for module` error.

To fix that you need to create a TypeScript declaration file and declare modules that miss their types:

```ts
// typings.d.ts

// You should specify the CKEditor 5 build you use here:
declare module '@ckeditor/ckeditor5-build-classic' {
	const ClassicEditorBuild: any;

	export = ClassicEditorBuild;
}
```

Unfortunately, CKEditor 5 builds do not ship with corresponding TypeScript typings yet. If you are interested in this topic you can add your vote or a comment [here](https://github.com/ckeditor/ckeditor5/issues/504).

## Integration with `ngModel`

The component implements the [`ControlValueAccessor`](https://angular.io/api/forms/ControlValueAccessor) interface and works with the `ngModel`. Here is how to use it:

1. Create some model in your component to share with the editor:

	```ts
	@Component( {
		// ...
	} )
	export class MyComponent {
		public model = {
			editorData: '<p>Hello, world!</p>'
		};
		// ...
	}
	```

2. Use the model in the template to enable a two–way data binding:

	```html
	<ckeditor [(ngModel)]="model.editorData" [editor]="Editor"></ckeditor>
	```

## Supported `@Input` properties

The following `@Input` properties are supported by the CKEditor 5 rich text editor component for Angular:

### `editor` (required)

The {@link builds/guides/integration/basic-api `Editor`} which provides the static {@link module:core/editor/editor~Editor.create `create()`} method to create an instance of the editor:

```html
<ckeditor [editor]="Editor"></ckeditor>
```

### `config`

The {@link module:core/editor/editorconfig~EditorConfig configuration} of the editor:

```html
<ckeditor [config]="{ toolbar: [ 'heading', '|', 'bold', 'italic' ] }" ...></ckeditor>
```

### `data`

The initial data of the editor. It can be a static value:

```html
<ckeditor data="<p>Hello, world!</p>" ...></ckeditor>
```

or a shared parent component's property

```ts
@Component( {
	// ...
} )
export class MyComponent {
	public editorData = '<p>Hello, world!</p>';
	// ...
}
```

```html
<ckeditor [data]="editorData" ...></ckeditor>
```

### `tagName`

The tag name of the HTML element on which the rich text editor will be created.

The default tag is `<div>`.

```html
<ckeditor tagName="textarea" ...></ckeditor>
```

### `disabled`

Controls the editor's {@link module:core/editor/editor~Editor#isReadOnly read–only} state:

```ts
@Component( {
	// ...
} )
export class MyComponent {
	public isDisabled = false;
	// ...
	toggleDisabled() {
		this.isDisabled = !this.isDisabled
	}
}
```

```html
<ckeditor [disabled]="isDisabled" ...></ckeditor>

<button (click)="toggleDisabled()">
	{{ isDisabled ? 'Enable editor' : 'Disable editor' }}
</button>
```

## Supported `@Output` properties

The following `@Output` properties are supported by the CKEditor 5 rich text editor component for Angular:

### `ready`

Fired when the editor is ready. It corresponds with the [`editor#ready`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#event-ready) event.
It is fired with the editor instance.

### `change`

Fired when the content of the editor has changed. It corresponds with the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event.
It is fired with an object containing the editor and the CKEditor 5 `change:data` event object.

```html
<ckeditor [editor]="Editor" (change)="onChange($event)"></ckeditor>
```

```ts
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

@Component( {
	// ...
} )
export class MyComponent {
	public Editor = ClassicEditor;

	public onChange( { editor }: ChangeEvent ) {
		const data = editor.getData();

		console.log( data );
	}
	...
}
```

### `blur`

Fired when the editing view of the editor is blurred. It corresponds with the {@link module:engine/view/document~Document#event:blur `editor.editing.view.document#blur`} event.
It is fired with an object containing the editor and the CKEditor 5 `blur` event data.

### `focus`

Fired when the editing view of the editor is focused. It corresponds with the {@link module:engine/view/document~Document#event:focus `editor.editing.view.document#focus`} event.
It is fired with an object containing the editor and the CKEditor 5 `focus` event data.

## Styling

The CKEditor 5 rich text editor component for Angular can be styled using the component stylesheet or using a global stylesheet. See how to set the CKEditor 5 component's height using these two approaches.

### Setting the height via the component stylesheet

First, create a (S)CSS file in the parent component's directory and style the given editor's part preceded by the `:host` and `::ng-deep` pseudo selectors:

```css
/* src/app/app.component.css */

:host ::ng-deep .ck-editor__editable_inline {
	min-height: 500px;
}
```

Then in the parent component add the relative path to the above stylesheet:

```ts
/* src/app/app.component.ts */

@Component( {
	// ...
	styleUrls: [ './app.component.css' ]
} )
```

### Setting the height via a global stylesheet

To style the component using a global stylesheet, first, create it:

```css
/* src/styles.css */

.ck-editor__editable_inline {
	min-height: 500px;
}
```

Then, add it in the `angular.json` configuration file:

```json
"architect": {
	"build": {
		"options": {
			"styles": [
				{ "input": "src/styles.css" }
			]
		}
	}
}
```

### Setting the placeholder

To display {@link features/editor-placeholder the placeholder} in the main editable element, set the `placeholder` field in the CKEditor 5 rich text editor component configuration:

```ts
@Component( {
	// ...
} )
export class MyComponent {
	public config = {
		placeholder: 'Type the content here!'
	}
}
```

## Accessing the editor instance

The CKEditor 5 rich text editor component provides all the functionality needed for most use cases. When access to the full CKEditor 5 API is needed you can get the editor instance with an additional step.

To do this, create a template reference variable `#editor` pointing to the `<ckeditor>` component:

```html
<ckeditor #editor [editor]="Editor" ...></ckeditor>
```

Then get the `<ckeditor>` component using a property decorated by `@ViewChild( 'editor' )` and access the editor instance when needed:

```ts
@Component()
export class MyComponent {
	@ViewChild( 'editor' ) editorComponent: CKEditorComponent;

	public getEditor() {
		// Warning: This may return "undefined" if the editor is hidden behind the `*ngIf` directive or
		// if the editor is not fully initialised yet.
		return this.editorComponent.editorInstance;
	}
}
```

<info-box>
	The editor creation is asynchronous so the `editorInstance` will not be available until the editor is created. If you want to make changes to an editor that has just been created, a better option would be getting the CKEditor 5 instance on the [`ready`](#ready) event.
</info-box>

## Localization

The CKEditor 5 rich text editor component can be localized in two steps.

### 1. Loading translation files

First, you need to add translation files to the bundle. This step can be achieved in two ways:

* By importing translations for given languages directly in your component file:

	```ts
	import '@ckeditor/ckeditor5-build-classic/build/translations/de';
	import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
	...
	```

* By adding paths to translation files to the `"scripts"` array in `angular.json`:

	```json
	"architect": {
		"build": {
			"options": {
				"scripts": [ "node_modules/@ckeditor/ckeditor5-build-classic/build/translations/de.js" ]
			}
		}
	}
	```

### 2. Configuring the language

Then, you need to configure the editor to use the given language:

```ts
@Component( {
	// ...
} )
export class MyComponent {
	public Editor = ClassicEditor;
	public config = {
		language: 'de'
	};
}
```

For advanced usage see the {@link features/ui-language Setting the UI language} guide.

## Contributing and reporting issues

The source code of the CKEditor 5 rich text editor component for Angular is available on GitHub in https://github.com/ckeditor/ckeditor5-angular.
