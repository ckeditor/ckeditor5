/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignmentediting
 */

import AlignmentCommand, { commandNameFromOptionName } from './alignmentcommand';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

/**
 * @extends module:core/plugin~Plugin
 */
export default class AlignmentEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'alignment', {
			options: [ ...this.constructor.supportedOptions ]
		} );
	}

	/**
	 * The list of supported alignment options:
	 *
	 * * `'left'`,
	 * * `'right'`,
	 * * `'center'`,
	 * * `'justify'`
	 *
	 * @static
	 * @readonly
	 * @member {Array.<String>} module:alignment/alignmentediting~AlignmentEditing.supportedOptions
	 */
	static get supportedOptions() {
		return [ 'left', 'right', 'center', 'justify' ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const data = editor.data;
		const editing = editor.editing;

		const enabledOptions = editor.config.get( 'alignment.options' );

		// Allow alignment attribute on all blocks.
		schema.extend( '$block', { allowAttributes: 'alignment' } );

		data.modelToView.on( 'attribute:alignment', convertStyle() );
		editing.modelToView.on( 'attribute:alignment', convertStyle() );

		// Convert `text-align` style property from element to model attribute alignment.
		buildViewConverter()
			.for( data.viewToModel )
			.fromAttribute( 'style', /text-align/ )
			.toAttribute( viewElement => {
				const textAlign = viewElement.getStyle( 'text-align' );

				// Do not convert empty, default or unknown alignment values.
				if ( !textAlign || isDefault( textAlign ) || !enabledOptions.includes( textAlign ) ) {
					return;
				}

				return { key: 'alignment', value: textAlign };
			} );

		// Add only enabled & supported commands.
		enabledOptions
			.filter( isSupported )
			.forEach( option => {
				editor.commands.add( commandNameFromOptionName( option ), new AlignmentCommand( editor, option, isDefault( option ) ) );
			} );
	}
}

/**
 * Checks whether the passed option is supported by {@link module:alignment/alignmentediting~AlignmentEditing}.
 *
 * @param {String} option The option value to check.
 * @returns {Boolean}
 */
export function isSupported( option ) {
	return AlignmentEditing.supportedOptions.includes( option );
}

// Dispatcher handler responsible for setting the style to a view element.
// @private
function convertStyle() {
	return ( evt, data, consumable, conversionApi ) => {
		if ( !consumable.consume( data.item, evt.name ) ) {
			return;
		}

		if ( data.attributeNewValue ) {
			conversionApi.mapper.toViewElement( data.item ).setStyle( { 'text-align': data.attributeNewValue } );
		} else {
			conversionApi.mapper.toViewElement( data.item ).removeStyle( 'text-align' );
		}
	};
}

// Check whether alignment is the default one.
// @private
function isDefault( textAlign ) {
	// Right now only LTR is supported so 'left' value is always the default one.
	return textAlign === 'left';
}
