/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

const toolbarItems = [
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
];

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: toolbarItems,
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

		buttonHandler( '#heading-config-mini', 'heading.options', [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' }
		] );

		buttonHandler( '#heading-config-midi', 'heading.options', [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' }
		] );

		buttonHandler( '#heading-config-maxi', 'heading.options', [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
		] );

		buttonHandler( '#toolbar-config-bold', 'toolbar', [ 'bold' ] );
		buttonHandler( '#toolbar-config-all', 'toolbar', toolbarItems );

		function buttonHandler( buttonId, configName, configValue ) {
			document.querySelector( buttonId ).addEventListener( 'click', () => {
				console.log( `Changing ${ configName }` );

				editor.config.set( configName, configValue );
			} );
		}

		editor.model.document.selection.on( 'change:range', () => {
			// const selectedElement = editor.model.document.selection.getSelectedElement();
			const position = editor.model.document.selection.getFirstPosition();
			const ancestors = position.getAncestors();
			const cellElement = ancestors.reverse().find( ancestor => ancestor.is( 'element', 'tableCell' ) );

			if ( cellElement ) {
				editor.config.set( 'toolbar', [
					'tableColumn',
					'tableRow',
					'mergeTableCells' ]
				);
			} else {
				editor.config.set( 'toolbar', toolbarItems );
			}

			console.log( cellElement );

			// if ( selectedElement.name === 'table' ) {
			// 	editor.config.set( 'toolbar',  );
			// }
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

