---
menu-title: Svelte
meta-title: Using CKEditor&nbsp;5 with Svelte from npm | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with Svelte using npm
category: self-hosted
order: 110
modified_at: 2025-04-24
---

# Integrating CKEditor&nbsp;5 with Svelte from npm

[Svelte](https://svelte.dev/) is a modern JavaScript compiler that builds highly optimized, reactive web applications. Unlike traditional frameworks, Svelte shifts most of the work from runtime to build time, resulting in highly efficient applications. CKEditor&nbsp;5 can be easily integrated with Svelte applications, providing powerful rich text editing capabilities to your projects.

{@snippet getting-started/use-builder}

## Quick start

This guide will show you how to integrate CKEditor&nbsp;5 into a Svelte application using the npm distribution. If you are new to Svelte, check out their [official tutorial](https://svelte.dev/docs/svelte/getting-started).

### Setting up a Svelte project

First, create a new Svelte project using Vite:

```bash
npm create vite@latest ckeditor-svelte -- --template svelte
cd ckeditor-svelte
npm install
```

### Installing CKEditor&nbsp;5

Next, install the `ckeditor5` and the `ckeditor5-premium-features` packages:

```bash
npm install ckeditor5 ckeditor5-premium-features
```

<info-box>
	The premium features package is optional and used in this guide to demonstrate a complete integration. You can use just the open-source features if you prefer.
</info-box>

### Project structure

When completed, the folder structure of your project should resemble this one:

```plain
├── node_modules/
├── public/
├── src/
│   ├── lib/
│   │   └── Editor.svelte
│   ├── App.svelte
│   ├── main.js
│   └── ...
├── index.html
├── package.json
├── vite.config.js
├── svelte.config.js
└── ...
```

The integration requires two key Svelte components:
* `src/lib/Editor.svelte` &ndash; the component that wraps CKEditor functionality
* `src/App.svelte` &ndash; the main application component that uses the Editor component

Let's implement these components next.

### Implementing the Editor component

Create a new file `src/lib/Editor.svelte` with the following content:

```html
<script>
	import { onMount, onDestroy } from 'svelte';
	
	import { ClassicEditor, Essentials, Bold, Italic, Font, Paragraph } from 'ckeditor5';
	import { FormatPainter } from 'ckeditor5-premium-features';
	
	import 'ckeditor5/ckeditor5.css';
	import 'ckeditor5-premium-features/ckeditor5-premium-features.css';

	let editorContainer;
	let editorInstance = null;

	onMount( () => {
		ClassicEditor
			.create( editorContainer, {
				licenseKey: '<YOUR_LICENSE_KEY>', // Replace with your license key or 'GPL'
				plugins: [ Essentials, Bold, Italic, Font, Paragraph, FormatPainter ],
				toolbar: [
					'undo', 'redo', '|', 'bold', 'italic', '|',
					'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
					'formatPainter'
				]
			} )
			.then( editor => {
				editorInstance = editor;
			} )
			.catch( error => {
				console.error( 'Error initializing CKEditor:', error );
			} );
	} );

	onDestroy( () => {
		if ( editorInstance ) {
			editorInstance.destroy().catch( err => console.error( err ) );
		}
	} );
</script>

<div bind:this={editorContainer}>
	<p>Hello from CKEditor 5!</p>
</div>
```

### Using the Editor component

Now, modify the main `App.svelte` file to use our editor component:

```html
<script>
	import Editor from './lib/Editor.svelte'
</script>

<main>
	<h1>CKEditor 5 + Svelte</h1>

	<div class="editor-wrapper">
		<Editor />
	</div>
</main>

<style>
	.editor-wrapper {
		width: 800px;
	}

	:global(.ck.ck-editor__editable) {
		height: 200px;
		background-color: white;
		color: #333;
	}
</style>
```

You can now run the dev server to see the editor in action:

```bash
npm run dev
```

### Component structure

The Svelte integration follows these key steps:

1. **Import dependencies**: The required CKEditor&nbsp;5 modules and styles are imported
2. **Editor initialization**: The editor is created with the specified configuration when the component mounts
3. **Cleanup**: Resources are properly released when the component is destroyed

### Styling

Basic styling is provided in the `App.svelte` component to ensure proper display in various environments, especially when using dark themes:

```css
.editor-wrapper {
	width: 800px;
}

:global(.ck.ck-editor__editable) {
	height: 200px;
	background-color: white;
	color: #333;
}
```

## Next steps

* Explore the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide to learn how to handle content.
* Learn more about {@link getting-started/setup/configuration configuration options} to customize your editor.
* Check the {@link features/index features documentation} to add more functionality to your editor.
