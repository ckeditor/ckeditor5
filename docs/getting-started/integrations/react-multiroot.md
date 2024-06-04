---
menu-title: Multi-root integration
meta-title: React rich text editor component | CKEditor 5 documentation
category: react
order: 20
modified_at: 2024-04-25
---

{@snippet installation/integrations/framework-integration}

# React rich text multi-root editor hook

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-react" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-react.svg" alt="npm version" loading="lazy">
	</a>
</p>

This page focuses on describing the usage of the multi-root editor in React applications. If you would like to use a different type of editor, you can find more information {@link getting-started/integrations/react here}.

The easiest way to use multi-root CKEditor&nbsp;5 in your React application is by using the {@link getting-started/legacy-getting-started/predefined-builds#multi-root-editor multi-root rich text editor build}.

<info-box hint>
	The multi-root editors in React is supported since version 6.2.0 of this package.

	Unlike the {@link getting-started/integrations/react default integration}, in the multi-root editor we prepared the integration based on the hooks and new React mechanisms.
</info-box>

## Quick start

This guide assumes you already have a React project. If you want to create a new one, you can use the [`create-react-app`](https://create-react-app.dev/) CLI. It allows you to create and customize your project with templates. For example, you can set up your project with TypeScript support.

Install the [CKEditor&nbsp;5 WYSIWYG editor package for React](https://www.npmjs.com/package/@ckeditor/ckeditor5-react) and the {@link getting-started/legacy-getting-started/predefined-builds#multi-root-editor multi-root editor build}. Assuming that you picked [`@ckeditor/ckeditor5-build-multi-root`](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-multi-root):

```bash
npm install --save @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-multi-root
```

Use the `useMultiRootEditor` hook inside your project:

```tsx
// App.jsx / App.tsx

import React from 'react';
import { useMultiRootEditor } from '@ckeditor/ckeditor5-react';
import MultiRootEditor from '@ckeditor/ckeditor5-build-multi-root';

const App = () => {
	const editorProps = {
		editor: MultiRootEditor,
		data: {
			intro: '<h1>React multi-root editor</h1>',
			content: '<p>Hello from CKEditor&nbsp;5 multi-root!</p>'
		},
		config: {
			// your editor config
		}
	};

	const {
		editor, toolbarElement, editableElements,
		data, setData,
		attributes, setAttributes
	} = useMultiRootEditor( editorProps );

	return (
		<div className="App">
			<h2>Using CKEditor&nbsp;5 multi-root build in React</h2>

			{ toolbarElement }

			{ editableElements }
		</div>
	);
}

export default App;
```

## Hook properties

The `useMultiRootEditor` hook supports the following properties:

* `editor: MultiRootEditor` (required) &ndash; The {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} constructor to use.
* `data: Object` &ndash; The initial data for the created editor. See the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* `rootsAttributes: Object` &ndash; The initial roots attributes for the created editor.
* `config: Object` &ndash; The editor configuration. See the {@link getting-started/setup/configuration Configuration} guide.
* `disabled: Boolean` &ndash; The {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} is being switched to read-only mode if the property is set to `true`.
* `disableWatchdog: Boolean` &ndash; If set to `true`, {@link features/watchdog the watchdog feature} will be disabled. It is set to `false` by default.
* `watchdogConfig: WatchdogConfig` &ndash; {@link module:watchdog/watchdog~WatchdogConfig Configuration object} for the [watchdog feature](https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html).
* `isLayoutReady: Boolean` &ndash; A property that delays the editor creation when set to `false`. It starts the initialization of the multi-root editor when sets to `true`. Useful when the CKEditor&nbsp;5 annotations or a presence list are used.
* `disableTwoWayDataBinding: Boolean` &ndash; Allows disabling the two-way data binding mechanism between the editor state and `data` object to improve editor efficiency. The default value is `false`.
* `onReady: Function` &ndash; It is called when the editor is ready with a {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} instance. This callback is also called after the reinitialization of the component if an error occurred.
* `onChange: Function` &ndash; It is called when the editor data has changed. See the {@link module:engine/model/document~Document#event:change:data `editor.model.document#change:data`} event.
* `onBlur: Function` &ndash; It is called when the editor was blurred. See the {@link module:engine/view/document~Document#event:blur `editor.editing.view.document#blur`} event.
* `onFocus: Function` &ndash; It is called when the editor was focused. See the {@link module:engine/view/document~Document#event:focus `editor.editing.view.document#focus`} event.
* `onError: Function` &ndash; It is called when the editor has crashed during the initialization or during the runtime. It receives two arguments: the error instance and the error details.
  Error details is an object that contains two properties:
	* `phase: 'initialization'|'runtime'` &ndash; Informs when the error has occurred (during the editor or context initialization, or after the initialization).
	* `willEditorRestart: Boolean` &ndash; When `true`, it means that the editor component will restart itself.

The editor event callbacks (`onChange`, `onBlur`, `onFocus`) receive two arguments:

1. An {@link module:utils/eventinfo~EventInfo `EventInfo`} object.
2. An {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} instance.

## Hook values

The `useMultiRootEditor` hook returns the following values:

* `editor` &ndash; The instance of created editor.
* `toolbarElement` &ndash; `ReactElement` that contains the toolbar. It could be rendered anywhere in the application.
* `editableElements` &ndash; An array of `ReactElements` that describes the editor's roots. This array is updated after detaching an existing root or adding a new root.
* `data` &ndash; The current state of the editor's data. It is updated after each editor update. Note that you should not use it if you disabled two-way binding by passing the `disableTwoWayDataBinding` property.
* `setData` &ndash; The function used for updating the editor's data.
* `attributes` &ndash; The current state of the editor's attributes. It is updated after each editor attributes update. Note that you should not use it if you disabled two-way binding by passing the `disableTwoWayDataBinding` property.
* `setAttributes` &ndash; The function used for updating the editor's attributes.

## Context feature

The `useMultiRootEditor` hook also supports the {@link features/context-and-collaboration-features context feature}, as described in the main {@link getting-started/integrations/react#context-feature React integration} guide.

However, as the multi-root editor addresses most use cases of the context feature, consider if you need to employ it.

## Two-way data binding

By default, the two-way data binding is enabled. It means that every change done in the editor is automatically applied in the `data` object returned from the `useMultiRootEditor` hook. Additionally, if you want to change or set data in the editor, you can simply use `setData` method provided by the hook. It works the same way in case of attributes &ndash; the hook provides the `attributes` object and the `setAttributes` method to update them. It ensures that if you want to use or save the state of the editor, these objects are always up-to-date.

<info-box>
	Two-way data binding may lead to performance issues with large editor content. In such cases, it is recommended to disable it by setting the `disableTwoWayDataBinding` property to `true` when using the `useMultiRootEditor` hook. When this is disabled, you will need to handle data synchronization manually if it is needed.

	The recommended approach for achieving this is based on utilizing the {@link features/autosave autosave plugin}. The second approach involves providing the `onChange` callback, which is called on each editor update.
</info-box>

## Contributing and reporting issues

The source code of rich text editor component for React is available on GitHub in [https://github.com/ckeditor/ckeditor5-react](https://github.com/ckeditor/ckeditor5-react).
