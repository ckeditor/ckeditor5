/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestyleediting
 */

import { Plugin } from 'ckeditor5/src/core';
import ImageStyleCommand from './imagestylecommand';
import { viewToModelStyleAttribute, modelToViewStyleAttribute } from './converters';
import utils from './utils';

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
	init() {
		const { normalizeStyles, getDefaultStylesConfiguration } = utils;
		const editor = this.editor;
		const isBlockPluginLoaded = editor.plugins.has( 'ImageBlockEditing' );
		const isInlinePluginLoaded = editor.plugins.has( 'ImageInlineEditing' );

		editor.config.define( 'image.styles', getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) );

		/**
		 * It contains lists of the normalized and validated style arrangements and style groups.
		 *
		 * * Each arrangement contains a complete icon markup.
		 * * The arrangements not supported by any of the loaded image editing plugins (
		 * {@link module:image/image/imageinlineediting~ImageInlineEditing `ImageInlineEditing`} or
		 * {@link module:image/image/imageblockediting~ImageBlockEditing `ImageBlockEditing`}) are filtered out.
		 * * The groups with no {@link module:image/imagestyle~ImageStyleGroupDefinition#items items} are filtered out.
		 * * All of the group items not defined in the arrangements are filtered out.
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

		// Register imageStyle command.
		editor.commands.add( 'imageStyle', new ImageStyleCommand( editor, this.normalizedStyles.arrangements ) );
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
		const arrangements = this.normalizedStyles.arrangements;

		const modelToViewConverter = modelToViewStyleAttribute( arrangements );
		const viewToModelConverter = viewToModelStyleAttribute( arrangements );

		editor.editing.downcastDispatcher.on( 'attribute:imageStyle', modelToViewConverter );
		editor.data.downcastDispatcher.on( 'attribute:imageStyle', modelToViewConverter );

		// Allow imageStyle attribute in image and imageInline.
		// We could call it 'style' but https://github.com/ckeditor/ckeditor5-engine/issues/559.
		if ( isBlockPluginLoaded ) {
			schema.extend( 'image', { allowAttributes: 'imageStyle' } );

			// Converter for figure element from view to model.
			editor.data.upcastDispatcher.on( 'element:figure', viewToModelConverter, { priority: 'low' } );
		}

		if ( isInlinePluginLoaded ) {
			schema.extend( 'imageInline', { allowAttributes: 'imageStyle' } );

			// Converter for the img element from view to model.
			editor.data.upcastDispatcher.on( 'element:img', viewToModelConverter, { priority: 'low' } );
		}
	}
}
