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
import { normalizeStyles, getDefaultStylesConfiguration } from './utils';

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
		const editor = this.editor;
		const isBlockPluginLoaded = editor.plugins.has( 'ImageBlockEditing' );
		const isInlinePluginLoaded = editor.plugins.has( 'ImageInlineEditing' );

		editor.config.define( 'image.styles', getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) );

		/**
		 * TODO docs
		 *
		 * Clear the arrangements and groups from the unsupported and undefined items.
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
	 * TODO
	 *
	 * @param {*} isBlockPluginLoaded
	 * @param {*} isInlinePluginLoaded
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

/**
 * The image style format descriptor.
 *
 *		import fullSizeIcon from 'path/to/icon.svg';
 *
 *		const imageStyleFormat = {
 *			name: 'fullSize',
 *			icon: fullSizeIcon,
 *			title: 'Full size image',
 *			className: 'image-full-size'
 *		}
 *
 * @typedef {Object} module:image/imagestyle/imagestyleediting~ImageStyleFormat
 *
 * @property {String} name The unique name of the style. It will be used to:
 *
 * * Store the chosen style in the model by setting the `imageStyle` attribute of the `<image>` element.
 * * As a value of the {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute `imageStyle` command},
 * * when registering a button for each of the styles (`'imageStyle:{name}'`) in the
 * {@link module:ui/componentfactory~ComponentFactory UI components factory} (this functionality is provided by the
 * {@link module:image/imagestyle/imagestyleui~ImageStyleUI} plugin).
 *
 * @property {Boolean} [isDefault] When set, the style will be used as the default one.
 * A default style does not apply any CSS class to the view element.
 *
 * @property {String} icon One of the following to be used when creating the style's button:
 *
 * * An SVG icon source (as an XML string).
 * * One of {@link module:image/imagestyle/utils~defaultIcons} to use a default icon provided by the plugin.
 *
 * @property {String} title The style's title.
 *
 * @property {String} className The CSS class used to represent the style in the view.
 */
