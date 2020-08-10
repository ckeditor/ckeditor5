/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststylescommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { getSiblingNodes } from './utils';

/**
 * The list style command. It is used by the {@link module:list/liststyles~ListStyles list styles feature}.
 *
 * @extends module:core/command~Command
 */
export default class ListStylesCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the command.
	 *
	 * @param {Object} options
	 * @param {String|null} options.type The type of the list styles, e.g. 'disc' or 'square'. If `null` specified, the default
	 * style will be applied.
	 * @protected
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const position = findPositionInsideList( document.selection );

		if ( !position ) {
			return;
		}

		const listItems = [
			...getSiblingNodes( position, 'backward' ),
			...getSiblingNodes( position, 'forward' )
		];

		model.change( writer => {
			for ( const item of listItems ) {
				writer.setAttribute( 'listStyle', options.type || 'default', item );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @returns {Boolean} The current value.
	 */
	_getValue() {

	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		return true;
	}
}

function findPositionInsideList( selection ) {
	const startPosition = selection.getFirstPosition();

	if ( startPosition.parent.is( 'element', 'listItem' ) ) {
		return startPosition;
	}

	const lastPosition = selection.getLastPosition();

	if ( lastPosition.parent.is( 'element', 'listItem' ) ) {
		return lastPosition;
	}

	return null;
}
