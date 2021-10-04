/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, toWidget, toWidgetEditable, console, window, document */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

class InfoBox {
	constructor( editor ) {
		// Schema definition.
		editor.model.schema.register( 'infoBox', {
			allowWhere: '$block',
			allowContentOf: '$root',
			isObject: true,
			allowAttributes: [ 'infoBoxType' ]
		} );

		// Upcast converter.
		editor.conversion.for( 'upcast' )
			.add( dispatcher => dispatcher.on( 'element:div', upcastConverter ) );

		// The downcast conversion must be split as you need a widget in the editing pipeline.
		editor.conversion.for( 'editingDowncast' )
			.add( dispatcher => dispatcher.on( 'insert:infoBox', editingDowncastConverter ) );
		editor.conversion.for( 'dataDowncast' )
			.add( dispatcher => dispatcher.on( 'insert:infoBox', dataDowncastConverter ) );

		// The model-to-view position mapper is needed since the model <infoBox> content needs to end up in the inner
		// <div class="info-box-content">.
		editor.editing.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
		editor.data.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
	}
}

function upcastConverter( event, data, conversionApi ) {
	const viewInfoBox = data.viewItem;

	// Detect that a view element is an info box <div>.
	// Otherwise, it should be handled by another converter.
	if ( !viewInfoBox.hasClass( 'info-box' ) ) {
		return;
	}

	// Create the model structure.
	const modelElement = conversionApi.writer.createElement( 'infoBox', {
		infoBoxType: getTypeFromViewElement( viewInfoBox )
	} );

	// Try to safely insert the element into the model structure.
	// If `safeInsert()` returns `false`, the element cannot be safely inserted
	// into the content and the conversion process must stop.
	// This may happen if the data that you are converting has an incorrect structure
	// (e.g. it was copied from an external website).
	if ( !conversionApi.safeInsert( modelElement, data.modelCursor ) ) {
		return;
	}

	// Mark the info box <div> as handled by this converter.
	conversionApi.consumable.consume( viewInfoBox, { name: true } );

	// Let us assume that the HTML structure is always the same.
	// Note: For full bulletproofing this converter, you should also check
	// whether these elements are the right ones.
	const viewInfoBoxTitle = viewInfoBox.getChild( 0 );
	const viewInfoBoxContent = viewInfoBox.getChild( 1 );

	// Mark info box inner elements (title and content <div>s) as handled by this converter.
	conversionApi.consumable.consume( viewInfoBoxTitle, { name: true } );
	conversionApi.consumable.consume( viewInfoBoxContent, { name: true } );

	// Let the editor handle the children of <div class="info-box-content">.
	conversionApi.convertChildren( viewInfoBoxContent, modelElement );

	// Finally, update the conversion's modelRange and modelCursor.
	conversionApi.updateConversionResult( modelElement, data );
}

function editingDowncastConverter( event, data, conversionApi ) {
	let { infoBox, infoBoxContent, infoBoxTitle } = createViewElements( data, conversionApi );

	// Decorate view items as a widget and widget editable area.
	infoBox = toWidget( infoBox, conversionApi.writer, { label: 'info box widget' } );
	infoBoxContent = toWidgetEditable( infoBoxContent, conversionApi.writer );

	insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent );
}

function dataDowncastConverter( event, data, conversionApi ) {
	const { infoBox, infoBoxContent, infoBoxTitle } = createViewElements( data, conversionApi );

	insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent );
}

function createViewElements( data, conversionApi ) {
	const type = data.item.getAttribute( 'infoBoxType' );

	const infoBox = conversionApi.writer.createContainerElement( 'div', {
		class: `info-box info-box-${ type.toLowerCase() }`
	} );
	const infoBoxContent = conversionApi.writer.createEditableElement( 'div', {
		class: 'info-box-content'
	} );

	const infoBoxTitle = conversionApi.writer.createUIElement( 'div',
		{ class: 'info-box-title' },
		function( domDocument ) {
			const domElement = this.toDomElement( domDocument );

			domElement.innerText = type;

			return domElement;
		} );

	return { infoBox, infoBoxContent, infoBoxTitle };
}

function insertViewElements( data, conversionApi, infoBox, infoBoxTitle, infoBoxContent ) {
	conversionApi.consumable.consume( data.item, 'insert' );

	conversionApi.writer.insert(
		conversionApi.writer.createPositionAt( infoBox, 0 ),
		infoBoxTitle
	);
	conversionApi.writer.insert(
		conversionApi.writer.createPositionAt( infoBox, 1 ),
		infoBoxContent
	);

	// The mapping between the model <infoBox> and its view representation.
	conversionApi.mapper.bindElements( data.item, infoBox );

	conversionApi.writer.insert(
		conversionApi.mapper.toViewPosition( data.range.start ),
		infoBox
	);
}

function createModelToViewPositionMapper( view ) {
	return ( evt, data ) => {
		const modelPosition = data.modelPosition;
		const parent = modelPosition.parent;

		// Only the mapping of positions that are directly in
		// the <infoBox> model element should be modified.
		if ( !parent.is( 'element', 'infoBox' ) ) {
			return;
		}

		// Get the mapped view element <div class="info-box">.
		const viewElement = data.mapper.toViewElement( parent );

		// Find the <div class="info-box-content"> in it.
		const viewContentElement = findContentViewElement( view, viewElement );

		// Translate the model position offset to the view position offset.
		data.viewPosition = data.mapper.findPositionIn( viewContentElement, modelPosition.offset );
	};
}

// Returns the <div class="info-box-content"> nested in the info box view structure.
function findContentViewElement( editingView, viewElement ) {
	for ( const value of editingView.createRangeIn( viewElement ) ) {
		if ( value.item.is( 'element', 'div' ) && value.item.hasClass( 'info-box-content' ) ) {
			return value.item;
		}
	}
}

function getTypeFromViewElement( viewElement ) {
	if ( viewElement.hasClass( 'info-box-info' ) ) {
		return 'Info';
	}

	if ( viewElement.hasClass( 'info-box-warning' ) ) {
		return 'Warning';
	}

	return 'None';
}

ClassicEditor
	.create( document.querySelector( '#editor-custom-element-converter' ), {
		cloudServices: CS_CONFIG,
		extraPlugins: [ InfoBox ],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|', 'toggleImageCaption', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
