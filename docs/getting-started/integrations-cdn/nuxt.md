---
menu-title: Nuxt
meta-title: Using CKEditor 5 with Nuxt from CDN | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with the Nuxt framework using CDN.
category: cloud
order: 50
modified_at: 2025-03-13
---

# Integrating CKEditor&nbsp;5 with Nuxt from CDN

[Nuxt](https://nuxt.com/) is a Vue.js meta-framework for creating full-stack web applications. It offers everything you would expect from a modern framework, including various rendering modes, file-based routing, automatic code splitting, a large ecosystem of plugins and hosting integrations, and more.

CKEditor&nbsp;5 does not support server-side rendering, but you can integrate it with the Nuxt framework. In this guide, you will add the editor to a Nuxt project. For this purpose, you will need a [Nuxt project](https://nuxt.com/docs/getting-started/installation) and the official {@link getting-started/integrations/vuejs-v3 CKEditor&nbsp;5 Vue component}.

{@snippet getting-started/use-builder}

## Setting up the project

This guide assumes you already have a Nuxt project. To create such a project, follow the [Nuxt installation guide](https://nuxt.com/docs/getting-started/installation).

## Using from CDN

<info-box>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

Nuxt is based on Vue.js, so install the [CKEditor 5 WYSIWYG editor component for Vue.js](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue), too:

```bash
npm install @ckeditor/ckeditor5-vue
```

You will use the installed dependencies in a Vue.js component. Create a new component in the `components` directory, for example, `components/Editor.vue`. It will use the `<ckeditor>` component to run the editor. The following example shows a single file component with open-source and premium CKEditor&nbsp;5 plugins.

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

In the above example, the `useCKEditorCloud` hook loads the editor code and plugins from CDN. To use premium plugins, set the `premium` property to `true` and provide your license key in the configuration. For more information about the `useCKEditorCloud` helper, see the {@link getting-started/setup/loading-cdn-resources Loading CDN resources} guide.

Now, you can import and use the `Editor.vue` component anywhere in your application.

```html
<template>
	<ClientOnly>
		<Editor />
	</ClientOnly>
</template>
```

Notice that the `<Editor>` component is wrapped in a `<ClientOnly>` component. It is required because CKEditor&nbsp;5 does not support server-side rendering. The `<ClientOnly>` component ensures that the editor is rendered only on the client side.

You can run your project now using the `npm run dev` command to see your application in the browser.

In the example above, we only used basic features of the `<ckeditor>` component. To learn more about additional features and configuration options, refer to the {@link getting-started/integrations/vuejs-v3 Vue.js integration guide}.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
