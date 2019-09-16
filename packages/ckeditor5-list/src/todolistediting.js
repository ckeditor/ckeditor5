/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolistediting
 */

import ListCommand from './listcommand';
import ListEditing from './listediting';
import TodoListCheckCommand from './todolistcheckcommand';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import {
	modelViewInsertion,
	modelViewTextInsertion,
	dataModelViewInsertion,
	dataModelViewTextInsertion,
	dataViewModelCheckmarkInsertion,
	modelViewChangeChecked,
	modelViewChangeType
} from './todolistconverters';

import { findInRange } from './utils';

/**
 * The engine of the to-do list feature. It handles creating, editing and removing to-do lists and their items.
 *
 * It registers the entire functionality of the {@link module:list/listediting~ListEditing list editing plugin} and extends
 * it with the `'todoList'` command.
 *
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

		// Extend schema.
		model.schema.extend( 'listItem', {
			allowAttributes: [ 'todoListChecked' ]
		} );

		// Disallow todoListChecked attribute on other nodes than listItem with to-do listType.
		model.schema.addAttributeCheck( ( context, attributeName ) => {
			const item = context.last;

			if ( attributeName == 'todoListChecked' && item.name == 'listItem' && item.getAttribute( 'listType' ) != 'todo' ) {
				return false;
			}
		} );

		// Register commands.
		editor.commands.add( 'todoList', new ListCommand( editor, 'todo' ) );
		editor.commands.add( 'todoListCheck', new TodoListCheckCommand( editor ) );

		// Define converters.
		editing.downcastDispatcher.on(
			'insert:listItem',
			modelViewInsertion( model, listItem => this._handleCheckmarkChange( listItem ) ),
			{ priority: 'high' }
		);
		editing.downcastDispatcher.on( 'insert:$text', modelViewTextInsertion, { priority: 'high' } );
		data.downcastDispatcher.on( 'insert:listItem', dataModelViewInsertion( model ), { priority: 'high' } );
		data.downcastDispatcher.on( 'insert:$text', dataModelViewTextInsertion, { priority: 'high' } );

		editing.downcastDispatcher.on(
			'attribute:listType:listItem',
			modelViewChangeType( listItem => this._handleCheckmarkChange( listItem ), editing.view )
		);
		editing.downcastDispatcher.on(
			'attribute:todoListChecked:listItem',
			modelViewChangeChecked( listItem => this._handleCheckmarkChange( listItem ) )
		);

		data.upcastDispatcher.on( 'element:input', dataViewModelCheckmarkInsertion, { priority: 'high' } );

		// Collect all view nodes that have changed and use it to check if the checkbox UI element is going to
		// be re-rendered. If yes than view post-fixer should verify view structure.
		const changedViewNodes = new Set();

		Array.from( viewDocument.roots ).forEach( watchRootForViewChildChanges );
		this.listenTo( viewDocument.roots, 'add', ( evt, root ) => watchRootForViewChildChanges( root ) );

		function watchRootForViewChildChanges( viewRoot ) {
			viewRoot.on( 'change:children', ( evt, node ) => changedViewNodes.add( node ) );
		}

		// Move all uiElements after a checkbox element.
		viewDocument.registerPostFixer( writer => {
			const changedCheckmarkElements = getChangedCheckmarkElements( writer, changedViewNodes );

			changedViewNodes.clear();

			return moveUIElementsAfterCheckmark( writer, changedCheckmarkElements );
		} );

		// Move selection after a checkbox element.
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

		// Toggle check state of selected to-do list items on keystroke.
		editor.keystrokes.set( 'Ctrl+space', () => editor.execute( 'todoListCheck' ) );

		// Remove `todoListChecked` attribute when a host element is no longer a to-do list item.
		const listItemsToFix = new Set();

		this.listenTo( model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( operation.type == 'rename' && operation.oldName == 'listItem' ) {
				const item = operation.position.nodeAfter;

				if ( item.hasAttribute( 'todoListChecked' ) ) {
					listItemsToFix.add( item );
				}
			} else if ( operation.type == 'changeAttribute' && operation.key == 'listType' && operation.oldValue === 'todo' ) {
				for ( const item of operation.range.getItems() ) {
					if ( item.hasAttribute( 'todoListChecked' ) && item.getAttribute( 'listType' ) !== 'todo' ) {
						listItemsToFix.add( item );
					}
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

	/**
	 * Handles the checkbox element change, moves the selection to the corresponding model item to make it possible
	 * to toggle the `todoListChecked` attribute using the command, and restores the selection position.
	 *
	 * Some say it's a hack :) Moving the selection only for executing the command on a certain node and restoring it after,
	 * is not a clear solution. We need to design an API for using commands beyond the selection range.
	 * See https://github.com/ckeditor/ckeditor5/issues/1954.
	 *
	 * @private
	 * @param {module:engine/model/element~Element} listItem
	 */
	_handleCheckmarkChange( listItem ) {
		const editor = this.editor;
		const model = editor.model;
		const previousSelectionRanges = Array.from( model.document.selection.getRanges() );

		model.change( writer => {
			writer.setSelection( listItem, 'end' );
			editor.execute( 'todoListCheck' );
			writer.setSelection( previousSelectionRanges );
		} );
	}
}

// Moves all UI elements in the to-do list item after the checkbox element.
//
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

// Moves the selection in the to-do list item after the checkbox element.
//
// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {module:engine/view/documentselection~DocumentSelection} selection
function moveSelectionAfterCheckmark( writer, selection ) {
	if ( !selection.isCollapsed ) {
		return false;
	}

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

		writer.setSelection( writer.createRange( nextPosition ), { isBackward: selection.isBackward } );

		return true;
	}

	return false;
}

// Handles the left arrow key and moves the selection at the end of the previous block element if the selection is just after
// the checkbox element. In other words, it jumps over the checkbox element when moving the selection to the left.
//
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

// Gets the list of all checkbox elements that are going to be rendered.
//
// @private
// @param {module:engine/view/view~View>} editingView
// @param {Set.<module:engine/view/element~Element>} changedViewNodes
// @returns {Array.<module:engine/view/uielement~UIElement>}
function getChangedCheckmarkElements( editingView, changedViewNodes ) {
	const elements = [];

	for ( const element of changedViewNodes ) {
		for ( const item of editingView.createRangeIn( element ).getItems() ) {
			if ( item.is( 'uiElement' ) && item.hasClass( 'todo-list__checkmark' ) && !elements.includes( item ) && element.document ) {
				elements.push( item );
			}
		}
	}

	return elements;
}

// Returns the list item ancestor of a given element.
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
