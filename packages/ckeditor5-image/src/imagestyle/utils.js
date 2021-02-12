/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/utils
 */

import { logWarning } from 'ckeditor5/src/utils';
import { icons } from 'ckeditor5/src/core';

export default class ImageStyleUtils {
	constructor( loadedPlugins, configuredStyles ) {
		if ( ImageStyleUtils._instance ) {
			return ImageStyleUtils._instance;
		}

		ImageStyleUtils._instance = this;

		this.loadedPlugins = {
			'imageBlock': loadedPlugins.has( 'ImageBlock' ),
			'imageInline': loadedPlugins.has( 'ImageInline' )
		};

		this.configuredStyles = configuredStyles;

		this.normalizedStyles = null;
		this.normalizedGroups = null;

		/**
		 * Default image styles provided by the plugin that can be referred in the
		 * {@link module:image/image~ImageConfig#styles} configuration.
		 *
		 * Among them, 2 default semantic content styles are available:
		 *
		 * * `full` is a full–width image without any CSS class,
		 * * `side` is a side image styled with the `image-style-side` CSS class.
		 *
		 * There are also 3 styles focused on formatting:
		 *
		 * * `alignLeft` aligns the image to the left using the `image-style-align-left` class,
		 * * `alignCenter` centers the image using the `image-style-align-center` class,
		 * * `alignRight` aligns the image to the right using the `image-style-align-right` class,
		 *
		 * @member {Object.<String,Object>}
		 */
		this.defaultArrangements = {
			alignInline: {
				name: 'alignInline',
				title: 'Image in text line',
				icon: icons.objectInline,
				modelElement: 'imageInline',
				isDefault: true
			},

			// This style represents an image aligned to the left.
			alignLeft: {
				name: 'alignLeft',
				title: 'Left aligned image',
				icon: icons.objectInlineLeft,
				modelElement: false,
				className: 'image-style-align-left'
			},

			// This style represents an image aligned to the right.
			alignRight: {
				name: 'alignRight',
				title: 'Right aligned image',
				icon: icons.objectInlineRight,
				modelElement: false,
				className: 'image-style-align-right'
			},

			alignBlockLeft: {
				name: 'alignBlockLeft',
				title: 'Left aligned image',
				icon: icons.objectLeft,
				modelElement: 'imageBlock',
				className: 'image-style-block-align-left'
			},

			// This style represents a centered image.
			alignCenter: {
				name: 'alignCenter',
				title: 'Centered image',
				icon: icons.objectCenter,
				modelElement: 'imageBlock',
				className: 'image-style-align-center'
			},

			alignBlockRight: {
				name: 'alignBlockRight',
				title: 'Right aligned image',
				icon: icons.objectRight,
				modelElement: 'imageBlock',
				className: 'image-style-block-align-right'
			},

			// This option is equal to the situation when no style is applied.
			full: {
				name: 'full',
				title: 'Full size image',
				icon: icons.objectFullWidth,
				modelElement: 'imageBlock',
				isDefault: true
			},

			// This represents a side image.
			side: {
				name: 'side',
				title: 'Side image',
				icon: icons.objectRight,
				modelElement: 'imageBlock',
				className: 'image-style-side'
			}
		};

		this.defaultGroups = {
			inParagraph: {
				name: 'inParagraph',
				title: 'Image in paragraph',
				defaultItem: 'alignLeft',
				items: [ 'alignLeft', 'alignRight' ]
			},

			betweenParagraphs: {
				name: 'betweenParagraphs',
				title: 'Image between paragraphs',
				defaultItem: 'alignCenter',
				items: [ 'alignBlockLeft', 'alignCenter', 'alignBlockRight' ]
			}
		};

		/**
		 * Default image style icons provided by the plugin that can be referred in the
		 * {@link module:image/image~ImageConfig#styles} configuration.
		 *
		 * There are 4 icons available: `'full'`, `'left'`, `'center'` and `'right'`.
		 *
		 * @member {Object.<String, String>}
		 */
		this.defaultIcons = {
			full: icons.objectFullWidth,
			left: icons.objectLeft,
			right: icons.objectRight,
			center: icons.objectCenter,
			inLineLeft: icons.objectInlineLeft,
			inLineRight: icons.objectInlineRight,
			inLine: icons.objectInline
		};
	}

	/**
	 * Returns a {@link module:image/image~ImageConfig#styles} array with items normalized in the
	 * {@link module:image/imagestyle/imagestyleediting~ImageStyleFormat} format and a complete `icon` markup for each style.
	 *
	 * @returns {Array.<module:image/imagestyle/imagestyleediting~ImageStyleFormat>}
	 */
	normalizeImageStyles( type ) {
		const configuredStyles = this.configuredStyles[ type ] || [];

		if ( type === 'arrangements' ) {
			if ( !this.normalizedArrangements ) {
				this.normalizedArrangements = configuredStyles
					.map( arrangement => this._normalizeArrangement( arrangement ) )
					.filter( arrangement => this._validateArrangement( arrangement ) );
			}
			return this.normalizedArrangements;
		}

		if ( type === 'groups' ) {
			if ( !this.normalizedGroups ) {
				this.normalizedGroups = configuredStyles
					.map( group => this._normalizeGroup( group ) )
					.map( group => {
						group.items = group.items
							.filter( item => this._validateGroupItem( item ) );

						return group;
					} )
					.filter( group => group.items.length > 0 );
			}
			return this.normalizedGroups;
		}
	}

