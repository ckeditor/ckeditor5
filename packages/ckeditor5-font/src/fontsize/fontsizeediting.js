/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontsize/fontsizeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';
import AttributeElement from '@ckeditor/ckeditor5-engine/src/view/attributeelement';

/**
 * The Font Size Editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontSizeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// Define default configuration using named presets
		editor.config.define( 'fontSize', {
			items: [
				'tiny',
				'small',
				'normal',
				'big',
				'huge'
			]
		} );

		// Get configuration
		const data = editor.data;
		const editing = editor.editing;

		// Covert view to model
		for ( const item of this.configuredItems ) {
			viewToAttribute( item.view, [ data.viewToModel ], 'fontSize', item.model );
		}

		// Convert model to view
		const items = this.configuredItems;

		attributeToView( [ data.modelToView, editing.modelToView ], 'fontSize', items );
	}

	get configuredItems() {
		// Cache value
		if ( this._cachedItems ) {
			return this._cachedItems;
		}

		const items = [];
		const editor = this.editor;
		const config = editor.config;

		const configuredItems = config.get( 'fontSize.items' );

		for ( const item of configuredItems ) {
			const itemDefinition = getItemDefinition( item );

			if ( itemDefinition ) {
				items.push( itemDefinition );
			}
		}

		return ( this._cachedItems = items );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow highlight attribute on all elements
		editor.document.schema.allow( { name: '$inline', attributes: 'fontSize', inside: '$block' } );
		// Temporary workaround. See https://github.com/ckeditor/ckeditor5/issues/477.
		editor.document.schema.allow( { name: '$inline', attributes: 'fontSize', inside: '$clipboardHolder' } );
	}
}

const namedPresets = {
	tiny: {
		label: 'Tiny',
		model: 'text-tiny',
		view: {
			name: 'span',
			class: 'text-tiny'
		}
	},
	small: {
		label: 'Small',
		model: 'text-small',
		view: {
			name: 'span',
			class: 'text-small'
		}
	},
	big: {
		label: 'Big',
		model: 'text-big',
		view: {
			name: 'span',
			class: 'text-big'
		}
	},
	huge: {
		label: 'Huge',
		model: 'text-huge',
		view: {
			name: 'span',
			class: 'text-huge'
		}
	}
};

// Returns item definition from preset
function getItemDefinition( item ) {
	// Named preset exist so return it
	if ( namedPresets[ item ] ) {
		return namedPresets[ item ];
	}

	// Probably it is full item definition so return it
	if ( typeof item === 'object' ) {
		return item;
	}

	// At this stage we probably have numerical value to generate a preset so parse it's value.
	const sizePreset = parseInt( item ); // TODO: Should we parse floats? 🤔

	// Discard any faulty values.
	if ( isNaN( sizePreset ) ) {
		return;
	}

	return generatePixelPreset( sizePreset );
}

// Creates a predefined preset for pixel size.
function generatePixelPreset( size ) {
	const sizeName = String( size );

	return {
		label: sizeName,
		model: sizeName,
		view: {
			name: 'span',
			style: {
				'font-size': `${ size }px`
			}
		}
	};
}

function toStylesString( stylesObject ) {
	const styles = [];

	for ( const key in stylesObject ) {
		styles.push( key + ':' + stylesObject[ key ] );
	}

	return styles.join( ';' );
}

function viewToAttribute( view, dispatchers, attributeName, attributeValue ) {
	const viewDefinitions = view.from ? view.from : [ view ];

	for ( const viewDefinition of viewDefinitions ) {
		const element = viewDefinition.name;
		const classes = viewDefinition.class;
		const styles = viewDefinition.style;

		const pattern = { name: element };

		if ( classes ) {
			pattern.class = classes;
		}

		if ( styles ) {
			pattern.style = styles;
		}

		buildViewConverter()
			.for( ...dispatchers )
			.from( pattern )
			.toAttribute( () => ( {
				key: attributeName,
				value: attributeValue
			} ) );
	}
}

function attributeToView( dispatchers, attributeName, items ) {
	buildModelConverter()
		.for( ...dispatchers )
		.fromAttribute( attributeName )
		.toElement( attributeValue => {
			const definition = _getDefinition( attributeValue );

			if ( !definition ) {
				return;
			}

			const viewDefinition = definition.view.to ? definition.view.to : definition.view;
			// TODO: AttributeElement.fromDefinition() ?

			const classes = viewDefinition.class;
			const styles = viewDefinition.style;

			const attributes = {};

			// TODO: AttributeElement does no accept Array
			if ( classes ) {
				attributes.class = Array.isArray( classes ) ? classes.join( ' ' ) : classes;
			}

			// TODO: Attribute element does not accept Object
			if ( styles ) {
				attributes.style = typeof styles === 'string' ? styles : toStylesString( styles );
			}

			return new AttributeElement( viewDefinition.name, attributes );
		} );

	function _getDefinition( name ) {
		const stringName = String( name );

		for ( const item of items ) {
			if ( item.model === stringName ) {
				return item;
			}
		}
	}
}

/**
 * Font size option descriptor.
 *
 * @typedef {Object} module:font/fontsize/fontsizeediting~FontSizeOption
 *
 * @property {String} label TODO me
 * @property {String} model TODO me
 * @property {module:engine/view/viewelementdefinition~ViewElementDefinition} view View element configuration.
 */

/**
 * The configuration of the heading feature. Introduced by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} feature.
 *
 * Read more in {@link module:font/fontsize/fontsizeediting~FontSizeConfig}.
 *
 * @member {module:font/fontsize/fontsizeediting~FontSizeConfig} module:core/editor/editorconfig~EditorConfig#fontSize
 */

/**
 * The configuration of the font size feature.
 * The option is used by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} feature.
 *
 *        ClassicEditor
 *            .create( {
 * 				fontSize: ... // Font size feature config.
 *			} )
 *            .then( ... )
 *            .catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface module:font/fontsize/fontsizeediting~FontSizeConfig
 */

/**
 * Available font size options. Defined either as array of strings.
 *
 * The default value is
 * TODO code
 * which configures
 *
 * @member {Array.<String|Number|module:font/fontsize/fontsizeediting~FontSizeOption>}
 *  module:font/fontsize/fontsizeediting~FontSizeConfig#items
 */
