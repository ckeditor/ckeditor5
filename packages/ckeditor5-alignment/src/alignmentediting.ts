/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module alignment/alignmentediting
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import type { AttributeDescriptor } from 'ckeditor5/src/engine.js';

import AlignmentCommand from './alignmentcommand.js';
import { isDefault, isSupported, normalizeAlignmentOptions, supportedOptions } from './utils.js';
import type { AlignmentFormat, SupportedOption } from './alignmentconfig.js';

/**
 * The alignment editing feature. It introduces the {@link module:alignment/alignmentcommand~AlignmentCommand command} and adds
 * the `alignment` attribute for block elements in the {@link module:engine/model/model~Model model}.
 */
export default class AlignmentEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'AlignmentEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'alignment', {
			options: supportedOptions.map( option => ( { name: option } ) )
		} );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const locale = editor.locale;
		const schema = editor.model.schema;

		const options: Array<AlignmentFormat> = normalizeAlignmentOptions( editor.config.get( 'alignment.options' )! );

		// Filter out unsupported options and those that are redundant, e.g. `left` in LTR / `right` in RTL mode.
		const optionsToConvert = options.filter(
			option => isSupported( option.name ) && !isDefault( option.name, locale )
		);

		// Once there is at least one `className` defined, we switch to alignment with classes.
		const shouldUseClasses = optionsToConvert.some( option => !!option.className );

		// Allow alignment attribute on all blocks.
		schema.extend( '$block', { allowAttributes: 'alignment' } );
		editor.model.schema.setAttributeProperties( 'alignment', { isFormatting: true } );

		if ( shouldUseClasses ) {
			editor.conversion.attributeToAttribute( buildClassDefinition( optionsToConvert ) );
		} else {
			// Downcast inline styles.
			editor.conversion.for( 'downcast' ).attributeToAttribute( buildDowncastInlineDefinition( optionsToConvert ) );
		}

		const upcastInlineDefinitions = buildUpcastInlineDefinitions( optionsToConvert );

		// Always upcast from inline styles.
		for ( const definition of upcastInlineDefinitions ) {
			editor.conversion.for( 'upcast' ).attributeToAttribute( definition );
		}

		const upcastCompatibilityDefinitions = buildUpcastCompatibilityDefinitions( optionsToConvert );

		// Always upcast from deprecated `align` attribute.
		for ( const definition of upcastCompatibilityDefinitions ) {
			editor.conversion.for( 'upcast' ).attributeToAttribute( definition );
		}

		editor.commands.add( 'alignment', new AlignmentCommand( editor ) );
	}
}

/**
 * Prepare downcast conversion definition for inline alignment styling.
 */
function buildDowncastInlineDefinition( options: Array<AlignmentFormat> ) {
	const view: Record<string, { key: 'style'; value: { 'text-align': SupportedOption } }> = {};

	for ( const { name } of options ) {
		view[ name ] = {
			key: 'style',
			value: {
				'text-align': name
			}
		};
	}

	const definition = {
		model: {
			key: 'alignment',
			values: options.map( option => option.name )
		},
		view
	};

	return definition;
}

/**
 * Prepare upcast definitions for inline alignment styles.
 */
function buildUpcastInlineDefinitions( options: Array<AlignmentFormat> ) {
	const definitions = [];

	for ( const { name } of options ) {
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

/**
 * Prepare upcast definitions for deprecated `align` attribute.
 */
function buildUpcastCompatibilityDefinitions( options: Array<AlignmentFormat> ) {
	const definitions = [];

	for ( const { name } of options ) {
		definitions.push( {
			view: {
				key: 'align',
				value: name
			},
			model: {
				key: 'alignment',
				value: name
			}
		} );
	}

	return definitions;
}

/**
 * Prepare conversion definitions for upcast and downcast alignment with classes.
 */
function buildClassDefinition( options: Array<AlignmentFormat> ) {
	const view: Record<string, AttributeDescriptor> = {};

	for ( const option of options ) {
		view[ option.name ] = {
			key: 'class',
			value: option.className!
		};
	}

	const definition = {
		model: {
			key: 'alignment',
			values: options.map( option => option.name )
		},
		view
	};

	return definition;
}
