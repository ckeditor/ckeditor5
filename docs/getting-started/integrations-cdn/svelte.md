---
menu-title: Svelte
meta-title: Using CKEditor 5 with Svelte from CDN | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with Svelte using CDN
category: cloud
order: 110
modified_at: 2025-04-24
---

# Integrating CKEditor&nbsp;5 with Svelte from CDN

[Svelte](https://svelte.dev/) is a modern JavaScript compiler that builds highly optimized, reactive web applications. Unlike traditional frameworks, Svelte shifts most of the work from runtime to build time, resulting in highly efficient applications. CKEditor&nbsp;5 can be easily integrated with Svelte applications, providing powerful rich text editing capabilities to your projects.

{@snippet getting-started/use-builder}

## Quick start

<info-box>
	To use our Cloud CDN services, [create a free account](https://portal.ckeditor.com/checkout?plan=free). Learn more about {@link getting-started/licensing/license-key-and-activation license key activation}.
</info-box>

This guide will show you how to integrate CKEditor&nbsp;5 into a Svelte application using the CDN distribution. If you are new to Svelte, check out their [official tutorial](https://svelte.dev/docs/svelte/getting-started).

### Setting up a Svelte project

First, create a new Svelte project using Vite:

```bash
npm create vite@latest ckeditor-svelte -- --template svelte
cd ckeditor-svelte
npm install
```

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

The integration requires:
* Modifying `index.html` to include CKEditor&nbsp;5 scripts and style sheets
* Creating the `src/lib/Editor.svelte` component
* Updating the `src/App.svelte` main application component

Let's implement these changes next.

### Adding CKEditor&nbsp;5 scripts and styles

To load CKEditor&nbsp;5 from CDN, modify the main HTML file of your project (`index.html`) to include the necessary scripts and style sheets:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<link rel="icon" type="image/svg+xml" href="/vite.svg" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>CKEditor 5 + Svelte</title>
		<!-- CKEditor 5 CSS -->
		<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.css" />
		<link rel="stylesheet" href="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.css" />
		<!-- CKEditor 5 Scripts -->
		<script src="https://cdn.ckeditor.com/ckeditor5/{@var ckeditor5-version}/ckeditor5.umd.js"></script>
		<script src="https://cdn.ckeditor.com/ckeditor5-premium-features/{@var ckeditor5-version}/ckeditor5-premium-features.umd.js"></script>
	</head>
	<body>
		<div id="app"></div>
		<script type="module" src="/src/main.js"></script>
	</body>
</html>
```

<info-box>
	The premium features scripts and style sheets are optional and used in this guide to demonstrate a complete integration. You can use just the open-source features if you prefer.
</info-box>

### Implementing the Editor component

Create a new file `src/lib/Editor.svelte` with the following content:

```html
<script>
	import { onMount, onDestroy } from 'svelte';

	let editorContainer;
	let editorInstance = null;
	
	onMount( () => {
		const { ClassicEditor, Essentials, Bold, Italic, Font, Paragraph } = CKEDITOR;
		const { FormatPainter } = CKEDITOR_PREMIUM_FEATURES;
		
		ClassicEditor
			.create( editorContainer, {
				licenseKey: '<YOUR_LICENSE_KEY>', // Replace with your license key
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

1. **Static loading**: CKEditor 5 scripts and styles are loaded from CDN in the HTML file
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
