/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/legacytodolist/legacytodolistediting
 */

import type {
	DowncastAttributeEvent,
	DowncastInsertEvent,
	Element,
	Item,
	MapperModelToViewPositionEvent,
	Model,
	ModelApplyOperationEvent,
	UpcastElementEvent,
	ViewDocumentArrowKeyEvent,
	ViewDocumentKeyDownEvent,
	AttributeOperation,
	RenameOperation,
	SelectionChangeRangeEvent,
	DocumentFragment
} from 'ckeditor5/src/engine.js';

import { Plugin } from 'ckeditor5/src/core.js';

import {
	getCode,
	parseKeystroke,
	getLocalizedArrowKeyCodeDirection,
	type Locale,
	type GetCallback
} from 'ckeditor5/src/utils.js';

import LegacyListCommand from '../legacylist/legacylistcommand.js';
import LegacyListEditing from '../legacylist/legacylistediting.js';
import LegacyCheckTodoListCommand from './legacychecktodolistcommand.js';
import {
	dataModelViewInsertion,
	dataViewModelCheckmarkInsertion,
	mapModelToViewPosition,
	modelViewChangeChecked,
	modelViewChangeType,
	modelViewInsertion
} from './legacytodolistconverters.js';

const ITEM_TOGGLE_KEYSTROKE = /* #__PURE__ */ parseKeystroke( 'Ctrl+Enter' );

/**
 * The engine of the to-do list feature. It handles creating, editing and removing to-do lists and their items.
 *
 * It registers the entire functionality of the {@link module:list/legacylist/legacylistediting~LegacyListEditing legacy list editing
 * plugin} and extends it with the commands:
 *
 * - `'todoList'`,
 * - `'checkTodoList'`,
 * - `'todoListCheck'` as an alias for `checkTodoList` command.
 */
