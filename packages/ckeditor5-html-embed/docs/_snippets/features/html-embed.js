/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, location, console */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';

ClassicEditor.builtinPlugins.push( HtmlEmbed );
ClassicEditor.builtinPlugins.push( CodeBlock );

/* eslint-disable max-len */
const initialData =
`
<h2>CKEditor 5 classic editor build</h2>
<div class="raw-html-embed">
	<p><a href="https://www.npmjs.com/package/@ckeditor/ckeditor5-build-classic"><img alt="npm version" src="https://badge.fury.io/js/%40ckeditor%2Fckeditor5-build-classic.svg" /></a></p>

	<p><a href="https://travis-ci.org/ckeditor/ckeditor5"><img alt="Build Status" src="https://travis-ci.org/ckeditor/ckeditor5.svg?branch=master" /></a>&nbsp;<a href="https://david-dm.org/ckeditor/ckeditor5"><img alt="Dependency Status" src="https://img.shields.io/david/ckeditor/ckeditor5.svg" /></a>&nbsp;<a href="https://david-dm.org/ckeditor/ckeditor5?type=dev"><img alt="devDependency Status" src="https://img.shields.io/david/dev/ckeditor/ckeditor5.svg" /></a></p>

	<p><a href="http://eepurl.com/c3zRPr"><img alt="Join newsletter" src="https://img.shields.io/badge/join-newsletter-00cc99.svg" /></a>&nbsp;<a href="https://twitter.com/ckeditor"><img alt="Follow twitter" src="https://img.shields.io/badge/follow-twitter-00cc99.svg" /></a></p>
</div>

<p>The classic editor build for CKEditor 5. Read more about the <a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/overview.html#classic-editor"><strong>classic editor build</strong></a> and see the <a href="https://ckeditor.com/docs/ckeditor5/latest/examples/builds/classic-editor.html"><strong>demo</strong></a>.</p>

<figure class="image"><img src="https://c.cksource.com/a/1/img/npm/ckeditor5-build-classic.png" alt="CKEditor 5 classic editor build screenshot"></figure>

<h2>Documentation</h2>
<p>See:</p>
<ul>
	<li><a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/installation.html">Installation</a> for how to install this package and what it contains.</li>
	<li><a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/basic-api.html">Basic API</a> for how to create an editor and interact with it.</li>
	<li><a href="https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/configuration.html">Configuration</a> for how to configure the editor.</li>
</ul>

<h2>Quick start</h2>
<p>First, install the build from npm:</p>
<pre><code class="language-plaintext">npm&nbsp;install&nbsp;--save&nbsp;@ckeditor/ckeditor5-build-classic</code></pre>
<p>And use it in your website:</p>
<pre><code class="language-html">&lt;div id="editor">
	&lt;p>This is the editor content.&lt;/p>
&lt;/div>
&lt;script src="./node_modules/@ckeditor/ckeditor5-build-classic/build/ckeditor.js">&lt;/script>
&lt;script>
	ClassicEditor
		.create( document.querySelector( '#editor' ) )
		.then( editor => {
			window.editor = editor;
		} )
		.catch( error => {
			console.error( 'There was a problem initializing the editor.', error );
		} );
&lt;/script></code></pre>

<h2>License</h2>
<p>Licensed under the terms of <a href="http://www.gnu.org/licenses/gpl.html" rel="nofollow">GNU General Public License Version 2 or later</a>. For full details about the license, please check the <code>LICENSE.md</code> file or <a href="https://ckeditor.com/legal/ckeditor-oss-license" rel="nofollow">https://ckeditor.com/legal/ckeditor-oss-license</a>.</p>

<div class="raw-html-embed"><script>
	window.emojicsOpts = {
		widget: '50c7737f072dfd100f3dad0411f02e',
		position: 'inline'
	};
	( function( d, s, id ) {
		var js, fjs = d.getElementsByTagName( s )[ 0 ];
		js = d.createElement( s );
		js.id = id;
		js.src = '//connect.emojics.com/dist/sdk.js';
		fjs.parentNode.insertBefore( js, fjs );
	} )( document, 'script', 'emojics-js' );
</script>
<div id="emojics-root"></div>
</script></div>
`;

ClassicEditor
	.create( document.querySelector( '#snippet-html-embed' ), {
		initialData,
		toolbar: {
			items: [
				'heading',
				'|',
				'bold',
				'italic',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'indent',
				'|',
				'blockQuote',
				'link',
				'imageUpload',
				'mediaEmbed',
				'insertTable',
				'codeBlock',
				'htmlEmbed',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		},
		image: {
			styles: [
				'full',
				'alignLeft',
				'alignRight'
			],
			toolbar: [
				'imageStyle:alignLeft',
				'imageStyle:full',
				'imageStyle:alignRight',
				'|',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		cloudServices: CS_CONFIG
	} )
	.then( editor => {
		window.editor = editor;

		// The "Preview editor data" button logic.
		document.querySelector( '#preview-data-action' ).addEventListener( 'click', () => {
			const mainCSSElement = [ ...document.querySelectorAll( 'link' ) ]
				.find( linkElement => linkElement.href.endsWith( 'css/styles.css' ) );
			const snippetCSSElement = [ ...document.querySelectorAll( 'link' ) ]
				.find( linkElement => linkElement.href.endsWith( 'snippet.css' ) );

			const iframeElement = document.querySelector( '#preview-data-container' );

			// We create the iframe in a careful way and set the base URL to make emojics widget work.
			// NOTE: the emojics widget works only when hosted on ckeditor.com.
			const html = '<!DOCTYPE html><html>' +
				'<head>' +
					'<meta charset="utf-8">' +
					`<base href="${ location.href }">` +
					`<title>${ document.title }</title>` +
					`<link rel="stylesheet" href="${ mainCSSElement.href }" type="text/css">` +
					`<link rel="stylesheet" href="${ snippetCSSElement.href }" type="text/css">` +
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
				'<body class="formatted ck-content">' +
					editor.getData() +
				'</body>' +
				'</html>';

			iframeElement.contentWindow.document.open();
			iframeElement.contentWindow.document.write( html );
			iframeElement.contentWindow.document.close();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
