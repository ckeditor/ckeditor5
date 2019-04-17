---
menu-title: Angular 2+ component
category: builds-integration-frameworks
order: 20
---

# Rich text editor component for Angular 2+

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-angular.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular)

CKEditor 5 consists of {@link builds/guides/overview ready-to-use editor builds} and {@link framework/guides/overview CKEditor 5 Framework} upon which the builds are based.

Currently, the CKEditor 5 component for Angular supports integrating CKEditor 5 only via builds. Integrating {@link builds/guides/integration/advanced-setup#scenario-2-building-from-source CKEditor 5 built from source} is not possible yet due to the lack of ability to [adjust webpack configuration in `angular-cli`](https://github.com/angular/angular-cli/issues/10618).

<info-box>
	While there is no support to integrate CKEditor 5 from source yet, you can still {@link builds/guides/development/custom-builds create a custom build of CKEditor 5} and include it in your Angular application.
</info-box>

## Quick start

In your existing Angular project, install the [CKEditor 5 WYSIWYG editor component for Angular 2+](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular):

```bash
npm install --save @ckeditor/ckeditor5-angular
```

Install one of the {@link builds/guides/overview#available-builds official editor builds} or {@link builds/guides/development/custom-builds create a custom one} (e.g. if you want to install more plugins or customize something that cannot be controlled with the {@link builds/guides/integration/configuration editor configuration}).

Assuming that you picked [`@ckeditor/ckeditor5-build-classic`](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic):

```bash
npm install --save @ckeditor/ckeditor5-build-classic
```

Now, add `CKEditorModule` to your application module imports:

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

Import the editor build in your Angular component and assign it to a `public` property so it becomes accessible in the template:

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

### Note: Using the Document editor build

If you want to use the {@link framework/guides/document-editor Document editor build}, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create add the toolbar to the DOM manually}.

```ts
import * as DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component( {
	// ...
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
	<ckeditor [(ngModel)]="model.editorData" [editor]="Editor" name="editor1"></ckeditor>
	```

## Supported `@Input` properties

The following `@Input` properties are supported by the CKEditor 5 component for Angular 2+:

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

Specifies the tag name of the HTML element on which the editor will be created.

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

The following `@Output` properties are supported by the CKEditor 5 component for Angular 2+:

### `ready`

Fired when the editor is ready. It corresponds with the [`editor#ready`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#event-ready) event. Fired with the editor instance.

### `change`

Fired when the content of the editor has changed. It corresponds with the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event.
Fired with an object containing the editor and the CKEditor 5 `change:data` event object.

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
Fired with an object containing the editor and the CKEditor 5 `blur` event data.

### `focus`

Fired when the editing view of the editor is focused. It corresponds with the {@link module:engine/view/document~Document#event:focus `editor.editing.view.document#focus`} event.
Fired with an object containing the editor and the CKEditor 5 `focus` event data.

## Styling

The CKEditor 5 component for Angular can be styled using the component stylesheet or using a global stylesheet. Let's see how to set the CKEditor 5 component's height using these two approaches.

### Setting the height via the component stylesheet

First, create a (S)CSS file in the parent component's directory and style the given editor's part preceded by the `:host` and `::ng-deep` pseudo selectors.

```css
/* src/app/app.component.css */

:host ::ng-deep .ck-editor__editable_inline {
	min-height: 500px;
}
```

Then in the parent component add the relative path to the above stylesheet.

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

Then, add it in the `angular.json` configuration file.

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

To display {@link features/editor-placeholder the placeholder} in the main editable element simply set the `placeholder` field in the CKEditor 5 component configuration:

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

## Accessing the CKEditor API from an Angular Component

The `<ckeditor>` component will provide all the functionality needed for most use cases.  In
cases where access to the Javascript-level {@link api CKEditor API} is needed
it is easy to access with an additional step.

To do this, assign the Angular `<ckeditor>` component to a locally scoped variable as
follows:

```html
	<ckeditor #editor1 [editor]="Editor" [config]="ckconfig"
			  [(ngModel)]="text" name="editcontent"></ckeditor>
```

You can then refer to that variable as needed in any method call within the component
such as:

```html
	<button type="button" (click)="doPasteSomething(editor1)">Do Someting</button>
```

In the component the target function will look like this:

```ts
  doPasteSomething(editorComponent: CKEditorComponent) {
    const editor = editorComponent.editorInstance;
    editor.model.insertContent(' >> This just got pasted! << ');
  }
```

The operations performed may be anything that is defined and allowable by the API.

Note that the Angular `editor1` template variable may also be accessed with an
`@ViewChild`-decorated variable declaration.  The method in the example, however,
will be preferable in the case where there is more than one `<ckeditor>` element on
the page.  Also, if the `<ckeditor>` element is inside an `*ngIf` structure the `@ViewChild`
declared variable may be inadvertently undefined.

## Implementing an Upload Adapter in an Angular Application

An Upload Adapter can be used with CKEditor so that when a user adds an image
to a document it is encoded as a link to the image.  The image itself is stored
separately from the document.   When images are large or numerous this results
in noticable improvement in performance over the default behavior.  Read about custom
UploadAdapters {@link framework/guides/deep-dive/upload-adapter here}.

The first step is to create an Upload Adapter.  This can be done in the same file where the
component that will use it.  Alternatively this can have its own file and be
imported.

This class will be instantiated each time that CKEditor needs it.  Note that
the functions in this class will run outside an `NgZone` which means that
if it makes changes to variables bound to HTML elements, the shadow-DOM logic
in the Angular framework won't detect those changes.

The instance property `loader` is the primary interface between the UploadAdapter
and the CKEditor instance.

```ts
class UploadAdapter {
  private loader;
  private url;

  private sub: Subscription;

  constructor(loader, url) {
    this.loader = loader;
    this.url = url;
  }

  upload() {
    return new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append('file', this.loader.file);

      this.sub = this.httpPostMediaReq(fd).subscribe(
        (event) => {
          if (event.type === HttpEventType.Response) {
            const resp = event.body;
            if (!resp.list || resp.list.length < 1 || resp.list[0].id < 1) reject(resp.error);
            else {
              const imageURL = this.imageURL(resp.list[0].id);
              resolve({ default: imageURL });
            }
          }
          else if (event.type === HttpEventType.UploadProgress) {
            this.loader.uploaded = event.loaded;
            this.loader.uploadTotal = event.total;
          }
        },
        (err) => {
            reject(err.body.message);
        });
    });
  }

  imageURL(id) {
     // RETURN THE URL WHERE THE SUCCESSFULY UPLOADED IMAGE
     // CAN BE RETRIEVED WITH AN HTTP GET REQUEST
  }

  httpPostMediaReq(formReq: FormData): Observable<any> {
      const options: {
        observe: 'events';
        reportProgress: boolean;
        withCredentials: boolean;
      } = {
        withCredentials: true,
        reportProgress: true,
        observe: 'events'
      };
      const request = new HttpRequest(
        'POST', this.url, formReq, options);
      return this.http.request(request);
    }

  abort() {
    console.log('UploadAdapter abort');
    if (this.sub) this.sub.unsubscribe();
  }

```

Next, in your component, create a function that can be plugged into CKEditor that
will generate an UploadAdapter as needed:

```ts
  MyUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new UploadAdapter(loader, '/image');  // MODIFY FOR YOUR SERVER
    };
  }
```

The second parameter is the URL where the image will be sent.  This will need
to have everything the `imageURL` function in the UploadAdpater needs to
generate a complete URL.

Next, we need to tell CKEditor where the Plugin can be found.  This is done
using the `extraPlugins` element in the configuration object, which can
be used without rebuilding the standard build you are using.  The following
instance variable can be defined:

```ts
  ckconfig = {
    extraPlugins: [ (ei) => this.MyUploadAdapterPlugin(ei) ]
  };
```

Any other desired configuration settings can be added (such as `toolbar`).
Then it can be used in the `<ckeditor>` component as follows:

```html
        <ckeditor [editor]="Editor" [config]="ckconfig"
                  [(ngModel)]="text" name="editcontent"></ckeditor>
```

Note the use of a closure in the `extraPlugins` array in the configuration.
This is done so that the `MyUploadAdapterPlugin` function will have access
to the properties of the component instance that spawned it.

At this point your UploadAdapter should be invoked any time the user pastes
or drag-and-drops an image into the `<ckeditor>` window.

## Localization

The CKEditor 5 component can be localized in two steps.

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

For advanced usage see the {@link features/ui-language Setting UI language} guide.

## Contributing and reporting issues

The source code of the rich text editor component for Angular 2+ is available on GitHub in https://github.com/ckeditor/ckeditor5-angular.
