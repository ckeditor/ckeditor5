/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imageinlineediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard';
import { UpcastWriter } from 'ckeditor5/src/engine';

import {
	downcastImageAttribute,
	downcastSrcsetAttribute
} from './converters';

import ImageEditing from './imageediting';
import ImageTypeCommand from './imagetypecommand';
import ImageUtils from '../imageutils';
import {
	getImgViewElementMatcher,
	createInlineImageViewElement,
	determineImageTypeForInsertionAtSelection
} from '../image/utils';

/**
 * The image inline plugin.
 *
 * It registers:
 *
 * * `<imageInline>` as an inline element in the document schema, and allows `alt`, `src` and `srcset` attributes.
 * * converters for editing and data pipelines.
 * * {@link module:image/image/imagetypecommand~ImageTypeCommand `'imageTypeInline'`} command that converts block images into
 * inline images.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageInlineEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEditing, ImageUtils, ClipboardPipeline ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageInlineEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		// Converters 'alt' and 'srcset' are added in 'ImageEditing' plugin.
		schema.register( 'imageInline', {
			inheritAllFrom: '$inlineObject',
			allowAttributes: [ 'alt', 'src', 'srcset' ]
		} );

		// Disallow inline images in captions (for now). This is the best spot to do that because
		// independent packages can introduce captions (ImageCaption, TableCaption, etc.) so better this
		// be future-proof.
		schema.addChildCheck( ( context, childDefinition ) => {
			if ( context.endsWith( 'caption' ) && childDefinition.name === 'imageInline' ) {
				return false;
			}
		} );

		this._setupConversion();

		if ( editor.plugins.has( 'ImageBlockEditing' ) ) {
			editor.commands.add( 'imageTypeInline', new ImageTypeCommand( this.editor, 'imageInline' ) );

			this._setupClipboardIntegration();
		}
	}

	/**
	 * Configures conversion pipelines to support upcasting and downcasting
	 * inline images (inline image widgets) and their attributes.
	 *
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const t = editor.t;
		const conversion = editor.conversion;
		const imageUtils = editor.plugins.get( 'ImageUtils' );

		conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: 'imageInline',
				view: ( modelElement, { writer } ) => writer.createEmptyElement( 'img' )
			} );

		conversion.for( 'editingDowncast' )
			.elementToStructure( {
				model: 'imageInline',
				view: ( modelElement, { writer } ) => imageUtils.toImageWidget(
					createInlineImageViewElement( writer ), writer, t( 'image widget' )
				)
			} );

		conversion.for( 'downcast' )
			.add( downcastImageAttribute( imageUtils, 'imageInline', 'src' ) )
			.add( downcastImageAttribute( imageUtils, 'imageInline', 'alt' ) )
			.add( downcastSrcsetAttribute( imageUtils, 'imageInline' ) );

		// More image related upcasts are in 'ImageEditing' plugin.
		conversion.for( 'upcast' )
			.elementToElement( {
				view: getImgViewElementMatcher( editor, 'imageInline' ),
				model: ( viewImage, { writer } ) => writer.createElement(
					'imageInline',
					viewImage.hasAttribute( 'src' ) ? { src: viewImage.getAttribute( 'src' ) } : null
				)
			} );
	}

	/**
	 * Integrates the plugin with the clipboard pipeline.
	 *
	 * Idea is that the feature should recognize the user's intent when an **block** image is
	 * pasted or dropped. If such an image is pasted/dropped into a non-empty block
	 * (e.g. a paragraph with some text) it gets converted into an inline image on the fly.
	 *
	 * We assume this is the user's intent if they decided to put their image there.
	 *
	 * **Note**: If a block image has a caption, it will not be converted to an inline image
	 * to avoid the confusion. Captions are added on purpose and they should never be lost
	 * in the clipboard pipeline.
	 *
	 * See the `ImageBlockEditing` for the similar integration that works in the opposite direction.
	 *
	 * @private
	 */
	_setupClipboardIntegration() {
		const editor = this.editor;
		const model = editor.model;
		const editingView = editor.editing.view;
		const imageUtils = editor.plugins.get( 'ImageUtils' );

		this.listenTo( editor.plugins.get( 'ClipboardPipeline' ), 'inputTransformation', ( evt, data ) => {
			const docFragmentChildren = Array.from( data.content.getChildren() );
			let modelRange;

			// Make sure only <figure class="image"></figure> elements are dropped or pasted. Otherwise, if there some other HTML
			// mixed up, this should be handled as a regular paste.
			if ( !docFragmentChildren.every( imageUtils.isBlockImageView ) ) {
				return;
			}

			// When drag and dropping, data.targetRanges specifies where to drop because
			// this is usually a different place than the current model selection (the user
			// uses a drop marker to specify the drop location).
			if ( data.targetRanges ) {
				modelRange = editor.editing.mapper.toModelRange( data.targetRanges[ 0 ] );
			}
			// Pasting, however, always occurs at the current model selection.
			else {
				modelRange = model.document.selection.getFirstRange();
			}

			const selection = model.createSelection( modelRange );

			// Convert block images into inline images only when pasting or dropping into non-empty blocks
			// and when the block is not an object (e.g. pasting to replace another widget).
			if ( determineImageTypeForInsertionAtSelection( model.schema, selection ) === 'imageInline' ) {
				const writer = new UpcastWriter( editingView.document );

				// Unwrap <figure class="image"><img .../></figure> -> <img ... />
				// but <figure class="image"><img .../><figcaption>...</figcaption></figure> -> stays the same
				const inlineViewImages = docFragmentChildren.map( blockViewImage => {
					// If there's just one child, it can be either <img /> or <a><img></a>.
					// If there are other children than <img>, this means that the block image
					// has a caption or some other features and this kind of image should be
					// pasted/dropped without modifications.
					if ( blockViewImage.childCount === 1 ) {
						// Pass the attributes which are present only in the <figure> to the <img>
						// (e.g. the style="width:10%" attribute applied by the ImageResize plugin).
						Array.from( blockViewImage.getAttributes() )
							.forEach( attribute => writer.setAttribute(
								...attribute,
								imageUtils.findViewImgElement( blockViewImage )
							) );

						return blockViewImage.getChild( 0 );
					} else {
						return blockViewImage;
					}
				} );

				data.content = writer.createDocumentFragment( inlineViewImages );
			}
		} );
	}
}
