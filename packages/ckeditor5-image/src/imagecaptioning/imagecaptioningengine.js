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
import ViewEditableElement from '@ckeditor/ckeditor5-engine/src/view/editableelement';
import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';
import ViewElement from '@ckeditor/ckeditor5-engine/src/view/element';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import ViewRange from '@ckeditor/ckeditor5-engine/src/view/range';
import viewWriter from '@ckeditor/ckeditor5-engine/src/view/writer';
import ModelPosition from '@ckeditor/ckeditor5-engine/src/model/position';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import ViewMatcher from '@ckeditor/ckeditor5-engine/src/view/matcher';
import { isImage, isImageWidget } from '../utils';

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
		const editableCreator = editingViewEditableCreator( viewDocument );
		editing.modelToView.on(
			'insert:caption',
			captionModelToView( editableCreator )
		);

		// Adding / removing caption element when there is no text in the model.
		const selection = viewDocument.selection;

		this.lastCaptionAdded = undefined;

		// Update view before each rendering.
		this.listenTo( viewDocument, 'render', () => {
			const imageFigure = selection.getSelectedElement();
			const mapper = editing.mapper;

			this._removeEmptyCaption();

			// Clicking on image figure without figcaption.
			if ( imageFigure && isImageWidget( imageFigure ) ) {
				const modelImage = mapper.toModelElement( imageFigure );
				const modelCaption = getCaption( modelImage );
				let viewCaption =  mapper.toViewElement( modelCaption );

				if ( !viewCaption ) {
					// TODO: this is same code as in insertElementAtEnd - refactor.
					const viewPosition = ViewPosition.createAt( imageFigure, 'end' );
					viewCaption = editableCreator();

					mapper.bindElements( modelCaption, viewCaption );
					viewWriter.insert( viewPosition, viewCaption );
				}

				this.lastCaptionAdded = viewCaption;

				return;
			}

			// Inside figcaption.
			const editableElement = selection.editableElement;

			if ( editableElement && isCaptionViewElement( selection.editableElement ) ) {
				this.lastCaptionAdded = selection.editableElement;

				return;
			}
		}, { priority: 'high' } );
	}

	_removeEmptyCaption() {
		const viewSelection = this.editor.editing.view.selection;
		const viewCaption = this.lastCaptionAdded;

		// No caption to hide.
		if ( !viewCaption ) {
			return;
		}

		// If selection is placed inside caption - do not remove it.
		if ( viewSelection.editableElement === viewCaption ) {
			return;
		}

		// Do not remove caption if selection is placed on image that contains that caption.
		const selectedElement = viewSelection.getSelectedElement();

		if ( selectedElement && isImageWidget( selectedElement ) ) {
			const viewImage = viewCaption.findAncestor( element => element == selectedElement );

			if ( viewImage ) {
				return;
			}
		}

		// Remove image caption if its empty.
		if ( viewCaption.childCount === 0 ) {
			const mapper = this.editor.editing.mapper;
			viewWriter.remove( ViewRange.createOn( viewCaption ) );
			mapper.unbindViewElement( viewCaption );
		}
	}
}

const captionSymbol = Symbol( 'imageCaption' );

function isCaptionViewElement( viewElement ) {
	return !!viewElement.getCustomProperty( captionSymbol );
}

function editingViewEditableCreator( viewDocument ) {
	return () => {
		const editable = new ViewEditableElement( 'figcaption', { contenteditable: true } ) ;
		editable.document = viewDocument;
		editable.setCustomProperty( captionSymbol, true );

		editable.on( 'change:isFocused', ( evt, property, is ) => {
			if ( is ) {
				editable.addClass( 'focused' );
			} else {
				editable.removeClass( 'focused' );
			}
		} );

		return editable;
	};
}

function captionModelToView( element ) {
	const insertConverter = insertElementAtEnd( element );

	return ( evt, data, consumable, conversionApi ) => {
		const captionElement = data.item;

		if ( isImage( captionElement.parent ) && ( captionElement.childCount > 0 ) ) {
			insertConverter( evt, data, consumable, conversionApi );
		}
	};
}

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

		if ( value.type == 'elementStart' && isImage( item ) && !getCaption( item ) ) {
			// Using batch of insertion.
			batch.document.enqueueChanges( () => {
				batch.insert( ModelPosition.createAt( item, 'end' ), new ModelElement( 'caption' ) );
			} );
		}
	}
}

function getCaption( image ) {
	for ( let node of image.getChildren() ) {
		if ( node instanceof ModelElement && node.name == 'caption' ) {
			return node;
		}
	}

	return null;
}

function insertElementAtEnd( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const imageFigure = conversionApi.mapper.toViewElement( data.range.start.parent );
		const viewPosition = ViewPosition.createAt( imageFigure, 'end' );

		const viewElement = ( elementCreator instanceof ViewElement ) ?
			elementCreator.clone( true ) :
			elementCreator( data, consumable, conversionApi );

		conversionApi.mapper.bindElements( data.item, viewElement );
		viewWriter.insert( viewPosition, viewElement );
	};
}
