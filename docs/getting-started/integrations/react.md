---
menu-title: React
meta-title: React rich text editor component | CKEditor 5 documentation
category: installation
order: 30
---

{@snippet installation/integrations/framework-integration}

# React rich text editor component

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-react" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-react.svg" alt="npm version" loading="lazy">
	</a>
</p>

Rewrite everything.

<info-box hint>
	Starting from version 6.0.0 of this package, you can use native type definitions provided by CKEditor&nbsp;5. Check the details about {@link getting-started/setup/working-with-typescript TypeScript support}.
</info-box>

## Quick start

### Using the Builder

Update

### Installing from npm

This guide assumes you already have a React project. If you want to create a new one, you can use the [`create-react-app`](https://create-react-app.dev/) CLI. It allows you to create and customize your project with templates. For example, you can set up your project with TypeScript support.

Install the [CKEditor&nbsp;5 WYSIWYG editor component for React](https://www.npmjs.com/package/@ckeditor/ckeditor5-react) and the editor build of your choice. Assuming that you picked [`@ckeditor/ckeditor5-build-classic`](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic):

```bash
npm install --save @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic
```

Use the `<CKEditor>` component inside your project:

```tsx
// App.jsx / App.tsx

import React, { Component } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

class App extends Component {
	render() {
		return (
			<div className="App">
				<h2>Using CKEditor&nbsp;5 build in React</h2>
				<CKEditor
					editor={ ClassicEditor }
					data="<p>Hello from CKEditor&nbsp;5!</p>"
					onReady={ editor => {
						// You can store the "editor" and use when it is needed.
						console.log( 'Editor is ready to use!', editor );
					} }
					onChange={ ( event ) => {
						console.log( event );
					} }
					onBlur={ ( event, editor ) => {
						console.log( 'Blur.', editor );
					} }
					onFocus={ ( event, editor ) => {
						console.log( 'Focus.', editor );
					} }
				/>
			</div>
		);
	}
}

export default App;
```

## Component properties

The `<CKEditor>` component supports the following properties:

* `editor` (required) &ndash; The {@link module:core/editor/editor~Editor `Editor`} constructor to use.
* `data` &ndash; The initial data for the created editor. See the {@link getting-started/getting-and-setting-data Getting and setting data} guide.
* `config` &ndash; The editor configuration. See the {@link getting-started/setup/configuration Configuration} guide.
* `id` &ndash; The editor ID. When this property changes, the component restarts the editor with new data instead of setting it on an initialized editor.
* `disabled` &ndash; A Boolean value. The {@link module:core/editor/editor~Editor `editor`} is being switched to read-only mode if the property is set to `true`.
* `disableWatchdog` &ndash; A Boolean value. If set to `true`, {@link features/watchdog the watchdog feature} will be disabled. It is set to `false` by default.
* `watchdogConfig` &ndash; {@link module:watchdog/watchdog~WatchdogConfig Configuration object} for the [watchdog feature](https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html).
* `onReady` &ndash; A function called when the editor is ready with an {@link module:core/editor/editor~Editor `editor`} instance. This callback is also called after the reinitialization of the component if an error occurred.
* `onChange` &ndash; A function called when the editor data has changed. See the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event.
* `onBlur` &ndash; A function called when the editor was blurred. See the {@link module:engine/view/document~Document#event:blur `editor.editing.view.document#blur`} event.
* `onFocus` &ndash; A function called when the editor was focused. See the {@link module:engine/view/document~Document#event:focus `editor.editing.view.document#focus`} event.
* `onError` &ndash; A function called when the editor has crashed during the initialization or during the runtime. It receives two arguments: the error instance and the error details.
	Error details is an object that contains two properties:
	* `{String} phase`: `'initialization'|'runtime'` &ndash; Informs when the error has occurred (during the editor or context initialization, or after the initialization).
	* `{Boolean} willEditorRestart` &ndash; When `true`, it means that the editor component will restart itself.

The editor event callbacks (`onChange`, `onBlur`, `onFocus`) receive two arguments:

1. An {@link module:utils/eventinfo~EventInfo `EventInfo`} object.
2. An {@link module:core/editor/editor~Editor `Editor`} instance.

## Context feature

The [`@ckeditor/ckeditor5-react`](https://www.npmjs.com/package/@ckeditor/ckeditor5-react) package provides a ready-to-use component for the {@link features/context-and-collaboration-features context feature} that is useful when used together with some {@link features/collaboration CKEditor&nbsp;5 collaboration features}.

```jsx
// This sample assumes that the application is using a CKEditor&nbsp;5 editor built from source.

import React, { Component } from 'react';
import {
	CKEditor,
	CKEditorContext,
	ClassicEditor,
	Context,
	Bold,
	Italic,
	Essentials,
	Paragraph
	} from 'ckeditor5';

class App extends Component {
	render() {
		return (
			<div className="App">
				<CKEditorContext context={ Context }>
					<h2>Using the CKEditor&nbsp;5 context feature in React</h2>
					<CKEditor
						editor={ ClassicEditor }
						config={ {
							plugins: [ Paragraph, Bold, Italic, Essentials ],
							toolbar: [ 'bold', 'italic' ]
						} }
						data="<p>Hello from the first editor working with the context!</p>"
						onReady={ editor => {
							// You can store the "editor" and use when it is needed.
							console.log( 'Editor1 is ready to use!', editor );
						} }
					/>

					<CKEditor
						editor={ ClassicEditor }
						config={ {
							plugins: [ Paragraph, Bold, Italic, Essentials ],
							toolbar: [ 'bold', 'italic' ]
						} }
						data="<p>Hello from the second editor working with the context!</p>"
						onReady={ editor => {
							// You can store the "editor" and use when it is needed.
							console.log( 'Editor2 is ready to use!', editor );
						} }
					/>
				</CKEditorContext>
			</div>
		);
	}
}

export default App;
```

### Context feature properties

The `CKEditorContext` component supports the following properties:

* `context` (required) &ndash; {@link module:core/context~Context The CKEditor&nbsp;5 context class}.
* `config` &ndash; The CKEditor&nbsp;5 context configuration.
* `isLayoutReady` &ndash; A property that delays the context creation when set to `false`. It creates the context and the editor children once it is `true` or unset. Useful when the CKEditor&nbsp;5 annotations or a presence list are used.
* `id` &ndash; The context ID. When this property changes, the component restarts the context with its editor and reinitializes it based on the current configuration.
* `onReady` &ndash; A function called when the context is ready and all editors inside were initialized with the `context` instance. This callback is also called after the reinitialization of the component if an error has occurred.
* `onError` &ndash; A function called when the context has crashed during the initialization or during the runtime. It receives two arguments: the error instance and the error details.
	Error details is an object that contains two properties:
	* `{String} phase`: `'initialization'|'runtime'` &ndash; Informs when the error has occurred (during the editor or context initialization, or after the initialization).
	* `{Boolean} willContextRestart` &ndash; When `true`, it means that the context component will restart itself.

<info-box>
	An example build that exposes both context and classic editor can be found in the [CKEditor&nbsp;5 collaboration sample](https://github.com/ckeditor/ckeditor5-collaboration-samples/blob/master/real-time-collaboration-comments-outside-of-editor-for-react).
</info-box>

## How to?

### Using the document editor build

If you use the {@link framework/document-editor document (decoupled) editor}, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create add the toolbar to the DOM manually}:

```jsx
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

class App extends Component {
	editor = null;

	render() {
		return (
			<div className="App">
				<h2>CKEditor&nbsp;5 using a custom build - decoupled editor</h2>
				<CKEditor
					onReady={ editor => {
						console.log( 'Editor is ready to use!', editor );

						// Insert the toolbar before the editable area.
						editor.ui.getEditableElement().parentElement.insertBefore(
							editor.ui.view.toolbar.element,
							editor.ui.getEditableElement()
						);

						this.editor = editor;
					} }
					onError={ ( error, { willEditorRestart } ) => {
						// If the editor is restarted, the toolbar element will be created once again.
						// The `onReady` callback will be called again and the new toolbar will be added.
						// This is why you need to remove the older toolbar.
						if ( willEditorRestart ) {
							this.editor.ui.view.toolbar.element.remove();
						}
					} }
					onChange={ ( event ) => console.log( event ) }
					editor={ DecoupledEditor }
					data="<p>Hello from CKEditor&nbsp;5's decoupled editor!</p>"
					config={ /* the editor configuration */ }
				/>
			</div>
		);
	}
}

export default App;
```

#### Using the editor with collaboration plugins

The easiest way to integrate {@link features/collaboration collaboration plugins} in a React application is to build the editor from source including the collaboration plugins together with the React application.

<info-box>
	For such a scenario we provide a few **ready-to-use integrations** featuring collaborative editing in React applications:

	* [CKEditor&nbsp;5 with real-time collaboration features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-react)
	* [CKEditor&nbsp;5 with real-time collaboration and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-revision-history-for-react)
	* [CKEditor&nbsp;5 with the revision history feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/revision-history-for-react)
	* [CKEditor&nbsp;5 with the track changes feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/track-changes-for-react)

	It is not mandatory to build applications on top of the above samples, however, they should help you get started.
</info-box>

Note: These integrations are meant to be as simple as possible, so they do not use the Create React App CLI. However, you should have no problem starting from `CRA` after reading the sections below.

### Localization

CKEditor&nbsp;5 supports {@link getting-started/setup/ui-language multiple UI languages}, and so does the official React component. Follow the instructions below to translate CKEditor&nbsp;5 in your React application.

#### Predefined builds

When using one of the {@link getting-started/legacy-getting-started/predefined-builds predefined builds} or the editor built by the [online builder](https://ckeditor.com/ckeditor-5/online-builder/), you need to import the translations first:

**Official editor builds:**

```js
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// Import translations for the German language.
import '@ckeditor/ckeditor5-build-classic/build/translations/de';

// ...
```

**The editor build from the online builder:**

```js
import Editor from 'ckeditor5-custom-build/build/ckeditor';

// Import translations for the German language.
import 'ckeditor5-custom-build/build/translations/de';
```

Then, {@link getting-started/setup/configuration configure} the language of the editor in the component:

```jsx
<CKEditor
	config={ {
		// Use the German language for this editor.
		language: 'de',

		// ...
	} }
	editor={ ClassicEditor }
	data="<p>Hello from CKEditor&nbsp;5!</p>"
/>
```

For more information, please refer to the {@link getting-started/setup/ui-language Setting the UI language} guide.

#### CKEditor&nbsp;5 built from source

Using the editor built from source requires you to modify the webpack configuration. First, install the [official translations webpack plugin](https://www.npmjs.com/package/@ckeditor/ckeditor5-dev-translations) that allows localizing editor builds:

```bash
yarn add @ckeditor/ckeditor5-dev-translations --dev
```

Then, add the installed plugin to the webpack configuration:

```js
// webpack.config.js
'use strict';

// ...
const { CKEditorTranslationsPlugin } = require( '@ckeditor/ckeditor5-dev-translations' );

module.exports = {
	// ...

	plugins: [
		// ....

		new CKEditorTranslationsPlugin( {
			// The UI language. Language codes follow the https://en.wikipedia.org/wiki/ISO_639-1 format.
			language: 'de',
			addMainLanguageTranslationsToAllAssets: true
		} ),

		// ....
	],

	// ...
};
```

After building the application, CKEditor&nbsp;5 will run with the UI translated into the specified language.

For more information, please refer to the {@link getting-started/setup/ui-language Setting the UI language} guide.

## Contributing and reporting issues

The source code of rich text editor component for React is available on GitHub in [https://github.com/ckeditor/ckeditor5-react](https://github.com/ckeditor/ckeditor5-react).
