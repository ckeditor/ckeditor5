---
category: builds-integration-frameworks
order: 20
---

# Angular 2+ component

TODO link to npm

## Usage

CKEditor 5 consists of a [ready to use builds](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html) and a [CKEditor 5 Framework](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/overview.html) upon which the builds are based.

Currently, the CKEditor 5 component for Angular supports integrating CKEditor 5 only via builds. Integrating [CKEditor 5 from source](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/advanced-setup.html#scenario-2-building-from-source) is not yet possible due to the lack of ability to [adjust webpack configuration in `angular-cli`](https://github.com/angular/angular-cli/issues/10618).

### Quick start

1. In your existing Angular project, install the CKEditor component:

	```bash
	npm install --save-dev @ckeditor/ckeditor5-angular
	```

2. Install one of the official editor builds:

	* [Classic editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic)
	* [Inline editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-inline)
	* [Balloon editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-balloon)
	* [Document editor build](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-decoupled-document)

	or [create a custom one](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/development/custom-builds.html) (e.g. if you want to install more plugins or customize any other thing which cannot be controlled via [editor configuration](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/configuration.html)).

	Let's pick the `@ckeditor/ckeditor5-build-classic`:

	```bash
	npm install --save-dev @ckeditor/ckeditor5-build-classic
	```

	**Note:** You may need to allow external JS in your project's `tsconfig.json` for the builds to work properly:

	```json
	"compilerOptions": {
		"allowJs": true
	}
	```

3. Include the CKEditor module:

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

4. Import the editor build in your Angular component and assign it to a `public` property so it becomes accessible in the template:

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

	You can import as many editor builds as you want.

5. Use the `<ckeditor>` tag in the template to run the editor

	```html
	<ckeditor [editor]="Editor" data="<p>Hello world!</p>"></ckeditor>
	```

### Note: Using the Document editor build

If you use the [Document editor](https://ckeditor.com/docs/ckeditor5/latest/framework/guides/ui/document-editor.html), you need to [add the toolbar to the DOM manually](https://ckeditor.com/docs/ckeditor5/latest/api/module_editor-decoupled_decouplededitor-DecoupledEditor.html#static-function-create).

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

The [Editor](https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/basic-api.html) which provides the static [`create()`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#static-function-create) method to create an instance of the editor:

```html
<ckeditor [editor]="Editor"></ckeditor>
```

### `config`

The [configuration](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editorconfig-EditorConfig.html) of the editor:

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

Controls the editor's [read–only](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#member-isReadOnly) state:

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

Fires when the editor is ready. It corresponds with the [`editor#ready`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#event-ready) event. Fires with the editor instance.

### `change`

Fires when the content of the editor has changed. It corresponds with the [`editor.model.document#change:data`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_document-Document.html#event-:data) event.
Fires with an object containing the editor and the CKEditor5 change:data event.

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

Fires when the editing view of the editor is blurred. It corresponds with the [`editor.editing.view.document#blur`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_document-Document.html#event-event:blur) event.
Fires with an object containing the editor and the CKEditor5 blur event.

### `focus`

Fires when the editing view of the editor is focused. It corresponds with the [`editor.editing.view.document#focus`](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_document-Document.html#event-event:focus) event.
Fires with an object containing the editor and the CKEditor5 focus event.

## Contributing and reporting issues

The source code of this component is available on GitHub in https://github.com/ckeditor/ckeditor5-angular.
