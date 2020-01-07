/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/underline/underlineediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AttributeCommand from '../attributecommand';

const UNDERLINE = 'underline';

/**
 * The underline editing feature.
 *
 * It registers the `'underline'` command, the <kbd>Ctrl+U</kbd> keystroke
 * and introduces the `underline` attribute in the model which renders to the view as an `<u>` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class UnderlineEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'UnderlineEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow strikethrough attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: UNDERLINE } );
		editor.model.schema.setAttributeProperties( UNDERLINE, {
			isFormatting: true,
			copyOnEnter: true
		} );

		editor.conversion.attributeToElement( {
			model: UNDERLINE,
			view: 'u',
			upcastAlso: {
				styles: {
					'text-decoration': 'underline'
				}
			}
		} );

		// Create underline command.
		editor.commands.add( UNDERLINE, new AttributeCommand( editor, UNDERLINE ) );

		// Set the Ctrl+U keystroke.
		editor.keystrokes.set( 'CTRL+U', 'underline' );
	}
}
