---
menu-title: Angular
meta-title: Using CKEditor 5 with Angular rich text editor component from npm | CKEditor 5 Documentation
meta-description: Install, integrate and configure CKEditor 5 using the Angular component with npm.
category: self-hosted
order: 30
---

# Integrating CKEditor&nbsp;5 with Angular from npm

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-angular" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-angular.svg" alt="npm version" loading="lazy">
	</a>
</p>

Angular is a TypeScript-based, open-source, single-page web application framework. The CKEditor 5 component for Angular supports integrating different editor types.

{@snippet getting-started/use-builder}

## Quick start

This guide assumes you already have an Angular project. To create such a project, you can use Angular CLI. Refer to the [Angular documentation](https://angular.io/cli) to learn more.

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

The following setup differs depending on the type of components you use.

### Standalone components

Standalone components provide a simplified way to build Angular applications. They are enabled in Angular 17 by default. Standalone components aim to simplify the setup and reduce the need for `NGModules`. That is why you do not need such a module in this case.

Instead, add the `CKEditorModule` to the imports in your app component. The component needs the `standalone` option set to `true`. The example below shows how to use the component with open-source and premium plugins.

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from npm:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

```ts
// app.component.ts

import { Component, ViewEncapsulation } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor, Bold, Essentials, Italic, Paragraph } from 'ckeditor5';
import { FormatPainter } from 'ckeditor5-premium-features';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	encapsulation: ViewEncapsulation.None,
	imports: [ CKEditorModule ],
	standalone: true
} )
export class AppComponent {
	title = 'angular';

	public Editor = ClassicEditor;
	public config = {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Paragraph, Bold, Italic, FormatPainter ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter' ]
	}
}
```

Depending on the plugins used (open source only or premium too), you may need to import the first or both CSS files. Angular, by default, scopes styles to a particular component. Because of that, the editor may not detect attached styles. You must set the encapsulation option to `ViewEncapsulation.None` to turn this scoping off.

```css
/* app.component.css */

@import 'ckeditor5/ckeditor5.css';
@import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
```

Then, use the `<ckeditor>` tag in the template to run the rich text editor:

```html
<!-- app.component.html -->

<ckeditor [editor]="Editor" [config]="config" data="<p>Hello, world!</p>"></ckeditor>
```

### NGModule components

If you want to use NGModule components, add the `CKEditorModule` to the `imports` array. It will make the CKEditor&nbsp;5 component available in your Angular application.

```ts
// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { AppComponent } from './app.component';

@NgModule( {
	declarations: [ AppComponent ],
	imports: [ BrowserModule, CKEditorModule ],
	providers: [],
	bootstrap: [ AppComponent ]
} )
export class AppModule { }
```

Then, import the editor in your Angular component and assign it to a `public` property to make it accessible from the template. The below example shows how to use the component with open-source and premium plugins.

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from npm:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

```ts
// app.component.ts

import { Component, ViewEncapsulation } from '@angular/core';
import { ClassicEditor, Essentials, Paragraph, Bold, Italic } from 'ckeditor5';
import { FormatPainter } from 'ckeditor5-premium-features';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css' ],
	encapsulation: ViewEncapsulation.None
} )
export class AppComponent {
	title = 'angular';

	public Editor = ClassicEditor;
	public config = {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Paragraph, Bold, Italic, FormatPainter ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter' ]
	}
}
```

Depending on the plugins you used, you may need to import the first or both CSS files. Angular, by default, scope styles to a particular component. Because of that, the editor may not detect attached styles. You must set the encapsulation option to `ViewEncapsulation.None` to turn this scoping off.

```css
/* app.component.css */

@import 'ckeditor5/ckeditor5.css';
@import 'ckeditor5-premium-features/ckeditor5-premium-features.css';
```

Finally, use the `<ckeditor>` tag in the template to run the rich text editor:

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
import { Editor, Context, ContextWatchdog } from 'ckeditor5';

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

import { Component, ViewEncapsulation } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DecoupledEditor, Essentials, Italic, Paragraph, Bold } from 'ckeditor5';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css' ],
	encapsulation: ViewEncapsulation.None
	imports: [ CKEditorModule ],
	standalone: true
} )
export class AppComponent {
	title = 'angular';

	public Editor = DecoupledEditor;
	public config = {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Bold, Essentials, Italic, Paragraph ],
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

Import the needed CSS style sheet:

```css
/* app.component.css */

@import 'ckeditor5/ckeditor5.css';
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

Similarly to CSS style sheets, both packages have separate translations. Import them as shown in the example below. Then, pass them to the `translations` array of the `config` property.

```ts
// app.component.ts

import { Component, ViewEncapsulation } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor } from 'ckeditor5';
// More imports...

import coreTranslations from 'ckeditor5/translations/es.js';
import premiumFeaturesTranslations from 'ckeditor5-premium-features/translations/es.js';

