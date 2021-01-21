/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/code/codeediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import AttributeCommand from '../attributecommand';
import TwoStepCaretMovement from '@ckeditor/ckeditor5-typing/src/twostepcaretmovement';
import setupHighlight from '@ckeditor/ckeditor5-typing/src/utils/inlinehighlight';

const CODE = 'code';
const HIGHLIGHT_CLASS = 'ck-code_selected';

/**
 * The code editing feature.
 *
 * It registers the `'code'` command and introduces the `code` attribute in the model which renders to the view
 * as a `<code>` element.
 *
 * @extends module:core/plugin~Plugin
 */
export default class CodeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'CodeEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TwoStepCaretMovement ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
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
		setupHighlight( editor, CODE, 'code', HIGHLIGHT_CLASS );
	}
}
