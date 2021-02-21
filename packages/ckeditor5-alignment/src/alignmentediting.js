/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module alignment/alignmentediting
 */

import { Plugin } from 'ckeditor5/src/core';

import AlignmentCommand from './alignmentcommand';
import { defaultConfig, isDefault, isSupported, normalizeAlignmentOptions } from './utils';

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
			options: [ ...defaultConfig ]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const locale = editor.locale;
		const schema = editor.model.schema;

		const options = normalizeAlignmentOptions( editor.config.get( 'alignment.options' ) );

		// Filter out unsupported options and those that are redundant, e.g. `left` in LTR / `right` in RTL mode.
		const optionsToConvert = options.filter(
			option => isSupported( option.name ) && !isDefault( option.name, locale )
		);

		// Converters for inline alignment need only alignment name.
		const optionNamesToConvert = optionsToConvert.map( option => option.name );

		// Once there is at least one `className` defined, we switch to alignment with classes.
		const shouldUseClasses = optionsToConvert.some( option => !!option.className );

		// Allow alignment attribute on all blocks.
		schema.extend( '$block', { allowAttributes: 'alignment' } );
		editor.model.schema.setAttributeProperties( 'alignment', { isFormatting: true } );

		if ( shouldUseClasses ) {
			// Downcast to only to classes.
			const definition = buildClassDefinition( optionsToConvert );

			editor.conversion.attributeToAttribute( definition );
		} else {
			// Downcast inline styles.
			const definition = buildDowncastInlineDefinition( optionNamesToConvert );

			editor.conversion.for( 'downcast' ).attributeToAttribute( definition );
		}

		const upcastInlineDefinitions = buildUpcastInlineDefinitions( optionNamesToConvert );

		// Always upcast from inline styles.
		for ( const definition of upcastInlineDefinitions ) {
			editor.conversion.for( 'upcast' ).attributeToAttribute( definition );
		}

		editor.commands.add( 'alignment', new AlignmentCommand( editor ) );
	}
}

// Prepare downcast conversion definition for inline alignment styling.
// @private
function buildDowncastInlineDefinition( optionNames ) {
	const definition = {
		model: {
			key: 'alignment',
			values: optionNames.slice()
		},
		view: {}
	};

	for ( const name of optionNames ) {
		definition.view[ name ] = {
			key: 'style',
			value: {
				'text-align': name
			}
		};
	}

	return definition;
}

// Prepare upcast definitions for inline alignment styles.
// @private
function buildUpcastInlineDefinitions( optionNames ) {
	const definitions = [];

	for ( const name of optionNames ) {
		definitions.push( {
			view: {
				key: 'style',
				value: {
					'text-align': name
				}
			},
			model: {
				key: 'alignment',
				value: name
			}
		} );
	}

	return definitions;
}

// Prepare conversion definitions for upcast and downcast alignment with classes.
// @private
function buildClassDefinition( options ) {
	const definition = {
		model: {
			key: 'alignment',
			values: options.map( option => option.name ).slice()
		},
		view: {}
	};

	for ( const option of options ) {
		definition.view[ option.name ] = {
			key: 'class',
			value: [ option.className ]
		};
	}

	return definition;
}