@Component( {
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [ './app.component.css' ],
	encapsulation: ViewEncapsulation.None
	imports: [ CKEditorModule ],
	standalone: true
} )
export class AppComponent {
	title = 'angular';
	public Editor = ClassicEditor;
	public config = {
		// ... Other configuration options ...
		translations: [ coreTranslations, premiumFeaturesTranslations ]
	}
}
```

For advanced usage see the {@link getting-started/setup/ui-language Setting the UI language} guide.

<info-box warning>
There is a known issue related to the localization in Angular 17. Read more in the [known issues section](#known-issues) below.
</info-box>

## Known issues

### Module resolution

The `moduleResolution` option of the TypeScript configuration determines the algorithm for finding and resolving modules from `node_modules`. In Angular 17, the option is set to `node` by default. This option prevents type declaration for editor translations from being correctly loaded. To fix it, you have several options:

* You can set the `moduleResolution` option to `bundler`. It is the recommended setting in TypeScript 5.0+ for applications that use a bundler. And it is a recommended way of fixing this problem. You can check other solutions below for lower TypeScript versions.
* You can tell the TypeScript compiler to suppress the problem using the `// @ts-expect-error` comment above the imported translations.
* You can update Angular to version 18, where the `moduleResolution` option is set to `bundler`  by default.
* You can import translations directly from our CDN, like: `import ‘https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/translations/es.umd.js’;`. This way, the editor will load the translations automatically, so you do not need to pass them manually into the configuration.

### Jest testing

You can use Jest as a test runner in Angular apps. Unfortunately, Jest does not use a real browser. Instead, it runs tests in Node.js that uses JSDOM. JSDOM is not a complete DOM implementation, and while it is sufficient for standard apps, it cannot polyfill all the DOM APIs that CKEditor&nbsp;5 requires.

For testing CKEditor&nbsp;5, it is recommended to use testing frameworks that utilize a real browser and provide a complete DOM implementation. Some popular options include:

* [Vitest](https://vitest.dev/)
* [Playwright](https://playwright.dev/)
* [Cypress](https://www.cypress.io/)

These frameworks offer better support for testing CKEditor&nbsp;5 and provide a more accurate representation of how the editor behaves in a real browser environment.

If this is not possible and you still want to use Jest, you can mock some of the required APIs. Below is an example of how to mock some of the APIs used by CKEditor&nbsp;5:

```javascript
import { TextEncoder } from 'util';

beforeAll( () => {
	window.TextEncoder = TextEncoder;

	window.scrollTo = jest.fn();

	window.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};

	for ( const key of [ 'InputEvent', 'KeyboardEvent' ] ) {
		window[ key ].prototype.getTargetRanges = () => {
			const range = new StaticRange( {
				startContainer: document.body.querySelector( '.ck-editor__editable p' ),
				startOffset: 0,
				endContainer: document.body.querySelector( '.ck-editor__editable p' ),
				endOffset: 0
			} );

			return [ range ];
		};
	}

	const getClientRects = () => ({
		item: () => null,
		length: 0,
		[Symbol.iterator]: function* () {}
	});

	Range.prototype.getClientRects = getClientRects;
	Element.prototype.getClientRects = getClientRects;

	if ( !Document.prototype.createElementNS ) {
		Document.prototype.createElementNS = ( namespace, name ) => {
			const element = document.createElement( name );
			element.namespaceURI = namespace;
			return element;
		};
	}
} );
```

These mocks should be placed before the tests that use CKEditor&nbsp;5. They are imperfect and may not cover all the cases, but they should be sufficient for basic initialization and rendering editor. Keep in mind that they are not a replacement for proper browser testing.

## Supported Angular versions

Because of the breaking changes in the Angular library output format, the `@ckeditor/ckeditor5-angular` package is released in the following versions to support various Angular ecosystems:

<table>
  <thead>
	<tr>
	 <th>CKEditor&nbsp;5&nbsp; Angular component version</th>
	 <th>Angular&nbsp;version</th>
	 <th>Details</th>
	</tr>
  </thead>
  <tbody>
	<tr>
	 <td colspan="3">Actively supported versions</td>
	</tr>
	<tr>
	 <td><code>^9</code></td>
	 <td><code>16+</code></td>
	 <td>Migration to TypeScript&nbsp;5. Declaration files are not backward compatible. Requires CKEditor&nbsp;5 in version <a href="https://github.com/ckeditor/ckeditor5/releases/tag/v43.0.0">43</a> or higher.</td>
	</tr>
	<tr>
	 <td colspan="3">Past releases (no longer maintained)</td>
	</tr>
	<tr>
	 <td><code>^8</code></td>
	 <td><code>13+</code></td>
	 <td>Requires CKEditor&nbsp;5 in version <a href="https://github.com/ckeditor/ckeditor5/releases/tag/v42.0.0">42</a> or higher.</td>
	</tr>
	<tr>
	 <td><code>^7</code></td>
	 <td><code>13+</code></td>
	 <td>Changes in peer dependencies (<a href="https://github.com/ckeditor/ckeditor5-angular/issues/376">issue</a>). Requires CKEditor&nbsp;5 in version <a href="https://github.com/ckeditor/ckeditor5/releases/tag/v37.0.0">37</a> or higher.</td>
	</tr>
	<tr>
	 <td><code>^6</code></td>
	 <td><code>13+</code></td>
	 <td>Requires CKEditor&nbsp;5 in version <a href="https://github.com/ckeditor/ckeditor5/releases/tag/v37.0.0">37</a> or higher.</td>
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
	 <td>Angular versions no longer maintained.</td>
	</tr>
  </tbody>
</table>

All available Angular versions are [listed on npm](https://www.npmjs.com/package/@ckeditor/ckeditor5-angular), where they can be pulled from.

## Contributing and reporting issues

The source code of the CKEditor&nbsp;5 rich text editor component for Angular is available on GitHub in [https://github.com/ckeditor/ckeditor5-angular](https://github.com/ckeditor/ckeditor5-angular).

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
