---
menu-title: Multi-root integration
meta-title: Using CKEditor 5 with Vue.js 3+ rich text editor multi-root component from npm | CKEditor 5 Documentation
meta-description: Install, integrate, and configure CKEditor 5 using the Vue.js 3+ multi-root component with npm.
category: vuejs-v3-npm
order: 20
modified_at: 2026-07-13
---

# Integrating CKEditor&nbsp;5 with Vue.js 3+ rich text multi-root editor component from npm

This page focuses on describing the usage of the multi-root editor in Vue applications. For other editor types, see the {@link getting-started/integrations/vue-default-npm default Vue.js 3+ integration}.

<info-box experimental>
	The Vue multi-root editor integration is experimental. Its API is not stable and may change in any release without a major version bump.
</info-box>

<info-box hint>
	The multi-root editors in Vue are supported since version 8.2.0 of this package.
</info-box>

## Quick start

This guide assumes you already have a Vue project. If you want to create a new one, you can use the [Vite](https://vitejs.dev/guide/) CLI. It allows you to create and customize your project with templates. For example, you can set up your project with TypeScript support.

Install the [CKEditor&nbsp;5 WYSIWYG editor package for Vue](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue) and the {@link getting-started/setup/editor-types#multi-root-editor multi-root editor type}.

```bash
npm install ckeditor5 @ckeditor/ckeditor5-vue
```

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from npm:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

Use the `CkeditorMultiRoot`, `CkeditorElement`, and `CkeditorMultiRootEditable` components inside your project:

```vue
<!-- App.vue -->

<template>
	<CkeditorMultiRoot
		v-model="editorData"
		v-model:roots-attributes="editorRootsAttributes"
		:editor="MultiRootEditor"
		:config="config"
	>
		<template #default="{ editor, roots }">
			<CkeditorElement
				:editor="editor"
				element="menuBar"
			/>
			<CkeditorElement :editor="editor" />

			<CkeditorMultiRootEditable
				v-for="rootName in roots"
				:id="rootName"
				:key="rootName"
				:root-name="rootName"
				:editor="editor"
			/>
		</template>
	</CkeditorMultiRoot>
</template>

<script setup>
import { computed, ref } from 'vue';
import { CkeditorElement, CkeditorMultiRoot, CkeditorMultiRootEditable } from '@ckeditor/ckeditor5-vue';
import { MultiRootEditor, Bold, Essentials, Italic, Paragraph } from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

const config = computed( () => {
	return {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Bold, Italic, Paragraph ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ]
	};
} );

const editorData = ref( {
	intro: '<h1>Vue multi-root editor</h1>',
	content: '<p>Hello from CKEditor&nbsp;5 multi-root!</p>'
} );

const editorRootsAttributes = ref( {
	intro: { order: 10 },
	content: { order: 20 }
} );
</script>
```

You can also register all CKEditor&nbsp;5 Vue components globally by installing `CkeditorPlugin` in your Vue application.

```js
import { createApp } from 'vue';
import { CkeditorPlugin } from '@ckeditor/ckeditor5-vue';

import App from './App.vue';

createApp( App )
	.use( CkeditorPlugin )
	.mount( '#app' );
```

## Component properties

The `CkeditorMultiRoot` component supports the following properties:

* `editor: MultiRootEditor` (required) &ndash; The {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} constructor to use.
* `modelValue: Object` &ndash; The initial data for the created editor. Use it with `v-model`. See the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* `rootsAttributes: Object` &ndash; The initial roots attributes for the created editor. Use it with `v-model:roots-attributes`.
* `config: Object` &ndash; The editor configuration. See the {@link getting-started/setup/configuration Configuration} guide.
* `disabled: Boolean` &ndash; The {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} is switched to read-only mode if the property is set to `true`.
* `disableWatchdog: Boolean` &ndash; If set to `true`, {@link features/watchdog the watchdog feature} will be disabled. It is set to `false` by default.
* `watchdogConfig: WatchdogConfig` &ndash; {@link module:watchdog/watchdog~WatchdogConfig Configuration object} for the [watchdog feature](https://ckeditor.com/docs/ckeditor5/latest/features/watchdog.html).
* `disableTwoWayDataBinding: Boolean` &ndash; Allows disabling the two-way data binding mechanism between the editor state and `modelValue` object to improve editor efficiency. The default value is `false`.

The component emits the following events:

* `ready` &ndash; It is called when the editor is ready with a {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} instance. This event is also emitted after the reinitialization of the component if an error occurred.
* `destroy` &ndash; It is called when the editor instance is destroyed.
* `change` &ndash; It is called when the editor data has changed. See the {@link module:engine/model/document~ModelDocument#event:change:data `editor.model.document#change:data`} event.
* `blur` &ndash; It is called when the editor was blurred. See the {@link module:engine/view/document~ViewDocument#event:blur `editor.editing.view.document#blur`} event.
* `focus` &ndash; It is called when the editor was focused. See the {@link module:engine/view/document~ViewDocument#event:focus `editor.editing.view.document#focus`} event.
* `error` &ndash; It is called when the editor has crashed during the initialization or during the runtime. It receives two arguments: the error instance and the error details.
* `input` &ndash; It is emitted when the editor data changes. It receives three arguments: the current data, an {@link module:utils/eventinfo~EventInfo `EventInfo`} object or `null`, and a {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} instance.
* `update:modelValue` &ndash; It is emitted when the editor data changes and updates `v-model`.
* `update:rootsAttributes` &ndash; It is emitted when the roots attributes change and updates `v-model:roots-attributes`.

Error details is an object that contains two properties:

* `phase: 'initialization'|'runtime'` &ndash; Informs when an error has occurred (during the editor or context initialization, or after the initialization).
* `causesRestart: Boolean` &ndash; If set to `true`, the watchdog will attempt to restart the editor.

The editor event callbacks (`change`, `blur`, `focus`) receive two arguments:

1. An {@link module:utils/eventinfo~EventInfo `EventInfo`} object.
2. An {@link module:editor-multi-root/multirooteditor~MultiRootEditor `MultiRootEditor`} instance.

## Slot values

The default slot of the `CkeditorMultiRoot` component exposes the following values:

* `editor` &ndash; The instance of created editor.
* `roots` &ndash; An array of editor root names. This array is updated after detaching an existing root or adding a new root.
* `data` &ndash; The current state of the editor's data. It is updated after each editor update. Note that you should not use it if you disabled two-way binding by passing the `disableTwoWayDataBinding` property.
* `attributes` &ndash; The current state of the editor's root attributes. It is updated after each editor attributes update. Note that you should not use it if you disabled two-way binding by passing the `disableTwoWayDataBinding` property.
* `rootsAttributes` &ndash; An alias for `attributes`.
* `addRoot` &ndash; A function that adds a new root to the editor at runtime. It accepts a single options object with `name`, `data`, `attributes`, `modelElement` (for example, `'$inlineRoot'`), and `editableOptions` (per-root `element`, `placeholder`, and `label`). The returned promise resolves once the root has been added.
* `removeRoot` &ndash; A function that detaches a root from the editor by name. The returned promise resolves once the root has been removed.

The `CkeditorElement` component renders editor UI elements outside of the editable root. It accepts the `editor` property and an optional `element` property set to `'toolbar'` or `'menuBar'`.

The `CkeditorMultiRootEditable` component renders a single editable root. It accepts the `editor`, `rootName`, optional `id`, and optional `editableOptions` properties.

## Two-way data binding

By default, the two-way data binding is enabled. It means that every change done in the editor is automatically applied in the object bound with `v-model`. It works the same way in case of attributes &ndash; bind them with `v-model:roots-attributes` to keep your application state up-to-date.

<info-box>
	Two-way data binding may lead to performance issues with large editor content. In such cases, it is recommended to disable it by setting the `disableTwoWayDataBinding` property to `true` when using the `CkeditorMultiRoot` component. When this is disabled, you will need to handle data synchronization manually if it is needed.

	The recommended approach for achieving this is based on utilizing the {@link features/autosave autosave plugin}. The second approach involves providing the `change` event listener, which is called on each editor update.
</info-box>

## How to?

### Adding and removing roots dynamically

The default slot exposes `addRoot` and `removeRoot` helpers so you can manage roots from event handlers. The `addRoot` helper accepts the new root's name, initial data, optional attributes, an optional `modelElement` for the schema, and `editableOptions` describing the editable element (its host tag, placeholder text, and accessible label).

```vue
<template>
	<CkeditorMultiRoot
		v-model="editorData"
		:editor="MultiRootEditor"
	>
		<template #default="{ editor, roots, addRoot, removeRoot }">
			<button @click="addSidebar( addRoot )">
				Add sidebar
			</button>
			<button @click="removeRoot( 'sidebar' )">
				Remove sidebar
			</button>

			<CkeditorElement :editor="editor" />

			<CkeditorMultiRootEditable
				v-for="rootName in roots"
				:key="rootName"
				:root-name="rootName"
				:editor="editor"
			/>
		</template>
	</CkeditorMultiRoot>
</template>

<script setup>
async function addSidebar( addRoot ) {
	await addRoot( {
		name: 'sidebar',
		data: '<p>Sidebar content</p>',
		attributes: { order: 30 },
		editableOptions: {
			element: 'section',
			placeholder: 'Type the sidebar content...',
			label: 'Sidebar'
		}
	} );
}
</script>
```

The `editableOptions.element` field accepts a tag name string (`'section'`, `'article'`) or a descriptor object with `name`, `classes`, `styles`, and `attributes`.

### Mixing standard and inline roots

A multi-root editor can host both standard and inline roots in the same document. Set `modelElement` to `'$inlineRoot'` for any root that should accept only inline content (text, bold, italic, links) instead of blocks. This is useful for titles, captions, or single-line fields combined with a block-based body.

```js
await addRoot( {
	name: 'title',
	data: 'Document title',
	modelElement: '$inlineRoot',
	editableOptions: {
		element: 'h1',
		placeholder: 'Enter title...'
	}
} );
```

Without `modelElement: '$inlineRoot'`, only the host tag changes &ndash; the schema still permits blocks inside the root.

### Using the editor with collaboration plugins

We provide several **ready-to-use integrations** featuring collaborative editing with multi-root in Vue applications:

* [CKEditor&nbsp;5 multi-root with real-time collaboration features and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-editor-multi-root-for-vue)

It is not necessary to build applications on top of the above samples, however, they should help you get started.

## Contributing and reporting issues

The source code of rich text editor component for Vue is available on GitHub in [https://github.com/ckeditor/ckeditor5-vue](https://github.com/ckeditor/ckeditor5-vue).

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
