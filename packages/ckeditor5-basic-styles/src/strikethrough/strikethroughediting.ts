/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/strikethrough/strikethroughediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import AttributeCommand from '../attributecommand.js';

const STRIKETHROUGH = 'strikethrough';

/**
 * The strikethrough editing feature.
 *
 * It registers the `'strikethrough'` command, the <kbd>Ctrl+Shift+X</kbd> keystroke and introduces the
 * `strikethroughsthrough` attribute in the model which renders to the view
 * as a `<s>` element.
 */
export default class StrikethroughEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'StrikethroughEditing' as const;
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
	public init(): void {
		const editor = this.editor;
		const t = this.editor.t;

		// Allow strikethrough attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: STRIKETHROUGH } );
		editor.model.schema.setAttributeProperties( STRIKETHROUGH, {
			isFormatting: true,
			copyOnEnter: true
		} );

		editor.conversion.attributeToElement( {
			model: STRIKETHROUGH,
			view: 's',
			upcastAlso: [
				'del',
				'strike',
				{
					styles: {
						'text-decoration': 'line-through'
					}
				}
			]
		} );

		// Create strikethrough command.
		editor.commands.add( STRIKETHROUGH, new AttributeCommand( editor, STRIKETHROUGH ) );

		// Set the Ctrl+Shift+X keystroke.
		editor.keystrokes.set( 'CTRL+SHIFT+X', 'strikethrough' );

		// Add the information about the keystroke to the accessibility database.
		editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Strikethrough text' ),
					keystroke: 'CTRL+SHIFT+X'
				}
			]
		} );
	}
}
