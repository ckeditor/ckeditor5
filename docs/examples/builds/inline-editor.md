---
category: examples-builds
order: 20
toc: false
classes: main__content--no-toc
---

# Inline editor

{@link installation/advanced/predefined-builds#inline-editor Inline editor} lets you create your content directly in its target location with the help of a floating toolbar that apprears when the editable text is focused.

In this example the {@link features/images-styles image styles} configuration was changed to enable left- and right-aligned images.

{@snippet examples/inline-editor}

## Editor example configuration

Check out the {@link installation/advanced/predefined-builds#installation-example-2 Quick start} guide to learn more about implementing this kind of editor. You will find implementation steps there. You can see this example editor’s code below.

<details>
<summary>View editor configuration script</summary>

```js

import InlineEditor from '@ckeditor/ckeditor5-build-inline/src/ckeditor';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

const inlineInjectElements = document.querySelectorAll( '#snippet-inline-editor [data-inline-inject]' );

Array.from( inlineInjectElements ).forEach( inlineElement => {
	const config = {
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		toolbar: {},
        cloudServices: {
                    // PROVIDE CORRECT VALUES HERE:
                    tokenUrl: 'https://example.com/cs-token-endpoint',
                    uploadUrl: 'https://your-organization-id.cke-cs.com/easyimage/upload/',
                    webSocketUrl: 'your-organization-id.cke-cs.com/ws/'
                },
	};

	if ( inlineElement.tagName.toLowerCase() == 'header' ) {
		config.removePlugins = [
			'Blockquote',
			'Image',
			'ImageCaption',
			'ImageStyle',
			'ImageToolbar',
			'ImageUpload',
			'List',
			'EasyImage',
			'CKFinder',
			'CKFinderUploadAdapter'
		];
		config.toolbar.items = [ 'heading', '|', 'bold', 'italic', 'link' ];
	} else {
		config.image = {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		};
	}

	InlineEditor
		.create( inlineElement, config )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( err => {
			console.error( err );
		} );
} );

```

</details>

<details>
<summary>View editor content listing</summary>

```html
<div id="snippet-inline-editor">
	<header data-inline-inject="true">
		<h2>Gone traveling</h2>
		<h3>Monthly travel news and inspiration</h3>
	</header>

	<div data-inline-inject="true">
		<h3>Destination of the Month</h3>

		<h4>Valletta</h4>

		<figure class="image image-style-align-right" style="width: 50%;">
			<img alt="Picture of a sunlit facade of a Maltan building." src="https://ckeditor.com/docs/ckeditor5/latest/assets/img/malta.jpg">
			<figcaption>It's siesta time in Valletta.</figcaption>
		</figure>

		<p>The capital city of <a href="https://en.wikipedia.org/wiki/Malta" target="_blank" rel="external">Malta</a> is the top destination this summer. It’s home to a cutting-edge contemporary architecture, baroque masterpieces, delicious local cuisine and at least 8 months of sun. It’s also a top destination for filmmakers, so you can take a tour through locations familiar to you from Game of Thrones, Gladiator, Troy and many more.</p>
	</div>

	<div class="demo-row">
		<div class="demo-row__half">
			<div data-inline-inject="true">
				<h3>The three greatest things you learn from traveling</h3>
				<p><a href="#">Find out more</a></p>
			</div>
		</div>

		<div class="demo-row__half">
			<div data-inline-inject="true">
				<h3>Walking the capitals of Europe: Warsaw</h3>
				<p><a href="#">Find out more</a></p>
			</div>
		</div>
	</div>
</div>

```

</details>
