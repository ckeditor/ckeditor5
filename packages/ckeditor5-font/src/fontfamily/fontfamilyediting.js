/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily/fontfamilyediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { attributeToElement } from '@ckeditor/ckeditor5-engine/src/conversion/two-way-converters';

import FontFamilyCommand from './fontfamilycommand';
import { normalizeOptions } from './utils';

const FONT_FAMILY = 'fontFamily';

/**
 * The font family editing feature. It introduces the `'fontFamily'` command and introduces `fontFamily` attribute in the model
 * which renders to the view as a `<span>` element with a `font-family` style attribute.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontFamilyEditing extends Plugin {
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
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow fontFamily attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: FONT_FAMILY } );

		// Get configured font family options without "default" option.
		const options = normalizeOptions( editor.config.get( 'fontFamily.options' ) ).filter( item => item.model );

		// Set-up the two-way conversion.
		attributeToElement( editor.conversion, FONT_FAMILY, options );

		editor.commands.add( FONT_FAMILY, new FontFamilyCommand( editor ) );
	}
}
