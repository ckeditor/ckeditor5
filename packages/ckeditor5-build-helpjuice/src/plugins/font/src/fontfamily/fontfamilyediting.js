/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontfamily/fontfamilyediting
 */

import { Plugin } from 'ckeditor5/src/core';

import FontFamilyCommand from './fontfamilycommand';
import { normalizeOptions } from './utils';
import { buildDefinition, FONT_FAMILY } from '../utils';

/**
 * The font family editing feature.
 *
 * It introduces the {@link module:font/fontfamily/fontfamilycommand~FontFamilyCommand command} and
 * the `fontFamily` attribute in the {@link module:engine/model/model~Model model} which renders
 * in the {@link module:engine/view/view view} as an inline `<span>` element (`<span style="font-family: Arial">`),
 * depending on the {@link module:font/fontfamily~FontFamilyConfig configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontFamilyEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FontFamilyEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// Define default configuration using font families shortcuts.
		editor.config.define( FONT_FAMILY, {
			options: [
				'default',
				'Arial, Helvetica, sans-serif',
				'Courier New, Courier, monospace',
				'Georgia, serif',
				'Lucida Sans Unicode, Lucida Grande, sans-serif',
				'Tahoma, Geneva, sans-serif',
				'Times New Roman, Times, serif',
				'Trebuchet MS, Helvetica, sans-serif',
				'Verdana, Geneva, sans-serif'
			],
			supportAllValues: false
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow fontFamily attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: FONT_FAMILY } );
		editor.model.schema.setAttributeProperties( FONT_FAMILY, {
			isFormatting: true,
			copyOnEnter: true
		} );

		// Get configured font family options without "default" option.
		const options = normalizeOptions( editor.config.get( 'fontFamily.options' ) ).filter( item => item.model );
		const definition = buildDefinition( FONT_FAMILY, options );

		// Set-up the two-way conversion.
		if ( editor.config.get( 'fontFamily.supportAllValues' ) ) {
			this._prepareAnyValueConverters();
			this._prepareCompatibilityConverter();
		} else {
			editor.conversion.attributeToElement( definition );
		}

		editor.commands.add( FONT_FAMILY, new FontFamilyCommand( editor ) );
	}

	/**
	 * These converters enable keeping any value found as `style="font-family: *"` as a value of an attribute on a text even
	 * if it is not defined in the plugin configuration.
	 *
	 * @private
	 */
	_prepareAnyValueConverters() {
		const editor = this.editor;

		editor.conversion.for( 'downcast' ).attributeToElement( {
			model: FONT_FAMILY,
			view: ( attributeValue, { writer } ) => {
				return writer.createAttributeElement( 'span', { style: 'font-family:' + attributeValue }, { priority: 7 } );
			}
		} );

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			model: {
				key: FONT_FAMILY,
				value: viewElement => viewElement.getStyle( 'font-family' )
			},
			view: {
				name: 'span',
				styles: {
					'font-family': /.*/
				}
			}
		} );
	}

	/**
	 * Adds support for legacy `<font face="..">` formatting.
	 *
	 * @private
	 */
	_prepareCompatibilityConverter() {
		const editor = this.editor;

		editor.conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'font',
				attributes: {
					'face': /.*/
				}
			},
			model: {
				key: FONT_FAMILY,
				value: viewElement => viewElement.getAttribute( 'face' )
			}
		} );
	}
}
