---
menu-title: Multi-root integration
meta-title: React rich text editor component | CKEditor 5 documentation
category: react
order: 20
---

{@snippet installation/integrations/framework-integration}

# React rich text multi-root editor hook

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-react" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-react.svg" alt="npm version" loading="lazy">
	</a>
</p>

CKEditor&nbsp;5 consists of {@link installation/getting-started/predefined-builds ready-to-use editor builds} and {@link framework/index CKEditor&nbsp;5 Framework} upon which the builds are based.

The easiest way to use multi-root CKEditor&nbsp;5 in your React application is by using the {@link installation/getting-started/predefined-builds#multi-root-editor multi-root rich text editor build}. Additionally, it is also possible to integrate [CKEditor&nbsp;5 built from source](#integrating-ckeditor-5-built-from-source) into your application. You can also use a customized editor built by using [CKEditor&nbsp;5 online builder](https://ckeditor.com/ckeditor-5/online-builder/) in any React application.

<info-box hint>
	The support for multi-root editors in React has been provided from version 6.2.0 of this package.

	Unlike the default integration, in the multi-root editor, we prepared the integration based on the hooks and new React mechanisms.
</info-box>

## Quick start

This guide assumes you already have a React project. If you want to create a new one, you can use the [`create-react-app`](https://create-react-app.dev/) CLI. It allows you to create and customize your project with templates. For example, you can set up your project with TypeScript support.

Install the [CKEditor&nbsp;5 WYSIWYG editor package for React](https://www.npmjs.com/package/@ckeditor/ckeditor5-react) and the {@link installation/getting-started/predefined-builds#multi-root-editor multi-root editor build}. Assuming that you picked [`@ckeditor/ckeditor5-build-classic`](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic):

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
		data: '<p>Hello from CKEditor&nbsp;5 multi-root!</p>',
		config: {
			// your config
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

* `editor` (required) &ndash; The {@link module:core/editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} constructor to use.
* `data` &ndash; The initial data for the created editor. See the {@link installation/getting-started/getting-and-setting-data Getting and setting data} guide.
* `rootsAttributes` &ndash; The initial roots attributes for the created editor.
* `config` &ndash; The editor configuration. See the {@link installation/getting-started/configuration Configuration} guide.
* `disabled` &ndash; A Boolean value. The {@link module:core/editor/editor~Editor `editor`} is being switched to read-only mode if the property is set to `true`.
* `disableWatchdog` &ndash; A Boolean value. If set to `true`, {@link features/watchdog the watchdog feature} will be disabled. It is set to `false` by default.
* `watchdogConfig` &ndash; {@link module:watchdog/watchdog~WatchdogConfig Configuration object} for the [watchdog feature](https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html).
* `isLayoutReady` &ndash; A property that delays the editor creation when set to `false`. It starts the initialization of the multi-root editor when sets to `true`. Useful when the CKEditor&nbsp;5 annotations or a presence list are used.
* `disableTwoWayDataBinding` &ndash; Allows disabling the two-way data binding mechanism between the editor state and `data` object. The default value is false.
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

The `useMultiRootEditor` hook also supports the {@link features/context-and-collaboration-features context feature}, as described {@link installation/integrations/react#context-feature}.

However, the multi-root editor addresses most use cases of the Context feature, so please consider if you need it.

## Two-way data binding

By default, the two-way data binding is enabled. It means that every change which is done in the editor is automatically applied in the `data` object returned from `useMultiEditorHook`. Additionally, if you want to change or set data in the editor, you do not need to use editor API, instead, the hook provides `setData` method. It works in the same way in case of attrributes - the hook provides `attributtes` object and `setAttributes` method to update them. It ensures that if you want to use or save the state of the editor, those object are always up to date.

<info-box>
	Two-way data binding may lead to performance issues with large editor content. In such cases, it is recommended to disable it by setting the `disableTwoWayDataBinding` property to `true` when using the `useMultiRootEditor` hook. When disabled, you will need to handle data synchronization manually if it is needed.

	It could be done by providing the `onChange` callback which is called on each editor's update and combine it, for instance, with [the autosave plugin](https://ckeditor.com/docs/ckeditor5/latest/features/autosave.html).
</info-box>

## Contributing and reporting issues

<!-- Be sure to update this if needed -->

The source code of rich text editor component for React is available on GitHub in [https://github.com/ckeditor/ckeditor5-react](https://github.com/ckeditor/ckeditor5-react).
