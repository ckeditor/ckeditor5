---
menu-title: Vue.js 3+
meta-title: Vue.js CKEditor 5 - migrate integration from npm to CDN | CKEditor 5 Documentation
meta-description: Migrate Vue 3+ CKEditor 5 integration from npm to CDN in a few simple steps. Learn how to install Vue 3+ CKEditor 5 integration in your project using the CDN.
category: migrations
order: 40
---

# Migrating Vue.js 3+ CKEditor&nbsp;5 integration from npm to CDN

This guide will help you migrate Vue 3 CKEditor&nbsp;5 integration from an NPM-based installation to a CDN-based one.

## Prerequisites

Remove the existing CKEditor&nbsp;5 packages from your project. If you are using the NPM-based installation, you can remove it by running the following command:

```bash
npm uninstall ckeditor5 ckeditor5-premium-features
```

Upgrade the CKEditor&nbsp;5 Vue 3 integration to the latest version. You can find the latest version in the {@link getting-started/integrations-cdn/vuejs-v3 Vue 3 integration} documentation.

Ensure that your testing suite uses real web browser environments for testing. If you are using `jsdom` or any other environment without a real DOM, you may need to adjust the testing suite configuration to use a real browser because CDN script injection might not be recognized properly in such environments.

## Migration steps

### Step 1: Remove CKEditor&nbsp;5 imports

If you have any CKEditor&nbsp;5 imports in your Vue components, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, /* ... other imports */  } from 'ckeditor5';
import { AIAdapter, /* ... other imports */ } from 'ckeditor5-premium-features';
```

### Step 2: Update your Vue components to use CDN

Replace the CKEditor&nbsp;5 NPM package imports with the CDN script imports and use the `useCKEditorCloud` function to load the CKEditor&nbsp;5 scripts. The `useCKEditorCloud` function is a part of the `@ckeditor/ckeditor5-vue` package and is used to load CKEditor&nbsp;5 scripts from the CKEditor Cloud service.

**Before:**

```html
<template>
	<h2>Using CKEditor 5 from NPM in Vue 3</h2>

	<ckeditor
		v-model="data"
		tag-name="textarea"
		:editor="TestEditor"
		:config="config"
	/>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
	ClassicEditor,
	Essentials,
	Paragraph,
	Heading,
	Bold,
	Italic,
	type EventInfo
} from 'ckeditor5';

class TestEditor extends ClassicEditor {
	static builtinPlugins = [
		Essentials,
		Paragraph,
		Heading,
		Bold,
		Italic
	];
}

const data = ref( '<p>Hello world!</p>' );
const config = reactive( {
	licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
	toolbar: [ 'heading', '|', 'bold', 'italic' ]
} );
</script>
```

**After:**

```html
<template>
	<h2>Using CKEditor 5 from NPM in Vue 3</h2>
  	<ckeditor
		v-if="TestEditor"
		v-model="data"
		tag-name="textarea"
		:editor="TestEditor"
		:config="config"
	/>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useCKEditorCloud } from '@ckeditor/ckeditor5-vue';

const cloud = useCKEditorCloud( {
	version: '{@var ckeditor5-version}'
} );

const TestEditor = computed( () => {
	if ( !cloud.data.value ) {
		return null;
	}

	const {
		ClassicEditor: BaseEditor, Paragraph,
		Essentials, Heading, Bold, Italic
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

const data = ref( '<p>Hello world!</p>' );
const config = reactive( {
	licenseKey: '<YOUR_LICENSE_KEY>',
	toolbar: [ 'heading', '|', 'bold', 'italic' ]
} );
</script>
```

### Step 3 (Optional): Migrate the CKEditor&nbsp;5 Vue 3+ integration testing suite

If you have any tests that use CKEditor&nbsp;5 objects, you need to update them to use the  `loadCKEditorCloud` function. Here is an example of migrating a test that uses the `ClassicEditor` object:

**Before:**

```javascript
import { ClassicEditor, /* ... other imports */ } from 'ckeditor5';

it( 'ClassicEditor test', () => {
	// Your test that uses the CKEditor 5 object.
} );
```

**After:**

```javascript
// It may be counterintuitive that in tests you need to use `loadCKEditorCloud` instead of `useCKEditorCloud`.
// The reason for this is that `useCKEditorCloud` is composable and can only be used in Vue components,
// while tests are typically written as functions in testing suites. Therefore, in tests, you should use
// the `loadCKEditorCloud` function to load CKEditor 5 from the CKEditor Cloud and obtain the necessary
// CKEditor 5 objects. This allows you to properly test your CKEditor 5 integration without any issues.

import { loadCKEditorCloud } from '@ckeditor/ckeditor5-vue';

let cloud;

beforeEach( async () => {
	cloud = await loadCKEditorCloud( {
		version: '{@var ckeditor5-version}',
	} );
} );

it( 'ClassicEditor test', () => {
	const { ClassicEditor, ... } = cloud.CKEditor;

	// Your test that uses the CKEditor 5 object.
} );
```

### Step 4 (Optional): Clean up the document head entries before each test

The `useCKEditorCloud` composable under the hood injects the CKEditor&nbsp;5 scripts and styles into your document head. If you use a testing suite that does not Clean up the document head entries before each test, you may need to do it manually. This is important because the `useCKEditorCloud` composable might reuse the same head entries for each test, which can lead to skipping the `loading` state and directly going to the `success` state. It may cause some tests that rely on the `loading` state to fail.

However, there is one downside to this approach. Cleaning up the head entries before each test may slow down the test execution because the browser needs to download the CKEditor&nbsp;5 script each time. In most cases, this should not be a problem, but if you notice that your tests are running slower, you may need to consider other solutions.

Here is an example of how you can Clean up the document head entries before each test:

```javascript
import { removeAllCkCdnResources } from '@ckeditor/ckeditor5-integrations-common/test-utils';

beforeEach( () => {
	removeAllCkCdnResources();
} );
```

The code above will remove all CKEditor&nbsp;5 CDN scripts, style sheets, and Window objects from the head section of your HTML file before each test, making sure that the `useCKEditorCloud` composable will inject the CKEditor&nbsp;5 scripts and styles again.
