/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, ClassicEditor, GeneralHtmlSupport */

ClassicEditor
	.create( document.querySelector( '#snippet-general-html-support' ), {
		extraPlugins: [ GeneralHtmlSupport ],
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:wrapText',
				'imageStyle:breakText',
				'|',
				'toggleImageCaption',
				'imageTextAlternative'
			]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		},
		htmlSupport: {
			allow: [
				// Enables <div>, <details>, and <summary> elements with all kind of attributes.
				{
					name: /^(div|details|summary)$/,
					styles: true,
					classes: true,
					attributes: true
				},

				// Extends the existing Paragraph and Heading features
				// with classes and data-* attributes.
				{
					name: /^(p|h[2-4])$/,
					classes: true,
					attributes: /^data-/
				},

				// Enables <span>s with any inline styles.
				{
					name: 'span',
					styles: true
				},

				// Enables <abbr>s with the title attribute.
				{
					name: 'abbr',
					attributes: [ 'title' ]
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		window.attachTourBalloon( {
			target: window.findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Source' ),
			text: 'Switch to the source mode to check out the source of the content and play with it.',
			editor
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
