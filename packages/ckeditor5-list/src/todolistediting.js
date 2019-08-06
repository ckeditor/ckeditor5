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
		const { editing, data } = editor;
		const viewDocument = editing.view.document;

		editor.model.schema.extend( 'listItem', {
			allowAttributes: [ 'listChecked' ]
		} );

		// Converters.
		editing.downcastDispatcher.on( 'insert:listItem', modelViewInsertion( editor.model ), { priority: 'high' } );
		editing.downcastDispatcher.on( 'insert:$text', modelViewTextInsertion, { priority: 'high' } );
		data.downcastDispatcher.on( 'insert:listItem', dataModelViewInsertion( editor.model ), { priority: 'high' } );
		data.downcastDispatcher.on( 'insert:$text', dataModelViewTextInsertion, { priority: 'high' } );

		editing.downcastDispatcher.on( 'attribute:listType:listItem', modelViewChangeType( editor.model ) );

		editing.downcastDispatcher.on( 'attribute:listChecked:listItem', modelViewChangeChecked( editor.model ) );

		// Register command for todo list.
		editor.commands.add( 'todoList', new ListCommand( editor, 'todo' ) );

		// Move selection after a checkbox element.
		viewDocument.registerPostFixer( writer => moveUIElementsAfterCheckmark( writer, this._getChangedCheckmarkElements() ) );

		// Move all uiElements after a checkbox element.
		viewDocument.registerPostFixer( writer => moveSelectionAfterCheckmark( writer, viewDocument.selection ) );

		// Remove `listChecked` attribute when a host element is no longer a todo list item.
		const listItemsToFix = new Set();

		this.listenTo( editor.model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			if ( operation.type != 'changeAttribute' && operation.key != 'listType' && operation.oldValue == 'todoList' ) {
				for ( const item of operation.range.getItems() ) {
					if ( item.name == 'listItem' && item.hasAttribute( 'listChecked' ) ) {
						listItemsToFix.add( item );
					}
				}
			}

			if ( operation.type == 'rename' && operation.oldName == 'listItem' ) {
				const item = operation.position.nodeAfter;

				if ( item.hasAttribute( 'listChecked' ) ) {
					listItemsToFix.add( item );
				}
			}
		} );

		editor.model.document.registerPostFixer( writer => {
			let hasChanged = false;

			for ( const listItem of listItemsToFix ) {
				writer.removeAttribute( 'listChecked', listItem );
				hasChanged = true;
			}

			listItemsToFix.clear();

			return hasChanged;
		} );

		// Jump at the end of the previous node on left arrow key press, when selection is after the checkbox.
		//
		// <blockquote><p>Foo</p></blockquote>
		// <ul><li><checkbox/>{}Bar</li></ul>
		//
		// press: `<-`
		//
		// <blockquote><p>Foo{}</p></blockquote>
		// <ul><li><checkbox/>Bar</li></ul>
		editor.keystrokes.set( 'arrowleft', ( evt, stop ) => {
			const schema = editor.model.schema;
			const selection = editor.model.document.selection;

			if ( !selection.isCollapsed ) {
				return;
			}

			const position = selection.getFirstPosition();
			const parent = position.parent;

			if ( parent.name === 'listItem' && parent.getAttribute( 'listType' ) == 'todo' && position.isAtStart ) {
				stop();

				const newRange = schema.getNearestSelectionRange( editor.model.createPositionBefore( parent ), 'backward' );

				if ( newRange ) {
					editor.model.change( writer => writer.setSelection( newRange ) );
				}
			}
		} );
	}

	/**
	 * Gets list of all checkmark elements that are going to be rendered.
	 *
	 * @private
	 * @returns {Array.<module:engine/view/uielement~UIElement>}
	 */
	_getChangedCheckmarkElements() {
		const editingView = this.editor.editing.view;
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
}

// @private
// @param {module:engine/view/downcastwriter~DowncastWriter} writer
// @param {Array.<module:engine/view/uielement~UIElement>} uiElements
// @returns {Boolean}
function moveUIElementsAfterCheckmark( writer, uiElements ) {
	let hasChanged = false;

	for ( const uiElement of uiElements ) {
		const listItem = getListItemAncestor( uiElement );
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
	if ( !selection.isCollapsed ) {
		return false;
	}

	const position = selection.getFirstPosition();

	if ( position.parent.name === 'li' && position.offset == 0 && position.nodeAfter && position.nodeAfter.is( 'uiElement' ) ) {
		writer.setSelection( position.parent, 1 );

		return true;
	}

	return false;
}

// @private
// @param {module:engine/view/uielement~UIElement} element
function getListItemAncestor( element ) {
	for ( const parent of element.getAncestors( { parentFirst: true } ) ) {
		if ( parent.name == 'li' ) {
			return parent;
		}
	}
}
