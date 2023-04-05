/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/code/codeediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { TwoStepCaretMovement, inlineHighlight } from 'ckeditor5/src/typing';

import AttributeCommand from '../attributecommand';

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
	public static get pluginName(): 'CodeEditing' {
		return 'CodeEditing';
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

		// Allow code attribute on text nodes.
		editor.model.schema.extend( '$text', { allowAttributes: CODE } );
		editor.model.schema.setAttributeProperties( CODE, {
			isFormatting: true,
			copyOnEnter: false
		} );

		editor.conversion.attributeToElement( {
			model: CODE,
			view: 'code',
			upcastAlso: {
				styles: {
					'word-wrap': 'break-word'
				}
			}
		} );

		// Create code command.
		editor.commands.add( CODE, new AttributeCommand( editor, CODE ) );

		// Enable two-step caret movement for `code` attribute.
		editor.plugins.get( TwoStepCaretMovement ).registerAttribute( CODE );

		// Setup highlight over selected element.
		inlineHighlight( editor, CODE, 'code', HIGHLIGHT_CLASS );
	}
}
