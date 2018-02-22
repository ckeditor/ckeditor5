/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module alignment/alignmentediting
 */

import AlignmentCommand, { commandNameFromOptionName } from './alignmentcommand';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

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

		// Filter out unsupported options.
		const enabledOptions = editor.config.get( 'alignment.options' ).filter( isSupported );

		// Allow alignment attribute on all blocks.
		schema.extend( '$block', { allowAttributes: 'alignment' } );

		const definition = _buildDefinition( enabledOptions.filter( option => !isDefault( option ) ) );

		editor.conversion.attributeToAttribute( definition );

		// Add only enabled commands.
		enabledOptions.forEach( option => {
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

// Utility function responsible for building converter definition.
// @private
function _buildDefinition( options ) {
	const definition = {
		model: {
			key: 'alignment',
			values: options.slice()
		},
		view: {}
	};

	for ( const option of options ) {
		definition.view[ option ] = {
			key: 'style',
			value: {
				'text-align': option
			}
		};
	}

	return definition;
}

// Check whether alignment is the default one.
// @private
function isDefault( textAlign ) {
	// Right now only LTR is supported so 'left' value is always the default one.
	return textAlign === 'left';
}
