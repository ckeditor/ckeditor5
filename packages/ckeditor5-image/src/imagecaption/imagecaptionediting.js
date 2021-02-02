/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptionediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { isImage } from '../image/utils';
import { captionElementCreator, getCaptionFromImage, matchImageCaption } from './utils';

/**
 * The image caption engine plugin.
 *
 * It registers proper converters. It takes care of adding a caption element if the image without it is inserted
 * to the model document.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageCaptionEditing';
	}

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
		 * The last selected caption editable.
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
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: matchImageCaption,
			model: 'caption'
		} );

		// Model to view converter for the data pipeline.
		const createCaptionForData = writer => writer.createContainerElement( 'figcaption' );
		data.downcastDispatcher.on( 'insert:caption', captionModelToView( createCaptionForData, false ) );

		// Model to view converter for the editing pipeline.
		const createCaptionForEditing = captionElementCreator( view, t( 'Enter image caption' ) );
		editing.downcastDispatcher.on( 'insert:caption', captionModelToView( createCaptionForEditing ) );

		// Always show caption in view when something is inserted in model.
		editing.downcastDispatcher.on(
			'insert',
			this._fixCaptionVisibility( data => data.item ),
			{ priority: 'high' }
		);

		// Hide caption when everything is removed from it.
		editing.downcastDispatcher.on( 'remove', this._fixCaptionVisibility( data => data.position.parent ), { priority: 'high' } );

		// Update caption visibility on view in post fixer.
		view.document.registerPostFixer( writer => this._updateCaptionVisibility( writer ) );
	}

	/**
	 * Updates the view before each rendering, making sure that empty captions (so unnecessary ones) are hidden
	 * and then visible when the image is selected.
	 *
	 * @private
	 * @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
	 * @returns {Boolean} Returns `true` when the view is updated.
	 */
	_updateCaptionVisibility( viewWriter ) {
		const mapper = this.editor.editing.mapper;
		const lastCaption = this._lastSelectedCaption;
		let viewCaption;

		// If whole image is selected.
		const modelSelection = this.editor.model.document.selection;
		const selectedElement = modelSelection.getSelectedElement();

		if ( selectedElement && selectedElement.is( 'element', 'image' ) ) {
			const modelCaption = getCaptionFromImage( selectedElement );
			viewCaption = mapper.toViewElement( modelCaption );
		}

		// If selection is placed inside caption.
		const position = modelSelection.getFirstPosition();
		const modelCaption = getParentCaption( position.parent );

		if ( modelCaption ) {
			viewCaption = mapper.toViewElement( modelCaption );
		}

		// Is currently any caption selected?
		if ( viewCaption && !this.editor.isReadOnly ) {
			// Was any caption selected before?
			if ( lastCaption ) {
				// Same caption as before?
				if ( lastCaption === viewCaption ) {
					return showCaption( viewCaption, viewWriter );
				} else {
					hideCaptionIfEmpty( lastCaption, viewWriter );
					this._lastSelectedCaption = viewCaption;

					return showCaption( viewCaption, viewWriter );
				}
			} else {
				this._lastSelectedCaption = viewCaption;
				return showCaption( viewCaption, viewWriter );
			}
		} else {
			// Was any caption selected before?
			if ( lastCaption ) {
				const viewModified = hideCaptionIfEmpty( lastCaption, viewWriter );
				this._lastSelectedCaption = null;

				return viewModified;
			} else {
				return false;
			}
		}
	}

	/**
	 * Returns a converter that fixes caption visibility during the model-to-view conversion.
	 * Checks if the changed node is placed inside the caption element and fixes its visibility in the view.
	 *
	 * @private
	 * @param {Function} nodeFinder
	 * @returns {Function}
	 */
	_fixCaptionVisibility( nodeFinder ) {
		return ( evt, data, conversionApi ) => {
			const node = nodeFinder( data );
			const modelCaption = getParentCaption( node );
			const mapper = this.editor.editing.mapper;
			const viewWriter = conversionApi.writer;

			if ( modelCaption ) {
				const viewCaption = mapper.toViewElement( modelCaption );

				if ( viewCaption ) {
					if ( modelCaption.childCount ) {
						viewWriter.removeClass( 'ck-hidden', viewCaption );
					} else {
						viewWriter.addClass( 'ck-hidden', viewCaption );
					}
				}
			}
		};
	}

	/**
	 * Checks whether the data inserted to the model document have an image element that has no caption element inside it.
	 * If there is none, it adds it to the image element.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer The writer to make changes with.
	 * @returns {Boolean} `true` if any change was applied, `false` otherwise.
	 */
	_insertMissingModelCaptionElement( writer ) {
		const model = this.editor.model;
		const changes = model.document.differ.getChanges();

		const imagesWithoutCaption = [];

		for ( const entry of changes ) {
			if ( entry.type == 'insert' && entry.name != '$text' ) {
				const item = entry.position.nodeAfter;

				if ( item.is( 'element', 'image' ) && !getCaptionFromImage( item ) ) {
					imagesWithoutCaption.push( item );
				}

				// Check elements with children for nested images.
				if ( !item.is( 'element', 'image' ) && item.childCount ) {
					for ( const nestedItem of model.createRangeIn( item ).getItems() ) {
						if ( nestedItem.is( 'element', 'image' ) && !getCaptionFromImage( nestedItem ) ) {
							imagesWithoutCaption.push( nestedItem );
						}
					}
				}
			}
		}

		for ( const image of imagesWithoutCaption ) {
			writer.appendElement( 'caption', image );
		}

		return !!imagesWithoutCaption.length;
	}
}

// Creates a converter that converts image caption model element to view element.
//
// @private
// @param {Function} elementCreator
// @param {Boolean} [hide=true] When set to `false` view element will not be inserted when it's empty.
// @returns {Function}
function captionModelToView( elementCreator, hide = true ) {
	return ( evt, data, conversionApi ) => {
		const captionElement = data.item;

		// Return if element shouldn't be present when empty.
		if ( !captionElement.childCount && !hide ) {
			return;
		}

		if ( isImage( captionElement.parent ) ) {
			if ( !conversionApi.consumable.consume( data.item, 'insert' ) ) {
				return;
			}

			const viewImage = conversionApi.mapper.toViewElement( data.range.start.parent );
			const viewCaption = elementCreator( conversionApi.writer );
			const viewWriter = conversionApi.writer;

			// Hide if empty.
			if ( !captionElement.childCount ) {
				viewWriter.addClass( 'ck-hidden', viewCaption );
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
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
function insertViewCaptionAndBind( viewCaption, modelCaption, viewImage, conversionApi ) {
	const viewPosition = conversionApi.writer.createPositionAt( viewImage, 'end' );

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

// Hides a given caption in the view if it is empty.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} caption
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @returns {Boolean} Returns `true` if the view was modified.
function hideCaptionIfEmpty( caption, viewWriter ) {
	if ( !caption.childCount && !caption.hasClass( 'ck-hidden' ) ) {
		viewWriter.addClass( 'ck-hidden', caption );
		return true;
	}

	return false;
}

// Shows the caption.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} caption
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @returns {Boolean} Returns `true` if the view was modified.
function showCaption( caption, viewWriter ) {
	if ( caption.hasClass( 'ck-hidden' ) ) {
		viewWriter.removeClass( 'ck-hidden', caption );
		return true;
	}

	return false;
}
