---
menu-title: Angular
meta-title: Angular rich text editor component | CKEditor 5 documentation
category: installation
order: 30
---

{@snippet installation/integrations/framework-integration}

# Angular rich text editor component

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-angular" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-angular.svg" alt="npm version" loading="lazy">
	</a>
</p>

Angular is a TypeScript-based, open-source, single-page web application framework. The CKEditor 5 component for Angular supports integrating different editor types.

<info-box hint>
	Starting from version 6.0.0 of this package, you can use native type definitions provided by CKEditor&nbsp;5. Check the details about {@link getting-started/setup/typescript-support TypeScript support}.
</info-box>

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

### Using CKEditor&nbsp;5 Builder

The easiest way to use CKEditor 5 in your Angular application is by configuring it with [CKEditor&nbsp;5 Builder](https://ckeditor.com/builder?redirect=docs) and integrating it with your application. Builder offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs. You can easily select:
* the features you need,
* the preferred framework (React, Angular, Vue or Vanilla JS),
* the preferred distribution method.

You get ready-to-use code tailored to your needs!

### Setting up the project

This guide assumes you already have a Angular project. To create such a project, you can use Angular CLI. Refer to the [Angular documentation](https://angular.io/cli) to learn more.

### Installing from npm

First, install the CKEditor 5 packages:

* `ckeditor5` &ndash; package with open-source plugins and features.
* `ckeditor5-premium-features` &ndash; package with premium plugins and features.

Depending on your configuration and chosen plugins, you may need to install the first or both packages.

```bash
npm install ckeditor5 ckeditor5-premium-features
```

Then, install the [CKEditor&nbsp;5 WYSIWYG editor component for Angular](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular):

```bash
npm install @ckeditor/ckeditor5-angular
```

The following setup differs depending on the type of component you use.

#### NGModule components

If you want to use NGModule components, add the `CKEditorModule` to the `imports` array. It will make the CKEditor&nbsp;5 component available in your Angular application.

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

Then, import the editor in your Angular component and assign it to a `public` property to make it accessible from the template. The below example shows how to use the component with open-source and premium plugins.

```ts
// app.component.ts

import { Component } from '@angular/core';
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo } from 'ckeditor5';
import { SlashCommand } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css' ]
} )
export class AppComponent {
	title = 'angular';

	public Editor = ClassicEditor;
	public config = {
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
		plugins: [
			Bold, Essentials, Italic, Mention, Paragraph, SlashCommand, Undo
		],
		licenseKey: '<YOUR_LICENSE_KEY>',
		mention: {
			// Mention configuration
		}
	}
}
```

Finally, use the `<ckeditor>` tag in the template to run the rich text editor:

```html
<!-- app.component.html -->

<ckeditor [editor]="Editor" [config]="config" data="<p>Hello, world!</p>"></ckeditor>
```

#### Standalone components

Standalone components provide a simplified way to build Angular applications. They are enabled in Angular 17 by default. Standalone components aim to simplify the setup and reduce the need for `NGModules`. That is why you do not need such a module in this case.

Instead, add the `CKEditorModule` to the imports in your app component. The component needs the `standalone` option set to `true`.

```ts
import { Component } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo } from 'ckeditor5';
import { SlashCommand } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [ CKEditorModule ],
	standalone: true
} )
export class AppComponent {
	title = 'angular';

	public Editor = ClassicEditor;
	public config = {
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
		plugins: [
			Bold, Essentials, Italic, Mention, Paragraph, SlashCommand, Undo
		],
		licenseKey: '<YOUR_LICENSE_KEY>',
		mention: {
			// Mention configuration
		}
	}
}
```

Then, use the `<ckeditor>` tag in the template to run the rich text editor:

```html
<!-- app.component.html -->

<ckeditor [editor]="Editor" [config]="config" data="<p>Hello, world!</p>"></ckeditor>
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
<ckeditor [config]="{ toolbar: [ 'heading', '|', 'bold', 'italic' ] }"></ckeditor>
```

### `data`

The initial data of the editor. It can be a static value:

```html
<ckeditor data="<p>Hello, world!</p>"></ckeditor>
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
<ckeditor [data]="editorData"></ckeditor>
```

### `tagName`

The tag name of the HTML element on which the rich text editor will be created.

The default tag is `<div>`.

```html
<ckeditor tagName="textarea"></ckeditor>
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
<ckeditor [disabled]="isDisabled"></ckeditor>

<button (click)="toggleDisabled()">
	{{ isDisabled ? 'Enable editor' : 'Disable editor' }}
</button>
```

<!-- TODO: Change the watchdog section if needed -->

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
	<ckeditor [watchdog]="watchdog"></ckeditor>
	<ckeditor [watchdog]="watchdog"></ckeditor>
	<ckeditor [watchdog]="watchdog"></ckeditor>
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
<ckeditor [editorWatchdogConfig]="myWatchdogConfig"></ckeditor>
```

### `disableTwoWayDataBinding`

Allows disabling the two-way data binding mechanism. The default value is `false`.

The reason for the introduction of this option are performance issues in large documents. By default, while using the `ngModel` directive, whenever the editor's data is changed, the component must synchronize the data between the editor instance and the connected property. This results in calling the {@link module:core/editor/editor~Editor#getData `editor.getData()`} function, which causes a massive slowdown while typing in large documents.

This option allows the integrator to disable the default behavior and only call the {@link module:core/editor/editor~Editor#getData `editor.getData()`} method on demand, which prevents the slowdowns. You can read more in the [relevant issue](https://github.com/ckeditor/ckeditor5-angular/issues/141).

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
import { ClassicEditor } from 'ckeditor5';
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
	// ...
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

### Styling

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

#### Setting the height via a global style sheet

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

#### Setting the placeholder

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

### Accessing the editor instance

The CKEditor&nbsp;5 rich text editor component provides all the functionality needed for most use cases. When access to the full CKEditor&nbsp;5 API is needed you can get the editor instance with an additional step.

To do this, create a template reference variable `#editor` pointing to the `<ckeditor>` component:

```html
<ckeditor #editor [editor]="Editor"></ckeditor>
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

## How to?

### Using the Document editor type

If you want to use the {@link framework/document-editor document (decoupled) editor}, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create add the toolbar to the DOM manually}:

```ts
// app.component.ts

import { Component } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DecoupledEditor, Essentials, Italic, Paragraph, Bold, Undo } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [ CKEditorModule ],
	standalone: true
} )
export class AppComponent {
	title = 'angular';

