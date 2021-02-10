/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/utils
 */

import { logWarning } from 'ckeditor5/src/utils';
import { icons } from 'ckeditor5/src/core';

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
const defaultStyles = {
	arrangements: {
		inline: {
			name: 'inline',
			title: 'Image in text line',
			icon: icons.inlineIcon,
			modelElement: 'imageInline',
			isDefault: true
		},

		left: {
			name: 'left',
			title: 'Left aligned image',
			icon: icons.inlineLeftIcon,
			modelElement: false,
			className: 'image-style-align-left'
		},

		right: {
			name: 'right',
			title: 'Right aligned image',
			icon: icons.inlineRightIcon,
			modelElement: false,
			className: 'image-style-align-right'
		},

		// This option is equal to the situation when no style is applied.
		blockFull: {
			name: 'blockFull',
			title: 'Full size image',
			icon: icons.fullWidthIcon,
			modelElement: 'image',
			isDefault: true
		},

		// This represents a side image.
		blockSide: {
			name: 'blockSide',
			title: 'Side image',
			icon: icons.rightIcon,
			modelElement: 'image',
			className: 'image-style-side'
		},

		// This style represents an image aligned to the left.
		blockLeft: {
			name: 'blockLeft',
			title: 'Left aligned image',
			icon: icons.leftIcon,
			modelElement: 'image',
			className: 'image-style-align-left'
		},

		// This style represents a centered image.
		blockCenter: {
			name: 'blockCenter',
			title: 'Centered image',
			icon: icons.centerIcon,
			modelElement: 'image',
			className: 'image-style-align-center'
		},

		// This style represents an image aligned to the right.
		blockRight: {
			name: 'blockRight',
			title: 'Right aligned image',
			icon: icons.rightIcon,
			modelElement: 'image',
			className: 'image-style-align-right'
		}
	},

	groups: {
		inParagraph: {
			name: 'inParagraph',
			title: 'Image in paragraph',
			defaultIcon: icons.inlineLeftIcon,
			items: [ 'left', 'right' ]
		},

		betweenParagraphs: {
			name: 'betweenParagraphs',
			title: 'Image between paragraphs',
			defaultIcon: icons.centerIcon,
			items: [ 'blockLeft', 'blockCenter', 'blockRight' ]
		}
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
const defaultIcons = {
	full: icons.fullWidthIcon,
	left: icons.leftIcon,
	right: icons.rightIcon,
	center: icons.centerIcon,
	inLineLeft: icons.inlineLeftIcon,
	inLineRight: icons.inlineRightIcon,
	inLine: icons.inlineIcon
};

/**
 * Returns a {@link module:image/image~ImageConfig#styles} array with items normalized in the
 * {@link module:image/imagestyle/imagestyleediting~ImageStyleFormat} format and a complete `icon` markup for each style.
 *
 * @returns {Array.<module:image/imagestyle/imagestyleediting~ImageStyleFormat>}
 */
export function normalizeImageStyles( configuredStyles, type ) {
	const configuredStylesType = configuredStyles[ type ] || [];

	if ( type === 'arrangements' ) {
		return configuredStylesType.map( _normalizeArrangement );
	} else if ( type === 'groups' ) {
		return configuredStylesType.map( _normalizeGroup );
	}
}

// Normalizes an image style provided in the {@link module:image/image~ImageConfig#styles}
// and returns it in a {@link module:image/imagestyle/imagestyleediting~ImageStyleFormat}.
//
// @param {Object} style
// @returns {@link module:image/imagestyle/imagestyleediting~ImageStyleFormat}
function _normalizeArrangement( style ) {
	const defaultArrangements = defaultStyles.arrangements;
	const isDefault = defaultArrangements[ style ];

	const isOnlyName = typeof style === 'string' && !isDefault;
	const isCallingDefault = typeof style === 'string' && isDefault;
	const isExtendingDefault = defaultArrangements[ style.name ];

	// Just the name of the style has been passed, but none of the defaults.
	// Warn because probably it's a mistake.
	if ( isOnlyName ) {
		/**
		 * There is no such image style of given name.
		 *
		 * @error image-style-not-found
		 * @param {String} name Name of a missing style name.
		 */
		logWarning( 'image-style-not-found', { name: style } );

		// Normalize the style anyway to prevent errors.
		style = { name: style };
	}
	// Just the name of the style has been passed and it's one of the defaults, just use it.
	else if ( isCallingDefault ) {
		// Clone the style to avoid overriding defaults.
		style = Object.assign( {}, defaultArrangements[ style ] );
	}
	// If an object style has been passed and if the name matches one of the defaults,
	// extend it with defaults – the user wants to customize a default style.
	// Note: Don't override the user–defined style object, clone it instead.
	else if ( isExtendingDefault ) {
		const defaultStyle = defaultArrangements[ style.name ];
		const extendedStyle = Object.assign( {}, style );

		for ( const prop in defaultStyle ) {
			if ( !Object.prototype.hasOwnProperty.call( style, prop ) ) {
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

function _normalizeGroup( group ) {
	const defaultGroups = defaultStyles.groups;
	const isDefault = defaultGroups[ group ];

	const isOnlyName = typeof group === 'string' && !isDefault;
	const isCallingDefault = typeof group === 'string' && isDefault;
	const isExtendingDefault = defaultGroups[ group.name ];

	if ( isOnlyName ) {
		/**
		 * There is no such image style of given name.
		 *
		 * @error image-style-not-found
		 * @param {String} name Name of a missing style name.
		 */
		logWarning( 'image-style-not-found', { name: group } );

		// Normalize the style anyway to prevent errors.
		group = { name: group };
	}
	else if ( isCallingDefault ) {
		// Clone the style to avoid overriding defaults.
		group = Object.assign( {}, defaultGroups[ group ] );
	}
	else if ( isExtendingDefault ) {
		const defaultStyle = defaultGroups[ group.name ];
		const extendedStyle = Object.assign( {}, group );

		for ( const prop in defaultStyle ) {
			if ( !Object.prototype.hasOwnProperty.call( group, prop ) ) {
				extendedStyle[ prop ] = defaultStyle[ prop ];
			}
			// ASK: nie nadpisujemy tych wartości?
			// Nie chcemy ich nadpisywać jeśli ktoś na przykład chce tylko podmienić itemy?
		}

		group = extendedStyle;
	}

	return group;
}
