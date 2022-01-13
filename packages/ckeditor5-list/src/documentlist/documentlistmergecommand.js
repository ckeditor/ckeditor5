/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistmergecommand
 */

import { Command } from 'ckeditor5/src/core';
import {
	indentBlocks, isFirstBlockOfListItem,
	mergeListItemBefore
} from './utils/model';
import ListWalker from './utils/listwalker';

/**
 * TODO
 * The document list indent command. It is used by the {@link module:list/documentlist~DocumentList list feature}.
 *
 * @extends module:core/command~Command
 */
export default class DocumentListMergeCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {'backward'|'forward'} direction Whether list item should be merged before or after the selected block.
	 */
	constructor( editor, direction ) {
		super( editor );

		/**
		 * Whether list item should be merged before or after the selected block.
		 *
		 * @readonly
		 * @private
		 * @member {'backward'|'forward'}
		 */
		this._direction = direction;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = true; // this._checkEnabled();
	}

	/**
	 * TODO
	 *
	 * @fires execute
	 * @fires afterExecute
	 */
	execute( { deleteContent = false } = {} ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			const anchorElement = selection.getFirstPosition().parent;
			const isFirstBlock = isFirstBlockOfListItem( anchorElement );
			let firstElement, lastElement;

			// TODO what about different list types?

			if ( this._direction == 'backward' ) {
				lastElement = anchorElement;
				firstElement = isFirstBlock && !deleteContent ?
					ListWalker.first( anchorElement, { sameIndent: true, lowerIndent: true } ) :
					anchorElement.previousSibling;
			} else {
				// TODO
				firstElement = anchorElement;
				lastElement = anchorElement.nextSibling;
			}

			const firstIndent = firstElement.getAttribute( 'listIndent' );
			const lastIndent = lastElement.getAttribute( 'listIndent' );

			if ( firstIndent != lastIndent ) {
				indentBlocks( lastElement, writer, {
					indentBy: firstIndent - lastIndent,
					expand: 'forward'
				} );
			}

			if ( deleteContent ) {
				let sel = selection;

				if ( selection.isCollapsed ) {
					sel = writer.createSelection( writer.createRange(
						writer.createPositionAt( firstElement, 'end' ),
						writer.createPositionAt( lastElement, 0 )
					) );
				}

				const lastElementId = lastElement.getAttribute( 'listItemId' );

				model.deleteContent( sel, { doNotResetEntireContent: true } );

				// Find the last element (it could be moved to graveyard).
				const lastElementAfterDelete = lastElement.root.rootName != '$graveyard' ? lastElement : firstElement;
				const nextSibling = lastElementAfterDelete.nextSibling;

				if ( nextSibling && nextSibling.getAttribute( 'listItemId' ) == lastElementId ) {
					mergeListItemBefore( nextSibling, lastElementAfterDelete, writer );
				}
			} else {
				mergeListItemBefore( lastElement, firstElement, writer );
			}

			// TODO this._fireAfterExecute()
		} );
	}

	/**
	 * TODO
	 *
	 * @private
	 * @param {Array.<module:engine/model/element~Element>} changedBlocks The changed list elements.
	 */
	_fireAfterExecute( changedBlocks ) {
		/**
		 * Event fired by the {@link #execute} method.
		 *
		 * It allows to execute an action after executing the {@link ~DocumentListIndentCommand#execute} method,
		 * for example adjusting attributes of changed list items.
		 *
		 * @protected
		 * @event afterExecute
		 */
		this.fire( 'afterExecute', changedBlocks );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstPosition = selection.getFirstPosition();
		const firstPositionParent = firstPosition.parent;

		let firstNode;

		if ( selection.isCollapsed ) {
			firstNode = firstPosition.isAtEnd ? firstPositionParent.nextSibling : firstPositionParent.previousSibling;
		} else {
			firstNode = firstPositionParent;
		}

		const lastNode = selection.getLastPosition().parent;

		if ( firstNode === lastNode ) {
			return false;
		}

		if ( !firstNode || !lastNode.hasAttribute( 'listItemId' ) ) {
			return false;
		}

		if ( selection.isCollapsed && !( firstPosition.isAtStart || firstPosition.isAtEnd ) ) {
			return false;
		}

		return true;
	}
}
