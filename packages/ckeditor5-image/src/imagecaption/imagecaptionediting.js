/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptionediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { Element, enablePlaceholder } from 'ckeditor5/src/engine';
import { toWidgetEditable } from 'ckeditor5/src/widget';

import ToggleImageCaptionCommand from './toggleimagecaptioncommand';

import ImageUtils from '../imageutils';
import ImageCaptionUtils from './imagecaptionutils';

/**
 * The image caption engine plugin. It is responsible for:
 *
 * * registering converters for the caption element,
 * * registering converters for the caption model attribute,
 * * registering the {@link module:image/imagecaption/toggleimagecaptioncommand~ToggleImageCaptionCommand `toggleImageCaption`} command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageCaptionEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageUtils, ImageCaptionUtils ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageCaptionEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * A map that keeps saved JSONified image captions and image model elements they are
		 * associated with.
		 *
		 * To learn more about this system, see {@link #_saveCaption}.
		 *
		 * @member {WeakMap.<module:engine/model/element~Element,Object>}
		 */
		this._savedCaptionsMap = new WeakMap();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		// Schema configuration.
		if ( !schema.isRegistered( 'caption' ) ) {
			schema.register( 'caption', {
				allowIn: 'imageBlock',
				allowContentOf: '$block',
				isLimit: true
			} );
		} else {
			schema.extend( 'caption', {
				allowIn: 'imageBlock'
			} );
		}

		editor.commands.add( 'toggleImageCaption', new ToggleImageCaptionCommand( this.editor ) );

		this._setupConversion();
		this._setupImageTypeCommandsIntegration();
		this._registerCaptionReconversion();
	}

	/**
	 * Configures conversion pipelines to support upcasting and downcasting
	 * image captions.
	 *
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const view = editor.editing.view;
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		const imageCaptionUtils = editor.plugins.get( 'ImageCaptionUtils' );
		const t = editor.t;

		// View -> model converter for the data pipeline.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: element => imageCaptionUtils.matchImageCaptionViewElement( element ),
			model: 'caption'
		} );

		// Model -> view converter for the data pipeline.
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !imageUtils.isBlockImage( modelElement.parent ) ) {
					return null;
				}

				return writer.createContainerElement( 'figcaption' );
			}
		} );

		// Model -> view converter for the editing pipeline.
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !imageUtils.isBlockImage( modelElement.parent ) ) {
					return null;
				}

				const figcaptionElement = writer.createEditableElement( 'figcaption' );
				writer.setCustomProperty( 'imageCaption', true, figcaptionElement );

				enablePlaceholder( {
					view,
					element: figcaptionElement,
					text: t( 'Enter image caption' ),
					keepOnFocus: true
				} );

				const imageAlt = modelElement.parent.getAttribute( 'alt' );
				const label = imageAlt ? t( 'Caption for image: %0', [ imageAlt ] ) : t( 'Caption for the image' );

				return toWidgetEditable( figcaptionElement, writer, { label } );
			}
		} );
	}

	/**
	 * Integrates with {@link module:image/image/imagetypecommand~ImageTypeCommand image type commands}
	 * to make sure the caption is preserved when the type of an image changes so it can be restored
	 * in the future if the user decides they want their caption back.
	 *
	 * @private
	 */
	_setupImageTypeCommandsIntegration() {
		const editor = this.editor;
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		const imageCaptionUtils = editor.plugins.get( 'ImageCaptionUtils' );
		const imageTypeInlineCommand = editor.commands.get( 'imageTypeInline' );
		const imageTypeBlockCommand = editor.commands.get( 'imageTypeBlock' );

		const handleImageTypeChange = evt => {
			// The image type command execution can be unsuccessful.
			if ( !evt.return ) {
				return;
			}

			const { oldElement, newElement } = evt.return;

			/* istanbul ignore if: paranoid check */
			if ( !oldElement ) {
				return;
			}

			if ( imageUtils.isBlockImage( oldElement ) ) {
				const oldCaptionElement = imageCaptionUtils.getCaptionFromImageModelElement( oldElement );

				// If the old element was a captioned block image (the caption was visible),
				// simply save it so it can be restored.
				if ( oldCaptionElement ) {
					this._saveCaption( newElement, oldCaptionElement );

					return;
				}
			}

			const savedOldElementCaption = this._getSavedCaption( oldElement );

			// If either:
			//
			// * the block image didn't have a visible caption,
			// * the block image caption was hidden (and already saved),
			// * the inline image was passed
			//
			// just try to "pass" the saved caption from the old image to the new image
			// so it can be retrieved in the future if the user wants it back.
			if ( savedOldElementCaption ) {
				// Note: Since we're writing to a WeakMap, we don't bother with removing the
				// [ oldElement, savedOldElementCaption ] pair from it.
				this._saveCaption( newElement, savedOldElementCaption );
			}
		};

		// Presence of the commands depends on the Image(Inline|Block)Editing plugins loaded in the editor.
		if ( imageTypeInlineCommand ) {
			this.listenTo( imageTypeInlineCommand, 'execute', handleImageTypeChange, { priority: 'low' } );
		}

		if ( imageTypeBlockCommand ) {
			this.listenTo( imageTypeBlockCommand, 'execute', handleImageTypeChange, { priority: 'low' } );
		}
	}

	/**
	 * Returns the saved {@link module:engine/model/element~Element#toJSON JSONified} caption
	 * of an image model element.
	 *
	 * See {@link #_saveCaption}.
	 *
	 * @protected
	 * @param {module:engine/model/element~Element} imageModelElement The model element the
	 * caption should be returned for.
	 * @returns {module:engine/model/element~Element|null} The model caption element or `null` if there is none.
	 */
	_getSavedCaption( imageModelElement ) {
		const jsonObject = this._savedCaptionsMap.get( imageModelElement );

		return jsonObject ? Element.fromJSON( jsonObject ) : null;
	}

	/**
	 * Saves a {@link module:engine/model/element~Element#toJSON JSONified} caption for
	 * an image element to allow restoring it in the future.
	 *
	 * A caption is saved every time it gets hidden and/or the type of an image changes. The
	 * user should be able to restore it on demand.
	 *
	 * **Note**: The caption cannot be stored in the image model element attribute because,
	 * for instance, when the model state propagates to collaborators, the attribute would get
	 * lost (mainly because it does not convert to anything when the caption is hidden) and
	 * the states of collaborators' models would de-synchronize causing numerous issues.
	 *
	 * See {@link #_getSavedCaption}.
	 *
	 * @protected
	 * @param {module:engine/model/element~Element} imageModelElement The model element the
	 * caption is saved for.
	 * @param {module:engine/model/element~Element} caption The caption model element to be saved.
	 */
	_saveCaption( imageModelElement, caption ) {
		this._savedCaptionsMap.set( imageModelElement, caption.toJSON() );
	}

	/**
	 * Reconverts image caption when image alt attribute changes.
	 * The change of alt attribute is reflected in caption's aria-label attribute.
	 *
	 * @private
	 */
	_registerCaptionReconversion() {
		const editor = this.editor;
		const model = editor.model;
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		const imageCaptionUtils = editor.plugins.get( 'ImageCaptionUtils' );

		model.document.on( 'change:data', () => {
			const changes = model.document.differ.getChanges();

			for ( const change of changes ) {
				if ( change.attributeKey !== 'alt' ) {
					continue;
				}

				const image = change.range.start.nodeAfter;

				if ( imageUtils.isBlockImage( image ) ) {
					const caption = imageCaptionUtils.getCaptionFromImageModelElement( image );

					if ( !caption ) {
						return;
					}

					editor.editing.reconvertItem( caption );
				}
			}
		} );
	}
}
