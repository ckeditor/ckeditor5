/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/utils
 */

import { icons } from 'ckeditor5/src/core';
import { logWarning } from 'ckeditor5/src/utils';

const {
	objectFullWidth,
	objectInline,
	objectLeft,	objectRight, objectCenter,
	objectInlineLeft, objectInlineRight
} = icons;

const DEFAULT_ARRANGEMENTS = {
	inline: {
		name: 'inline',
		title: 'In line',
		icon: objectInline,
		modelElements: [ 'imageInline' ],
		isDefault: true
	},

	// This style represents an image aligned to the left.
	alignLeft: {
		name: 'alignLeft',
		title: 'Left aligned image',
		icon: objectInlineLeft,
		modelElements: [ 'image', 'imageInline' ],
		className: 'image-style-align-left'
	},

	// This style represents an image aligned to the right.
	alignRight: {
		name: 'alignRight',
		title: 'Right aligned image',
		icon: objectInlineRight,
		modelElements: [ 'image', 'imageInline' ],
		className: 'image-style-align-right'
	},

	alignBlockLeft: {
		name: 'alignBlockLeft',
		title: 'Left aligned image',
		icon: objectLeft,
		modelElements: [ 'image' ],
		className: 'image-style-block-align-left'
	},

	// This style represents a centered image.
	alignCenter: {
		name: 'alignCenter',
		title: 'Centered image',
		icon: objectCenter,
		modelElements: [ 'image' ],
		className: 'image-style-align-center'
	},

	alignBlockRight: {
		name: 'alignBlockRight',
		title: 'Right aligned image',
		icon: objectRight,
		modelElements: [ 'image' ],
		className: 'image-style-block-align-right'
	},

	// This option is equal to the situation when no style is applied.
	full: {
		name: 'full',
		title: 'Full size image',
		icon: objectFullWidth,
		modelElements: [ 'image' ],
		isDefault: true
	},

	// This represents a side image.
	side: {
		name: 'side',
		title: 'Side image',
		icon: objectInlineRight,
		modelElements: [ 'image' ],
		className: 'image-style-side'
	}
};

const DEFAULT_GROUPS = {
	wrapText: {
		name: 'wrapText',
		title: 'Wrap text',
		defaultItem: 'alignLeft',
		items: [ 'alignLeft', 'alignRight' ]
	},

	breakText: {
		name: 'breakText',
		title: 'Break text',
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
const DEFAULT_ICONS = {
	full: objectFullWidth,
	left: objectLeft,
	right: objectRight,
	center: objectCenter,
	inLineLeft: objectInlineLeft,
	inLineRight: objectInlineRight,
	inLine: objectInline
};

function normalizeStyles( options ) {
	const configuredArrangements = options.configuredStyles.arrangements || [];
	const configuredGroups = options.configuredStyles.groups || [];

	const arrangements = configuredArrangements
		.map( arrangement => normalizeDefinition( DEFAULT_ARRANGEMENTS, arrangement, 'arrangement' ) )
		.filter( arrangement => isValidArrangement( arrangement, options ) );

	const groups = configuredGroups
		.map( group => normalizeDefinition( DEFAULT_GROUPS, group, 'group' ) )
		.map( group => validateGroup( group, arrangements ) )
		.filter( group => !!group.items.length );

	return { arrangements, groups };
}

function getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) {
	if ( isBlockPluginLoaded && isInlinePluginLoaded ) {
		return {
			arrangements: [
				'inline', 'alignLeft', 'alignRight',
				'alignCenter', 'alignBlockLeft', 'alignBlockRight'
			],
			groups: [ 'wrapText', 'breakText' ]
		};
	} else if ( isBlockPluginLoaded ) {
		return {
			arrangements: [ 'full', 'side' ]
		};
	} else if ( isInlinePluginLoaded ) {
		return {
			arrangements: [ 'inline', 'alignLeft', 'alignRight' ]
		};
	}

	return {};
}

function normalizeDefinition( defaults, definition, definitionType ) {
	if ( typeof definition === 'string' ) {
		// Just the name of the style has been passed, but none of the defaults.
		// Warn because probably it's a mistake.
		if ( !defaults[ definition ] ) {
			// Normalize the style anyway to prevent errors.
			definition = { name: definition };
		}
		// Just the name of the style has been passed and it's one of the defaults, just use it.
		// Clone the style to avoid overriding defaults.
		else {
			definition = Object.assign( {}, defaults[ definition ] );
		}
	} else {
		// If an object style has been passed and if the name matches one of the defaults,
		// extend it with defaults – the user wants to customize a default style.
		// Note: Don't override the user–defined style object, clone it instead.
		definition = extendStyle( defaults[ definition.name ], definition );
	}

	// If an icon is defined as a string and correspond with a name
	// in default icons, use the default icon provided by the plugin.
	if ( definitionType === 'arrangement' && typeof definition.icon === 'string' ) {
		definition.icon = DEFAULT_ICONS[ definition.icon ] || definition.icon;
	}

	return definition;
}

function isValidArrangement( arrangement, { isBlockPluginLoaded, isInlinePluginLoaded } ) {
	const { name: arrangementName, modelElements } = arrangement;

	if ( !modelElements || !modelElements.length ) {
		logWarning( 'image-style-invalid', { arrangement } );

		return false;
	}

	const loadedPlugins = [ isBlockPluginLoaded ? 'image' : null, isInlinePluginLoaded ? 'imageInline' : null ];
	const supportedBy = loadedPlugins.filter( plugin => modelElements.includes( plugin ) );

	// Check if arrangement is supported by any of the loaded plugins.
	if ( !supportedBy.length ) {
		logWarning( 'image-style-unsupported', {
			arrangement: arrangementName,
			missingPlugins: modelElements.map( modelElementName => {
				return modelElementName === 'image' ? 'ImageBlockEditing' : 'ImageInlineEditing';
			} )
		} );

		return false;
	}

	return true;
}

function validateGroup( originalGroup, arrangements ) {
	const group = Object.assign( {}, originalGroup );

	group.items = ( group.items || [] ).filter( item => isValidGroupItem( item, arrangements ) );
	const isDefaultItemValid = typeof group.defaultItem === 'string' && group.items.indexOf( group.defaultItem ) > -1;

	if ( !group.items.length || !isDefaultItemValid ) {
		logWarning( 'image-style-invalid', { group: originalGroup } );
		return { name: group.name, items: [] };
	}

	return group;
}

// Check if arrangement set in the group items is defined.
function isValidGroupItem( itemName, normalizedArrangements ) {
	const isValid = !!normalizedArrangements.find( item => item.name === itemName );

	if ( !isValid ) {
		logWarning( 'image-style-invalid', { groupItem: itemName } );
	}

	return isValid;
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

export default {
	normalizeStyles,
	getDefaultStylesConfiguration,
	DEFAULT_ARRANGEMENTS,
	DEFAULT_GROUPS,
	DEFAULT_ICONS
};
