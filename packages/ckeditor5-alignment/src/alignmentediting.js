/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module alignment/alignmentediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { CKEditorError } from '../../../src/utils';

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
			options: [ ...supportedOptions ],
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

		// Filter out unsupported options.
		const enabledOptions = editor.config.get( 'alignment.options' ).filter( isSupported );
		const classNameConfig = editor.config.get( 'alignment.classNames' );

		if ( !Array.isArray( classNameConfig ) ||
			( classNameConfig.length && classNameConfig.length != enabledOptions.length )
		) {
			/**
			 * The number of items in `alignment.classNames` should match number of items in `alignment.options`.
			 *
			 * @error alignment-config-classnames-not-matching
			 * @param {Array.<String>} enabledOptions Available alignment options set in config.
			 * @param {Array.<String>} classNameConfig Classes listed in the config.
			 */
			throw new CKEditorError( 'alignment-config-classnames-not-matching', null, { enabledOptions, classNameConfig } );
		}

		// Allow alignment attribute on all blocks.
		schema.extend( '$block', { allowAttributes: 'alignment' } );
		editor.model.schema.setAttributeProperties( 'alignment', { isFormatting: true } );

		const shouldUseClasses = classNameConfig.length;
		const options = enabledOptions.filter( option => !isDefault( option, locale ) );

		if ( shouldUseClasses ) {
			// Upcast and Downcast classes.

			const alignmentClassNames = classNameConfig.reduce( ( classNameMap, className, index ) => {
				classNameMap[ enabledOptions[ index ] ] = className;

				return classNameMap;
			}, {} );

			const definition = _buildClassDefinition( options, alignmentClassNames );

			editor.conversion.attributeToAttribute( definition );
		} else {
			// Downcast inline styles.

			const definition = _buildDowncastInlineDefinition( options );

			editor.conversion.for( 'downcast' ).attributeToAttribute( definition );
		}

		const upcastInlineDefinitions = _buildUpcastInlineDefinitions( options );

		// Always upcast from inline styles.
		for ( const definition of upcastInlineDefinitions ) {
			editor.conversion.for( 'upcast' ).attributeToAttribute( definition );
		}

		editor.commands.add( 'alignment', new AlignmentCommand( editor ) );
	}
}

// Prepare downcast conversion definition for inline alignment styling.
// @private
function _buildDowncastInlineDefinition( options ) {
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
function _buildUpcastInlineDefinitions( options ) {
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
function _buildClassDefinition( options, alignmentClassNames ) {
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

