/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/italic/italicediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AttributeCommand from '../attributecommand';

const ITALIC = 'italic';

/**
 * The italic editing feature.
 *
 * It registers the `'italic'` command, the <kbd>Ctrl+I</kbd> keystroke and introduces the `italic` attribute in the model
 * which renders to the view as an `<i>` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ItalicEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Allow italic attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: ITALIC } );
		editor.model.schema.setAttributeProperties( ITALIC, {
			isFormatting: true,
			copyOnEnter: true
		} );

		editor.conversion.attributeToElement( {
			model: ITALIC,
			view: 'i',
			upcastAlso: [
				'em',
				{
					styles: {
						'font-style': 'italic'
					}
				}
			]
		} );

		// Create italic command.
		editor.commands.add( ITALIC, new AttributeCommand( editor, ITALIC ) );

		// Set the Ctrl+I keystroke.
		editor.keystrokes.set( 'CTRL+I', ITALIC );
	}
}
