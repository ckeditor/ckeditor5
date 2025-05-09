---
menu-title: Vue.js 3+
meta-title: Using CKEditor 5 with Vue.js 3+ from CDN | CKEditor 5 Documentation
meta-description: Install, integrate and configure CKEditor 5 using the Vue.js 3+ component with CDN.
category: cloud
order: 70
---

# Integrating CKEditor&nbsp;5 with Vue.js 3+ from CDN

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-vue" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-vue.svg" alt="npm version" loading="lazy">
	</a>
</p>

CKEditor&nbsp;5 has an official Vue integration that you can use to add a rich text editor to your application. This guide will help you install it and configure to use the CDN distribution of the CKEditor&nbsp;5.

{@snippet getting-started/use-builder}

## Quick start

This guide assumes that you already have a Vue project. If you do not have one, see the [Vue documentation](https://vuejs.org/guide/quick-start) to learn how to create it.

<info-box>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

Start by installing the Vue integration for CKEditor&nbsp;5 from npm:

```bash
npm install @ckeditor/ckeditor5-vue
```

Once the integration is installed, create a new Vue component called `Editor.vue`. It will use the `useCKEditorCloud` helper to load the editor code from the CDN and the `<ckeditor>` component to run it, both of which come from the above package. The following example shows a single file component with open source and premium CKEditor&nbsp;5 plugins.

```html
<template>
	<ckeditor
		v-if="editor"
		v-model="data"
		:editor="editor"
		:config="config"
	/>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Ckeditor, useCKEditorCloud } from '@ckeditor/ckeditor5-vue';

const cloud = useCKEditorCloud( {
	version: '{@var ckeditor5-version}',
	premium: true
} );

const data = ref( '<p>Hello world!</p>' );

const editor = computed( () => {
	if ( !cloud.data.value ) {
		return null;
	}

	return cloud.data.value.CKEditor.ClassicEditor;
} );

const config = computed( () => {
		if ( !cloud.data.value ) {
		return null;
	}

	const { Essentials, Paragraph, Bold, Italic } = cloud.data.value.CKEditor;
	const { FormatPainter } = cloud.data.value.CKEditorPremiumFeatures;

	return {
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Paragraph, Bold, Italic, FormatPainter ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter' ]
	};
} );
</script>
```

In the above example, the `useCKEditorCloud` helper is used to load the editor code and plugins from CDN. The `premium` option is set to also load premium plugins. For more information about the `useCKEditorCloud` helper, see the {@link getting-started/setup/loading-cdn-resources Loading CDN resources} guide.

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
	<ckeditor :editor="editor" />
</template>
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
	<ckeditor :editor="editor" v-model="data" />
	<button @click="emptyEditor">Empty the editor</button>

	<h2>Editor data</h2>
	<code>{{ data }}</code>
</template>

<script setup>
import { ref } from 'vue';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

// Editor loading and configuration is skipped for brevity.

const data = ref( '<p>Hello world!</p>' );

function emptyEditor() {
	data.value = '';
}
</script>
```

In the above example, the `data` property will be updated automatically as the user types and the content changes. It can also be used to change (as in `emptyEditor()`) or set the initial content of the editor.

If you only want to execute an action when the editor data changes, use the [`input`](#input) event.

### `model-value`

Allows a one–way data binding that sets the content of the editor. Unlike [`v-model`](#v-model), the value will not be updated when the content of the editor changes.

```html
<template>
	<ckeditor :editor="editor" :model-value="data" />
</template>

<script setup>
import { ref } from 'vue';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

// Editor loading and configuration is skipped for brevity.

const data = ref( '<p>Hello world!</p>' );
</script>
```

To execute an action when the editor data changes, use the [`input`](#input) event.

### `config`

Specifies the {@link module:core/editor/editorconfig~EditorConfig configuration} of the editor.

```html
<template>
	<ckeditor :editor="editor" :config="config" />
</template>

<script setup>
import { computed } from 'vue';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

// Editor loading and configuration is skipped for brevity.

const config = computed( () => {
	const { Essentials, Paragraph, Bold, Italic } = cloud.data.value.CKEditor;
	const { FormatPainter } = cloud.data.value.CKEditorPremiumFeatures;

	return {
		licenseKey: '<YOUR_LICENSE_KEY>',
		plugins: [ Essentials, Paragraph, Bold, Italic, FormatPainter ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter' ]
	};
} );
</script>
```

### `disabled`

This directive controls the {@link module:core/editor/editor~Editor#isReadOnly `isReadOnly`} property of the editor.

It sets the initial read–only state of the editor and changes it during its lifecycle.

```html
<template>
	<ckeditor :editor="editor" :disabled="disabled" />
</template>

<script setup>
import { ref } from 'vue';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

// Editor loading and configuration is skipped for brevity.

const disabled = ref( true );
</script>
```

### `disableTwoWayDataBinding`

Allows disabling the two-way data binding mechanism. The default value is `false`.

The reason for introducing this option is performance issues in large documents. After enabling this flag, the `v-model` directive will no longer update the connected value whenever the editor's data is changed.

This option allows the integrator to disable the default behavior and only call the {@link module:core/editor/editor~Editor#getData `editor.getData()`} method on demand, which prevents the slowdowns. You can read more in the [relevant issue](https://github.com/ckeditor/ckeditor5-vue/issues/246).

```html
<template>
	<ckeditor :editor="editor" :disableTwoWayDataBinding="disableTwoWayDataBinding" />
</template>

<script setup>
import { ref } from 'vue';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

// Editor loading and configuration is skipped for brevity.

const disableTwoWayDataBinding = ref( true );
</script>
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
	<ckeditor
		v-if="editor"
		v-model="data"
		:editor="editor"
		:config="config"
		@ready="onReady"
	/>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Ckeditor, useCKEditorCloud } from '@ckeditor/ckeditor5-vue';

const cloud = useCKEditorCloud( {
	version: '{@var ckeditor5-version}'
} );

const data = ref( '<p>Hello world!</p>' );

const editor = computed( () => {
	if ( !cloud.data.value ) {
		return null;
	}

	return cloud.data.value.CKEditor.ClassicEditor;
} );

const config = computed( () => {
	if ( !cloud.data.value ) {
		return null;
	}

	const { Essentials, Paragraph, Bold, Italic, Mention } = cloud.data.value.CKEditor;
	const { SlashCommand } = cloud.data.value.CKEditorPremiumFeatures;

	return {
		licenseKey: '<YOUR_LICENSE_KEY>',
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ],
		plugins: [
			Essentials,
			Paragraph,
			Bold,
			Italic,
			Mention,
			SlashCommand
		]
	};
} );

