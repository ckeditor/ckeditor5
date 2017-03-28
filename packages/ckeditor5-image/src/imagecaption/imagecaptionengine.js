/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaption/imagecaptionengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ModelTreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import viewWriter from '@ckeditor/ckeditor5-engine/src/view/writer';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import { isImage, isImageWidget } from '../image/utils';
import {
	captionElementCreator,
	isCaption,
	getCaptionFromImage,
	matchImageCaption
} from './utils';

/**
 * The image caption engine plugin.
 *
 * Registers proper converters. Takes care of adding caption element if image without it is inserted to model document.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const document = editor.document;
		const viewDocument = editor.editing.view;
		const schema = document.schema;
		const data = editor.data;
		const editing = editor.editing;

		/**
		 * Last selected caption editable.
		 * It is used for hiding editable when is empty and image widget is no longer selected.
		 *
		 * @private
		 * @member {module:engine/view/editableelement~EditableElement} #_lastSelectedCaption
		 */

		/**
		 * Function used to create editable caption element in the editing view.
		 *
		 * @private
		 * @member {Function}
		 */
		this._createCaption = captionElementCreator( viewDocument );

		// Schema configuration.
		schema.registerItem( 'caption' );
		schema.allow( { name: '$inline', inside: 'caption' } );
		schema.allow( { name: 'caption', inside: 'image' } );
		schema.limits.add( 'caption' );

		// Add caption element to each image inserted without it.
		document.on( 'change', insertMissingModelCaptionElement );

		// View to model converter for the data pipeline.
		buildViewConverter()
			.for( data.viewToModel )
			.from( matchImageCaption )
			.toElement( 'caption' );

		// Model to view converter for the data pipeline.
		data.modelToView.on( 'insert:caption', captionModelToView( new ViewContainerElement( 'figcaption' ), false ) );

		// Model to view converter for the editing pipeline.
		editing.modelToView.on( 'insert:caption', captionModelToView( this._createCaption ) );

		// Update view before each rendering.
		this.listenTo( viewDocument, 'render', () => this._updateCaptionVisibility(), { priority: 'high' } );
	}

	/**
	 * Updates view before each rendering, making sure that empty captions (so unnecessary ones) are hidden
	 * and then visible when the image is selected.
	 *
	 * @private
	 */
	_updateCaptionVisibility() {
		const mapper = this.editor.editing.mapper;
		const viewSelection = this.editor.editing.view.selection;
		const selectedElement = viewSelection.getSelectedElement();
		let viewCaption;

		// Hide last selected caption if have no child elements.
		if ( this._lastSelectedCaption && !this._lastSelectedCaption.childCount ) {
			this._lastSelectedCaption.addClass( 'ck-hidden' );
		}

		// If whole image widget is selected.
		if ( selectedElement && isImageWidget( selectedElement ) ) {
			const modelImage = mapper.toModelElement( selectedElement );
			const modelCaption = getCaptionFromImage( modelImage );
			viewCaption =  mapper.toViewElement( modelCaption );
		}

		// If selection is placed inside caption.
		if ( isCaption( viewSelection.editableElement ) ) {
			viewCaption = viewSelection.editableElement;
		}

		if ( viewCaption ) {
			viewCaption.removeClass( 'ck-hidden' );
			this._lastSelectedCaption = viewCaption;
		}
	}
}

// Checks whether data inserted to the model document have image element that has no caption element inside it.
// If there is none - adds it to the image element.
//
// @private
function insertMissingModelCaptionElement( evt, changeType, data, batch ) {
	if ( changeType !== 'insert' ) {
		return;
	}

	const walker = new ModelTreeWalker( {
		boundaries: data.range,
		ignoreElementEnd: true
	} );

	for ( let value of walker ) {
		const item = value.item;

		if ( value.type == 'elementStart' && isImage( item ) && !getCaptionFromImage( item ) ) {
			batch.document.enqueueChanges( () => {
				batch.insert( ModelPosition.createAt( item, 'end' ), new ModelElement( 'caption' ) );
			} );
		}
	}
}
// Creates a converter that converts image caption model element to view element.
//
// @private
// @param {Function|module:engine/view/element~Element} elementCreator
// @param {Boolean} [hide=true] When set to `false` view element will not be inserted when it's empty.
// @return {Function}
function captionModelToView( elementCreator, hide = true ) {
	return ( evt, data, consumable, conversionApi ) => {
		const captionElement = data.item;

		// Return if element shouldn't be present when empty.
		if ( !captionElement.childCount && !hide ) {
			return;
		}

		if ( isImage( captionElement.parent ) ) {
			if ( !consumable.consume( data.item, 'insert' ) ) {
				return;
			}

			const viewImage = conversionApi.mapper.toViewElement( data.range.start.parent );
			const viewCaption = ( elementCreator instanceof ViewElement ) ?
				elementCreator.clone( true ) :
				elementCreator();

			// Hide if empty.
			if ( !captionElement.childCount ) {
				viewCaption.addClass( 'ck-hidden' );
			}

			insertViewCaptionAndBind( viewCaption, data.item, viewImage, conversionApi.mapper );
		}
	};
}

// Inserts `viewCaption` at the end of `viewImage` and binds it to `modelCaption`.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} viewCaption
// @param {module:engine/model/element~Element} modelCaption
// @param {module:engine/view/containerelement~ContainerElement} viewImage
// @param {module:engine/conversion/mapper~Mapper} mapper
function insertViewCaptionAndBind( viewCaption, modelCaption, viewImage, mapper ) {
	const viewPosition = ViewPosition.createAt( viewImage, 'end' );

	viewWriter.insert( viewPosition, viewCaption );
	mapper.bindElements( modelCaption, viewCaption );
}
