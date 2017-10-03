/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestyleengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageStyleCommand from './imagestylecommand';
import ImageEngine from '../image/imageengine';
import { viewToModelStyleAttribute, modelToViewStyleAttribute } from './converters';
import log from '@ckeditor/ckeditor5-utils/src/log';

import fullWidthIcon from '@ckeditor/ckeditor5-core/theme/icons/object-full-width.svg';
import leftIcon from '@ckeditor/ckeditor5-core/theme/icons/object-left.svg';
import centerIcon from '@ckeditor/ckeditor5-core/theme/icons/object-center.svg';
import rightIcon from '@ckeditor/ckeditor5-core/theme/icons/object-right.svg';

/**
 * The image style engine plugin. It sets the default configuration, creates converters and registers
 * {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand ImageStyleCommand}.
 *
 * @extends {module:core/plugin~Plugin}
 */
export default class ImageStyleEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'ImageStyleEngine';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const doc = editor.document;
		const schema = doc.schema;
		const data = editor.data;
		const editing = editor.editing;

		// Define default configuration.
		editor.config.define( 'image.styles', [ 'imageStyleFull', 'imageStyleSide' ] );

		// Get configuration.
		const styles = this.imageStyles;

		// Allow imageStyle attribute in image.
		// We could call it 'style' but https://github.com/ckeditor/ckeditor5-engine/issues/559.
		schema.allow( { name: 'image', attributes: 'imageStyle', inside: '$root' } );

		// Converters for imageStyle attribute from model to view.
		const modelToViewConverter = modelToViewStyleAttribute( styles );
		editing.modelToView.on( 'addAttribute:imageStyle:image', modelToViewConverter );
		data.modelToView.on( 'addAttribute:imageStyle:image', modelToViewConverter );
		editing.modelToView.on( 'changeAttribute:imageStyle:image', modelToViewConverter );
		data.modelToView.on( 'changeAttribute:imageStyle:image', modelToViewConverter );
		editing.modelToView.on( 'removeAttribute:imageStyle:image', modelToViewConverter );
		data.modelToView.on( 'removeAttribute:imageStyle:image', modelToViewConverter );

		// Converter for figure element from view to model.
		data.viewToModel.on( 'element:figure', viewToModelStyleAttribute( styles ), { priority: 'low' } );

		// Register separate command for each style.
		for ( const style of styles ) {
			editor.commands.add( style.name, new ImageStyleCommand( editor, style ) );
		}
	}

	/**
	 * Returns {@link module:image/image~ImageConfig#styles} array with items normalized in the
	 * {@link module:image/imagestyle/imagestyleengine~ImageStyleFormat} format, translated
	 * `title` and a complete `icon` markup for each style.
	 *
	 * @readonly
	 * @type {Array.<module:image/imagestyle/imagestyleengine~ImageStyleFormat>}
	 */
	get imageStyles() {
		// Return cached value if there is one to improve the performance.
		if ( this._cachedImageStyles ) {
			return this._cachedImageStyles;
		}

		const styles = [];
		const editor = this.editor;
		const titles = this.localizedDefaultStylesTitles;
		const configuredStyles = editor.config.get( 'image.styles' );

		for ( let style of configuredStyles ) {
			style = normalizeStyle( style );

			// Localize the titles of the styles, if a title corresponds with
			// a localized default provided by the plugin.
			if ( titles[ style.title ] ) {
				style.title = titles[ style.title ];
			}

			// Don't override the user-defined styles array, clone it instead.
			styles.push( style );
		}

		return ( this._cachedImageStyles = styles );
	}

	/**
	 * Returns the default localized style titles provided by the plugin e.g. ready to
	 * use in the {@link #imageStyles}.
	 *
	 * The following localized titles corresponding with
	 * {@link module:image/imagestyle/imagestyleengine~ImageStyleEngine.defaultStyles} are available:
	 *
	 * * `'Full size image'`,
	 * * `'Side image'`,
	 * * `'Left aligned image'`,
	 * * `'Centered image'`,
	 * * `'Right aligned image'`
	 *
	 * @readonly
	 * @type {Object.<String,String>}
	 */
	get localizedDefaultStylesTitles() {
		const t = this.editor.t;

		return {
			'Full size image': t( 'Full size image' ),
			'Side image': t( 'Side image' ),
			'Left aligned image': t( 'Left aligned image' ),
			'Centered image': t( 'Centered image' ),
			'Right aligned image': t( 'Right aligned image' ),
		};
	}
}

/**
 * Default image styles provided by the plugin, which can be referred in the
 * {@link module:image/image~ImageConfig#styles} config.
 *
 * Among them, 2 default semantic content styles are available:
 *
 * * `imageStyleFull` is a full–width image without any CSS class,
 * * `imageStyleSide` is a side image styled with the `image-style-side` CSS class
 *
 * There are also 3 styles focused on formatting:
 *
 * * `imageStyleAlignLeft` aligns the image to the left using the `image-style-align-left` class,
 * * `imageStyleAlignCenter` centers the image to the left using the `image-style-align-center` class,
 * * `imageStyleAlignRight` aligns the image to the right using the `image-style-align-right` class,
 *
 * @member {Object.<String,Object>}
 */
