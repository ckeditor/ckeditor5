/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals customElements, HTMLElement, document, window, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '../_utils/articlepluginset';

customElements.define( 'ck-editor',
	class extends HTMLElement {
		connectedCallback() {
			const shadowRoot = this.attachShadow( { mode: 'open' } );
			const editorElement = this.querySelector( '#editor-element' );

			shadowRoot.innerHTML = '<h2>CKEditor 5 in shadow DOM.</h2>';
			shadowRoot.appendChild( editorElement );
			shadowRoot.appendChild( document.querySelector( 'style[data-cke]' ).cloneNode( true ) );

			const style = document.createElement( 'style' );

			style.innerHTML = `
				* {
					font-family: "Comic Sans MS", "Comic Sans", cursive;
				}
			`;

			shadowRoot.appendChild( style );

			ClassicEditor
				.create( editorElement, {
					plugins: [ ArticlePluginSet ],
					toolbar: [
						'heading',
						'|',
						'bold',
						'italic',
						'link',
						'bulletedList',
						'numberedList',
						'|',
						'outdent',
						'indent',
						'|',
						'blockQuote',
						'insertTable',
						'mediaEmbed',
						'undo',
						'redo'
					],
					image: {
						toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'imageTextAlternative' ]
					},
					table: {
						contentToolbar: [
							'tableColumn',
							'tableRow',
							'mergeTableCells'
						]
					}
				} )
				.then( editor => {
					window.editor = editor;

					shadowRoot.appendChild( document.querySelector( '.ck-body-wrapper' ) );
				} )
				.catch( err => {
					console.error( err.stack );
				} );
		}
	}
);

