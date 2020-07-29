/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, toWidget, toWidgetEditable, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

class InfoBox {
	constructor( editor ) {
		editor.model.schema.register( 'infoBox', {
			allowWhere: '$block',
			allowContentOf: '$root',
			isObject: true,
			allowAttributes: [ 'infoBoxType' ]
		} );

		editor.conversion.for( 'upcast' ).add( dispatcher => dispatcher.on( 'element:div', upcastConverter ) );

		// The downcast conversion must be split as we need a widget in the editing pipeline.
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => dispatcher.on( 'insert:infoBox', editingDowncastConverter ) );
		editor.conversion.for( 'dataDowncast' ).add( dispatcher => dispatcher.on( 'insert:infoBox', dataDowncastConverter ) );
	}
}

function upcastConverter( event, data, conversionApi ) {
	const viewInfoBox = data.viewItem;

	// Detect that view element is an info-box div. Otherwise, it should be handled by another converter.
	if ( !viewInfoBox.hasClass( 'info-box' ) ) {
		return;
	}

	// Create a model structure.
	const modelElement = conversionApi.writer.createElement( 'infoBox', {
		infoBoxType: getTypeFromViewElement( viewInfoBox )
	} );

	// Try to safely insert element - if it returns false the element can't be safely inserted into the content,
	// and the conversion process must stop.
	if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
		return;
	}

	// Mark info-box div as handled by this converter.
	conversionApi.consumable.consume( viewInfoBox, { name: true } );

	// Let's assume that the HTML structure is always the same.
	// If you don't control the order of view elements a more sophisticated search might be needed.
	const viewInfoBoxTitle = viewInfoBox.getChild( 0 );
	const viewInfoBoxContent = viewInfoBox.getChild( 1 );

	// Mark info-box inner elements as handled by this converter.
	conversionApi.consumable.consume( viewInfoBoxTitle, { name: true } );
	conversionApi.consumable.consume( viewInfoBoxContent, { name: true } );

	// Let the editor handle children of the info-box content conversion.
	conversionApi.convertChildren( viewInfoBoxContent, modelElement );

	// Conversion requires updating result data structure properly.
	conversionApi.updateConversionResult( modelElement, data );
}

function editingDowncastConverter( event, data, conversionApi ) {
	let { infoBox, infoBoxContent, infoBoxTitle } = createViewElements( data, conversionApi );

	// Decorate view items as widgets.
	infoBox = toWidget( infoBox, conversionApi.writer, { label: 'simple box widget' } );
	infoBoxContent = toWidgetEditable( infoBoxContent, conversionApi.writer );

	insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent );
}

function dataDowncastConverter( event, data, conversionApi ) {
	const { infoBox, infoBoxContent, infoBoxTitle } = createViewElements( data, conversionApi );

	insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent );
}

function createViewElements( data, conversionApi ) {
	const type = data.item.getAttribute( 'infoBoxType' );

	const infoBox = conversionApi.writer.createContainerElement( 'div', { class: `info-box info-box-${ type.toLowerCase() }` } );
	const infoBoxContent = conversionApi.writer.createEditableElement( 'div', { class: 'info-box-content' } );

	const infoBoxTitle = conversionApi.writer.createUIElement( 'div', { class: 'info-box-title' }, function( domDocument ) {
		const domElement = this.toDomElement( domDocument );

		domElement.innerText = type;

		return domElement;
	} );

	return { infoBox, infoBoxContent, infoBoxTitle };
}

function insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent ) {
	conversionApi.consumable.consume( data.item, 'insert' );

	conversionApi.writer.insert( conversionApi.writer.createPositionAt( infoBox, 0 ), infoBoxTitle );
	conversionApi.writer.insert( conversionApi.writer.createPositionAt( infoBox, 1 ), infoBoxContent );

	conversionApi.mapper.bindElements( data.item, infoBox );
	conversionApi.mapper.bindElements( data.item, infoBoxContent );

	conversionApi.writer.insert( conversionApi.mapper.toViewPosition( data.range.start ), infoBox );
}

ClassicEditor
	.create( document.querySelector( '#editor-custom-element-converter' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ InfoBox ],
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
			viewportTopOffset: window.getViewportTopOffsetConfig()
		}
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
		return 'Info';
	}

	if ( classNames.includes( 'info-box-warning' ) ) {
		return 'Warning';
	}

	return 'None';
}
