---
menu-title: Angular
meta-title: Angular rich text editor component | Legacy CKEditor 5 documentation
category: legacy-integrations
order: 20
---

{@snippet installation/integrations/framework-integration}

# Angular rich text editor component &ndash; Legacy guide

<info-box warning>
	⚠️  We changed installation methods and this legacy guide is kept for users' convenience. If you are looking for current CKEditor 5 Angular integration, please refer to the newest version of the {@link getting-started/integrations/angular CKEditor&nbsp;5 integration} guide.
</info-box>

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-angular" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-angular.svg" alt="npm version" loading="lazy">
	</a>
</p>

CKEditor&nbsp;5 consists of the {@link getting-started/legacy-getting-started/predefined-builds ready-to-use editor builds} and the {@link framework/index CKEditor&nbsp;5 Framework} upon which the builds are based.

Currently, the CKEditor&nbsp;5 component for Angular supports integrating CKEditor&nbsp;5 only via builds. Integrating {@link getting-started/advanced/integrating-from-source-webpack CKEditor&nbsp;5 built from source} is not possible yet due to the lack of ability to [adjust webpack configuration in `angular-cli`](https://github.com/angular/angular-cli/issues/10618).

## Supported Angular versions

Because of the breaking changes in the Angular library output format, the `@ckeditor/ckeditor5-angular` package is released in the following versions to support various Angular ecosystems:

<table>
  <thead>
	<tr>
	 <th>CKEditor&nbsp;5&nbsp;version</th>
	 <th>Angular&nbsp;version</th>
	 <th>Details</th>
	</tr>
  </thead>
  <tbody>
	<tr>
	 <td colspan="3">Actively supported versions</td>
	</tr>
	<tr>
	 <td><code>^6</code></td>
	 <td><code>13+</code></td>
	 <td>Requires CKEditor&nbsp;5 in version <a href="https://github.com/ckeditor/ckeditor5/releases/tag/v37.0.0">37</a> or higher.</td>
	</tr>
	<tr>
	 <td colspan="3">Past releases (no longer maintained)</td>
	</tr>
	<tr>
	 <td><code>^5</code></td>
	 <td><code>13+</code></td>
	 <td>Requires Angular in version 13+ or higher. Lower versions are no longer maintained.</td>
	</tr>
	<tr>
	 <td><code>^5</code></td>
	 <td><code>13+</code></td>
	 <td>Requires Angular in version 13+ or higher. Lower versions are no longer maintained.</td>
	</tr>
	<tr>
	 <td><code>^4</code></td>
	 <td><code>9.1+</code></td>
	 <td>Requires CKEditor&nbsp;5 in version <a href="https://github.com/ckeditor/ckeditor5/releases/tag/v34.0.0">34</a> or higher.</td>
	</tr>
	<tr>
	 <td><code>^3</code></td>
	 <td><code>9.1+</code></td>
	 <td>Requires Node.js in version 14 or higher.</td>
	</tr>
	<tr>
	 <td><code>^2</code></td>
	 <td><code>9.1+</code></td>
	 <td>Migration to TypeScript&nbsp;4. Declaration files are not backward compatible.</td>
	</tr>
	<tr>
	 <td><code>^1</code></td>
	 <td><code>5.x&nbsp;-&nbsp;8.x</code></td>
	 <td>Angular versions are no longer maintained.</td>
	</tr>
  </tbody>
</table>

All available Angular versions are [listed on npm](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular), where they can be pulled from.

## Quick start

In your existing Angular project, install the [CKEditor&nbsp;5 WYSIWYG editor component for Angular](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular):

```bash
npm install --save @ckeditor/ckeditor5-angular
```

<info-box>
	If you do not have an existing project, you can use the [Angular CLI](https://angular.io/cli) to create a new one.
</info-box>

Install one of the {@link getting-started/legacy-getting-started/predefined-builds CKEditor&nbsp;5 predefined builds} or [create a custom one](#using-a-custom-ckeditor-5-build).

This tutorial assumes that you picked [`@ckeditor/ckeditor5-build-classic`](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic):

```bash
npm install --save @ckeditor/ckeditor5-build-classic
```

The [`@ckeditor/ckeditor5-angular`](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular) package requires the following peer dependencies, with a version of at least 37.0.0:

* [`@ckeditor/ckeditor5-core`](https://www.npmjs.com/package/@ckeditor/ckeditor5-core),
* [`@ckeditor/ckeditor5-engine`](https://www.npmjs.com/package/@ckeditor/ckeditor5-engine),
* [`@ckeditor/ckeditor5-utils`](https://www.npmjs.com/package/@ckeditor/ckeditor5-utils),
* [`@ckeditor/ckeditor5-watchdog`](https://www.npmjs.com/package/@ckeditor/ckeditor5-watchdog).

Keep in mind that they must have the same version as the editor build.

Install all the required peer dependencies:

```bash
npm install --save @ckeditor/ckeditor5-core @ckeditor/ckeditor5-engine @ckeditor/ckeditor5-utils @ckeditor/ckeditor5-watchdog
```

Now, add `CKEditorModule` to modules whose components will be using the `<ckeditor>` component in their templates.

```ts
// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { AppComponent } from './app.component';

@NgModule( {
  declarations: [
	AppComponent
  ],
  imports: [
	BrowserModule,
	CKEditorModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
} )
export class AppModule { }

```

Import the editor build in your Angular component and assign it to a `public` property to make it accessible from the template:

```ts
// app.component.ts

import { Component } from '@angular/core';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

@Component( {
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
} )
export class AppComponent {
  title = 'angular';
  public Editor = ClassicEditor;
}
```

Finally, use the `<ckeditor>` tag in the template to run the rich text editor:

```html
<!-- app.component.html -->

<ckeditor [editor]="Editor" data="<p>Hello, world!</p>"></ckeditor>
```

Rebuild your application and CKEditor&nbsp;5 should greet you with a "Hello, world!"

### Using the Document editor build

If you want to use the {@link framework/document-editor document editor build}, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create add the toolbar to the DOM manually}.

```ts
// app.component.ts

import { Component } from '@angular/core';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

@Component( {
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
} )
export class AppComponent {
  title = 'angular';
  public Editor = DecoupledEditor;

  public onReady( editor: DecoupledEditor ): void {
    const element = editor.ui.getEditableElement()!;
    const parent = element.parentElement!;

    parent.insertBefore(
      editor.ui.view.toolbar.element!,
      element
    );
  }
}
```

And then, in the template:

```html
<!-- app.component.html -->

<ckeditor [editor]="Editor" data="<p>Hello, world!</p>" (ready)="onReady($event)"></ckeditor>
```

### Using a custom CKEditor&nbsp;5 build

If you want to add more plugins to an existing build or customize something that cannot be controlled with the {@link getting-started/setup/configuration editor configuration} you need to create a custom build first, as described in the {@link getting-started/legacy-getting-started/quick-start-other#building-the-editor-from-source Building the editor from source} guide.

By completing the above tutorial you should get a generated `ckeditor.js` file (and corresponding translation files). In the next step you should copy it to the `src` directory and import it to the component file.

```ts
// app.component.ts

import * as Editor from 'path/to/the/ckeditor';

@Component( {
	// ...
} )
export class MyComponent {
	public Editor = Editor;
	// ...
}
```

Note that to allow importing JavaScript files without providing their corresponding types you need to set `allowJs` to `true` in the `tsconfig.json` file. Also, make sure that you target `ES6` or higher, otherwise you are likely to end up with a [weird transpilation error](https://github.com/ckeditor/ckeditor5-angular/issues/20) in the production build.

```json
// tsconfig.json

"compilerOptions": {
	"allowJs": true,
	"target": "es2015"
	// other options
}
```

<info-box>
	If you cannot set the target higher than `es5`, try to set `"buildOptimizer": false` which will produce a bigger, but correct production build.
</info-box>

### Integrating a build from the online builder

This guide assumes that you have created a zip archive with the editor built using the [CKEditor&nbsp;5 online builder](https://ckeditor.com/ckeditor-5/online-builder/).

Unpack it into you application's main directory. The directory with the editor build cannot be placed inside the `src/` directory as Node will return an error. Because of that, we recommend placing the directory next to the `src/` and `node_modules/` folders:

```
├── ckeditor5
│   ├── build
│   ├── sample
│   ├── src
│   ├── ...
│   ├── package.json
│   └── webpack.config.js
├── node_modules
├── src
├── ...
└── package.json
```

Then, add the package located in the `ckeditor5` directory as a dependency of your project:

```
npm install ./ckeditor5
```

Now, import the build in your application:

```ts
// app.component.ts

import { Component } from '@angular/core';
import Editor from 'ckeditor5-custom-build/build/ckeditor';

@Component( {
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
} )
export class AppComponent {
  title = 'customEditor';
  public Editor = Editor;
}
```

### Using the editor with collaboration plugins

The easiest way to integrate {@link features/collaboration collaboration plugins} in an Angular application is to create a custom build first and then import it from the Angular application. See [Using a custom CKEditor&nbsp;5 build](#using-a-custom-ckeditor-5-build).

<info-box>
	For such a scenario we provide a few **ready-to-use integrations** featuring collaborative editing in Angular applications:

	* [CKEditor&nbsp;5 with real-time collaboration features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-angular)
	* [CKEditor&nbsp;5 with real-time collaboration and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-revision-history-for-angular)
	* [CKEditor&nbsp;5 with the revision history feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/revision-history-for-angular)
	* [CKEditor&nbsp;5 with the track changes feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/track-changes-for-angular)

	It is not mandatory to build applications on top of the above samples, however, they should help you get started.
</info-box>

## Integration with `ngModel`

The component implements the [`ControlValueAccessor`](https://angular.io/api/forms/ControlValueAccessor) interface and works with the `ngModel`. Here is how to use it:

Create some model in your component to share with the editor:

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

Use the model in the template to enable a two–way data binding:

```html
<ckeditor [(ngModel)]="model.editorData" [editor]="Editor"></ckeditor>
```

## Supported `@Input` properties

The following `@Input` properties are supported by the CKEditor&nbsp;5 rich text editor component for Angular:

### `editor` (required)

The {@link getting-started/setup/editor-lifecycle `Editor`} which provides the static {@link module:core/editor/editor~Editor.create `create()`} method to create an instance of the editor:

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

### `watchdog`

An instance of the {@link module:watchdog/contextwatchdog~ContextWatchdog `ContextWatchdog`} class that is responsible for providing the same context to multiple editor instances and restarting the whole structure in case of crashes.

```ts
import CKSource from 'path/to/custom/build';

const Context = CKSource.Context;
const Editor = CKSource.Editor;
const ContextWatchdog = CKSource.ContextWatchdog;

@Component( {
	// ...
} )
export class MyComponent {
	public editor = Editor;
	public watchdog: any;
	public ready = false;

	ngOnInit() {
		const contextConfig = {};

		this.watchdog = new ContextWatchdog( Context );

		this.watchdog.create( contextConfig )
			.then( () => {
				this.ready = true;
			} );
	}
}
```

```html
<div *ngIf="ready">
	<ckeditor [watchdog]="watchdog" ...></ckeditor>
	<ckeditor [watchdog]="watchdog" ...></ckeditor>
	<ckeditor [watchdog]="watchdog" ...></ckeditor>
</div>
```

### `editorWatchdogConfig`

If the `watchdog` property is not used, {@link module:watchdog/editorwatchdog~EditorWatchdog `EditorWatchdog`} will be used by default. `editorWatchdogConfig` property allows for passing a {@link module:watchdog/watchdog~WatchdogConfig config} to that watchdog.

```ts
@Component( {
	// ...
} )
export class MyComponent {
	public myWatchdogConfig = {
		crashNumberLimit: 5,
		// ...
	};
	// ...
}
```

```html
<ckeditor [editorWatchdogConfig]="myWatchdogConfig" ...></ckeditor>
```

### `disableTwoWayDataBinding`

Allows disabling the two-way data binding mechanism. The default value is `false`.

The reason for the introduction of this option are performance issues in large documents. By default, while using the `ngModel` directive, whenever the editor's data is changed, the component must synchronize the data between the editor instance and the connected property. This results in calling the {@link module:core/editor/utils/dataapimixin~DataApi#getData `editor.getData()`} function, which causes a massive slowdown while typing in large documents.

This option allows the integrator to disable the default behavior and only call the {@link module:core/editor/utils/dataapimixin~DataApi#getData `editor.getData()`} method on demand, which prevents the slowdowns. You can read more in the [relevant issue](https://github.com/ckeditor/ckeditor5-angular/issues/141).

## Supported `@Output` properties

The following `@Output` properties are supported by the CKEditor&nbsp;5 rich text editor component for Angular:

### `ready`

Fired when the editor is ready. It corresponds with the [`editor#ready`](https://ckeditor.com/docs/ckeditor5/latest/api/module_core_editor_editor-Editor.html#event-ready) event.
It is fired with the editor instance.

Note that this method might be called multiple times. Apart from initialization, it is also called whenever the editor is restarted after a crash. Do not keep the reference to the editor instance internally, because it will change in case of restart. Instead, you should use `watchdog.editor` property.

### `change`

Fired when the content of the editor has changed. It corresponds with the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event.
It is fired with an object containing the editor and the CKEditor&nbsp;5 `change:data` event object.

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
It is fired with an object containing the editor and the CKEditor&nbsp;5 `blur` event data.

### `focus`

Fired when the editing view of the editor is focused. It corresponds with the {@link module:engine/view/document~Document#event:focus `editor.editing.view.document#focus`} event.
It is fired with an object containing the editor and the CKEditor&nbsp;5 `focus` event data.

### `error`

Fired when the editor crashes. Once the editor is crashed, the internal watchdog mechanism restarts the editor and fires the [ready](#ready) event.

<info-box>
	Prior to ckeditor5-angular `v7.0.1`, this event was not fired for crashes during the editor initialization.
</info-box>

## Styling

The CKEditor&nbsp;5 rich text editor component for Angular can be styled using the component style sheet or using a global style sheet. See how to set the CKEditor&nbsp;5 component's height using these two approaches.

### Setting the height via the component style sheet

First, create a (S)CSS file in the parent component's directory and style the given editor's part preceded by the `:host` and `::ng-deep` pseudo selectors:

```css
/* src/app/app.component.css */

:host ::ng-deep .ck-editor__editable_inline {
	min-height: 500px;
}
```

Then in the parent component add the relative path to the above style sheet:

```ts
/* src/app/app.component.ts */

@Component( {
	// ...
	styleUrls: [ './app.component.css' ]
} )
```

### Setting the height via a global style sheet

To style the component using a global style sheet, first, create it:

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

To display {@link features/editor-placeholder the placeholder} in the main editable element, set the `placeholder` field in the CKEditor&nbsp;5 rich text editor component configuration:

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

The CKEditor&nbsp;5 rich text editor component provides all the functionality needed for most use cases. When access to the full CKEditor&nbsp;5 API is needed you can get the editor instance with an additional step.

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
	The editor creation is asynchronous so the `editorInstance` will not be available until the editor is created. If you want to make changes to an editor that has just been created, a better option would be getting the CKEditor&nbsp;5 instance on the [`ready`](#ready) event.
</info-box>

## Localization

The CKEditor&nbsp;5 rich text editor component can be localized in two steps.

### Loading translation files

First, you need to add translation files to the bundle. This step can be achieved in two ways:

By importing translations for given languages directly in your component file:

```ts
import '@ckeditor/ckeditor5-build-classic/build/translations/de';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// More imports.
// ...
```

By adding paths to translation files to the `"scripts"` array in `angular.json`:

```json
"architect": {
	"build": {
		"options": {
			"scripts": [ "node_modules/@ckeditor/ckeditor5-build-classic/build/translations/de.js" ]
		}
	}
}
```

### Configuring the language

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

For advanced usage see the {@link getting-started/setup/ui-language Setting the UI language} guide.

## Common issues

### zone.js

There is a repeatable issue with zone.js library when upgrading to new Angular versions. The ngOnDestroy handler crashes throwing:
```
ERROR Error: Uncaught (in promise): TypeError: Cannot read property 'data-ck-expando' of undefined
TypeError: Cannot read property 'data-ck-expando' of undefined
```

Workaround: in `polyfills.js` import zone.js using `import zone.js/dist/zone.js` instead of `import 'zone.js'`.
More details:
- [https://github.com/ckeditor/ckeditor5-angular/issues/109](https://github.com/ckeditor/ckeditor5-angular/issues/109)
- [https://github.com/angular/angular/tree/master/packages/zone.js#breaking-changes-since-zonejs-v0111](https://github.com/angular/angular/tree/master/packages/zone.js#breaking-changes-since-zonejs-v0111)

## Contributing and reporting issues

The source code of the CKEditor&nbsp;5 rich text editor component for Angular is available on GitHub in [https://github.com/ckeditor/ckeditor5-angular](https://github.com/ckeditor/ckeditor5-angular).
