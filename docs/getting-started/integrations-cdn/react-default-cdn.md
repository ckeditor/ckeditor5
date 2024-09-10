---
menu-title: Default integration
meta-title: React rich text editor component with CDN | CKEditor 5 documentation
meta-description: Install, integrate and configure CKEditor 5 using the React component with CDN.
category: react-cdn
order: 10
---

{@snippet installation/integrations/framework-integration}

# React rich text editor component (CDN)

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-react" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-react.svg" alt="npm version" loading="lazy">
	</a>
</p>

React lets you build user interfaces out of individual pieces called components. CKEditor&nbsp;5 can be used as one of such components. This guide explains how to integrate CKEditor&nbsp;5 into your React application using CDN.

<info-box hint>
	Starting from version 6.0.0 of this package, you can use native type definitions provided by CKEditor&nbsp;5. Check the details about {@link getting-started/setup/typescript-support TypeScript support}.
</info-box>

## Quick start

### Using CKEditor&nbsp;5 Builder

The easiest way to use CKEditor&nbsp;5 in your React application is by configuring it with [CKEditor&nbsp;5 Builder](https://ckeditor.com/builder?redirect=docs) and integrating it with your application. Builder offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs. You can easily select:

* the features you need,
* the preferred framework (React, Angular, Vue or Vanilla JS),
* the preferred distribution method.

You get ready-to-use code tailored to your needs!

### Setting up the project

This guide assumes you have a React project. You can create a basic React project using [Vite](https://vitejs.dev/). Refer to the [React documentation](https://react.dev/learn/start-a-new-react-project) to learn how to set up a project in the framework.

### Installing React component from npm

Install the `@ckeditor/ckeditor5-react` package:

```bash
npm install @ckeditor/ckeditor5-react
```

The `useCKEditorCloud` hook is responsible for returning information that:

* The editor is still downloading from the CDN with the `status = 'loading'`.
* An error occurred during the download when `status = 'error'`. Further information is in the error field.
* About the editor in the data field and its dependencies when `status = 'success'`.

Use the `<CKEditor>` component inside your project. The below example shows how to use it with the open-source plugins.

```js
import React from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

const CKEditorDemo = () => {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}',
	} );

	if ( cloud.status === 'error' ) {
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const {
		ClassicEditor,
		Bold,
		Essentials,
		Italic,
		Paragraph,
		Undo,
	} = cloud.CKEditor;

	return (
		<CKEditor
			editor={ ClassicEditor }
			data={ '<p>Hello world!</p>' }
			config={ {
				licenseKey: 'GPL',
				toolbar: {
					items: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				},
				plugins: [ Bold, Essentials, Italic, Paragraph, Undo ],
			} }
		/>
	);
};
```

To use premium plugins, set the `premium` property to `true` in the `useCKEditorCloud` configuration and provide your license key in the `CKEditor` configuration.

```js
import React from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

const CKEditorDemo = () => {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}',
		premium: true,
	} );

	if ( cloud.status === 'error' ) {
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const {
		ClassicEditor,
		Bold,
		Essentials,
		Italic,
		Mention,
		Paragraph,
		Undo,
	} = cloud.CKEditor;

	const { SlashCommand } = cloud.CKEditorPremiumFeatures!;

	return (
		<CKEditor
			editor={ ClassicEditor }
			data={ '<p>Hello world!</p>' }
			config={ {
				licenseKey: '<YOUR_LICENSE_KEY>',
				toolbar: {
					items: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				},
				plugins: [
					Bold,
					Essentials,
					Italic,
					Mention,
					Paragraph,
					Undo,
					SlashCommand,
				],
			} }
		/>
	);
};
```

### Usage with CKBox

To use `CKBox`, specify the version and theme (optionally) in the `useCKEditorCloud` configuration. Also, remember about the actual plugin configuration inside `<CKEditor/>` component.

```js
import React from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

const CKEditorDemo = () => {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}',
		ckbox: {
			version: '2.5.1',
			// Optional - it's already 'lark' by default.
			theme: 'lark',
		},
	} );

	if ( cloud.status === 'error' ) {
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const {
		ClassicEditor,
		Bold,
		Essentials,
		Italic,
		Mention,
		Paragraph,
		Undo,
		CKBox,
		CKBoxImageEdit,
	} = cloud.CKEditor;

	return (
		<CKEditor
			editor={ ClassicEditor }
			data={ '<p>Hello world!</p>' }
			config={ {
				toolbar: {
					items: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				},
				plugins: [
					Bold,
					Essentials,
					Italic,
					Mention,
					Paragraph,
					Undo,
					CKBox,
					CKBoxImageEdit,
				],
				ckbox: {
					tokenUrl: 'https://api.ckbox.io/token/demo',
					forceDemoLabel: true,
					allowExternalImagesEditing: [ /^data:/, /^i.imgur.com\//, 'origin' ],
				},
			} }
		/>
	);
};
```

### Usage with external plugins

There are various ways to use external plugins. Here is a list of them:

* **Local UMD Plugins:** Dynamically import local UMD modules using the `import()` syntax.
* **Local External Imports:** Load external plugins locally using additional bundler configurations (such as Vite).
* **CDN Third-Party Plugins:** Load JavaScript and CSS files from a CDN by specifying the URLs.
* **Verbose Configuration:** Advanced plugin loading with options to specify both script and style sheet URLs, along with an optional `checkPluginLoaded` function to verify the plugin has been correctly loaded into the global scope.

Here is an example:

```js
import React from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

const CKEditorDemo = () => {
	const cloud = useCKEditorCloud( {
		version: '{@var ckeditor5-version}',
		plugins: {
			PluginUMD: async () => await import( './your-local-import.umd.js' ),
			PluginLocalImport: async () => await import( './your-local-import' ),
			PluginThirdParty: [
				'https://cdn.example.com/plugin3.js',
				'https://cdn.example.com/plugin3.css'
			]
		}
	} );

	if ( cloud.status === 'error' ) {
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const { PluginUMD, PluginLocalImport, PluginThirdParty } = cloud.loadedPlugins;
	// ...
};
```

### Component properties

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

The `<useCKEditorCloud>` component supports the following properties:

* `version` (required) &ndash; The version of CKEditor Cloud Services to use.
* `languages` &ndash; The languages to load. English language ('en') should not be passed because it is already bundled in.
* `premium` &ndash; If `true` then the premium features will be loaded.
* `ckbox` &ndash; CKBox bundle configuration.
* `plugins` &ndash; Additional resources to load.

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

	const { CKEditor: CKEDITOR } = cloud;

	return (
		<CKEditor
			contextItemMetadata={ {
				name
			} }
			editor={ CKEDITOR.ClassicEditor }
			data={ content }
			config={ {
				plugins: [
					CKEDITOR.Essentials,
					CKEDITOR.CKFinderUploadAdapter,
					CKEDITOR.Autoformat,
					CKEDITOR.Bold,
					CKEDITOR.Italic,
					CKEDITOR.BlockQuote,
					CKEDITOR.CKBox,
					CKEDITOR.CKFinder,
					CKEDITOR.CloudServices,
					CKEDITOR.EasyImage,
					CKEDITOR.Heading,
					CKEDITOR.Image,
					CKEDITOR.ImageCaption,
					CKEDITOR.ImageStyle,
					CKEDITOR.ImageToolbar,
					CKEDITOR.ImageUpload,
					CKEDITOR.Indent,
					CKEDITOR.IndentBlock,
					CKEDITOR.Link,
					CKEDITOR.List,
					CKEDITOR.MediaEmbed,
					CKEDITOR.Paragraph,
					CKEDITOR.PasteFromOffice,
					CKEDITOR.PictureEditing,
					CKEDITOR.Table,
					CKEDITOR.TableToolbar,
					CKEDITOR.TextTransformation,
					CKEDITOR.Base64UploadAdapter
				],
				toolbar: {
					items: [
						'undo', 'redo',
						'|', 'heading',
						'|', 'bold', 'italic',
						'|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
						'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
					]
				},
				image: {
					toolbar: [
						'imageStyle:inline',
						'imageStyle:block',
						'imageStyle:side',
						'|',
						'toggleImageCaption',
						'imageTextAlternative'
					]
				},
				table: {
					contentToolbar: [
						'tableColumn',
						'tableRow',
						'mergeTableCells'
					]
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

	const { DecoupledEditor, Bold, Italic, Paragraph, Essentials } = cloud.CKEditor;

	return (
		<div>
			<div ref={ editorToolbarRef }></div>
			<div>
				{ isMounted && (
					<CKEditor
						editor={ DecoupledEditor }
						data='<p>Hello from CKEditor 5 decoupled editor!</p>'
						config={ {
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

* [CKEditor&nbsp;5 with real-time collaboration features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-react)
* [CKEditor&nbsp;5 with real-time collaboration and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-revision-history-for-react)
* [CKEditor&nbsp;5 with the revision history feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/revision-history-for-react)
* [CKEditor&nbsp;5 with the track changes feature](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/track-changes-for-react)

It is not mandatory to build applications on top of the above samples, however, they should help you get started.

### Localization

CKEditor&nbsp;5 supports {@link getting-started/setup/ui-language multiple UI languages}, and so does the official React component. Follow the instructions below to translate CKEditor&nbsp;5 in your React application.

Pass the language you need into the `translations` array inside the configuration in the `useCKEditorCloud`.

```js
import React from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';

const CKEditorDemo = () => {
	const cloud = useCKEditorCloud({
		version: '{@var ckeditor5-version}',
		languages: [ 'de' ]
	});

	if ( cloud.status === 'error' ) {
		return <div>Error!</div>;
	}

	if ( cloud.status === 'loading' ) {
		return <div>Loading...</div>;
	}

	const {
		ClassicEditor: ClassicEditorBase,
		Bold,
		Essentials,
		Italic,
		Paragraph,
		Undo,
	} = cloud.CKEditor;

	return (
		<CKEditor
			editor={ ClassicEditorBase }
			data={ '<p>Hello world!</p>' }
			config={{
				toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				plugins: [ Bold, Essentials, Italic, Paragraph, Undo ],
			}}
		/>
	);
};
```

For more information, please refer to the {@link getting-started/setup/ui-language Setting the UI language} guide.

## Contributing and reporting issues

The source code of rich text editor component for React is available on GitHub in [https://github.com/ckeditor/ckeditor5-react](https://github.com/ckeditor/ckeditor5-react).