ImageStyleEngine.defaultStyles = {
	// This option is equal to situation when no style is applied.
	imageStyleFull: {
		name: 'imageStyleFull',
		title: 'Full size image',
		icon: fullWidthIcon,
		isDefault: true
	},

	// This represents side image.
	imageStyleSide: {
		name: 'imageStyleSide',
		title: 'Side image',
		icon: rightIcon,
		className: 'image-style-side'
	},

	// This style represents an imaged aligned to the left.
	imageStyleAlignLeft: {
		name: 'imageStyleAlignLeft',
		title: 'Left aligned image',
		icon: leftIcon,
		className: 'image-style-align-left'
	},

	// This style represents a centered imaged.
	imageStyleAlignCenter: {
		name: 'imageStyleAlignCenter',
		title: 'Centered image',
		icon: centerIcon,
		className: 'image-style-align-center'
	},

	// This style represents an imaged aligned to the right.
	imageStyleAlignRight: {
		name: 'imageStyleAlignRight',
		title: 'Right aligned image',
		icon: rightIcon,
		className: 'image-style-align-right'
	}
};

/**
 * Default image style icons provided by the plugin, which can be referred in the
 * {@link module:image/image~ImageConfig#styles} config.
 *
 * There are 4 icons available: `'full'`, `'left'`, `'center'` and `'right'`.
 *
 * @member {Object.<String, String>}
 */
ImageStyleEngine.defaultIcons = {
	full: fullWidthIcon,
	left: leftIcon,
	right: rightIcon,
	center: centerIcon,
};

// Normalizes an image style provided in the {@link module:image/image~ImageConfig#styles}
// and returns it in a {@link module:image/imagestyle/imagestyleengine~ImageStyleFormat}.
//
// @private
// @param {Object} style
// @returns {@link module:image/imagestyle/imagestyleengine~ImageStyleFormat}
function normalizeStyle( style ) {
	const defaultStyles = ImageStyleEngine.defaultStyles;
	const defaultIcons = ImageStyleEngine.defaultIcons;

	// Just the name of the style has been passed.
	if ( typeof style == 'string' ) {
		// If it's one of the defaults, just use it.
		// Clone the style to avoid overriding defaults.
		if ( defaultStyles[ style ] ) {
			style = Object.assign( {}, defaultStyles[ style ] );
		}
		// If it's just a name but none of the defaults, warn because probably it's a mistake.
		else {
			log.warn(
				'image-style-not-found: There is no such image style of given name.',
				{ name: style }
			);

			// Normalize the style anyway to prevent errors.
			style = {
				name: style
			};
		}
	}

	// If an object style has been passed and if the name matches one of the defaults,
	// extend it with defaults – the user wants to customize a default style.
	// Note: Don't override the user–defined style object, clone it instead.
	else if ( defaultStyles[ style.name ] ) {
		const defaultStyle = defaultStyles[ style.name ];
		const extendedStyle = Object.assign( {}, style );

		for ( const prop in defaultStyle ) {
			if ( !style.hasOwnProperty( prop ) ) {
				extendedStyle[ prop ] = defaultStyle[ prop ];
			}
		}

		style = extendedStyle;
	}

	// If an icon is defined as a string and correspond with a name
	// in default icons, use the default icon provided by the plugin.
	if ( typeof style.icon == 'string' && defaultIcons[ style.icon ] ) {
		style.icon = defaultIcons[ style.icon ];
	}

	return style;
}

/**
 * Image style format descriptor.
 *
 *		import fullWidthIcon from 'path/to/icon.svg`;
 *
 *		const imageStyleFormat = {
 *			name: 'fullSizeImage',
 *			icon: fullWidthIcon,
 *			title: 'Full size image',
 *			className: 'image-full-size'
 *		}
 *
 * @typedef {Object} module:image/imagestyle/imagestyleengine~ImageStyleFormat
 * @property {String} name The unique name of the style. It will be used to:
 * * register the {@link module:core/command~Command command} which will apply this style,
 * * store the style's button in the editor {@link module:ui/componentfactory~ComponentFactory},
 * * store the style in the `imageStyle` model attribute.
 * @property {Boolean} [isDefault] When set, the style will be used as the default one.
 * A default style does not apply any CSS class to the view element.
 * @property {String} icon One of the following to be used when creating the style's button:
 *  * An SVG icon source (as an XML string),
 *  * One of {@link module:image/imagestyle/imagestyleengine~ImageStyleEngine.defaultIcons} to use a default icon provided by the plugin.
 * @property {String} title The style's title.
 * @property {String} className The CSS class used to represent the style in view.
 */
