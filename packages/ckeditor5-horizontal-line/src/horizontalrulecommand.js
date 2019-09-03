/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module horizontal-rule/horizontalrulecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { isHorizontalRuleAllowed } from './utils';

/**
 * The insert a horizontal rule command.
 *
 * The command is registered by the {@link module:horizontal-rule/horizontalruleediting~HorizontalRuleEditing} as `'horizontalRule'`.
 *
 * To insert the horizuntal rule at the current selection, execute the command:
 *
 *		editor.execute( 'horizontalRule' );
 *
 * @extends module:core/command~Command
 */
export default class HorizontalRuleCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = isHorizontalRuleAllowed( this.editor.model );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;

		model.change( writer => {
			const modelElement = writer.createElement( 'horizontalRule' );

			model.insertContent( modelElement );
			writer.setSelection( modelElement, 'on' );
		} );
	}
}
