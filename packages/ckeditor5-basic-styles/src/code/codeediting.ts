/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/code/codeediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import { TwoStepCaretMovement, inlineHighlight } from 'ckeditor5/src/typing.js';

import AttributeCommand from '../attributecommand.js';

const CODE = 'code';
const HIGHLIGHT_CLASS = 'ck-code_selected';

/**
 * The code editing feature.
 *
 * It registers the `'code'` command and introduces the `code` attribute in the model which renders to the view
 * as a `<code>` element.
 */
export default class CodeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'CodeEditing' as const;
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
	public static get requires() {
		return [ TwoStepCaretMovement ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const t = this.editor.t;

		// Allow code attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: CODE } );
		editor.model.schema.setAttributeProperties( CODE, {
			isFormatting: true,
			copyOnEnter: false
		} );

		editor.conversion.attributeToElement( {
			model: CODE,
			view: 'code'
		} );

		// Create code command.
		editor.commands.add( CODE, new AttributeCommand( editor, CODE ) );

		// Enable two-step caret movement for `code` attribute.
		editor.plugins.get( TwoStepCaretMovement ).registerAttribute( CODE );

		// Setup highlight over selected element.
		inlineHighlight( editor, CODE, 'code', HIGHLIGHT_CLASS );

		// Add the information about the keystroke to the accessibility database.
		editor.accessibility.addKeystrokeInfos( {
			keystrokes: [
				{
					label: t( 'Move out of an inline code style' ),
					keystroke: [
						[ 'arrowleft', 'arrowleft' ],
						[ 'arrowright', 'arrowright' ]
					]
				}
			]
		} );
	}
}
