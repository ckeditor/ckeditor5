---
menu-title: Default integration
meta-title: Using CKEditor 5 with React from CDN | CKEditor 5 Documentation
meta-description: Install, integrate and configure CKEditor 5 using the React component with CDN.
category: react-cdn
order: 10
---

# Integrating CKEditor&nbsp;5 with React from CDN

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-react" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-react.svg" alt="npm version" loading="lazy">
	</a>
</p>

CKEditor&nbsp;5 has an official React integration that you can use to add a rich text editor to your application. This guide will help you install it and configure to use the CDN distribution of the CKEditor&nbsp;5.

{@snippet getting-started/use-builder}

## Quick start

This guide assumes that you already have a React project. If you do not have one, see the [React documentation](https://react.dev/learn/start-a-new-react-project) to learn how to create it.

<info-box>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

Start by installing the React integration for CKEditor&nbsp;5 from npm:

```bash
npm install @ckeditor/ckeditor5-react
```

Once the integration is installed, create a new React component called `Editor.jsx`. It will use the `useCKEditorCloud` helper to load the editor code from the CDN and the `<CKEditor>` component to run it, both of which come from the above package. The following example shows a component with open source and premium CKEditor&nbsp;5 plugins.

```js
import React from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

const CKEditorDemo = () => {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}',
		premium: true
	} );

	if ( cloud.status === 'error' ) {
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const {
		ClassicEditor,
		Essentials,
		Paragraph,
		Bold,
		Italic
	} = cloud.CKEditor;

	const { FormatPainter } = cloud.CKEditorPremiumFeatures;

	return (
		<CKEditor
			editor={ ClassicEditor }
			data={ '<p>Hello world!</p>' }
			config={ {
				licenseKey: '<YOUR_LICENSE_KEY>',
				plugins: [ Essentials, Paragraph, Bold, Italic, FormatPainter ],
				toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter' ]
			} }
		/>
	);
};
```

In the above example, the `useCKEditorCloud` helper is used to load the editor code and plugins from CDN. The `premium` option is set to also load premium plugins. For more information about the `useCKEditorCloud` helper, see the {@link getting-started/setup/loading-cdn-resources Loading CDN resources} guide.

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
* `phase`: `'initialization'|'runtime'` &ndash; Informs when the error has occurred (during or after the editor/context initialization).
* `willEditorRestart` &ndash; When `true`, it means the editor component will restart itself.

The editor event callbacks (`onChange`, `onBlur`, `onFocus`) receive two arguments:

1. An {@link module:utils/eventinfo~EventInfo `EventInfo`} object.
2. An {@link module:core/editor/editor~Editor `Editor`} instance.

## Context feature

The [`@ckeditor/ckeditor5-react`](https://www.npmjs.com/package/@ckeditor/ckeditor5-react) package provides a ready-to-use component for the {@link features/context-and-collaboration-features context feature} that is useful to use with some {@link features/collaboration CKEditor&nbsp;5 collaboration features}.

```jsx
import React from 'react';
import { CKEditor, CKEditorContext, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

export const CKEditorCloudContextDemo = () => {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}'
	} );

	if ( cloud.status === 'error' ) {
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const { ClassicEditor } = cloud.CKEditor;

	return (
		<CKEditorContext
			context={ ClassicEditor.Context }
			contextWatchdog={ ClassicEditor.ContextWatchdog }
			onChangeInitializedEditors={ editors => {
				console.log( 'Initialized editors:', editors );
			} }
		>
			<CKEditorNestedInstanceDemo
				name='editor1'
				content='<p>Editor 1</p>'
			/>

			<br />

			<CKEditorNestedInstanceDemo
				name='editor2'
				content='<p>Editor 2</p>'
			/>
		</CKEditorContext>
	);
};

function CKEditorNestedInstanceDemo( { name, content } ) {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}',
		premium: true
	} );

	if ( cloud.status === 'error' ) {
		console.error( cloud );
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const {
		ClassicEditor,
		Essentials,
		Paragraph,
		Bold,
		Italic,
		Mention
	} = cloud.CKEditor;

	return (
		<CKEditor
			contextItemMetadata={ {
				name
			} }
			editor={ ClassicEditor }
			data={ content }
			config={ {
				plugins: [
					Essentials,
					Paragraph,
					Bold,
					Italic,
					Mention
				],
				toolbar: {
					items: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				}
			} }
		/>
	);
}
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
* `phase`: `'initialization'|'runtime'` &ndash; Informs when the error has occurred (during or after the editor/context initialization).
* `willContextRestart` &ndash; When `true`, it means that the context component will restart itself.

<info-box>
	An example build that exposes both context and classic editor can be found in the [CKEditor&nbsp;5 collaboration sample](https://github.com/ckeditor/ckeditor5-collaboration-samples/blob/master/real-time-collaboration-comments-outside-of-editor-for-react).
</info-box>

## How to?

### Using the document editor type

If you use the {@link framework/document-editor document (decoupled) editor}, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create add the toolbar to the DOM manually}:

```jsx
import { useEffect, useRef, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';

function App() {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}'
	} );

	const editorToolbarRef = useRef( null );
	const [ isMounted, setMounted ] = useState( false );

	useEffect( () => {
		setMounted( true );

		return () => {
			setMounted( false );
		};
	}, [] );

	if ( cloud.status === 'error' ) {
		console.error( cloud );
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const { DecoupledEditor, Essentials, Paragraph, Bold, Italic } = cloud.CKEditor;

	return (
		<div>
			<div ref={ editorToolbarRef }></div>
			<div>
				{ isMounted && (
					<CKEditor
						editor={ DecoupledEditor }
						data='<p>Hello from CKEditor 5 decoupled editor!</p>'
						config={ {
							plugins: [ Essentials, Paragraph, Bold, Italic ],
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
						} }
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

* [CKEditor&nbsp;5 with real-time collaboration features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-react)
* [CKEditor&nbsp;5 with real-time collaboration and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-revision-history-for-react)
* [CKEditor&nbsp;5 with the revision history feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/revision-history-for-react)
* [CKEditor&nbsp;5 with the track changes feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/track-changes-for-react)

It is not mandatory to build applications on top of the above samples, however, they should help you get started.

### Localization

CKEditor&nbsp;5 supports {@link getting-started/setup/ui-language multiple UI languages}, and so does the official React component. To translate the editor, pass the languages you need into the `translations` array inside the configuration of the `useCKEditorCloud` hook.

```jsx
import React from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

const CKEditorDemo = () => {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}',
		translations: [ 'es' ]
	} );

	if ( cloud.status === 'error' ) {
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const {
		ClassicEditor,
		Essentials,
		Bold,
		Italic,
		Paragraph
	} = cloud.CKEditor;

	return (
		<CKEditor
			editor={ ClassicEditor }
			data={ '<p>Hello world!</p>' }
			config={ {
				licenseKey: '<YOUR_LICENSE_KEY>',
				toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				plugins: [ Bold, Essentials, Italic, Paragraph ],
			} }
		/>
	);
};
```

For more information, please refer to the {@link getting-started/setup/ui-language Setting the UI language} guide.

### TypeScript support

The official React integration for CKEditor&nbsp;5 is written in TypeScript and fully supports it. If you use TypeScript in your project, you can use the `CKEditor` component without additional configuration. However, if you want to use some specific types from the CKEditor&nbsp;5 packages, you can import them directly from a special package containing type definitions. Take a look at the following example:

```tsx
import React from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

import type { EventInfo } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';

const CKEditorDemo = () => {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}',
		translations: [ 'es' ]
	} );

	if ( cloud.status === 'error' ) {
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const {
		ClassicEditor,
		Essentials,
		Bold,
		Italic,
		Paragraph
	} = cloud.CKEditor;

	return (
		<CKEditor
			editor={ ClassicEditor }
			data={ '<p>Hello world!</p>' }
			config={ {
				licenseKey: '<YOUR_LICENSE_KEY>',
				toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				plugins: [ Bold, Essentials, Italic, Paragraph ],
			} }
			onBlur={ ( event: EventInfo ) => {
				// your event handler
			} }
		/>
	);
};
```

In the example above, the `EventInfo` type is imported from the `https://cdn.ckeditor.com/typings/ckeditor5.d.ts` package, while the editor itself loads from the CDN. Note that `https://cdn.ckeditor.com/typings/ckeditor5.d.ts` is not an actual URL to the CKEditor&nbsp;5 typings file but a synthetic TypeScript module providing typings for the editor. The `ckeditor5` package supplies the actual types, which depend on the `@ckeditor/ckeditor5-react` package.

Although this setup might seem complex, it prevents users from directly importing anything from the `ckeditor5` package, which could lead to duplicated code issues.

#### Type definitions for premium features

If you want to use types for premium features, you can import them similarly to the base editor types. Remember that you need to install the `ckeditor5-premium-features` package to use them. You can do it by running the following command:

```bash
npm install --save-dev ckeditor5-premium-features
```

After installing the package, you can import the types in the following way:

```html
<script setup>
// ...
import type { Mention } from 'https://cdn.ckeditor.com/typings/ckeditor5-premium-features.d.ts';
// ...
</script>
```

## Known issues

While type definitions for the base editor should be available out of the box, some bundlers do not install the `ckeditor5` package, which provides typing for the editor. If you encounter any issues with the type definitions, you can install the `ckeditor5` package manually:

```bash
npm install --save-dev ckeditor5
```

## Contributing and reporting issues

The source code of rich text editor component for React is available on GitHub in [https://github.com/ckeditor/ckeditor5-react](https://github.com/ckeditor/ckeditor5-react).

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
