/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaptioning/imagecaptioningengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ModelTreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';
import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import viewWriter from '@ckeditor/ckeditor5-engine/src/view/writer';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import ViewMatcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import { isImage, isImageWidget } from '../utils';
import { captionModelToView } from './converters';
import { captionEditableCreator, isCaptionEditable, getCaptionFromImage } from './utils';

export default class ImageCaptioningEngine extends Plugin {
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

		// Schema configuration.
		schema.registerItem( 'caption' );
		schema.allow( { name: '$inline', inside: 'caption' } );
		schema.allow( { name: 'caption', inside: 'image' } );

		// Add caption element to each image inserted without it.
		document.on( 'change', insertCaptionElement );

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
		const editableCreator = captionEditableCreator( viewDocument );
		editing.modelToView.on(
			'insert:caption',
			captionModelToView( editableCreator )
		);

		// Adding / removing caption element when there is no text in the model.
		const selection = viewDocument.selection;

		this.lastCaptionUsed = undefined;

		// Update view before each rendering.
		this.listenTo( viewDocument, 'render', () => {
			// Check if there is an empty caption view element to remove.
			this._removeEmptyCaption();

			// Check if image widget is selected and caption view element needs to be added.
			this._addCaption();

			// If selection is currently inside caption - store it to hide when empty.
			const editableElement = selection.editableElement;

			if ( editableElement && isCaptionEditable( selection.editableElement ) ) {
				this.lastCaptionUsed = selection.editableElement;
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
		const viewCaptionElement = this.lastCaptionUsed;

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
		const editableCreator = captionEditableCreator( editing.view );

		if ( imageFigure && isImageWidget( imageFigure ) ) {
			const modelImage = mapper.toModelElement( imageFigure );
			const modelCaption = getCaptionFromImage( modelImage );
			let viewCaption =  mapper.toViewElement( modelCaption );

			if ( !viewCaption ) {
				// TODO: this is same code as in insertElementAtEnd - refactor.
				const viewPosition = ViewPosition.createAt( imageFigure, 'end' );
				viewCaption = editableCreator();

				mapper.bindElements( modelCaption, viewCaption );
				viewWriter.insert( viewPosition, viewCaption );
			}

			this.lastCaptionUsed = viewCaption;
		}
	}
}

// Checks whether data inserted to the model document have image element that has no caption element inside it.
// If there is none - adds it to the image element.
//
// @private
function insertCaptionElement( evt, changeType, data, batch ) {
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
			// Using batch of insertion.
			batch.document.enqueueChanges( () => {
				batch.insert( ModelPosition.createAt( item, 'end' ), new ModelElement( 'caption' ) );
			} );
		}
	}
}