	// Normalizes an image style provided in the {@link module:image/image~ImageConfig#styles}
	// and returns it in a {@link module:image/imagestyle/imagestyleediting~ImageStyleFormat}.
	//
	// @param {Object} style
	// @returns {@link module:image/imagestyle/imagestyleediting~ImageStyleFormat}
	_normalizeArrangement( arrangement ) {
		const defaultArrangements = this.defaultArrangements;
		const isDefault = defaultArrangements[ arrangement ];

		const isOnlyName = typeof arrangement === 'string' && !isDefault;
		const isCallingDefault = typeof arrangement === 'string' && isDefault;
		const isExtendingDefault = defaultArrangements[ arrangement.name ];

		// Just the name of the style has been passed, but none of the defaults.
		// Warn because probably it's a mistake.
		if ( isOnlyName ) {
			warnUnavailableStyle( arrangement, 'group' );

			// Normalize the style anyway to prevent errors.
			const arrangementName = arrangement;
			arrangement = { name: arrangementName };
		}
		// Just the name of the style has been passed and it's one of the defaults, just use it.
		else if ( isCallingDefault ) {
			// Clone the style to avoid overriding defaults.
			const arrangementName = arrangement;
			arrangement = Object.assign( {}, defaultArrangements[ arrangementName ] );
		}
		// If an object style has been passed and if the name matches one of the defaults,
		// extend it with defaults – the user wants to customize a default style.
		// Note: Don't override the user–defined style object, clone it instead.
		else if ( isExtendingDefault ) {
			arrangement = extendStyle( defaultArrangements[ arrangement.name ], arrangement );
		}

		// If an icon is defined as a string and correspond with a name
		// in default icons, use the default icon provided by the plugin.
		if ( typeof arrangement.icon === 'string' && this.defaultIcons[ arrangement.icon ] ) {
			arrangement.icon = this.defaultIcons[ arrangement.icon ];
		}

		return arrangement;
	}

	_normalizeGroup( group ) {
		const defaultGroups = this.defaultGroups;
		const isDefault = defaultGroups[ group ];

		const isOnlyName = typeof group === 'string' && !isDefault;
		const isCallingDefault = typeof group === 'string' && isDefault;
		const isExtendingDefault = defaultGroups[ group.name ];

		if ( isOnlyName ) {
			warnUnavailableStyle( group, 'group' );

			// Normalize the style anyway to prevent errors.
			const groupName = group;
			group = { name: groupName };
		}
		else if ( isCallingDefault ) {
			// Clone the style to avoid overriding defaults.
			const groupName = group;
			group = Object.assign( {}, defaultGroups[ groupName ] );
		}
		else if ( isExtendingDefault ) {
			group = extendStyle( defaultGroups[ group.name ], group );
		}

		if ( typeof group.defaultIcon === 'string' && this.defaultIcons[ group.defaultIcon ] ) {
			group.defaultIcon = this.defaultIcons[ group.defaultIcon ];
		}

		return group;
	}

	_validateArrangement( arrangement ) {
		const config = typeof arrangement === 'string' ? this.getArrangementConfig( arrangement ) : arrangement;

		const modelElement = config.modelElement;

		if ( modelElement && !this.loadedPlugins[ modelElement ] ) {
			logWarning( 'image-style-unsupported', {
				missingPlugin: modelElement,
				unsupportedStyle: config.name
			} );
			// to jest case gdzie dostępne pluginy nie obsługują wybranych styli.
			return false;
		}
		else {
			return true;
		}
	}

	_validateGroupItem( item ) {
		const isItemDefined = this.getArrangementConfig( item );

		return !!isItemDefined;
	}

	getArrangementConfig( name ) {
		const arrangements = this.normalizedArrangements || this.normalizeImageStyles( 'arrangements' );

		return arrangements.find( arrangement => arrangement.name === name );
	}
}

function warnUnavailableStyle( name, type ) {
	/**
	 * There is no such image arrangement or group of given name.
	 *
	 * @error image-style-not-found
	 * @param {String} name Name of a missing style.
	 * @param {String} type Type of a missing style (an arrangement or a group).
	 */
	logWarning( 'image-style-not-found', { name, type } );
}

function extendStyle( source, style ) {
	const extendedStyle = Object.assign( {}, style );

	for ( const prop in source ) {
		if ( !Object.prototype.hasOwnProperty.call( style, prop ) ) {
			extendedStyle[ prop ] = source[ prop ];
		}
		// ASK: nie nadpisujemy tych wartości?
		// Nie chcemy ich nadpisywać jeśli ktoś na przykład chce tylko podmienić itemy?
	}

	return extendedStyle;
}
