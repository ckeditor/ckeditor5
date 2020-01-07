/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module alignment/alignmentediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import AlignmentCommand from './alignmentcommand';
import { isDefault, isSupported, supportedOptions } from './utils';

/**
 * The alignment editing feature. It introduces the {@link module:alignment/alignmentcommand~AlignmentCommand command} and adds
 * the `alignment` attribute for block elements in the {@link module:engine/model/model~Model model}.
 * @extends module:core/plugin~Plugin
 */
export default class AlignmentEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'AlignmentEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		editor.config.define( 'alignment', {
			options: [ ...supportedOptions ]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const locale = editor.locale;
		const schema = editor.model.schema;

		// Filter out unsupported options.
		const enabledOptions = editor.config.get( 'alignment.options' ).filter( isSupported );

		// Allow alignment attribute on all blocks.
		schema.extend( '$block', { allowAttributes: 'alignment' } );
		editor.model.schema.setAttributeProperties( 'alignment', { isFormatting: true } );

		const definition = _buildDefinition( enabledOptions.filter( option => !isDefault( option, locale ) ) );

		editor.conversion.attributeToAttribute( definition );

		editor.commands.add( 'alignment', new AlignmentCommand( editor ) );
	}
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
