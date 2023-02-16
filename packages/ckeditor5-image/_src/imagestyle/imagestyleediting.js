/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestyleediting
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageStyleCommand from './imagestylecommand';
import ImageUtils from '../imageutils';
import utils from './utils';
import { viewToModelStyleAttribute, modelToViewStyleAttribute } from './converters';

/**
 * The image style engine plugin. It sets the default configuration, creates converters and registers
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand ImageStyleCommand}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ImageStyleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageStyleEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageUtils ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const { normalizeStyles, getDefaultStylesConfiguration } = utils;
		const editor = this.editor;
		const isBlockPluginLoaded = editor.plugins.has( 'ImageBlockEditing' );
		const isInlinePluginLoaded = editor.plugins.has( 'ImageInlineEditing' );

		editor.config.define( 'image.styles', getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) );

		/**
		 * It contains a list of the normalized and validated style options.
		 *
		 * * Each option contains a complete icon markup.
		 * * The style options not supported by any of the loaded image editing plugins (
		 * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} or
		 * {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`}) are filtered out.
		 *
		 * @protected
		 * @readonly
		 * @type {module:image/imagestyle~ImageStyleConfig}
		 */
		this.normalizedStyles = normalizeStyles( {
			configuredStyles: editor.config.get( 'image.styles' ),
			isBlockPluginLoaded,
			isInlinePluginLoaded
		} );

		this._setupConversion( isBlockPluginLoaded, isInlinePluginLoaded );
		this._setupPostFixer();

		// Register imageStyle command.
		editor.commands.add( 'imageStyle', new ImageStyleCommand( editor, this.normalizedStyles ) );
	}

	/**
	 * Sets the editor conversion taking the presence of
	 * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`}
	 * and {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`} plugins into consideration.
	 *
	 * @private
	 * @param {Boolean} isBlockPluginLoaded
	 * @param {Boolean} isInlinePluginLoaded
	 */
	_setupConversion( isBlockPluginLoaded, isInlinePluginLoaded ) {
		const editor = this.editor;
		const schema = editor.model.schema;

		const modelToViewConverter = modelToViewStyleAttribute( this.normalizedStyles );
		const viewToModelConverter = viewToModelStyleAttribute( this.normalizedStyles );

		editor.editing.downcastDispatcher.on( 'attribute:imageStyle', modelToViewConverter );
		editor.data.downcastDispatcher.on( 'attribute:imageStyle', modelToViewConverter );

		// Allow imageStyle attribute in image and imageInline.
		// We could call it 'style' but https://github.com/ckeditor/ckeditor5-engine/issues/559.
		if ( isBlockPluginLoaded ) {
			schema.extend( 'imageBlock', { allowAttributes: 'imageStyle' } );

			// Converter for figure element from view to model.
			editor.data.upcastDispatcher.on( 'element:figure', viewToModelConverter, { priority: 'low' } );
		}

		if ( isInlinePluginLoaded ) {
			schema.extend( 'imageInline', { allowAttributes: 'imageStyle' } );

			// Converter for the img element from view to model.
			editor.data.upcastDispatcher.on( 'element:img', viewToModelConverter, { priority: 'low' } );
		}
	}

	/**
	 * Registers a post-fixer that will make sure that the style attribute value is correct for a specific image type (block vs inline).
	 *
	 * @private
	 */
	_setupPostFixer() {
		const editor = this.editor;
		const document = editor.model.document;

		const imageUtils = editor.plugins.get( ImageUtils );
		const stylesMap = new Map( this.normalizedStyles.map( style => [ style.name, style ] ) );

		// Make sure that style attribute is valid for the image type.
		document.registerPostFixer( writer => {
			let changed = false;

			for ( const change of document.differ.getChanges() ) {
				if ( change.type == 'insert' || change.type == 'attribute' && change.attributeKey == 'imageStyle' ) {
					let element = change.type == 'insert' ? change.position.nodeAfter : change.range.start.nodeAfter;

					if ( element && element.is( 'element', 'paragraph' ) && element.childCount > 0 ) {
						element = element.getChild( 0 );
					}

					if ( !imageUtils.isImage( element ) ) {
						continue;
					}

					const imageStyle = element.getAttribute( 'imageStyle' );

					if ( !imageStyle ) {
						continue;
					}

					const imageStyleDefinition = stylesMap.get( imageStyle );

					if ( !imageStyleDefinition || !imageStyleDefinition.modelElements.includes( element.name ) ) {
						writer.removeAttribute( 'imageStyle', element );
						changed = true;
					}
				}
			}

			return changed;
		} );
	}
}
