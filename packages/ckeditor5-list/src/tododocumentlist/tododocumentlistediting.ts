/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/tododocumentlist/tododocumentlistediting
 */

import {
	Matcher,
	type UpcastElementEvent,
	type Element,
	type MatcherPattern,
	type ViewDocumentKeyDownEvent
} from 'ckeditor5/src/engine';

import {
	getCode,
	parseKeystroke,
	type GetCallback
} from 'ckeditor5/src/utils';

import { Plugin } from 'ckeditor5/src/core';

import { isFirstBlockOfListItem, isListItemBlock } from '../documentlist/utils/model';
import DocumentListEditing, {
	type DocumentListEditingCheckParagraphEvent,
	type DocumentListEditingPostFixerEvent
} from '../documentlist/documentlistediting';
import DocumentListCommand from '../documentlist/documentlistcommand';
import CheckTodoDocumentListCommand from './checktododocumentlistcommand';
import TodoCheckboxChangeObserver, { type ViewDocumentTodoCheckboxChangeEvent } from './todocheckboxchangeobserver';

const ITEM_TOGGLE_KEYSTROKE = parseKeystroke( 'Ctrl+Enter' );

/**
 * TODO
 */
export default class TodoDocumentListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TodoDocumentListEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DocumentListEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;
		const editing = editor.editing;

		editor.commands.add( 'todoList', new DocumentListCommand( editor, 'todo' ) );
		editor.commands.add( 'checkTodoList', new CheckTodoDocumentListCommand( editor ) );

		editing.view.addObserver( TodoCheckboxChangeObserver );

		model.schema.extend( '$container', { allowAttributes: 'todoListChecked' } );
		model.schema.extend( '$block', { allowAttributes: 'todoListChecked' } );
		model.schema.extend( '$blockObject', { allowAttributes: 'todoListChecked' } );

		model.schema.addAttributeCheck( ( context, attributeName ) => {
			const item = context.last;

			if ( attributeName != 'todoListChecked' ) {
				return;
			}

			if ( !item.getAttribute( 'listItemId' ) || item.getAttribute( 'listType' ) != 'todo' ) {
				return false;
			}
		} );

		editor.conversion.for( 'upcast' ).add( dispatcher => {
			// Upcast of to-do list item is based on a checkbox at the beginning of a <li> to keep compatibility with markdown input.
			dispatcher.on( 'element:input', todoItemInputConverter() );

			// Consume other elements that are normally generated in data downcast, so they won't get captured by GHS.
			dispatcher.on( 'element:label', elementUpcastConsumingConverter(
				{ name: 'label', classes: 'todo-list__label' }
			) );
			dispatcher.on( 'element:span', elementUpcastConsumingConverter(
				{ name: 'span', classes: 'todo-list__label__description' }
			) );
			dispatcher.on( 'element:ul', attributeUpcastConsumingConverter(
				{ name: 'ul', classes: 'todo-list' }
			) );
		} );

		editor.conversion.for( 'downcast' ).elementToElement( {
			model: 'paragraph',
			view: ( element, { writer } ) => {
				if ( isFirstBlockOfListItem( element ) && element.getAttribute( 'listType' ) == 'todo' ) {
					return writer.createContainerElement( 'span', { class: 'todo-list__label__description' } );
				}
			},
			converterPriority: 'highest'
		} );

		const documentListEditing = editor.plugins.get( DocumentListEditing );

		documentListEditing.registerDowncastStrategy( {
			attributeName: 'listType',
			scope: 'list',
			setAttributeOnDowncast( writer, value, element ) {
				if ( value == 'todo' ) {
					writer.addClass( 'todo-list', element );
				} else {
					writer.removeClass( 'todo-list', element );
				}
			}
		} );

		documentListEditing.registerDowncastStrategy( {
			attributeName: 'listType',
			scope: 'itemMarker',
			createElement( writer, value, element, { dataPipeline } ) {
				if ( value != 'todo' ) {
					return null;
				}

				const viewElement = writer.createEmptyElement( 'input', {
					type: 'checkbox',
					...( element.getAttribute( 'todoListChecked' ) ?
						{ checked: 'checked' } :
						null
					),
					... ( dataPipeline ?
						{ disabled: 'disabled' } :
						{ tabindex: '-1' }
					)
				} );

				if ( dataPipeline ) {
					return viewElement;
				}

				return writer.createContainerElement( 'span', { contenteditable: 'false' }, viewElement );
			}
		} );

		// Just mark the todoListChecked attribute as a list attribute that could trigger conversion.
		documentListEditing.registerDowncastStrategy( {
			attributeName: 'todoListChecked',
			scope: 'itemMarker',
			createElement() {
				return null;
			}
		} );

		documentListEditing.on<DocumentListEditingCheckParagraphEvent>( 'checkParagraph', ( evt, { modelElement, viewElement } ) => {
			const hasViewClass = viewElement.hasClass( 'todo-list__label__description' );
			const isModelTodoList = modelElement.getAttribute( 'listType' ) == 'todo';

			if ( hasViewClass != isModelTodoList ) {
				evt.return = true;
				evt.stop();
			}
		} );

		// Make sure that all blocks of the same list item have the same todoListChecked.
		documentListEditing.on<DocumentListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			for ( const { node, previousNodeInList } of listNodes ) {
				// This is a first item of a nested list.
				if ( !previousNodeInList ) {
					continue;
				}

				if ( previousNodeInList.getAttribute( 'listItemId' ) != node.getAttribute( 'listItemId' ) ) {
					continue;
				}

				const previousHasAttribute = previousNodeInList.hasAttribute( 'todoListChecked' );
				const nodeHasAttribute = node.hasAttribute( 'todoListChecked' );

				if ( nodeHasAttribute && !previousHasAttribute ) {
					writer.removeAttribute( 'todoListChecked', node );
					evt.return = true;
				}
				else if ( !nodeHasAttribute && previousHasAttribute ) {
					writer.setAttribute( 'todoListChecked', true, node );
					evt.return = true;
				}
			}
		} );

		// Make sure that todoListChecked attribute is only present for to-do list items.
		model.document.registerPostFixer( writer => {
			const changes = model.document.differ.getChanges();
			let wasFixed = false;

			for ( const change of changes ) {
				if ( change.type == 'attribute' && change.attributeKey == 'listType' ) {
					const element = change.range.start.nodeAfter!;

					if ( change.attributeOldValue == 'todo' && element.hasAttribute( 'todoListChecked' ) ) {
						writer.removeAttribute( 'todoListChecked', element );
						wasFixed = true;
					}
				} else if ( change.type == 'insert' && change.name != '$text' ) {
					for ( const { item } of writer.createRangeOn( change.position.nodeAfter! ) ) {
						if ( item.is( 'element' ) && item.getAttribute( 'listType' ) != 'todo' && item.hasAttribute( 'todoListChecked' ) ) {
							writer.removeAttribute( 'todoListChecked', item );
							wasFixed = true;
						}
					}
				}
			}

			return wasFixed;
		} );

		// Toggle check state of selected to-do list items on keystroke.
		this.listenTo<ViewDocumentKeyDownEvent>( editing.view.document, 'keydown', ( evt, data ) => {
			if ( getCode( data ) === ITEM_TOGGLE_KEYSTROKE ) {
				editor.execute( 'checkTodoList' );
				evt.stop();
			}
		}, { priority: 'high' } );

		this.listenTo<ViewDocumentTodoCheckboxChangeEvent>( editing.view.document, 'todoCheckboxChange', ( evt, data ) => {
			const viewTarget = data.target;

			if ( !viewTarget || !viewTarget.is( 'element', 'input' ) ) {
				return;
			}

			const viewPositionAfter = editing.view.createPositionAfter( viewTarget );
			const modelPositionAfter = editing.mapper.toModelPosition( viewPositionAfter );
			const modelElement = modelPositionAfter.nodeAfter;

			if ( modelElement && isListItemBlock( modelElement ) && modelElement.getAttribute( 'listType' ) == 'todo' ) {
				this._handleCheckmarkChange( modelElement );
			}
		} );

		editing.mapper.registerViewToModelLength( 'input', viewElement => {
			if (
				viewElement.getAttribute( 'type' ) == 'checkbox' &&
				viewElement.parent!.name == 'li'
			) {
				return 0;
			}

			return editing.mapper.toModelElement( viewElement ) ? 1 : 0;
		} );
	}

	/**
	 * Handles the checkbox element change, moves the selection to the corresponding model item to make it possible
	 * to toggle the `todoListChecked` attribute using the command, and restores the selection position.
	 *
	 * Some say it's a hack :) Moving the selection only for executing the command on a certain node and restoring it after,
	 * is not a clear solution. We need to design an API for using commands beyond the selection range.
	 * See https://github.com/ckeditor/ckeditor5/issues/1954.
	 */
	private _handleCheckmarkChange( listItem: Element ): void {
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

/**
 * TODO
 */
function todoItemInputConverter(): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const modelCursor = data.modelCursor;
		const modelItem = modelCursor.parent as Element;
		const viewItem = data.viewItem;

		if ( viewItem.getAttribute( 'type' ) != 'checkbox' || !modelCursor.isAtStart || !modelItem.hasAttribute( 'listType' ) ) {
			return;
		}

		if ( !conversionApi.consumable.consume( viewItem, { name: true } ) ) {
			return;
		}

		const writer = conversionApi.writer;

		writer.setAttribute( 'listType', 'todo', modelItem );

		if ( data.viewItem.hasAttribute( 'checked' ) ) {
			writer.setAttribute( 'todoListChecked', true, modelItem );
		}

		data.modelRange = writer.createRange( modelCursor );
	};
}

/**
 * TODO
 */
function elementUpcastConsumingConverter( matcherPattern: MatcherPattern ): GetCallback<UpcastElementEvent> {
	const matcher = new Matcher( matcherPattern );

	return ( evt, data, conversionApi ) => {
		const matcherResult = matcher.match( data.viewItem );

		if ( !matcherResult ) {
			return;
		}

		if ( !conversionApi.consumable.consume( data.viewItem, matcherResult.match ) ) {
			return;
		}

		Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
	};
}

/**
 * TODO
 */
function attributeUpcastConsumingConverter( matcherPattern: MatcherPattern ): GetCallback<UpcastElementEvent> {
	const matcher = new Matcher( matcherPattern );

	return ( evt, data, conversionApi ) => {
		const matcherResult = matcher.match( data.viewItem );

		if ( !matcherResult ) {
			return;
		}

		const match = matcherResult.match;

		match.name = false;
		conversionApi.consumable.consume( data.viewItem, match );
	};
}
