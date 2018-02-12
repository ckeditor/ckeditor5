/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagecaption/imagecaptionengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import { isImage } from '../image/utils';
import {
	captionElementCreator,
	getCaptionFromImage,
	matchImageCaption
} from './utils';

/**
 * The image caption engine plugin.
 *
 * It registers proper converters. It takes care of adding a caption element if the image without it is inserted
 * to the model document.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const view = editor.editing.view;
		const schema = editor.model.schema;
		const data = editor.data;
		const editing = editor.editing;
		const t = editor.t;

		/**
		 * Last selected caption editable.
		 * It is used for hiding the editable when it is empty and the image widget is no longer selected.
		 *
		 * @private
		 * @member {module:engine/view/editableelement~EditableElement} #_lastSelectedCaption
		 */

		// Schema configuration.
		schema.register( 'caption', {
			allowIn: 'image',
			allowContentOf: '$block',
			isLimit: true
		} );

		// Add caption element to each image inserted without it.
		editor.model.document.registerPostFixer( writer => this._insertMissingModelCaptionElement( writer ) );

		// View to model converter for the data pipeline.
		editor.conversion.for( 'upcast' ).add( upcastElementToElement( {
			view: matchImageCaption,
			model: 'caption'
		} ) );

		// Model to view converter for the data pipeline.
		const createCaptionForData = writer => writer.createContainerElement( 'figcaption' );
		data.downcastDispatcher.on( 'insert:caption', captionModelToView( createCaptionForData, false ) );

		// Model to view converter for the editing pipeline.
		const createCaptionForEditing = captionElementCreator( view, t( 'Enter image caption' ) );
		editing.downcastDispatcher.on( 'insert:caption', captionModelToView( createCaptionForEditing ) );

		// Always show caption in view when something is inserted in model.
		editing.downcastDispatcher.on( 'insert', ( evt, data ) => this._fixCaptionVisibility( data.item ), { priority: 'high' } );

		// Hide caption when everything is removed from it.
		editing.downcastDispatcher.on(
			'remove',
			( evt, data ) => this._fixCaptionVisibility( data.position.parent ),
			{ priority: 'high' }
		);

		// Update view before each rendering.
		this.listenTo( view.renderer, 'render', () => this._updateCaptionVisibility(), { priority: 'high' } );
	}

	/**
	 * Updates the view before each rendering, making sure that empty captions (so unnecessary ones) are hidden
	 * and then visible when the image is selected.
	 *
	 * @private
	 */
	_updateCaptionVisibility() {
		const mapper = this.editor.editing.mapper;
		let viewCaption;

		// Hide last selected caption if have no child elements.
		if ( this._lastSelectedCaption && !this._lastSelectedCaption.childCount ) {
			this._lastSelectedCaption.addClass( 'ck-hidden' );
		}

		// If whole image is selected.
		const modelSelection = this.editor.model.document.selection;
		const selectedElement = modelSelection.getSelectedElement();

		if ( selectedElement && selectedElement.is( 'image' ) ) {
			const modelCaption = getCaptionFromImage( selectedElement );
			viewCaption = mapper.toViewElement( modelCaption );
		}

		// If selection is placed inside caption.
		const position = modelSelection.getFirstPosition();
		const modelCaption = getParentCaption( position.parent );

		if ( modelCaption ) {
			viewCaption = mapper.toViewElement( modelCaption );
		}

		if ( viewCaption ) {
			viewCaption.removeClass( 'ck-hidden' );
			this._lastSelectedCaption = viewCaption;
		}
	}

	/**
	 * Fixes caption visibility during the model-to-view conversion.
	 * Checks if the changed node is placed inside the caption element and fixes its visibility in the view.
	 *
	 * @private
	 * @param {module:engine/model/node~Node} node
	 */
	_fixCaptionVisibility( node ) {
		const modelCaption = getParentCaption( node );
		const mapper = this.editor.editing.mapper;

		if ( modelCaption ) {
			const viewCaption = mapper.toViewElement( modelCaption );

			if ( viewCaption ) {
				if ( modelCaption.childCount ) {
					viewCaption.removeClass( 'ck-hidden' );
				} else {
					viewCaption.addClass( 'ck-hidden' );
				}
			}
		}
	}

	/**
	 * Checks whether data inserted to the model document have image element that has no caption element inside it.
	 * If there is none - adds it to the image element.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer Writer to make changes with.
	 * @returns {Boolean} `true` if any change has been applied, `false` otherwise.
	 */
	_insertMissingModelCaptionElement( writer ) {
		const model = this.editor.model;
		const changes = model.document.differ.getChanges();

		for ( const entry of changes ) {
			if ( entry.type == 'insert' && entry.name == 'image' ) {
				const item = entry.position.nodeAfter;

				if ( !getCaptionFromImage( item ) ) {
					writer.appendElement( 'caption', item );

					return true;
				}
			}
		}
	}
}

// Creates a converter that converts image caption model element to view element.
//
// @private
// @param {Function} elementCreator
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
			const viewCaption = elementCreator( conversionApi.writer );

			// Hide if empty.
			if ( !captionElement.childCount ) {
				viewCaption.addClass( 'ck-hidden' );
			}

			insertViewCaptionAndBind( viewCaption, data.item, viewImage, conversionApi );
		}
	};
}

// Inserts `viewCaption` at the end of `viewImage` and binds it to `modelCaption`.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} viewCaption
// @param {module:engine/model/element~Element} modelCaption
// @param {module:engine/view/containerelement~ContainerElement} viewImage
// @param {Object} conversionApi
function insertViewCaptionAndBind( viewCaption, modelCaption, viewImage, conversionApi ) {
	const viewPosition = ViewPosition.createAt( viewImage, 'end' );

	conversionApi.writer.insert( viewPosition, viewCaption );
	conversionApi.mapper.bindElements( modelCaption, viewCaption );
}

// Checks if the provided node or one of its ancestors is a caption element, and returns it.
//
// @private
// @param {module:engine/model/node~Node} node
// @returns {module:engine/model/element~Element|null}
function getParentCaption( node ) {
	const ancestors = node.getAncestors( { includeSelf: true } );
	const caption = ancestors.find( ancestor => ancestor.name == 'caption' );

	if ( caption && caption.parent && caption.parent.name == 'image' ) {
		return caption;
	}

	return null;
}
