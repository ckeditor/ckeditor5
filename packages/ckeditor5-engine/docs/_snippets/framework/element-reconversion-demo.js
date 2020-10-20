/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const getTypeFromViewElement = viewElement => {
	for ( const type of [ 'info', 'warning' ] ) {
		if ( viewElement.hasClass( `info-box-${ type }` ) ) {
			return type;
		}
	}

	return 'info';
};

class ComplexInfoBox {
	constructor( editor ) {
		// Schema definition.
		editor.model.schema.register( 'complexInfoBox', {
			allowWhere: '$block',
			allowContentOf: '$root',
			isObject: true,
			allowAttributes: [ 'infoBoxType', 'infoBoxURL' ]
		} );

		editor.model.schema.register( 'complexInfoBoxTitle', {
			isLimit: true,
			allowIn: 'complexInfoBox',
			allowContentOf: '$block'
		} );

		editor.model.schema.register( 'complexInfoBoxContent', {
			isLimit: true,
			allowIn: 'complexInfoBox',
			allowContentOf: '$root'
		} );

		// Upcast converter.
		editor.conversion.for( 'upcast' )
			.elementToElement( {
				view: {
					name: 'div',
					classes: [ 'info-box' ]
				},
				model( viewElement, { writer } ) {
					const complexInfoBox = writer.createElement( 'complexInfoBox' );

					const type = getTypeFromViewElement( viewElement );

					writer.setAttribute( 'infoBoxType', type, complexInfoBox );
					writer.setAttribute( 'infoBoxURL', 'https://ckeditor.com', complexInfoBox );

					return complexInfoBox;
				}
			} )
			.elementToElement( {
				view: {
					name: 'div',
					classes: [ 'info-box-title' ]
				},
				model: 'complexInfoBoxTitle'
			} )
			.elementToElement( {
				view: {
					name: 'div',
					classes: [ 'info-box-content' ]
				},
				model: 'complexInfoBoxContent'
			} );

		// The downcast conversion must be split as you need a widget in the editing pipeline.
		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'complexInfoBox',
			view( modelElement, { writer, consumable, mapper } ) {
				const complexInfoBoxView = writer.createContainerElement( 'div', { class: 'info-box' } );

				const type = modelElement.getAttribute( 'infoBoxType' ) || 'info';

				writer.addClass( `info-box-${ type }`, complexInfoBoxView );

				for ( const child of modelElement.getChildren() ) {
					const childView = writer.createContainerElement( 'div' );

					if ( child.is( 'element', 'complexInfoBoxTitle' ) ) {
						writer.addClass( 'info-box-title', childView );
					} else {
						writer.addClass( 'info-box-content', childView );
					}

					consumable.consume( child, 'insert' );
					mapper.bindElements( child, childView );
					writer.insert( writer.createPositionAt( complexInfoBoxView, 'end' ), childView );
				}

				return complexInfoBoxView;
			}
		} );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor-element-reconversion' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ ComplexInfoBox ],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		toolbar: {
			items: [ 'paragraph', 'heading1', 'heading2', '|', '|', 'bold', 'italic', '|' ],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );
