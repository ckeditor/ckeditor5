---
menu-title: Vue.js 3+
meta-title: Vue.js 3+ rich text editor component | CKEditor 5 documentation
category: installation
order: 50
---

{@snippet installation/integrations/framework-integration}

# Vue.js 3+ rich text editor component

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-vue" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-vue.svg" alt="npm version" loading="lazy">
	</a>
</p>

Vue.js is a versatile framework for building web user interfaces. CKEditor&nbsp;5 provides the official Vue component you can use in your application.

<info-box hint>
	Starting from version 5.0.0 of this package, you can use native type definitions provided by CKEditor&nbsp;5. Check the details about {@link getting-started/setup/typescript-support TypeScript support}.
</info-box>

## Quick start

### Using CKEditor&nbsp;5 Builder

The easiest way to use CKEditor&nbsp;5 in your Vue application is by configuring it with [CKEditor&nbsp;5 Builder](https://ckeditor.com/builder?redirect=docs) and integrating it with your application. Builder offers an easy-to-use user interface to help you configure, preview, and download the editor suited to your needs. You can easily select:

* the features you need,
* the preferred framework (React, Angular, Vue or Vanilla JS),
* the preferred distribution method.

You get ready-to-use code tailored to your needs!

### Setting up the project

This guide assumes that you already have a Vue project. If you do not have one, see the [Vue documentation](https://vuejs.org/guide/quick-start) to learn how to create it.

### Installation

Start by installing the following packages:

* `ckeditor5` &ndash; contains all open-source plugins and features for CKEditor&nbsp;5.

	```bash
	npm install ckeditor5
	```

* `ckeditor5-premium-features` &ndash; contains premium plugins and features for CKEditor&nbsp;5. Depending on your configuration and chosen plugins, you might not need it.

	```bash
	npm install ckeditor5-premium-features
	```

* `@ckeditor/ckeditor5-vue` &ndash; the [CKEditor&nbsp;5 WYSIWYG editor component for Vue](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue).

	```bash
	npm install @ckeditor/ckeditor5-vue
	```

With these packages installed, you now need to choose whether to install the `<ckeditor>` component globally or locally and follow the appropriate instructions below.

#### Installing the `<ckeditor>` component globally

To register the `<ckeditor>` component globally, you must install the CKEditor&nbsp;5 plugin for Vue.

If you are using a plain Vue project, you should find the file where the `createApp` function is called and register the `CkeditorPlugin` plugin with the [`use()` method](https://vuejs.org/api/application.html#app-use).

```js
import { createApp } from 'vue';
import { CkeditorPlugin } from '@ckeditor/ckeditor5-vue';
import App from './App.vue';

createApp( App )
	.use( CkeditorPlugin )
	.mount( '#app' );
```

If you are using Nuxt.js, you can follow the [Nuxt.js documentation](https://nuxt.com/docs/guide/directory-structure/plugins#vue-plugins) to get access to the `use()` method and register this plugin.

Now you can use the `<ckeditor>` component in any of your Vue components. The following example shows a single file component with open source and premium plugins.

```html
<template>
	<div id="app">
		<ckeditor
			v-model="editorData"
			:editor="editor"
			:config="editorConfig"
		/>
	</div>
</template>

<script>
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo } from 'ckeditor5';
import { SlashCommand } from 'ckeditor5-premium-features';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

export default {
	name: 'app',
	data() {
		return {
			editor: ClassicEditor,
			editorData: '<p>Hello from CKEditor 5 in Vue!</p>',
			editorConfig: {
				plugins: [ Bold, Essentials, Italic, Mention, Paragraph, SlashCommand, Undo ],
				toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				licenseKey: '<YOUR_LICENSE_KEY>',
				// Other configuration options...
			}
		};
	}
};
</script>
```

#### Using the `<ckeditor>` component locally

If you do not want to enable the CKEditor&nbsp;5 component globally, you can import the `Ckeditor` component from the `@ckeditor/ckeditor5-vue` package directly into the Vue component where you want to use it, and add it to the `components` object.

```html
<template>
	<div id="app">
		<ckeditor
			v-model="editorData"
			:editor="editor"
			:config="editorConfig"
		/>
	</div>
</template>

<script>
import { ClassicEditor, Bold, Essentials, Italic, Mention, Paragraph, Undo } from 'ckeditor5';
import { SlashCommand } from 'ckeditor5-premium-features';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

export default {
	name: 'app',
	components: {
		Ckeditor
	},
	data() {
		return {
			editor: ClassicEditor,
			editorData: '<p>Hello from CKEditor 5 in Vue!</p>',
			editorConfig: {
				plugins: [ Bold, Essentials, Italic, Mention, Paragraph, SlashCommand, Undo ],
				toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
				licenseKey: '<YOUR_LICENSE_KEY>',
				// Other configuration options...
			}
		};
	}
};
</script>
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
