/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/fontsize/fontsizeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {
	modelAttributeToViewAttributeElement,
	viewToModelAttribute
} from '@ckeditor/ckeditor5-engine/src/conversion/definition-based-converters';

import FontSizeCommand from './fontsizecommand';
import { normalizeOptions } from './utils';

/**
 * The Font Size Editing feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontSizeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		// Define default configuration using named presets.
		editor.config.define( 'fontSize', {
			options: [
				'tiny',
				'small',
				'normal',
				'big',
				'huge'
			]
		} );

		const data = editor.data;
		const editing = editor.editing;

		// Define view to model conversion.
		const options = normalizeOptions( this.editor.config.get( 'fontSize.options' ) ).filter( item => item.model );

		for ( const option of options ) {
			// Covert view to model.
			viewToModelAttribute( 'fontSize', option, [ data.viewToModel ] );
		}

		// Define model to view conversion.
		modelAttributeToViewAttributeElement( 'fontSize', options, [ data.modelToView, editing.modelToView ] );

		// Add FontSize command.
		editor.commands.add( 'fontSize', new FontSizeCommand( editor ) );
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow fontSize attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: 'fontSize' } );
	}
}
