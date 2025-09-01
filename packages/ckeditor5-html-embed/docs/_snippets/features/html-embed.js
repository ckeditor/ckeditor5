/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	HtmlEmbed,
	CodeBlock,
	CKBox,
	CKBoxImageEdit,
	PictureEditing,
	HorizontalLine,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage
} from 'ckeditor5';
import {
	TOKEN_URL,
	CS_CONFIG,
	ClassicEditor,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';

ClassicEditor.builtinPlugins.push(
	HtmlEmbed,
	CodeBlock,
	PictureEditing,
	HorizontalLine,
	ImageInsert,
	ImageResize,
	AutoImage,
	LinkImage,
	CKBox,
	CKBoxImageEdit );

/* eslint-disable @stylistic/max-len */
const initialData =
`
<h2>CKEditor 5 HTML Embed feature</h2>
<p>The feature may be used to embed advanced textual content, both static and generated, that boosts discoverability, cross-language support, and accessibility. For example:</p>
<div class="raw-html-embed">
<p>
	Explore our latest achievements in the <abbr title="Large Language Model">LLM</abbr> research!<br>
	Where? At the <ruby>ＡＩ研究施設<rt>えーあいけんきゅうしせつ</rt></ruby>, AI Reesearch Facility.<br>
	When? Today, <span id="today"></span>, at 2 PM.
</p>
<script>
  const today = new Date();
  document.getElementById("today").textContent = today.toLocaleDateString();
</script>
</div>
<hr>
<div role="separator" class="b-separator"></div>
<p>It may also serve dynamic, external content. For example:</p>
<div class="raw-html-embed">
	<a class="weatherwidget-io" href="https://forecast7.com/en/40d71n74d01/new-york/" data-label_1="NEW YORK" data-label_2="WEATHER" data-theme="original" >NEW YORK WEATHER</a>
	<script>
	!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');
	</script>
</div>
<hr>
<div role="separator" class="b-separator"></div>
<p>Or it can be used to produce generated content that is complicated under the surface, but quite simple for the end user. For example:</p>
<div class="raw-html-embed">
<script>
	const element = document.createElement( 'div' );
	element.innerHTML = '<p>CKEditor 5 classic type</p>';
	document.body.appendChild( element );
</script>
</div>
`;

ClassicEditor
	.create( document.querySelector( '#snippet-html-embed' ), {
		initialData,
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'insertImage', 'insertTable', 'mediaEmbed', 'htmlEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;

		const refreshIframeContent = window.umberto.throttle( () => {
			const stylesheets = [
				'css/styles.css',
				'ckeditor5.css',
				'ckeditor5-premium-features.css'
			];

			const links = Array
				.from( document.querySelectorAll( 'link' ) )
				.filter( element => stylesheets.some( name => element.href.endsWith( name ) ) );

			const { iframe } = document.querySelector( '#preview-data-container' );

			// We create the iframe in a careful way and set the base URL to make emojics widget work.
			// NOTE: the emojics widget works only when hosted on ckeditor.com.
			iframe.setContent(
				'<!DOCTYPE html><html>' +
				'<head>' +
					'<meta charset="utf-8">' +
					`<base href="${ location.href }">` +
					`<title>${ document.title }</title>` +
					links.map( link => `<link rel="stylesheet" href="${ link.href }">` ).join( '' ) +
					`<style>
						body {
							padding: 20px;
						}
						.formatted p img {
							display: inline;
							margin: 0;
						}
					</style>` +
				'</head>' +
				'<body class="ck-content">' +
					editor.getData() +
				'</body>' +
				'</html>'
			);
		}, 200 );

		editor.model.document.on( 'change:data', refreshIframeContent );

		refreshIframeContent();
		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar, item => item.label && item.label === 'Insert HTML' ),
			text: 'Click to embed a new HTML snippet.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
