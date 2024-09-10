---
menu-title: Vue.js 3+
meta-title: Vue.js 3+ rich text editor component with CDN | CKEditor 5 documentation
meta-description: Install, integrate and configure CKEditor 5 using the Vue.js 3+ component with CDN.
category: cloud
order: 50
---

{@snippet installation/integrations/framework-integration}

# Vue.js 3+ rich text editor component (CDN)

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-vue" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-vue.svg" alt="npm version" loading="lazy">
	</a>
</p>

CKEditor&nbsp;5 has an official Vue integration that you can use to add a rich text editor to your application. This guide will help you install it and configure to use the CDN distribution of the CKEditor&nbsp;5.

This guide assumes that you already have a Vue project. If you do not have one, see the [Vue documentation](https://vuejs.org/guide/quick-start) to learn how to create it.

## Quick start

{@snippet getting-started/use-builder}

### Installing and configuring the Vue integration

Start by installing the Vue integration for CKEditor&nbsp;5 from npm:

```bash
npm install @ckeditor/ckeditor5-vue
```

Once the integration is installed, create a new Vue component called `Editor.vue`. It will use the `useCKEditorCloud` helper to load the editor code from CDN and the `<ckeditor>` component to run it. The following example shows a single file component with open source and premium CKEditor&nbsp;5 plugins.

```html
<template>
	<ckeditor
		v-if="editor"
		v-model="data"
		:editor="editor"
		:config="config"
	/>
</template>

<script>
import { Ckeditor, useCKEditorCloud } from '@ckeditor/ckeditor5-vue';

export default {
	name: 'Editor',
	components: {
		Ckeditor
	},
	data() {
		return {
			cloud: useCKEditorCloud( {
				version: '{@var ckeditor5-version}',
				premium: true
			} ),
			data: '<p>Hello world!</p>',
			config: {
				licenseKey: '<YOUR_LICENSE_KEY>', // Or "GPL"
				toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ]
			}
		}
	},
	computed: {
		editor() {
			if ( !this.cloud.data ) {
				return null;
			}

			const {
				ClassicEditor,
				Paragraph,
				Essentials,
				Bold,
				Italic,
				Mention
			} = this.cloud.data.CKEditor;

			const { SlashCommand } = this.cloud.data.CKEditorPremiumFeatures;

			return class Editor extends ClassicEditor {
				static builtinPlugins = [
					Essentials,
					Paragraph,
					Bold,
					Italic,
					Mention,
					SlashCommand
				];
			};
		}
	}
}
</script>
```

In the above example, the `useCKEditorCloud` helper is used to load the editor code and plugins from CDN. The `premium` option is set to also load premium plugins. For more information about the `useCKEditorCloud` helper, see the {@link getting-started/setup/loading-cdn-resources Loading CDN resources} page.

Now, you can import and use the `Editor.vue` component anywhere in your application.

```html
<template>
	<Editor />
</template>
```

If you use Nuxt.js with server-side rendering enabled, remember to wrap the `<Editor>` component in the `<ClientOnly>` component to avoid issues with the editor calling browser-specific APIs on the server.

```html
<template>
	<ClientOnly>
		<Editor />
	</ClientOnly>
</template>
```

## Component directives

### `editor`

This directive specifies the editor to be used by the component. It must directly reference the editor constructor to be used in the template.

```html
<template>
	<div id="app">
		<ckeditor :editor="editor" />
	</div>
</template>

<script>
	import { ClassicEditor } from 'ckeditor5';

	export default {
		name: 'app',
		data() {
			return {
				editor: ClassicEditor,

				// ...
			};
		}
	};
</script>
```

### `tag-name`

By default, the editor component creates a `<div>` container which is used as an element passed to the editor (for example, {@link module:editor-classic/classiceditorui~ClassicEditorUI#element `ClassicEditor#element`}). The element can be configured, so for example to create a `<textarea>`, use the following directive:

```html
<ckeditor :editor="editor" tag-name="textarea" />
```

### `v-model`

A [standard directive](https://v3.vuejs.org/guide/component-basics.html#using-v-model-on-components) for form inputs in Vue. Unlike [`model-value`](#model-value), it creates a two–way data binding, which:

* Sets the initial editor content.
* Automatically updates the state of the application as the editor content changes (for example, as the user types).
* Can be used to set the editor content when necessary.

```html
<template>
	<div id="app">
		<ckeditor :editor="editor" v-model="editorData" />
		<button @click="emptyEditor">Empty the editor</button>

		<h2>Editor data</h2>
		<code>{{ editorData }}</code>
	</div>
</template>

<script>
	import { ClassicEditor } from 'ckeditor5';

	export default {
		name: 'app',
		data() {
			return {
				editor: ClassicEditor,
				editorData: '<p>Content of the editor.</p>'
			};
		},
		methods: {
			emptyEditor() {
				this.editorData = '';
			}
		}
	};
</script>
```

In the above example, the `editorData` property will be updated automatically as the user types and the content changes. It can also be used to change (as in `emptyEditor()`) or set the initial content of the editor.

If you only want to execute an action when the editor data changes, use the [`input`](#input) event.

### `model-value`

Allows a one–way data binding that sets the content of the editor. Unlike [`v-model`](#v-model), the value will not be updated when the content of the editor changes.

```html
<template>
	<div id="app">
		<ckeditor :editor="editor" :model-value="editorData" />
	</div>
</template>

<script>
	import { ClassicEditor } from 'ckeditor5';

	export default {
		name: 'app',
		data() {
			return {
				editor: ClassicEditor,
				editorData: '<p>Content of the editor.</p>'
			};
		}
	};
</script>
```

To execute an action when the editor data changes, use the [`input`](#input) event.

### `config`

Specifies the {@link module:core/editor/editorconfig~EditorConfig configuration} of the editor.

```html
<template>
	<div id="app">
		<ckeditor :editor="editor" :config="editorConfig" />
	</div>
</template>

<script>
	import { ClassicEditor } from 'ckeditor5';

	export default {
		name: 'app',
		data() {
			return {
				editor: ClassicEditor,
				editorConfig: {
					toolbar: [ 'bold', 'italic', '|', 'link' ]
				}
			};
		}
	};
</script>
```

### `disabled`

This directive controls the {@link module:core/editor/editor~Editor#isReadOnly `isReadOnly`} property of the editor.

It sets the initial read–only state of the editor and changes it during its lifecycle.

```html
<template>
	<div id="app">
		<ckeditor :editor="editor" :disabled="editorDisabled" />
	</div>
</template>

<script>
	import { ClassicEditor } from 'ckeditor5';

	export default {
		name: 'app',
		data() {
			return {
				editor: ClassicEditor,
				// This editor will be read–only when created.
				editorDisabled: true
			};
		}
	};
</script>
```

### `disableTwoWayDataBinding`

Allows disabling the two-way data binding mechanism. The default value is `false`.

The reason for introducing this option is performance issues in large documents. After enabling this flag, the `v-model` directive will no longer update the connected value whenever the editor's data is changed.

This option allows the integrator to disable the default behavior and only call the {@link module:core/editor/editor~Editor#getData `editor.getData()`} method on demand, which prevents the slowdowns. You can read more in the [relevant issue](https://github.com/ckeditor/ckeditor5-vue/issues/246).

```html
<ckeditor :editor="editor" :disableTwoWayDataBinding="true" />
```

## Component events

### `ready`

Corresponds to the {@link module:core/editor/editor~Editor#event:ready `ready`} editor event.

```html
<ckeditor :editor="editor" @ready="onEditorReady" />
```

### `focus`

Corresponds to the {@link module:engine/view/document~Document#event:focus `focus`} editor event.

```html
<ckeditor :editor="editor" @focus="onEditorFocus" />
```

### `blur`

Corresponds to the {@link module:engine/view/document~Document#event:blur `blur`} editor event.

```html
<ckeditor :editor="editor" @blur="onEditorBlur" />
```

### `input`

Corresponds to the {@link module:engine/model/document~Document#event:change:data `change:data`} editor event.

```html
<ckeditor :editor="editor" @input="onEditorInput" />
```

### `destroy`

Corresponds to the {@link module:core/editor/editor~Editor#event:destroy `destroy`} editor event.

**Note:** Because the destruction of the editor is promise–driven, this event can be fired before the actual promise resolves.

```html
<ckeditor :editor="editor" @destroy="onEditorDestroy" />
```

## How to?

### Using the Document editor type

If you use the {@link framework/document-editor Document (decoupled) editor} in your application, you need to {@link module:editor-decoupled/decouplededitor~DecoupledEditor.create manually add the editor toolbar to the DOM}.

Since accessing the editor toolbar is not possible until after the editor instance is {@link module:core/editor/editor~Editor#event:ready ready}, put your toolbar insertion code in a method executed upon the [`ready`](#ready) event of the component, like in the following example:

```html
<template>
	<div id="app">
		<ckeditor :editor="editor" @ready="onReady" />
	</div>
</template>

<script>
	import { DecoupledEditor, Bold, Essentials, Italic, Paragraph, Undo } from 'ckeditor5';
	import CKEditor from '@ckeditor/ckeditor5-vue';
	
	import 'ckeditor5/ckeditor5.css';

	export default {
		name: 'app',
		data() {
			return {
				editor: DecoupledEditor,
				// ...
			};
		},
		methods: {
			onReady( editor )  {
				// Insert the toolbar before the editable area.
				editor.ui.getEditableElement().parentElement.insertBefore(
					editor.ui.view.toolbar.element,
					editor.ui.getEditableElement()
				);
			}
		}
	};
</script>
```

### Using the editor with collaboration plugins

We provide a **ready-to-use integration** featuring collaborative editing in a Vue application:

* [CKEditor&nbsp;5 with real-time collaboration features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-vue)

It is not mandatory to build applications on top of the above sample, however, it should help you get started.

### Localization

CKEditor&nbsp;5 supports {@link getting-started/setup/ui-language multiple UI languages}, and so does the official Vue component. Follow the instructions below to translate CKEditor&nbsp;5 in your Vue application.

Similarly to CSS style sheets, both packages have separate translations. Import them as shown in the example below. Then, pass them to the `translations` array inside the `editorConfig` prop in the component:

```html
<template>
	<div id="app">
		<ckeditor :editor="editor" v-model="editorData" :config="editorConfig" />
	</div>
</template>

<script>
import { ClassicEditor, Bold, Essentials, Italic, Paragraph } from 'ckeditor5';
// More imports...

import coreTranslations from 'ckeditor5/translations/es.js';
import premiumFeaturesTranslations from 'ckeditor5-premium-features/translations/es.js';

// Style sheets imports...

export default {
	name: 'app',
	data() {
		return {
			editor: ClassicEditor,
			editorData: '<p>Hola desde CKEditor 5 en Vue!</p>',
			editorConfig: {
				licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
				toolbar: {
					items: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				},
				plugins: [ Bold, Essentials, Italic, Paragraph ],
				translations: [ coreTranslations, premiumFeaturesTranslations ]
			}
		};
	}
};
</script>
```

For more information, refer to the {@link getting-started/setup/ui-language Setting the UI language} guide.

## Contributing and reporting issues

The source code of this component is available on GitHub in [https://github.com/ckeditor/ckeditor5-vue](https://github.com/ckeditor/ckeditor5-vue).
