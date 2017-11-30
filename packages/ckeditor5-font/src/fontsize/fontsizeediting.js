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

		for ( const item of this.configuredItems ) {
			const viewDefinition = item.view;
			const element = viewDefinition.name;
			const classes = viewDefinition.classes;
			const styles = viewDefinition.styles;

			const attribute = {};

			if ( classes ) {
				attribute.class = classes;
			}

			// TODO styles are not normalized in parsing - it require better handling
			if ( styles ) {
				attribute.style = styles;
			}

			buildViewConverter()
				.for( data.viewToModel )
				.from( { name: element, attribute } )
				.toAttribute( () => ( {
					key: 'fontSize',
					value: item.model
				} ) );
		}

		// Convert model to view
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromAttribute( 'fontSize' )
			.toElement( data => {
				const definition = this._getDefinition( data );

				if ( !definition ) {
					return;
				}

				// TODO: make utitlity class of this?
				const viewDefinition = definition.view;

				const attributes = {};

				if ( viewDefinition.classes ) {
					attributes.class = viewDefinition.classes;
				}

				if ( viewDefinition.styles ) {
					attributes.style = viewDefinition.styles;
				}

				return new AttributeElement( viewDefinition.name, attributes );
			} );
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

	_getDefinition( name ) {
		const stringName = String( name );

		for ( const item of this.configuredItems ) {
			if ( item.model === stringName ) {
				return item;
			}
		}
	}
}

const namedPresets = {
	tiny: {
		label: 'Tiny',
		model: 'text-tiny',
		// stopValue: .7
		// stopUnit: 'em'
		view: {
			name: 'span',
			classes: 'text-tiny'
		}
	},
	small: {
		label: 'Small',
		model: 'text-small',
		// stopValue: .85
		// stopUnit: 'em',
		view: {
			name: 'span',
			classes: 'text-small'
		}
	},
	big: {
		label: 'Big',
		model: 'text-big',
		// stopValue: 1.4
		// stopUnit: 'em',
		view: {
			name: 'span',
			classes: 'text-big'
		}
	},
	huge: {
		label: 'Huge',
		model: 'text-huge',
		// stopValue: 1.8
		// stopUnit: 'em',
		view: {
			name: 'span',
			classes: 'text-huge'
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
		stopValue: size,
		view: {
			name: 'span',
			styles: `font-size:${ size }px;`
		}
	};
}