function onReady( editor ) {
	// Insert the toolbar before the editable area.
	editor.ui.getEditableElement().parentElement.insertBefore(
		editor.ui.view.toolbar.element,
		editor.ui.getEditableElement()
	);
}
</script>
```

### Using the editor with collaboration plugins

We provide a **ready-to-use integration** featuring collaborative editing in a Vue application:

* [CKEditor&nbsp;5 with real-time collaboration features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-vue)

It is not mandatory to build applications on top of the above sample, however, it should help you get started.

### Localization

CKEditor&nbsp;5 supports {@link getting-started/setup/ui-language multiple UI languages}, and so does the official Vue component. To translate the editor, pass the languages you need into the `translations` array inside the configuration of the `useCKEditorCloud` function.

```html
<script setup>
import { useCKEditorCloud } from '@ckeditor/ckeditor5-vue';

const cloud = useCKEditorCloud( {
	version: '{@var ckeditor5-version}',
	translations: [ 'es' ]
} );
</script>
```

### TypeScript support

The CKEditor&nbsp;5 Vue component is written in TypeScript and provides type definitions. If you use TypeScript in your project, you can take advantage of them. To do so, import the component and its types using an `import type` statement from a special package containing type definitions. Take a look at the following example:

```html
<script setup>
import { useCKEditorCloud } from '@ckeditor/ckeditor5-vue';
import type { ClassicEditor } from 'https://cdn.ckeditor.com/typings/ckeditor5.d.ts';

const cloud = useCKEditorCloud( {
	version: '{@var ckeditor5-version}',
	translations: [ 'es' ]
} );

const TestEditor = computed<typeof ClassicEditor | null>( () => {
	if ( !cloud.data.value ) {
		return null;
	}

	const {
		ClassicEditor: BaseEditor,
		Paragraph,
		Essentials,
		Heading,
		Bold,
		Italic
	} = cloud.data.value.CKEditor;

	return class TestEditor extends BaseEditor {
		static builtinPlugins = [
			Essentials,
			Paragraph,
			Heading,
			Bold,
			Italic
		];
	};
} );
</script>
```

In the example above, the ClassicEditor type is imported from the `https://cdn.ckeditor.com/typings/ckeditor5.d.ts` package, while the editor itself loads from the CDN. Note that `https://cdn.ckeditor.com/typings/ckeditor5.d.ts` is not an actual URL to the CKEditor&nbsp;5 types file but a synthetic TypeScript module providing type definitions for the editor. The `ckeditor5` package supplies the actual typings, which depend on the `@ckeditor/ckeditor5-react` package.

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

The source code of this component is available on GitHub in [https://github.com/ckeditor/ckeditor5-vue](https://github.com/ckeditor/ckeditor5-vue).

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
