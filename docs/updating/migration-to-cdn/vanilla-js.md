---
menu-title: Vanilla JS
meta-title: Vanilla JS CKEditor 5 - migrate from npm to CDN | CKEditor 5 Documentation
meta-description: Migrate CKEditor 5 from npm to CDN in a few simple steps. Learn how to install CKEditor 5 in your project using the CDN.
category: migrations
order: 10
---

# Migrating CKEditor&nbsp;5 from npm to CDN

This guide will help you migrate CKEditor&nbsp;5 from an NPM-based installation to a CDN-based one. CDN-based installations can simplify the setup process by providing a bundler-agnostic way to lazy initialization of CKEditor&nbsp;5 scripts and styles injection. It reduces complexity in the project setup.

## Prerequisites

If you use frameworks like [Laravel](https://laravel.com/), [Symfony](https://symfony.com/), or [Ruby on Rails](https://rubyonrails.org/), modify the head section in the main layout file and follow the traditional HTML integration to install CKEditor&nbsp;5.

However, if you use SPA frameworks like [React](https://reactjs.org/), [Angular](https://angular.io/), [Vue.js](https://vuejs.org/), or [Svelte](https://svelte.dev/) and do not use official integrations, you may need to follow different steps to migrate CKEditor&nbsp;5 from npm to CDN. In this case, you can utilize the lazy injection of CKEditor&nbsp;5 since you cannot directly modify the head section.

## Traditional HTML integration

The traditional HTML integration to installing CKEditor&nbsp;5 involves modification of the HTML head section to include the CKEditor&nbsp;5 script from the CDN. The editor is then initialized using the `window.CKEDITOR` global variable.

### Step 1: Update your HTML file

First, update your HTML file to include the CKEditor&nbsp;5 script from the CDN. Add the following script and style sheet tag inside the `<head>` section of your HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CKEditor 5 CDN Example</title>
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css">
    <script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.js"></script>

	<!-- Optionally, add premium features. -->
	<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5-premium-features.css">
	<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5-premium-features.js"></script>
</head>
<body>
    <textarea name="content" id="editor"></textarea>
    <script src="app.js"></script>
</body>
</html>
```

### Step 2: Replace CKEditor&nbsp;5 imports with `window.CKEDITOR`

Since the CKEditor&nbsp;5 script is now included via the CDN, you can access the `ClassicEditor` object directly in your JavaScript file using the `window.CKEDITOR` global variable. It means that `import` statements are no longer needed and you can remove them from your JavaScript files. Here is an example of migrating the CKEditor&nbsp;5 initialization code:

**Before:**

```javascript
import { ClassicEditor } from 'ckeditor5';
import { AIAdapter, /* ... other imports */ } from 'ckeditor5-premium-features';

ClassicEditor
	.create( document.querySelector('#editor'), {
		licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
		// ... other configuration
	} )
	.catch( error => {
		console.error(error);
	} );
```

**After:**

```javascript
const { ClassicEditor } = window.CKEDITOR;
const { AIAdapter, /* ... other imports */ } = window.CKEDITOR_PREMIUM_FEATURES;

ClassicEditor
	.create( document.querySelector('#editor'), {
		licenseKey: '<YOUR_LICENSE_KEY>',
		// ... other configuration
	} )
	.catch( error => {
		console.error(error);
	} );
```

## Using lazy injection of CKEditor&nbsp;5

If you prefer to automatically inject the CKEditor&nbsp;5 script into your HTML file, you can migrate your project using the `@ckeditor/ckeditor5-integrations-common` package. This package provides a `loadCKEditorCloud` function that automatically injects the CKEditor&nbsp;5 scripts and styles into your HTML file. It may be useful when your project uses a bundler like Webpack or Rollup and you cannot modify your head section directly.

### Step 1: Install the `@ckeditor/ckeditor5-integrations-common` Package

First, install the `@ckeditor/ckeditor5-integrations-common` package using the following command:

```bash
npm install @ckeditor/ckeditor5-integrations-common
```

### Step 2: Replace CKEditor&nbsp;5 Imports

If you have any CKEditor&nbsp;5 imports in your JavaScript files, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, /* ... other imports */ } from 'ckeditor5';
import { AIAdapter, /* ... other imports */ } from 'ckeditor5-premium-features';
```

Next, update your JavaScript file to use the `loadCKEditorCloud` function from the `@ckeditor/ckeditor5-integrations-common` package. Here is an example of migrating the CKEditor&nbsp;5 initialization code:

**Before:**

```javascript
import { ClassicEditor } from 'ckeditor5';

ClassicEditor
	.create( document.querySelector('#editor') )
	.catch( error => {
		console.error(error);
	} );
```

**After:**

```javascript
import { loadCKEditorCloud } from '@ckeditor/ckeditor5-integrations-common';

const { ClassicEditor } = await loadCKEditorCloud( {
	version: '{@var ckeditor5-version}',
} );
```

## Conclusion

Following these steps, you successfully migrated CKEditor&nbsp;5 from an NPM-based installation to a CDN-based installation using Vanilla JS. This approach simplifies the setup process and can help improve the performance of your application by reducing the bundle size.