	public Editor = DecoupledEditor;
	public config = {
		plugins: [ Bold, Essentials, Italic, Paragraph, Undo ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ]
	}
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

And then, link the method in the template:

```html
<!-- app.component.html -->

<ckeditor [editor]="Editor" data="<p>Hello, world!</p>" (ready)="onReady($event)"></ckeditor>
```

### Using the editor with collaboration plugins

We provide a few **ready-to-use integrations** featuring collaborative editing in Angular applications:

* [CKEditor&nbsp;5 with real-time collaboration features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-angular)
* [CKEditor&nbsp;5 with real-time collaboration and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-revision-history-for-angular)
* [CKEditor&nbsp;5 with the revision history feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/revision-history-for-angular)
* [CKEditor&nbsp;5 with the track changes feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/track-changes-for-angular)

It is not mandatory to build applications on top of the above samples, however, they should help you get started.

### Localization

CKEditor 5 supports multiple UI languages, and so does the official Angular component. Follow the instructions below to translate CKEditor 5 in your Angular application.

Similarly to CSS style sheets, both packages have separate translations. Import them as shown in the example below. Then, pass them to the translations array of the `config` property.

```ts
import { Component } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor } from 'ckeditor5';
// More imports...

import coreTranslations from 'ckeditor5/translations/es.js';
import commercialTranslations from 'ckeditor5-premium-features/translations/es.js';

// style sheets imports...

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [ CKEditorModule ],
	standalone: true
} )
export class AppComponent {
	title = 'angular';
	public Editor = ClassicEditor;
	public config = {
		translations: [ coreTranslations, commercialTranslations ]
	}
}
```

For advanced usage see the {@link getting-started/setup/ui-language Setting the UI language} guide.

## Contributing and reporting issues

The source code of the CKEditor&nbsp;5 rich text editor component for Angular is available on GitHub in [https://github.com/ckeditor/ckeditor5-angular](https://github.com/ckeditor/ckeditor5-angular).
