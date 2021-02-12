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
import ImageStyleUtils from './utils';

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
		const schema = editor.model.schema;
		const data = editor.data;
		const editing = editor.editing;
		const loadedPlugins = editor.plugins;

		// Aet default configuration.
		this._defineDefaultUI();

		// Get configuration.
		const configuredStyles = editor.config.get( 'image.styles' );
		const styles = new ImageStyleUtils( loadedPlugins, configuredStyles || [] )
			.normalizeImageStyles( 'arrangements', true );

		// Allow imageStyle attribute in image and imageInline.
		// We could call it 'style' but https://github.com/ckeditor/ckeditor5-engine/issues/559.
		if ( loadedPlugins.has( 'ImageBlockEditing' ) ) {
			schema.extend( 'image', { allowAttributes: 'imageStyle' } );

			// Converter for figure element from view to model.
			data.upcastDispatcher.on( 'element:figure', viewToModelStyleAttribute( styles ), { priority: 'low' } );
		}

		if ( loadedPlugins.has( 'ImageInlineEditing' ) ) {
			schema.extend( 'imageInline', { allowAttributes: 'imageStyle' } );
			// ASK: Additional converter needed?
		}

		const modelToViewConverter = modelToViewStyleAttribute( styles );
		editing.downcastDispatcher.on( 'attribute:imageStyle', modelToViewConverter );
		data.downcastDispatcher.on( 'attribute:imageStyle', modelToViewConverter );

		// Register imageStyle command.
		editor.commands.add( 'imageStyle', new ImageStyleCommand( editor, styles ) );
	}

	_defineDefaultUI() {
		const config = this.editor.config;
		const loadedPlugins = this.editor.plugins;
		let styles;

		const blockPluginLoaded = loadedPlugins.has( 'ImageBlockEditing' );
		const inlinePluginLoaded = loadedPlugins.has( 'ImageInlineEditing' );

		if ( inlinePluginLoaded && blockPluginLoaded ) {
			styles = {
				arrangements: [
					'alignInline', 'alignLeft', 'alignRight',
					'alignCenter', 'alignBlockLeft', 'alignBlockRight'
				],
				groups: [ 'inParagraph', 'betweenParagraphs' ]
			};
		} else if ( blockPluginLoaded ) {
			styles = {
				arrangements: [ 'full', 'side' ]
			};
		} else if ( inlinePluginLoaded ) {
			styles = {
				arrangements: [ 'alignInline', 'alignLeft', 'alignRight' ]
			};
		}

		config.define( 'image.styles', styles );
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
