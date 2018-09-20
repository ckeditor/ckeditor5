---
category: builds-integration-frameworks
order: 20
---

# Angular 2+ component

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-angular.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular)

CKEditor 5 consists of a {@link builds/guides/overview ready to use builds} and a {@link framework/guides/overview CKEditor 5 Framework} upon which the builds are based.

Currently, the CKEditor 5 component for Angular supports integrating CKEditor 5 only via builds. Integrating {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source CKEditor 5 from source} is not yet possible due to the lack of ability to [adjust webpack configuration in `angular-cli`](https://github.com/angular/angular-cli/issues/10618).

<info-box>
	While there is no support to integrate CKEditor 5 from source yet, you can still {@link builds/guides/development/custom-builds create a custom build of CKEditor 5} and include it in your Angular application.
</info-box>

## Quick start

In your existing Angular project, install the [CKEditor component](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular):

```bash
npm install --save-dev @ckeditor/ckeditor5-angular
```

Install one of the {@link builds/guides/overview#available-builds official editor builds} or {@link builds/guides/development/custom-builds create a custom one} (e.g. if you want to install more plugins or customize any other thing which cannot be controlled via {@link builds/guides/integration/configuration editor configuration}.

Let's say you picked [`@ckeditor/ckeditor5-build-classic`](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic):

```bash
npm install --save-dev @ckeditor/ckeditor5-build-classic
```

**Note:** You may need to allow external JS in your project's `tsconfig.json` for the builds to work properly:

```json
"compilerOptions": {
	"allowJs": true
}
```

Now, add `CKEditorModule` to your application module imports:

```ts
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

@NgModule( {
	imports: [
		...
		CKEditorModule,
		...
	],
	...
} )
```

Import the editor build in your Angular component and assign it to a `public` property so it becomes accessible in the template:

```ts
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component( {
	...
} )
export class MyComponent {
	public Editor = ClassicEditor;
	...
}
```

Finally, use the `<ckeditor>` tag in the template to run the editor:

```html
<ckeditor [editor]="Editor" data="<p>Hello world!</p>"></ckeditor>
```

Rebuild your application and CKEditor 5 should greet you with "Hello world!".

### Note: Using the Document editor build

If you want to use the {@link framework/guides/document-editor Document editor}, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create add the toolbar to the DOM manually}.

```ts
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component( {
	...
} )
export class MyComponent {
	public Editor = DecoupledEditor;

	public onReady( editor ) {
		editor.ui.view.editable.element.parentElement.insertBefore(
			editor.ui.view.toolbar.element,
			editor.ui.view.editable.element
		);
	}
}
```

```html
<ckeditor [editor]="Editor" data="<p>Hello world!</p>" (ready)="onReady($event)"></ckeditor>
```

## Integration with `ngModel`

The component implements the [`ControlValueAccessor`](https://angular.io/api/forms/ControlValueAccessor) interface and works with the `ngModel`.

1. Create some model in your component to share with the editor:

	```ts
	@Component( {
		...
	} )
	export class MyComponent {
		public model = {
			editorData: '<p>Hello world!</p>'
		};
		...
	}
	```

2. Use the model in the template to enable a 2–way data binding:

	```html
	<ckeditor [(ngModel)]="model.editorData" [editor]="Editor"></ckeditor>
	```

## Supported `@Inputs`

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
<ckeditor data="<p>Hello world!</p>" ...></ckeditor>
```

or a shared parent component's property

```ts
@Component( {
	...
} )
export class MyComponent {
	public editorData = '<p>Hello world!</p>';
	...
}
```

```html
<ckeditor [data]="editorData" ...></ckeditor>
```

### `tagName`

Specifies the tag name of the HTML element on which the editor will be created.

The default tag is `div`.

```html
<ckeditor tagName="textarea" ...></ckeditor>
```

### `disabled`

Controls the editor's {@link module:core/editor/editor~Editor#isReadOnly read–only} state:

```ts
@Component( {
	...
} )
export class MyComponent {
	public isDisabled = false;
	...
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

## Supported `@Outputs`

### `ready`

Fired when the editor is ready. It corresponds with the [`editor#ready`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#event-ready) event. Fired with the editor instance.

### `change`

Fired when the content of the editor has changed. It corresponds with the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event.
Fired with an object containing the editor and the CKEditor 5's `change:data` event object.

```html
<ckeditor [editor]="Editor" (change)="onChange($event)"></ckeditor>
```

```ts
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';

@Component( {
	...
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
Fired with an object containing the editor and the CKEditor 5's `blur` event data.

### `focus`

Fired when the editing view of the editor is focused. It corresponds with the {@link module:engine/view/document~Document#event:focus `editor.editing.view.document#focus`} event.
Fired with an object containing the editor and the CKEditor 5's `focus` event data.

## Localization

CKEditor 5 can be localized in two steps.

### 1. Load translation files

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

### 2. Configure the language

Then, you need to configure the editor to use the given language:

```ts
@Component( {
	...
} )
export class MyComponent {
	public Editor = ClassicEditor;
	public config = {
		language: 'de'
	};
}
```

For advanced usage see the {@link features/ui-language Setting UI language} guide.

## Contributing and reporting issues

The source code of this component is available on GitHub in https://github.com/ckeditor/ckeditor5-angular.
