/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

class Section extends Plugin {
	init() {
		const editor = this.editor;
		// section -> toc map
		const trackedSections = new Map();

		editor.model.schema.register( 'section', {
			allowIn: '$root',
			allowContentOf: '$root'
		} );

		editor.conversion.for( 'upcast' ).elementToElement( {
			model: 'section',
			view: 'section'
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'section',
			view: ( modelElement, viewWriter ) => {
				const section = viewWriter.createContainerElement( 'section' );

				const toc = viewWriter.createUIElement(
					'div',
					{
						class: 'toc',
						contenteditable: 'false' // Make it invisible for the selection, to not block up/down arrow keys.
					},
					function( domDocument ) {
						const domElement = this.toDomElement( domDocument );

						domElement.innerHTML = '<div>Section TOC...</div><button>toggle</button>';

						const [ div, button ] = domElement.childNodes;

						button.addEventListener( 'click', evt => {
							evt.stopPropagation();
							evt.preventDefault();

							div.classList.toggle( 'hidden' );
						} );

						return domElement;
					}
				);

				trackedSections.set( section, toc );

				return section;
			}
		} );

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'section',
			view: 'section'
		} );

		editor.editing.view.document.registerPostFixer( writer => {
			// Cleanup section removed from the document first.
			for ( const section of trackedSections.keys() ) {
				if ( !section.isAttached() ) {
					console.log( 'Stopping tracking a section' );

					trackedSections.delete( section );
				}
			}

			// Ensure position at the beginning of a section.
			for ( const [ section, toc ] of trackedSections ) {
				if ( section.getChild( 0 ) !== toc ) {
					console.log( 'Repositioning a TOC' );
					writer.insert( writer.createPositionAt( section, 0 ), toc );
				}
			}
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Section ],
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
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
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
	} )
	.catch( err => {
		console.error( err.stack );
	} );