export default class LegacyTodoListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LegacyTodoListEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ LegacyListEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const { editing, data, model } = editor;

		// Extend schema.
		model.schema.extend( 'listItem', {
			allowAttributes: [ 'todoListChecked' ]
		} );

		// Disallow todoListChecked attribute on other nodes than listItem with to-do listType.
		model.schema.addAttributeCheck( ( context: any, attributeName ) => {
			const item = context.last;

			if ( attributeName == 'todoListChecked' && item.name == 'listItem' && item.getAttribute( 'listType' ) != 'todo' ) {
				return false;
			}
		} );

		// Register `todoList` command.
		editor.commands.add( 'todoList', new LegacyListCommand( editor, 'todo' ) );

		const checkTodoListCommand = new LegacyCheckTodoListCommand( editor );

		// Register `checkTodoList` command and add `todoListCheck` command as an alias for backward compatibility.
		editor.commands.add( 'checkTodoList', checkTodoListCommand );
		editor.commands.add( 'todoListCheck', checkTodoListCommand );

		// Define converters.
		data.downcastDispatcher.on<DowncastInsertEvent<Element>>(
			'insert:listItem',
			dataModelViewInsertion( model ),
			{ priority: 'high' }
		);
		data.upcastDispatcher.on<UpcastElementEvent>(
			'element:input',
			dataViewModelCheckmarkInsertion,
			{ priority: 'high' }
		);

		editing.downcastDispatcher.on<DowncastInsertEvent<Element>>(
			'insert:listItem',
			modelViewInsertion( model, listItem => this._handleCheckmarkChange( listItem ) ),
			{ priority: 'high' }
		);
		editing.downcastDispatcher.on<DowncastAttributeEvent<Element>>(
			'attribute:listType:listItem',
			modelViewChangeType( listItem => this._handleCheckmarkChange( listItem ), editing.view )
		);
		editing.downcastDispatcher.on<DowncastAttributeEvent<Element>>(
			'attribute:todoListChecked:listItem',
			modelViewChangeChecked( listItem => this._handleCheckmarkChange( listItem ) )
		);

		editing.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', mapModelToViewPosition( editing.view ) );
		data.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', mapModelToViewPosition( editing.view ) );

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
		this.listenTo<ViewDocumentArrowKeyEvent>(
			editing.view.document,
			'arrowKey',
			jumpOverCheckmarkOnSideArrowKeyPress( model, editor.locale ),
			{ context: 'li' }
		);

		// Toggle check state of selected to-do list items on keystroke.
		this.listenTo<ViewDocumentKeyDownEvent>( editing.view.document, 'keydown', ( evt, data ) => {
			if ( getCode( data ) === ITEM_TOGGLE_KEYSTROKE ) {
				editor.execute( 'checkTodoList' );
				evt.stop();
			}
		}, { priority: 'high' } );

		// Remove `todoListChecked` attribute when a host element is no longer a to-do list item.
		const listItemsToFix = new Set<Item>();

		this.listenTo<ModelApplyOperationEvent>( model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ] as RenameOperation | AttributeOperation;

			if ( operation.type == 'rename' && operation.oldName == 'listItem' ) {
				const item = operation.position.nodeAfter!;

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

		this._initAriaAnnouncements();
	}

	/**
	 * Handles the checkbox element change, moves the selection to the corresponding model item to make it possible
	 * to toggle the `todoListChecked` attribute using the command, and restores the selection position.
	 *
	 * Some say it's a hack :) Moving the selection only for executing the command on a certain node and restoring it after,
	 * is not a clear solution. We need to design an API for using commands beyond the selection range.
	 * See https://github.com/ckeditor/ckeditor5/issues/1954.
	 */
	private _handleCheckmarkChange( listItem: Element ) {
		const editor = this.editor;
		const model = editor.model;
		const previousSelectionRanges = Array.from( model.document.selection.getRanges() );

		model.change( writer => {
			writer.setSelection( listItem, 'end' );
			editor.execute( 'checkTodoList' );
			writer.setSelection( previousSelectionRanges );
		} );
	}

	/**
	 * Observe when user enters or leaves todo list and set proper aria value in global live announcer.
	 * This allows screen readers to indicate when the user has entered and left the specified todo list.
	 *
	 * @internal
	 */
	private _initAriaAnnouncements( ) {
		const { model, ui, t } = this.editor;
		let lastFocusedCodeBlock: Element | DocumentFragment | null = null;

		if ( !ui ) {
			return;
		}

		model.document.selection.on<SelectionChangeRangeEvent>( 'change:range', () => {
			const focusParent = model.document.selection.focus!.parent;
			const lastElementIsTodoList = isLegacyTodoListItemElement( lastFocusedCodeBlock );
			const currentElementIsTodoList = isLegacyTodoListItemElement( focusParent );

			if ( lastElementIsTodoList && !currentElementIsTodoList ) {
				ui.ariaLiveAnnouncer.announce( t( 'Leaving a to-do list' ) );
			} else if ( !lastElementIsTodoList && currentElementIsTodoList ) {
				ui.ariaLiveAnnouncer.announce( t( 'Entering a to-do list' ) );
			}

			lastFocusedCodeBlock = focusParent;
		} );
	}
}

/**
 * Handles the left/right (LTR/RTL content) arrow key and moves the selection at the end of the previous block element
 * if the selection is just after the checkbox element. In other words, it jumps over the checkbox element when
 * moving the selection to the left/right (LTR/RTL).
 *
 * @returns Callback for 'keydown' events.
 */
function jumpOverCheckmarkOnSideArrowKeyPress( model: Model, locale: Locale ): GetCallback<ViewDocumentArrowKeyEvent> {
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

		const position = selection.getFirstPosition()!;
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

/**
 * Returns true if the given element is a list item model element of a to-do list.
 */
function isLegacyTodoListItemElement( element: Element | DocumentFragment | null ): boolean {
	return !!element && element.is( 'element', 'listItem' ) && element.getAttribute( 'listType' ) === 'todo';
}
