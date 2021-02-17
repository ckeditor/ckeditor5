/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module alignment/alignmentediting
 */

import { Plugin } from 'ckeditor5/src/core';

import AlignmentCommand from './alignmentcommand';
import { defaultOptions, isDefault, isSupported, normalizeAlignmentOptions } from './utils';

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
			options: [ ...defaultOptions ],
			classNames: []
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const locale = editor.locale;
		const schema = editor.model.schema;

		const alignmentOptions = normalizeAlignmentOptions( editor.config.get( 'alignment.options' ) );

		// Filter out unsupported options.
		const enabledOptions = alignmentOptions.map( option => option.name ).filter( isSupported );
		const classNameConfig = alignmentOptions.map( option => option.className );

		// Allow alignment attribute on all blocks.
		schema.extend( '$block', { allowAttributes: 'alignment' } );
		editor.model.schema.setAttributeProperties( 'alignment', { isFormatting: true } );

		const shouldUseClasses = classNameConfig.filter( className => !!className ).length;

		// There is no need for converting alignment that's the same as current text direction.
		const options = enabledOptions.filter( option => !isDefault( option, locale ) );

		if ( shouldUseClasses ) {
			// Upcast and Downcast classes.

			const alignmentClassNames = classNameConfig.reduce( ( classNameMap, className, index ) => {
				classNameMap[ enabledOptions[ index ] ] = className;

				return classNameMap;
			}, {} );

			const definition = buildClassDefinition( options, alignmentClassNames );

			editor.conversion.attributeToAttribute( definition );
		} else {
			// Downcast inline styles.

			const definition = buildDowncastInlineDefinition( options );

			editor.conversion.for( 'downcast' ).attributeToAttribute( definition );
		}

		const upcastInlineDefinitions = buildUpcastInlineDefinitions( options );

		// Always upcast from inline styles.
		for ( const definition of upcastInlineDefinitions ) {
			editor.conversion.for( 'upcast' ).attributeToAttribute( definition );
		}

		editor.commands.add( 'alignment', new AlignmentCommand( editor ) );
	}
}

// Prepare downcast conversion definition for inline alignment styling.
// @private
function buildDowncastInlineDefinition( options ) {
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

// Prepare upcast definitions for inline alignment styles.
// @private
function buildUpcastInlineDefinitions( options ) {
	const definitions = [];

	for ( const option of options ) {
		const view = {
			key: 'style',
			value: {
				'text-align': option
			}
		};
		const model = {
			key: 'alignment',
			value: option
		};

		definitions.push( {
			view,
			model
		} );
	}

	return definitions;
}

// Prepare conversion definitions for upcast and downcast alignment with classes.
// @private
function buildClassDefinition( options, alignmentClassNames ) {
	const definition = {
		model: {
			key: 'alignment',
			values: options.slice()
		},
		view: {}
	};

	for ( const option of options ) {
		definition.view[ option ] = {
			key: 'class',
			value: [ alignmentClassNames[ option ] ]
		};
	}

	return definition;
}

