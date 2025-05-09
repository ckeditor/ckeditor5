---
menu-title: Nuxt
meta-title: Using CKEditor 5 with Nuxtfrom npm | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with the Nuxt framework using npm.
category: self-hosted
order: 50
modified_at: 2025-03-13
---

# Integrating CKEditor&nbsp;5 with Nuxt from npm

[Nuxt](https://nuxt.com/) is a Vue.js meta-framework for creating full-stack web applications. It offers everything you would expect from a modern framework, including various rendering modes, file-based routing, automatic code splitting, a large ecosystem of plugins and hosting integrations, and more.

CKEditor&nbsp;5 does not support server-side rendering, but you can integrate it with the Nuxt framework. In this guide, you will add the editor to a Nuxt project. For this purpose, you will need a [Nuxt project](https://nuxt.com/docs/getting-started/installation) and the official {@link getting-started/integrations/vuejs-v3 CKEditor&nbsp;5 Vue component}.

{@snippet getting-started/use-builder}

## Setting up the project

This guide assumes you already have a Nuxt project. To create such a project, follow the [Nuxt installation guide](https://nuxt.com/docs/getting-started/installation).

## Installing from npm

First, install the CKEditor 5 packages:

* `ckeditor5` &ndash; package with open-source plugins and features.
* `ckeditor5-premium-features` &ndash; package with premium plugins and features.

Depending on your configuration and chosen plugins, you may need to install the first or both packages.

```bash
npm install ckeditor5 ckeditor5-premium-features
```

Nuxt is based on Vue.js, so install the [CKEditor 5 WYSIWYG editor component for Vue.js](https://www.npmjs.com/package/@ckeditor/ckeditor5-vue), too:

```bash
npm install @ckeditor/ckeditor5-vue
```

Next, you will use the installed dependencies in a Vue.js component. Create a new component in the `components` directory, for example, `components/Editor.vue`. It will use the `<ckeditor>` component to run the editor. The following example shows a single file component with open-source and premium CKEditor&nbsp;5 plugins.

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
