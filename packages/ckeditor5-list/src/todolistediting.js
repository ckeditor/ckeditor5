/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolistediting
 */

import ListCommand from './listcommand';
import ListEditing from './listediting';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import {
	modelViewInsertion,
	modelViewTextInsertion,
	dataModelViewInsertion,
	dataModelViewTextInsertion,
	modelViewChangeChecked,
	modelViewChangeType
} from './todolistconverters';

import { findInRange } from './utils';

/**
 * @extends module:core/plugin~Plugin
 */
export default class TodoListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ListEditing ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const { editing, data, model } = editor;
		const viewDocument = editing.view.document;

		model.schema.extend( 'listItem', {
			allowAttributes: [ 'todoListChecked' ]
		} );

		// Converters.
		editing.downcastDispatcher.on( 'insert:listItem', modelViewInsertion( model ), { priority: 'high' } );
		editing.downcastDispatcher.on( 'insert:$text', modelViewTextInsertion, { priority: 'high' } );
		data.downcastDispatcher.on( 'insert:listItem', dataModelViewInsertion( model ), { priority: 'high' } );
		data.downcastDispatcher.on( 'insert:$text', dataModelViewTextInsertion, { priority: 'high' } );

		editing.downcastDispatcher.on( 'attribute:listType:listItem', modelViewChangeType( model ) );
		editing.downcastDispatcher.on( 'attribute:todoListChecked:listItem', modelViewChangeChecked( model ) );

		// Register command for todo list.
		editor.commands.add( 'todoList', new ListCommand( editor, 'todo' ) );

		// Move selection after a checkbox element.
		viewDocument.registerPostFixer( writer => moveUIElementsAfterCheckmark( writer, getChangedCheckmarkElements( editing.view ) ) );

		// Move all uiElements after a checkbox element.
		viewDocument.registerPostFixer( writer => moveSelectionAfterCheckmark( writer, viewDocument.selection ) );

		// Jump at the end of the previous node on left arrow key press, when selection is after the checkbox.
		//
		// <blockquote><p>Foo</p></blockquote>
		// <ul><li><checkbox/>{}Bar</li></ul>
		//
		// press: `<-`
		//
		// <blockquote><p>Foo{}</p></blockquote>
		// <ul><li><checkbox/>Bar</li></ul>
		editor.keystrokes.set( 'arrowleft', ( evt, stop ) => jumpOverCheckmarkOnLeftArrowKeyPress( stop, model ) );

		// Remove `todoListChecked` attribute when a host element is no longer a todo list item.
		const listItemsToFix = new Set();

		this.listenTo( model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( operation.type == 'rename' && operation.oldName == 'listItem' ) {
				const item = operation.position.nodeAfter;

				if ( item.hasAttribute( 'todoListChecked' ) ) {
					listItemsToFix.add( item );
				}
			}
		} );

		model.document.registerPostFixer( writer => {
			let hasChanged = false;

			for ( const listItem of listItemsToFix ) {
				writer.removeAttribute( 'todoListChecked', listItem );
				hasChanged = true;
			}

			listItemsToFix.clear();

			return hasChanged;
		} );
	}
}

// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {Array.<module:engine/view/uielement~UIElement>} uiElements
// @returns {Boolean}
function moveUIElementsAfterCheckmark( writer, uiElements ) {
	let hasChanged = false;

	for ( const uiElement of uiElements ) {
		const listItem = findViewListItemAncestor( uiElement );
		const positionAtListItem = writer.createPositionAt( listItem, 0 );
		const positionBeforeUiElement = writer.createPositionBefore( uiElement );

		if ( positionAtListItem.isEqual( positionBeforeUiElement ) ) {
			continue;
		}

		const range = writer.createRange( positionAtListItem, positionBeforeUiElement );

		for ( const item of Array.from( range.getItems() ) ) {
			if ( item.is( 'uiElement' ) ) {
				writer.move( writer.createRangeOn( item ), writer.createPositionAfter( uiElement ) );
				hasChanged = true;
			}
		}
	}

	return hasChanged;
}

// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {module:engine/view/documentselection~DocumentSelection} selection
function moveSelectionAfterCheckmark( writer, selection ) {
	const positionToChange = selection.getFirstPosition();

	if ( positionToChange.parent.name != 'li' || !positionToChange.parent.parent.hasClass( 'todo-list' ) ) {
		return false;
	}

	const parentEndPosition = writer.createPositionAt( positionToChange.parent, 'end' );
	const uiElement = findInRange( writer.createRange( positionToChange, parentEndPosition ), item => {
		return ( item.is( 'uiElement' ) && item.hasClass( 'todo-list__checkmark' ) ) ? item : false;
	} );

	if ( uiElement && !positionToChange.isAfter( writer.createPositionBefore( uiElement ) ) ) {
		const boundaries = writer.createRange( writer.createPositionAfter( uiElement ), parentEndPosition );
		const text = findInRange( boundaries, item => item.is( 'textProxy' ) ? item.textNode : false );
		const nextPosition = text ? writer.createPositionAt( text, 0 ) : parentEndPosition;

		let range;

		if ( selection.isCollapsed ) {
			range = writer.createRange( nextPosition );
		} else {
			range = writer.createRange( nextPosition, selection.getLastPosition() );
		}

		writer.setSelection( range, { isBackward: selection.isBackward } );

		return true;
	}

	return false;
}

// @private
// @param {Function} stopKeyEvent
// @param {module:engine/model/model~Model} model
function jumpOverCheckmarkOnLeftArrowKeyPress( stopKeyEvent, model ) {
	const schema = model.schema;
	const selection = model.document.selection;

	if ( !selection.isCollapsed ) {
		return;
	}

	const position = selection.getFirstPosition();
	const parent = position.parent;

	if ( parent.name === 'listItem' && parent.getAttribute( 'listType' ) == 'todo' && position.isAtStart ) {
		const newRange = schema.getNearestSelectionRange( model.createPositionBefore( parent ), 'backward' );

		if ( newRange ) {
			stopKeyEvent();
			model.change( writer => writer.setSelection( newRange ) );
		}
	}
}

// Gets list of all checkmark elements that are going to be rendered.
//
// @private
// @returns {Array.<module:engine/view/uielement~UIElement>}
function getChangedCheckmarkElements( editingView ) {
	const elements = [];

	for ( const element of Array.from( editingView._renderer.markedChildren ) ) {
		for ( const item of editingView.createRangeIn( element ).getItems() ) {
			if ( item.is( 'uiElement' ) && item.hasClass( 'todo-list__checkmark' ) && !elements.includes( item ) ) {
				elements.push( item );
			}
		}
	}

	return elements;
}

// Returns list item ancestor of given element.
//
// @private
// @param {module:engine/view/item~Item} item
// @returns {module:engine/view/element~Element}
function findViewListItemAncestor( item ) {
	for ( const parent of item.getAncestors( { parentFirst: true } ) ) {
		if ( parent.name == 'li' ) {
			return parent;
		}
	}
}
