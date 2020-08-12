/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/liststylescommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import TreeWalker from '@ckeditor/ckeditor5-engine/src/model/treewalker';

/**
 * The list style command. It is used by the {@link module:list/liststyles~ListStyles list styles feature}.
 *
 * @extends module:core/command~Command
 */
export default class ListStylesCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {String} defaultType The list type that will be used by default if the value was not specified during
	 * the command execution.
	 */
	constructor( editor, defaultType ) {
		super( editor );

		/**
		 * The default type of the list style.
		 *
		 * @private
		 * @member {String}
		 */
		this._defaultType = defaultType;
	}

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
	 * @returns {String|null} The current value.
	 */
	_getValue() {
		const listItem = this.editor.model.document.selection.getFirstPosition().parent;

		if ( listItem && listItem.is( 'element', 'listItem' ) ) {
			return listItem.getAttribute( 'listStyle' );
		}

		return null;
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		const editor = this.editor;

		const numberedList = editor.commands.get( 'numberedList' );
		const bulletedList = editor.commands.get( 'bulletedList' );

		return numberedList.isEnabled || bulletedList.isEnabled;
	}
}

// Returns a position that is hooked in the `listItem` element.
// It can be the selection starting position or end.
//
// @param {module:engine/model/selection~Selection} selection
// @returns {module:engine/model/position~Position|null}
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

// Returns an array with all `listItem` elements that represents the same list.
//
// It means that values for `listIndent`, `listType`, and `listStyle` for all items
// are equal.
//
// @param {module:engine/model/position~Position} position Starting position.
// @param {'forward'|'backward'} direction Walking direction.
// @returns {Array.<module:engine/model/element~Element>
function getSiblingNodes( position, direction ) {
	const items = [];
	const listItem = position.parent;
	const walkerOptions = {
		ignoreElementEnd: true,
		startPosition: position,
		shallow: true,
		direction
	};
	const limitIndent = listItem.getAttribute( 'listIndent' );
	const nodes = [ ...new TreeWalker( walkerOptions ) ]
		.filter( value => value.item.is( 'element' ) )
		.map( value => value.item );

	for ( const element of nodes ) {
		// If found something else than `listItem`, we're out of the list scope.
		if ( !element.is( 'element', 'listItem' ) ) {
			break;
		}

		// If current parsed item has lower indent that element that the element that was a starting point,
		// it means we left a nested list. Abort searching items.
		//
		// ■ List item 1.       [listIndent=0]
		//     ○ List item 2.[] [listIndent=1], limitIndent = 1,
		//     ○ List item 3.   [listIndent=1]
		// ■ List item 4.       [listIndent=0]
		//
		// Abort searching when leave nested list.
		if ( element.getAttribute( 'listIndent' ) < limitIndent ) {
			break;
		}

		// ■ List item 1.[]     [listIndent=0] limitIndent = 0,
		//     ○ List item 2.   [listIndent=1]
		//     ○ List item 3.   [listIndent=1]
		// ■ List item 4.       [listIndent=0]
		//
		// Ignore nested lists.
		if ( element.getAttribute( 'listIndent' ) > limitIndent ) {
			continue;
		}

		// ■ List item 1.[]  [listType=bulleted]
		// 1. List item 2.   [listType=numbered]
		// 2.List item 3.    [listType=numbered]
		//
		// Abort searching when found a different kind of a list.
		if ( element.getAttribute( 'listType' ) !== listItem.getAttribute( 'listType' ) ) {
			break;
		}

		// ■ List item 1.[]  [listType=bulleted]
		// ■ List item 2.    [listType=bulleted]
		// ○ List item 3.    [listType=bulleted]
		// ○ List item 4.    [listType=bulleted]
		//
		// Abort searching when found a different list style.
		if ( element.getAttribute( 'listStyle' ) !== listItem.getAttribute( 'listStyle' ) ) {
			break;
		}

		if ( direction === 'backward' ) {
			items.unshift( element );
		} else {
			items.push( element );
		}
	}

	return items;
}
