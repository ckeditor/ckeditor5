---
menu-title: Default integration
meta-title: Using CKEditor 5 with React rich text editor componentfrom npm | CKEditor 5 Documentation
meta-description: Install, integrate and configure CKEditor 5 using the default React component with npm.
category: react-npm
order: 10
---

# Integrating CKEditor&nbsp;5 with React rich text editor component from npm

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-react" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-react.svg" alt="npm version" loading="lazy">
	</a>
</p>

CKEditor&nbsp;5 has an official React integration that you can use to add a rich text editor to your application. This guide will help you install it and configure to use the npm distribution of the CKEditor&nbsp;5.

{@snippet getting-started/use-builder}

## Quick start

This guide assumes that you already have a React project. If you do not have one, see the [React documentation](https://react.dev/learn/start-a-new-react-project) to learn how to create it.

First, install the CKEditor&nbsp;5 packages:

* `ckeditor5` &ndash; package with open-source plugins and features.
* `ckeditor5-premium-features` &ndash; package with premium plugins and features.

Depending on your configuration and chosen plugins, you may need to install the first or both packages.

```bash
npm install ckeditor5 ckeditor5-premium-features
```

Then, install the [CKEditor 5 WYSIWYG editor component for React](https://www.npmjs.com/package/@ckeditor/ckeditor5-react):

```bash
npm install @ckeditor/ckeditor5-react
```

Use the `<CKEditor>` component inside your project. The below example shows how to use the component with open-source and premium plugins.

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from npm:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

```jsx
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor, Essentials, Paragraph, Bold, Italic } from 'ckeditor5';
import { FormatPainter } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

function App() {
	return (
		<CKEditor
			editor={ ClassicEditor }
			config={ {
				licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
				plugins: [ Essentials, Paragraph, Bold, Italic, FormatPainter ],
				toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter' ],
				initialData: '<p>Hello from CKEditor 5 in React!</p>',
			} }
		/>
	);
}

export default App;
```

Remember to import the necessary style sheets. The `ckeditor5` package contains the styles for open-source features, while the `ckeditor5-premium-features` package contains the premium features styles.

## Component properties

The `<CKEditor>` component supports the following properties:

* `editor` (required) &ndash; The {@link module:core/editor/editor~Editor `Editor`} constructor to use.
* `data` &ndash; The initial data for the created editor. See the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* `config` &ndash; The editor configuration. See the {@link getting-started/setup/configuration Configuration} guide.
* `id` &ndash; The editor ID. When this property changes, the component restarts the editor with new data instead of setting it on an initialized editor.
* `disabled` &ndash; A Boolean value. The {@link module:core/editor/editor~Editor `editor`} is being switched to read-only mode if the property is set to `true`.
* `disableWatchdog` &ndash; A Boolean value. If set to `true`, {@link features/watchdog the watchdog feature} will be disabled. It is set to `false` by default.
* `watchdogConfig` &ndash; {@link module:watchdog/watchdog~WatchdogConfig Configuration object} for the [watchdog feature](https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html).
* `onReady` &ndash; A function called when the editor is ready with an {@link module:core/editor/editor~Editor `editor`} instance. This callback is also called after the reinitialization of the component if an error occurred.
* `onAfterDestroy` &ndash; A function called after the successful destruction of an editor instance rendered by the component. This callback is also triggered after the editor has been reinitialized after an error. The component is not guaranteed to be mounted when this function is called.
* `onChange` &ndash; A function called when the editor data has changed. See the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event.
* `onBlur` &ndash; A function called when the editor was blurred. See the {@link module:engine/view/document~Document#event:blur `editor.editing.view.document#blur`} event.
* `onFocus` &ndash; A function called when the editor was focused. See the {@link module:engine/view/document~Document#event:focus `editor.editing.view.document#focus`} event.
* `onError` &ndash; A function called when the editor has crashed during the initialization or during the runtime. It receives two arguments: the error instance and the error details. Error details is an object that contains two properties:
  * `{String} phase`: `'initialization'|'runtime'` &ndash; Informs when the error has occurred (during the editor or context initialization, or after the initialization).
  * `{Boolean} willEditorRestart` &ndash; When `true`, it means that the editor component will restart itself.

The editor event callbacks (`onChange`, `onBlur`, `onFocus`) receive two arguments:

1. An {@link module:utils/eventinfo~EventInfo `EventInfo`} object.
2. An {@link module:core/editor/editor~Editor `Editor`} instance.

## Context feature

The [`@ckeditor/ckeditor5-react`](https://www.npmjs.com/package/@ckeditor/ckeditor5-react) package provides a ready-to-use component for the {@link features/context-and-collaboration-features context feature} that is useful when used together with some {@link features/collaboration CKEditor&nbsp;5 collaboration features}.

```jsx
import { ClassicEditor, Context, Bold, Essentials, Italic, Paragraph, ContextWatchdog } from 'ckeditor5';
import { CKEditor, CKEditorContext } from '@ckeditor/ckeditor5-react';

import 'ckeditor5/ckeditor5.css';

function App() {
  return (
	<CKEditorContext context={ Context } contextWatchdog={ ContextWatchdog }>
	  <CKEditor
		editor={ ClassicEditor }
		config={ {
		  licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		  plugins: [ Essentials, Bold, Italic, Paragraph ],
		  toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
		} }
		data='<p>Hello from the first editor working with the context!</p>'
		onReady={ ( editor ) => {
		  // You can store the "editor" and use when it is needed.
		  console.log( 'Editor 1 is ready to use!', editor );
		} }
	  />

	  <CKEditor
		editor={ ClassicEditor }
		config={ {
		  licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		  plugins: [ Essentials, Bold, Italic, Paragraph ],
		  toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
		} }
		data='<p>Hello from the second editor working with the context!</p>'
		onReady={ ( editor ) => {
		  // You can store the "editor" and use when it is needed.
		  console.log( 'Editor 2 is ready to use!', editor );
		} }
	  />
	</CKEditorContext>
  );
}

export default App;
```

The `CKEditorContext` component supports the following properties:

* `context` (required) &ndash; {@link module:core/context~Context The CKEditor&nbsp;5 context class}.
* `contextWatchdog` (required) &ndash; {@link module:watchdog/contextwatchdog~ContextWatchdog The Watchdog context class}.
* `config` &ndash; The CKEditor&nbsp;5 context configuration.
* `isLayoutReady` &ndash; A property that delays the context creation when set to `false`. It creates the context and the editor children once it is `true` or unset. Useful when the CKEditor&nbsp;5 annotations or a presence list are used.
* `id` &ndash; The context ID. When this property changes, the component restarts the context with its editor and reinitializes it based on the current configuration.
* `onChangeInitializedEditors` &ndash; A function called when any editor is initialized or destroyed in the tree. It receives a dictionary of fully initialized editors, where the key is the value of the `contextItemMetadata.name` property set on the `CKEditor` component. The editor's ID is the key if the `contextItemMetadata` property is absent. Additional data can be added to the `contextItemMetadata` in the `CKEditor` component, which will be passed to the `onChangeInitializedEditors` function.
* `onReady` &ndash; A function called when the context is ready and all editors inside were initialized with the `context` instance. This callback is also called after the reinitialization of the component if an error has occurred.
* `onError` &ndash; A function called when the context has crashed during the initialization or during the runtime. It receives two arguments: the error instance and the error details. Error details is an object that contains two properties:
  * `{String} phase`: `'initialization'|'runtime'` &ndash; Informs when the error has occurred (during the editor or context initialization, or after the initialization).
  * `{Boolean} willContextRestart` &ndash; When `true`, it means that the context component will restart itself.

<info-box>
	An example build that exposes both context and classic editor can be found in the [CKEditor&nbsp;5 collaboration sample](https://github.com/ckeditor/ckeditor5-collaboration-samples/blob/master/real-time-collaboration-comments-outside-of-editor-for-react).
</info-box>

## How to?

### Using the document editor type

If you use the {@link framework/document-editor document (decoupled) editor}, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create add the toolbar to the DOM manually}:

```jsx
import { useEffect, useRef, useState } from 'react';
import { DecoupledEditor, Bold, Essentials, Italic, Paragraph } from 'ckeditor5';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import 'ckeditor5/ckeditor5.css';

function App() {
	const editorToolbarRef = useRef( null );
	const [ isMounted, setMounted ] = useState( false );

	useEffect( () => {
		setMounted( true );

		return () => {
			setMounted( false );
		};
	}, [] );

	return (
		<div>
			<div ref={ editorToolbarRef }></div>
			<div>
				{ isMounted && (
					<CKEditor
						editor={ DecoupledEditor }
						data='<p>Hello from CKEditor 5 decoupled editor!</p>'
						config={ {
		  					licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
							plugins: [ Bold, Italic, Paragraph, Essentials ],
							toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ]
						} }
						onReady={ ( editor ) => {
							if ( editorToolbarRef.current ) {
								editorToolbarRef.current.appendChild( editor.ui.view.toolbar.element );
							}
						}}
						onAfterDestroy={ ( editor ) => {
							if ( editorToolbarRef.current ) {
								Array.from( editorToolbarRef.current.children ).forEach( child => child.remove() );
							}
						}}
					/>
				) }
			</div>
		</div>
	);
}

export default App;
```

### Using the editor with collaboration plugins

We provide a few **ready-to-use integrations** featuring collaborative editing in React applications:

* [CKEditor&nbsp;5 with real-time collaboration features and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-react)
* [CKEditor&nbsp;5 with offline comments, track changes and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/collaboration-for-react)

It is not mandatory to build applications on top of the above samples, however, they should help you get started.

### Localization

CKEditor&nbsp;5 supports {@link getting-started/setup/ui-language multiple UI languages}, and so does the official React component. Follow the instructions below to translate CKEditor&nbsp;5 in your React application.

Similarly to CSS style sheets, both packages have separate translations. Import them as shown in the example below. Then, pass them to the `translations` array inside the `config` prop in the CKEditor 5 component.

```jsx
import { ClassicEditor } from 'ckeditor5';
import { CKEditor } from '@ckeditor/ckeditor5-react';
// More imports...

import coreTranslations from 'ckeditor5/translations/es.js';
import premiumFeaturesTranslations from 'ckeditor5-premium-features/translations/es.js';

function App() {
	return (
		<CKEditor
			editor={ ClassicEditor }
			config={ {
				// ... Other configuration options ...
				translations: [ coreTranslations, premiumFeaturesTranslations ],
				initialData: '<p>Hola desde CKEditor 5 en React!</p>'
			} }
		/>
	);
}

export default App;
```

For more information, please refer to the {@link getting-started/setup/ui-language Setting the UI language} guide.

### Jest testing

Jest is the default test runner used by many React apps. Unfortunately, Jest does not use a real browser. Instead, it runs tests in Node.js that uses JSDOM. JSDOM is not a complete DOM implementation, and while it is sufficient for standard apps, it cannot polyfill all the DOM APIs that CKEditor&nbsp;5 requires.

For testing CKEditor&nbsp;5, it is recommended to use testing frameworks that utilize a real browser and provide a complete DOM implementation. Some popular options include:

* [Vitest](https://vitest.dev/)
* [Playwright](https://playwright.dev/)
* [Cypress](https://www.cypress.io/)

These frameworks offer better support for testing CKEditor&nbsp;5 and provide a more accurate representation of how the editor behaves in a real browser environment.

If this is not possible and you still want to use Jest, you can mock some of the required APIs. Below is an example of how to mock some of the APIs used by CKEditor&nbsp;5:

```jsx
import { TextEncoder } from 'util';
import React, { useRef } from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { DecoupledEditor, Essentials, Paragraph } from 'ckeditor5';
import { CKEditor } from '@ckeditor/ckeditor5-react';

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

const SomeComponent = ( { value, onChange } ) => {
	const editorRef = useRef();

	return (
		<div
			style={{
				border: '1px solid black',
				padding: 10,
			}}
		>
			<CKEditor
				editor={ DecoupledEditor }
				config={{
					plugins: [ Essentials, Paragraph ],
				}}
				onReady={ (editor) => {
					editorRef.current = editor;
				} }
				data={ value }
				onChange={ () => {
					onChange( editorRef.current?.getData() );
				} }
			/>
		</div>
	);
};

it( 'renders', async () => {
	render( <SomeComponent value="this is some content" /> );

	await waitFor( () => expect( screen.getByText( /some content/ ) ).toBeTruthy());
} );

it( 'updates', async () => {
	const onChange = jest.fn();
	render( <SomeComponent value="this is some content" onChange={onChange} /> );

	await waitFor( () => expect( screen.getByText( /some content/ ) ).toBeTruthy() );

	await userEvent.click( document.querySelector( '[contenteditable="true"]' ) );

	userEvent.keyboard( 'more stuff' );

	await waitFor( () => expect( onChange ).toHaveBeenCalled() );
} );
```

The mocks presented above only test two basic scenarios, and more will likely need to be added, which may change with each version of the editor.

## Contributing and reporting issues

The source code of rich text editor component for React is available on GitHub in [https://github.com/ckeditor/ckeditor5-react](https://github.com/ckeditor/ckeditor5-react).

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
