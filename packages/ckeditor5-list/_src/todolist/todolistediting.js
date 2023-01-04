/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolist/todolistediting
 */

import { Plugin } from 'ckeditor5/src/core';
import {
	getCode,
	parseKeystroke,
	getLocalizedArrowKeyCodeDirection
} from 'ckeditor5/src/utils';

import ListCommand from '../list/listcommand';
import ListEditing from '../list/listediting';
import CheckTodoListCommand from './checktodolistcommand';
import {
	dataModelViewInsertion,
	dataViewModelCheckmarkInsertion,
	mapModelToViewPosition,
	modelViewChangeChecked,
	modelViewChangeType,
	modelViewInsertion
} from './todolistconverters';

const ITEM_TOGGLE_KEYSTROKE = parseKeystroke( 'Ctrl+Enter' );

/**
 * The engine of the to-do list feature. It handles creating, editing and removing to-do lists and their items.
 *
 * It registers the entire functionality of the {@link module:list/list/listediting~ListEditing list editing plugin} and extends
 * it with the commands:
 *
 * - `'todoList'`,
 * - `'checkTodoList'`,
 * - `'todoListCheck'` as an alias for `checkTodoList` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TodoListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TodoListEditing';
	}

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

		// Register `todoList` command.
		editor.commands.add( 'todoList', new ListCommand( editor, 'todo' ) );

		const checkTodoListCommand = new CheckTodoListCommand( editor );

		// Register `checkTodoList` command and add `todoListCheck` command as an alias for backward compatibility.
		editor.commands.add( 'checkTodoList', checkTodoListCommand );
		editor.commands.add( 'todoListCheck', checkTodoListCommand );

		// Define converters.
		data.downcastDispatcher.on( 'insert:listItem', dataModelViewInsertion( model ), { priority: 'high' } );
		data.upcastDispatcher.on( 'element:input', dataViewModelCheckmarkInsertion, { priority: 'high' } );

		editing.downcastDispatcher.on(
			'insert:listItem',
			modelViewInsertion( model, listItem => this._handleCheckmarkChange( listItem ) ),
			{ priority: 'high' }
		);
		editing.downcastDispatcher.on(
			'attribute:listType:listItem',
			modelViewChangeType( listItem => this._handleCheckmarkChange( listItem ), editing.view )
		);
		editing.downcastDispatcher.on(
			'attribute:todoListChecked:listItem',
			modelViewChangeChecked( listItem => this._handleCheckmarkChange( listItem ) )
		);

		editing.mapper.on( 'modelToViewPosition', mapModelToViewPosition( editing.view ) );
		data.mapper.on( 'modelToViewPosition', mapModelToViewPosition( editing.view ) );

		// Jump at the end of the previous node on left arrow key press, when selection is after the checkbox.
		//
		// <blockquote><p>Foo</p></blockquote>
		// <ul><li><checkbox/>{}Bar</li></ul>
		//
		// press: `<-`
		//
		// <blockquote><p>Foo{}</p></blockquote>
		// <ul><li><checkbox/>Bar</li></ul>
		//
		this.listenTo( editing.view.document, 'arrowKey', jumpOverCheckmarkOnSideArrowKeyPress( model, editor.locale ), { context: 'li' } );

		// Toggle check state of selected to-do list items on keystroke.
		this.listenTo( editing.view.document, 'keydown', ( evt, data ) => {
			if ( getCode( data ) === ITEM_TOGGLE_KEYSTROKE ) {
				editor.execute( 'checkTodoList' );
				evt.stop();
			}
		}, { priority: 'high' } );

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
			editor.execute( 'checkTodoList' );
			writer.setSelection( previousSelectionRanges );
		} );
	}
}

// Handles the left/right (LTR/RTL content) arrow key and moves the selection at the end of the previous block element
// if the selection is just after the checkbox element. In other words, it jumps over the checkbox element when
// moving the selection to the left/right (LTR/RTL).
//
// @private
// @param {module:engine/model/model~Model} model
// @param {module:utils/locale~Locale} locale
// @returns {Function} Callback for 'keydown' events.
function jumpOverCheckmarkOnSideArrowKeyPress( model, locale ) {
	return ( eventInfo, domEventData ) => {
		const direction = getLocalizedArrowKeyCodeDirection( domEventData.keyCode, locale.contentLanguageDirection );

		if ( direction != 'left' ) {
			return;
		}

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
				model.change( writer => writer.setSelection( newRange ) );
			}

			domEventData.preventDefault();
			domEventData.stopPropagation();
			eventInfo.stop();
		}
	};
}
