---
menu-title: Vue.js 3+
meta-title: Vue.js 3+ rich text editor component | CKEditor 5 documentation
category: self-hosted
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
