---
menu-title: Vue.js 3+
meta-title: Using CKEditor 5 with Vue.js 3+ rich text editor component from npm | CKEditor 5 Documentation
meta-description: Install, integrate and configure CKEditor 5 using the Vue.js 3+ component with npm.
category: self-hosted
order: 70
---

# Integrating CKEditor&nbsp;5 with Vue.js 3+ from npm

<p>
	<a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-vue" target="_blank" rel="noopener">
		<img src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-vue.svg" alt="npm version" loading="lazy">
	</a>
</p>

CKEditor&nbsp;5 has an official Vue integration that you can use to add a rich text editor to your application. This guide will help you install it and configure to use the npm distribution of the CKEditor&nbsp;5.

{@snippet getting-started/use-builder}

## Quick start

This guide assumes that you already have a Vue project. If you do not have one, see the [Vue documentation](https://vuejs.org/guide/quick-start) to learn how to create it.

Start by installing the following packages:

`ckeditor5` &ndash; contains all open-source plugins and features for CKEditor&nbsp;5.

```bash
npm install ckeditor5
```

`ckeditor5-premium-features` &ndash; contains premium plugins and features for CKEditor&nbsp;5. Depending on your configuration and chosen plugins, you might not need it.

```bash
npm install ckeditor5-premium-features
```

`@ckeditor/ckeditor5-vue` &ndash; the [CKEditor&nbsp;5 WYSIWYG editor component for Vue](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue).

```bash
npm install @ckeditor/ckeditor5-vue
```

With these packages installed, create a new Vue component called `Editor.vue`. It will use the `<ckeditor>` component to run the editor. The following example shows a single file component with open-source and premium CKEditor&nbsp;5 plugins.

<info-box>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from npm:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

```html
<template>
	<ckeditor
		v-model="data"
		:editor="ClassicEditor"
		:config="config"
	/>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ClassicEditor, Essentials, Paragraph, Bold, Italic } from 'ckeditor5';
import { FormatPainter } from 'ckeditor5-premium-features';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

import 'ckeditor5/ckeditor5.css';
import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

const data = ref( '<p>Hello world!</p>' );

const config = computed( () => {
	return {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Paragraph, Bold, Italic, FormatPainter ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic', '|', 'formatPainter' ]
	};
} );
</script>
```

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
	<ckeditor :editor="ClassicEditor" />
</template>

<script setup>
import { ClassicEditor } from 'ckeditor5';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';
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
	<ckeditor :editor="ClassicEditor" v-model="data" />
	<button @click="emptyEditor">Empty the editor</button>

	<h2>Editor data</h2>
	<code>{{ data }}</code>
</template>

<script setup>
import { ref } from 'vue';
import { ClassicEditor } from 'ckeditor5';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

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
	<ckeditor :editor="ClassicEditor" :model-value="data" />
</template>

<script setup>
import { ref } from 'vue';
import { ClassicEditor } from 'ckeditor5';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

const data = ref( '<p>Hello world!</p>' );
</script>
```

To execute an action when the editor data changes, use the [`input`](#input) event.

### `config`

Specifies the {@link module:core/editor/editorconfig~EditorConfig configuration} of the editor.

```html
<template>
    <ckeditor :editor="ClassicEditor" :config="config" />
</template>

<script setup>
import { computed } from 'vue';
import { ClassicEditor, Essentials, Paragraph, Bold, Italic } from 'ckeditor5';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

const config = computed( () => {
	return {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		plugins: [ Essentials, Paragraph, Bold, Italic ],
		toolbar: [ 'undo', 'redo', '|', 'bold', 'italic' ]
	};
} );
</script>
```

### `disabled`

This directive controls the {@link module:core/editor/editor~Editor#isReadOnly `isReadOnly`} property of the editor.

It sets the initial read–only state of the editor and changes it during its lifecycle.

```html
<template>
	<ckeditor :editor="ClassicEditor" :disabled="disabled" />
</template>

<script setup>
import { ref } from 'vue';
import { ClassicEditor } from 'ckeditor5';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

const disabled = ref( true );
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
	<ckeditor :editor="DecoupledEditor" @ready="onReady" />
</template>

<script setup>
import { DecoupledEditor } from 'ckeditor5';
import { Ckeditor } from '@ckeditor/ckeditor5-vue';

import 'ckeditor5/ckeditor5.css';

function onReady( editor )  {
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

* [CKEditor&nbsp;5 with real-time collaboration features and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/real-time-collaboration-for-vue)
* [CKEditor&nbsp;5 with offline comments, track changes and revision history features](https://github.com/ckeditor/ckeditor5-collaboration-samples/tree/master/collaboration-for-vue)

It is not mandatory to build applications on top of the above sample, however, it should help you get started.

### Localization

CKEditor&nbsp;5 supports {@link getting-started/setup/ui-language multiple UI languages}, and so does the official Vue component. Follow the instructions below to translate CKEditor&nbsp;5 in your Vue application.

Similarly to CSS style sheets, both packages have separate translations. Import them as shown in the example below. Then, pass them to the `translations` array inside the `config` prop in the component:

```html

<script setup>
import { computed } from 'vue';
import coreTranslations from 'ckeditor5/translations/es.js';
import premiumFeaturesTranslations from 'ckeditor5-premium-features/translations/es.js';

const config = computed( () => {
	return {
		translations: [ coreTranslations, premiumFeaturesTranslations ],
		// Other configuration options
	};
} );
</script>
```

For more information, refer to the {@link getting-started/setup/ui-language Setting the UI language} guide.

### Jest testing

You can use Jest as a test runner in Vue apps. Unfortunately, Jest does not use a real browser. Instead, it runs tests in Node.js that uses JSDOM. JSDOM is not a complete DOM implementation, and while it is sufficient for standard apps, it cannot polyfill all the DOM APIs that CKEditor&nbsp;5 requires.

For testing CKEditor&nbsp;5, it is recommended to use testing frameworks that utilize a real browser and provide a complete DOM implementation. Some popular options include:

* [Vitest](https://vitest.dev/)
* [Playwright](https://playwright.dev/)
* [Cypress](https://www.cypress.io/)

These frameworks offer better support for testing CKEditor&nbsp;5 and provide a more accurate representation of how the editor behaves in a real browser environment.

If this is not possible and you still want to use Jest, you can mock some of the required APIs. Below is an example of how to mock some of the APIs used by CKEditor&nbsp;5:

```javascript
import { TextEncoder } from 'util';

beforeAll( () => {
	window.TextEncoder = TextEncoder;

	window.scrollTo = jest.fn();

	window.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};

	for (const key of ['InputEvent', 'KeyboardEvent']) {
		window[key].prototype.getTargetRanges = () => {
			const range = new StaticRange({
				startContainer: document.body.querySelector('.ck-editor__editable p')!,
				startOffset: 0,
				endContainer: document.body.querySelector('.ck-editor__editable p')!,
				endOffset: 0,
			});

			return [range];
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
```

These mocks should be placed before the tests that use CKEditor&nbsp;5. They are imperfect and may not cover all the cases, but they should be sufficient for basic initialization and rendering editor. Remember that they are not a replacement for proper browser testing.

## Contributing and reporting issues

The source code of this component is available on GitHub in [https://github.com/ckeditor/ckeditor5-vue](https://github.com/ckeditor/ckeditor5-vue).

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
