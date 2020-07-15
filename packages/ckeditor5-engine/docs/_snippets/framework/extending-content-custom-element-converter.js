/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, toWidget, toWidgetEditable, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

ClassicEditor
	.create( document.querySelector( '#editor-custom-element-converter' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ function( editor ) {
			editor.model.schema.register( 'infoBox', {
				allowWhere: '$block',
				allowContentOf: '$root',
				isObject: true,
				allowAttributes: [ 'infoBoxType' ]
			} );

			editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:div', ( event, data, conversionApi ) => {
				const viewInfoBox = data.viewItem;
				// . Detect that converted div is the one we need to convert.

				// . Create model structure.
				const modelElement = conversionApi.writer.createElement( 'infoBox', {
					infoBoxType: getTypeFromViewElement( viewInfoBox )
				} );

				// . Try to safely insert element - if it returns false the element can't be safely inserted into
				// the content and the conversion process must stop.
				if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
					return;
				}

				// . Mark info-box div as handled by this converter.
				if ( !conversionApi.consumable.consume( viewInfoBox, { name: true } ) ) {
					return; // If already handled by another converter.
				}

				// For the sake of simplicity we assume that HTML structure is always the same.
				// If you can't control the order of view elements a more sophisticated search might be needed.
				const viewInfoBoxTitle = viewInfoBox.getChild( 0 );
				const viewInfoBoxContent = viewInfoBox.getChild( 1 );

				conversionApi.consumable.consume( viewInfoBoxTitle, { name: true } );
				conversionApi.consumable.consume( viewInfoBoxContent, { name: true } );

				// . Make editor handle children conversion.
				conversionApi.convertChildren( viewInfoBoxContent, modelElement );

				// . Conversion requires updating data structure properly.
				conversionApi.updateConversionResult( modelElement, data );
			} ) );

			editor.conversion.for( 'downcast' ).add(
				dispatcher => dispatcher.on( 'insert:infoBox', ( event, data, conversionApi ) => {
					const modelElement = data.item;
					const viewWriter = conversionApi.writer;

					const type = modelElement.getAttribute( 'infoBoxType' );

					const infoBox = toWidget(
						viewWriter.createContainerElement( 'div', { class: `info-box info-box-${ type }` } ),
						viewWriter,
						{ label: 'simple box widget' }
					);

					const infoBoxTitle = viewWriter.createUIElement( 'div', { class: 'info-box-title' }, function( domDocument ) {
						const domElement = this.toDomElement( domDocument );

						domElement.innerText = type;

						return domElement;
					} );

					const infoBoxContent = toWidgetEditable(
						viewWriter.createEditableElement( 'div', { class: 'info-box-content' } ),
						viewWriter
					);

					conversionApi.consumable.consume( modelElement, 'insert' );

					const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
					viewWriter.insert( viewWriter.createPositionAt( infoBox, 0 ), infoBoxTitle );
					viewWriter.insert( viewWriter.createPositionAt( infoBox, 1 ), infoBoxContent );

					// Bind both...
					conversionApi.mapper.bindElements( modelElement, infoBox );
					conversionApi.mapper.bindElements( modelElement, infoBoxContent );

					conversionApi.writer.insert( viewPosition, infoBox );
				} )
			);
		} ],
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
		// toolbar: {
		// 	viewportTopOffset: window.getViewportTopOffsetConfig()
		// }
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function getTypeFromViewElement( viewElement ) {
	const classNames = [ ...viewElement.getClassNames() ];

	if ( classNames.includes( 'info-box-info' ) ) {
		return 'info';
	}

	if ( classNames.includes( 'info-box-warning' ) ) {
		return 'warning';
	}

	return 'none';
}

