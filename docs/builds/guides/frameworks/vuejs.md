---
menu-title: Vue.js component
category: builds-integration-frameworks
order: 30
---

# Rich text editor component for Vue.js

[![npm version](https://badge.fury.io/js/%40ckeditor%2Fckeditor5-vue.svg)](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue)

CKEditor 5 provides {@link builds/guides/overview ready-to-use editor builds} and the {@link framework/guides/overview CKEditor 5 Framework} which is the foundation of all builds.

The easiest way to use CKEditor 5 in your Vue.js application is by choosing one of the {@link builds/guides/overview#available-builds rich text editor builds}. Additionally, it is also possible to integrate [CKEditor 5 built from source](#integrating-ckeditor-5-from-source) into your application.

## Quick start

Install the [CKEditor 5 rich text editor component for Vue.js](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue) and the build of your choice.

Assuming that you picked [`@ckeditor/ckeditor5-build-classic`](https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic):

```bash
npm install --save @ckeditor/ckeditor5-vue @ckeditor/ckeditor5-build-classic
```

### Direct `<script>` Include

Assuming [Vue is installed](https://vuejs.org/v2/guide/installation.html) in your project, include the `<script>` tags for the editor component and the build:

```html
<script src="../node_modules/@ckeditor/ckeditor5-build-classic/build/ckeditor.js"></script>
<script src="../node_modules/@ckeditor/ckeditor5-vue/dist/ckeditor.js"></script>
```

Install the plugin in your application using the [`Vue.use`](https://vuejs.org/v2/api/#Vue-use) method, specifying the editor build:

```js
Vue.use( CKEditor, {
	editors: {
		classic: ClassicEditor
	}
} );
```

<info-box>
	Check out the [plugin configuration](#plugin-configuration) section to learn more.
</info-box>

Use the component in your template. To enable a two–way data binding, use the [`v-model` directive](https://vuejs.org/v2/api/#v-model):

```html
<ckeditor editor="classic" v-model="editorData" :config="editorConfig"></ckeditor>
```

```js
const app = new Vue( {
	// ...

	data: {
		// ...

		editorData: '<p>Content of the editor.</p>',

		// ...
	},

	// ...
} );
```

<info-box>
	See the list of supported [directives](#supported-directives) and [events](#supported-events) that will help you configure the component.
</info-box>

### Using ES6 modules

Import the editor build and the component modules into your applications:

```js
import Vue from 'vue';
import CKEditor from '@ckeditor/ckeditor5-vue';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
```

Install the plugin in your application using the [`Vue.use`](https://vuejs.org/v2/api/#Vue-use) method, specifying the editor build:

```js
import Vue from 'vue';
import CKEditor from '@ckeditor/ckeditor5-vue';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

Vue.use( CKEditor, {
	editors: {
		classic: ClassicEditor
	}
} );
```

<info-box>
	Check out the [plugin configuration](#plugin-configuration) section to learn more.
</info-box>

Use the component in your template. To enable a two–way data binding, use the [`v-model` directive](https://vuejs.org/v2/api/#v-model):

```html
<ckeditor editor="classic" v-model="editorData" :config="editorConfig"></ckeditor>
```

```js
import Vue from 'vue';
import CKEditor from '@ckeditor/ckeditor5-vue';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

Vue.use( CKEditor, {
	editors: {
		classic: ClassicEditor
	}
} );

const app = new Vue( {
	// ...

	data: {
		// ...

		editorData: '<p>Content of the editor.</p>',

		// ...
	},

	// ...
} );
```

<info-box>
	See the list of supported [directives](#supported-directives) and [events](#supported-events) that will help you configure the component.
</info-box>

### Using Vue CLI

TODO

## Plugin configuration

### Editors

You can specify the editor builds available to the component using the `editors` property. Editors can be either {@link builds/guides/overview ready-to-use editor builds} or [custom builds created from source](#integrating-ckeditor-5-from-source):

```js
Vue.use( CKEditor, {
	editors: {
		classic: ClassicEditor,
		inline: InlineEditor,

		// ...
	}
} );
```

Use the name of the build in your template to create the right editor instance:

```html
<ckeditor editor="classic" ...></ckeditor>
<ckeditor editor="inline" ...></ckeditor>
```

### Component name

You can change the name of the CKEditor component (by default `<ckeditor>`) using the `componentName` property:

```js
Vue.use( CKEditor, {
	componentName: 'myEditor',

	// ...
} );
```

Use the new name in the template to create editor instances:

```html
<myEditor editor="classic"></myEditor>
```

## Component directives

## Component events

## Contributing and reporting issues

The source code of this component is available on GitHub in https://github.com/ckeditor/ckeditor5-vue.
