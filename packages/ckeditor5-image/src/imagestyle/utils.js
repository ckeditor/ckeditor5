/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/utils
 */

import { icons } from 'ckeditor5/src/core';
import { logWarning } from 'ckeditor5/src/utils';

const defaultArrangements = {
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
		modelElement: 'image',
		className: 'image-style-block-align-left'
	},

	// This style represents a centered image.
	alignCenter: {
		name: 'alignCenter',
		title: 'Centered image',
		icon: icons.objectCenter,
		modelElement: 'image',
		className: 'image-style-align-center'
	},

	alignBlockRight: {
		name: 'alignBlockRight',
		title: 'Right aligned image',
		icon: icons.objectRight,
		modelElement: 'image',
		className: 'image-style-block-align-right'
	},

	// This option is equal to the situation when no style is applied.
	full: {
		name: 'full',
		title: 'Full size image',
		icon: icons.objectFullWidth,
		modelElement: 'image',
		isDefault: true
	},

	// This represents a side image.
	side: {
		name: 'side',
		title: 'Side image',
		icon: icons.objectRight,
		modelElement: 'image',
		className: 'image-style-side'
	}
};

const defaultGroups = {
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
const defaultIcons = {
	full: icons.objectFullWidth,
	left: icons.objectLeft,
	right: icons.objectRight,
	center: icons.objectCenter,
	inLineLeft: icons.objectInlineLeft,
	inLineRight: icons.objectInlineRight,
	inLine: icons.objectInline
};

export function normalizeStyles( configuredStyles, loadedPlugins ) {
	const configuredArrangements = configuredStyles.arrangements || [];
	const configuredGroups = configuredStyles.groups || [];

	const arrangements = configuredArrangements
		.map( arrangement => normalizeArrangement( arrangement ) )
		.filter( arrangement => validateArrangement( arrangement, loadedPlugins ) );

	const groups = configuredGroups
		.map( group => normalizeGroup( group ) )
		.map( group => {
			group.items = group.items
				.filter( item => validateGroupItem( item, arrangements ) );

			return group;
		} )
		.filter( group => group.items.length > 0 );

	return { arrangements, groups };
}

function normalizeArrangement( arrangement ) {
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
	if ( typeof arrangement.icon === 'string' && defaultIcons[ arrangement.icon ] ) {
		arrangement.icon = defaultIcons[ arrangement.icon ];
	}

	return arrangement;
}

function normalizeGroup( group ) {
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

	// Load default icon if possible.
	if ( typeof group.defaultIcon === 'string' && defaultIcons[ group.defaultIcon ] ) {
		group.defaultIcon = defaultIcons[ group.defaultIcon ];
	}

	return group;
}

// Check if the style's modelElement is supported by the loaeded plugins.
function validateArrangement( arrangement, loadedPlugins ) {
	const modelElementName = arrangement.modelElement;

	// name się nie zgadza!!!
	if ( modelElementName && !loadedPlugins.has( getPluginName( modelElementName ) ) ) {
		logWarning( 'image-style-unsupported', {
			missingPlugin: modelElementName,
			unsupportedStyle: arrangement.name
		} );
		return false;
	}
	else {
		return true;
	}

	function getPluginName( modelElementName ) {
		const mapping = {
			image: 'ImageBlock',
			imageInline: 'ImageInline'
		};

		return mapping[ modelElementName ];
	}
}

// Check if arrangement set in the group items is defined.
function validateGroupItem( itemName, normalizedArrangements ) {
	const isItemDefined = normalizedArrangements.find( item => item.name === itemName );

	return !!isItemDefined;
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
	}

	return extendedStyle;
}
