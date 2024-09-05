---
menu-title: Migrate from NPM to CDN in Vanilla JS
meta-title: Vanilla JS CKEditor 5 - migrate from NPM to CDN | CKEditor 5 documentation
meta-description: Migrate CKEditor 5 from NPM to CDN in a few simple steps. Learn how to install CKEditor 5 in your project using the CDN.
category: cloud
order: 21
---

# Migrating CKEditor&nbsp;5 from NPM to CDN

This guide will help you migrate CKEditor 5 from an NPM-based installation to a CDN-based installation using Vanilla JS.

## Prerequisites

Make sure that you can modify the HTML head section of your project on server side. If you are using framework like [Laravel](https://laravel.com/), [Symfony](https://symfony.com/) or [Ruby on Rails](https://rubyonrails.org/), you can modify the head section in the main layout file. This means that the HTML file with proper scripts and styles will be send to the client side, so you can use the classical approach to install CKEditor&nbsp;5.

However, if you are using SPA frameworks like [React](https://reactjs.org/), [Angular](https://angular.io/), [Vue.js](https://vuejs.org/), or [Svelte](https://svelte.dev/) and you are not using official integrations, you may need to follow different steps for migrating CKEditor 5 from NPM to CDN. In this case, you can use the lazy injection of CKEditor&nbsp;5.

## Classical approach

The classical approach to installing CKEditor 5 involves modification of the HTML head section to include the CKEditor 5 script from the CDN. The editor is then initialized using the `window.CKEDITOR` global variable.

### Step 1: Remove CKEditor&nbsp;5 NPM Packages

First, you need to uninstall CKEditor 5 packages from your project. Open your terminal and run the following command:

```bash
npm uninstall ckeditor5 ckeditor5-premium-features
```

### Step 2: Update Your HTML File

Next, update your HTML file to include the CKEditor 5 script from the CDN. Add the following script and stylesheet tag inside the `<head>` section of your HTML file:

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

### Step 3: Remove CKEditor&nbsp;5 Imports from JavaScript

If you have any CKEditor 5 imports in your JavaScript files, remove them. For example, remove lines like:

```javascript
import { ClassicEditor, ... } from 'ckeditor5';
import { EasyImage, ... } from 'ckeditor5-premium-features';
```

### Step 4: Initialize CKEditor&nbsp;5 Using CDN

Since the CKEditor 5 script is now included via the CDN, you can access the `ClassicEditor` object directly in your JavaScript file using the `window.CKEDITOR` global variable. Here is an example of migrating the CKEditor 5 initialization code:

**Before:**

```javascript
import { ClassicEditor } from 'ckeditor5';
import { EasyImage, ... } from 'ckeditor5-premium-features';

ClassicEditor
	.create( document.querySelector('#editor') )
	.catch( error => {
		console.error(error);
	} );
```

**After:**

```javascript
const { ClassicEditor } = window.CKEDITOR;

ClassicEditor
	.create( document.querySelector('#editor') )
	.catch( error => {
		console.error(error);
	} );
```

## Using lazy injection of CKEditor&nbsp;5

If you prefer to automatically inject the CKEditor 5 script into your HTML file, you can migrate your project using the `@ckeditor/ckeditor5-integrations-common` package. This package provides a `loadCKEditorCloud` function that automatically injects the CKEditor 5 scripts and styles into your HTML file. It may be useful when your project uses a bundler like Webpack or Rollup and you cannot modify your head section directly.

### Step 1: Install the `@ckeditor/ckeditor5-integrations-common` Package

First, install the `@ckeditor/ckeditor5-integrations-common` package using the following command:

```bash
npm install @ckeditor/ckeditor5-integrations-common
```

### Step 2: Update Your JavaScript File

Next, update your JavaScript file to use the `loadCKEditorCloud` function from the `@ckeditor/ckeditor5-integrations-common` package. Here is an example of migrating the CKEditor 5 initialization code:

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

By following these steps, you have successfully migrated CKEditor 5 from an NPM-based installation to a CDN-based installation using Vanilla JS. This approach simplifies the setup process and can help improve the performance of your application by reducing the bundle size.
