---
# Scope:
# * Introduction to setting configurations.
# * Introduction to the top and must-know configurations.
# * Point where to find the list of configuration options.

category: setup
menu-title: Configuration
meta-title: Configuration | CKEditor 5 documentation
order: 10
---

<!-- cut out nav infoboxes, cut out all mentions of predefined builds, cut out mentions about Online Builder -->

# Configuration

When creating an editor on your page, it is possible to set up {@link module:core/editor/editorconfig~EditorConfig configuration options} that change many of its aspects. For example:

```js
ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote' ],
		heading: {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
			]
		}
	} )
	.catch( error => {
		console.log( error );
	} );
```

As you can see, the configuration is set by a simple JavaScript object passed to the `create()` method.

See {@link module:core/editor/editorconfig~EditorConfig} to learn about all available configuration options.

Some of the options may require loading plugins that are not available in the build you use. Return to the {@link getting-started/legacy-getting-started/quick-start-other Customized installation} guide for instructions on creating a custom build.
