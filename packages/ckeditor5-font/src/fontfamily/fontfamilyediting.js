/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontfamily/fontfamilyediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	modelAttributeToViewAttributeElement,
	viewToModelAttribute
} from '@ckeditor/ckeditor5-engine/src/conversion/definition-based-converters';

import FontFamilyCommand from './fontfamilycommand';
import { normalizeOptions } from './utils';

/**
 * The Font Family Editing feature.
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
		editor.config.define( 'fontFamily', {
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
		const data = editor.data;
		const editing = editor.editing;

		// Allow fontFamily attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'fontFamily' } );

		// Get configured font family options without "default" option.
		const options = normalizeOptions( editor.config.get( 'fontFamily.options' ) ).filter( item => item.model );

		// Define view to model conversion.
		for ( const option of options ) {
			viewToModelAttribute( 'fontFamily', option, [ data.viewToModel ] );
		}

		// Define model to view conversion.
		modelAttributeToViewAttributeElement( 'fontFamily', options, [ data.modelToView, editing.modelToView ] );

		editor.commands.add( 'fontFamily', new FontFamilyCommand( editor ) );
	}
}
