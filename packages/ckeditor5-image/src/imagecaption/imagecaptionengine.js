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
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import viewWriter from '@ckeditor/ckeditor5-engine/src/view/writer';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import ViewMatcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import { isImage, isImageWidget } from '../utils';
import { captionElementCreator, isCaption, getCaptionFromImage } from './utils';

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
		 * @member {module:image/imagecaption/imagecaptionengine~ImageCaptionEngine} #_lastSelectedEditable
		 */

		// Schema configuration.
		schema.registerItem( 'caption' );
		schema.allow( { name: '$inline', inside: 'caption' } );
		schema.allow( { name: 'caption', inside: 'image' } );
		schema.limits.add( 'caption' );

		// Add caption element to each image inserted without it.
		document.on( 'change', insertMissingCaptionElement );

		// View to model converter for data pipeline.
		const matcher = new ViewMatcher( ( element ) => {
			const parent = element.parent;

			// Convert only captions for images.
			if ( element.name == 'figcaption' && parent && parent.name == 'figure' && parent.hasClass( 'image' ) ) {
				return { name: true };
			}

			return null;
		} );

		buildViewConverter()
			.for( data.viewToModel )
			.from( matcher )
			.toElement( 'caption' );

		// Model to view converter for data pipeline.
		data.modelToView.on(
			'insert:caption',
			captionModelToView( new ViewContainerElement( 'figcaption' ) )
		);

		// Model to view converter for editing pipeline.
		editing.modelToView.on(
			'insert:caption',
			captionModelToView( captionElementCreator( viewDocument ) )
		);

		// Adding / removing caption element when there is no text in the model.
		const selection = viewDocument.selection;

		// Update view before each rendering.
		this.listenTo( viewDocument, 'render', () => {
			// Check if there is an empty caption view element to remove.
			this._removeEmptyCaption();

			// Check if image widget is selected and caption view element needs to be added.
			this._addCaption();

			// If selection is currently inside caption editable - store it to hide when empty.
			const editableElement = selection.editableElement;

			if ( editableElement && isCaption( selection.editableElement ) ) {
				this._lastSelectedEditable = selection.editableElement;
			}
		}, { priority: 'high' } );
	}

	/**
	 * Checks if there is an empty caption element to remove from view.
	 *
	 * @private
	 */
	_removeEmptyCaption() {
		const viewSelection = this.editor.editing.view.selection;
		const viewCaptionElement = this._lastSelectedEditable;

		// No caption to hide.
		if ( !viewCaptionElement ) {
			return;
		}

		// If selection is placed inside caption - do not remove it.
		if ( viewSelection.editableElement === viewCaptionElement ) {
			return;
		}

		// Do not remove caption if selection is placed on image that contains that caption.
		const selectedElement = viewSelection.getSelectedElement();

		if ( selectedElement && isImageWidget( selectedElement ) ) {
			const viewImage = viewCaptionElement.findAncestor( element => element == selectedElement );

			if ( viewImage ) {
				return;
			}
		}

		// Remove image caption if its empty.
		if ( viewCaptionElement.childCount === 0 ) {
			const mapper = this.editor.editing.mapper;
			viewWriter.remove( ViewRange.createOn( viewCaptionElement ) );
			mapper.unbindViewElement( viewCaptionElement );
		}
	}

	/**
	 * Checks if selected image needs a new caption element inside.
	 *
	 * @private
	 */
	_addCaption() {
		const editing = this.editor.editing;
		const selection = editing.view.selection;
		const imageFigure = selection.getSelectedElement();
		const mapper = editing.mapper;
		const editableCreator = captionElementCreator( editing.view );

		if ( imageFigure && isImageWidget( imageFigure ) ) {
			const modelImage = mapper.toModelElement( imageFigure );
			const modelCaption = getCaptionFromImage( modelImage );
			let viewCaption =  mapper.toViewElement( modelCaption );

			if ( !viewCaption ) {
				viewCaption = editableCreator();

				const viewPosition = ViewPosition.createAt( imageFigure, 'end' );
				mapper.bindElements( modelCaption, viewCaption );
				viewWriter.insert( viewPosition, viewCaption );
			}

			this._lastSelectedEditable = viewCaption;
		}
	}
}

// Checks whether data inserted to the model document have image element that has no caption element inside it.
// If there is none - adds it to the image element.
//
// @private
function insertMissingCaptionElement( evt, changeType, data, batch ) {
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
// @return {Function}
function captionModelToView( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		const captionElement = data.item;

		if ( isImage( captionElement.parent ) && ( captionElement.childCount > 0 ) ) {
			if ( !consumable.consume( data.item, 'insert' ) ) {
				return;
			}

			const imageFigure = conversionApi.mapper.toViewElement( data.range.start.parent );
			const viewElement = ( elementCreator instanceof ViewElement ) ?
				elementCreator.clone( true ) :
				elementCreator( data, consumable, conversionApi );

			const viewPosition = ViewPosition.createAt( imageFigure, 'end' );
			conversionApi.mapper.bindElements( data.item, viewElement );
			viewWriter.insert( viewPosition, viewElement );
		}
	};
}
