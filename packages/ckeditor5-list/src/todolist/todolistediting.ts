/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todolist/todolistediting
 */

import {
	Matcher,
	type UpcastElementEvent,
	type Model,
	type MatcherPattern,
	type ViewElement,
	type ViewDocumentKeyDownEvent,
	type ViewDocumentArrowKeyEvent,
	type MapperViewToModelPositionEvent,
	type ViewDocumentFragment,
	type SelectionChangeRangeEvent,
	type DocumentFragment,
	type Element
} from 'ckeditor5/src/engine.js';

import {
	getCode,
	parseKeystroke,
	getLocalizedArrowKeyCodeDirection,
	type GetCallback,
	type Locale
} from 'ckeditor5/src/utils.js';

import { Plugin } from 'ckeditor5/src/core.js';

import { getAllListItemBlocks, isFirstBlockOfListItem, isListItemBlock } from '../list/utils/model.js';
import ListEditing, {
	type ListEditingCheckElementEvent,
	type ListEditingPostFixerEvent
} from '../list/listediting.js';
import ListCommand from '../list/listcommand.js';
import CheckTodoListCommand from './checktodolistcommand.js';
import TodoCheckboxChangeObserver, { type ViewDocumentTodoCheckboxChangeEvent } from './todocheckboxchangeobserver.js';

const ITEM_TOGGLE_KEYSTROKE = /* #__PURE__ */ parseKeystroke( 'Ctrl+Enter' );

/**
 * The engine of the to-do list feature. It handles creating, editing and removing to-do lists and their items.
 *
 * It registers the entire functionality of the {@link module:list/list/listediting~ListEditing list editing plugin}
 * and extends it with the commands:
 *
 * - `'todoList'`,
 * - `'checkTodoList'`,
 */
export default class TodoListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TodoListEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ListEditing ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;
		const editing = editor.editing;
		const listEditing = editor.plugins.get( ListEditing );
		const multiBlock = editor.config.get( 'list.multiBlock' );
		const elementName = multiBlock ? 'paragraph' : 'listItem';

		editor.commands.add( 'todoList', new ListCommand( editor, 'todo' ) );
		editor.commands.add( 'checkTodoList', new CheckTodoListCommand( editor ) );

		editing.view.addObserver( TodoCheckboxChangeObserver );

		model.schema.extend( '$listItem', { allowAttributes: 'todoListChecked' } );

		model.schema.addAttributeCheck( context => {
			const item = context.last;

			// Don't allow `todoListChecked` attribute on elements which are not todo list items.
			if ( !item.getAttribute( 'listItemId' ) || item.getAttribute( 'listType' ) != 'todo' ) {
				return false;
			}
		}, 'todoListChecked' );

		editor.conversion.for( 'upcast' ).add( dispatcher => {
			// Upcast of to-do list item is based on a checkbox at the beginning of a <li> to keep compatibility with markdown input.
			dispatcher.on( 'element:input', todoItemInputConverter() );

			// Priority is set to low to allow generic list item converter to run first.
			dispatcher.on( 'element:li', todoListItemUpcastConverter(), {
				priority: 'low'
			} );

			// Consume other elements that are normally generated in data downcast, so they won't get captured by GHS.
			dispatcher.on( 'element:label', elementUpcastConsumingConverter(
				{ name: 'label', classes: 'todo-list__label' }
			) );
			dispatcher.on( 'element:label', elementUpcastConsumingConverter(
				{ name: 'label', classes: [ 'todo-list__label', 'todo-list__label_without-description' ] }
			) );
			dispatcher.on( 'element:span', elementUpcastConsumingConverter(
				{ name: 'span', classes: 'todo-list__label__description' }
			) );

			dispatcher.on( 'element:ul', attributeUpcastConsumingConverter(
				{ name: 'ul', classes: 'todo-list' }
			) );
		} );

		editor.conversion.for( 'downcast' ).elementToElement( {
			model: elementName,
			view: ( element, { writer } ) => {
				if ( isDescriptionBlock( element, listEditing.getListAttributeNames() ) ) {
					return writer.createContainerElement( 'span', { class: 'todo-list__label__description' } );
				}
			},
			converterPriority: 'highest'
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'listType',

			setAttributeOnDowncast( writer, value, element ) {
				if ( value == 'todo' ) {
					writer.addClass( 'todo-list', element );
				} else {
					writer.removeClass( 'todo-list', element );
				}
			}
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'itemMarker',
			attributeName: 'todoListChecked',

			createElement( writer, modelElement, { dataPipeline } ) {
				if ( modelElement.getAttribute( 'listType' ) != 'todo' ) {
					return null;
				}

				const viewElement = writer.createUIElement( 'input', {
					type: 'checkbox',
					...( modelElement.getAttribute( 'todoListChecked' ) ?
						{ checked: 'checked' } :
						null
					),
					...( dataPipeline ?
						{ disabled: 'disabled' } :
						{ tabindex: '-1' }
					)
				} );

				if ( dataPipeline ) {
					return viewElement;
				}

				const wrapper = writer.createContainerElement( 'span', { contenteditable: 'false' }, viewElement );

				wrapper.getFillerOffset = () => null;

				return wrapper;
			},

			canWrapElement( modelElement ) {
				return isDescriptionBlock( modelElement, listEditing.getListAttributeNames() );
			},

			createWrapperElement( writer, modelElement, { dataPipeline } ) {
				const classes = [ 'todo-list__label' ];

				if ( !isDescriptionBlock( modelElement, listEditing.getListAttributeNames() ) ) {
					classes.push( 'todo-list__label_without-description' );
				}

				return writer.createAttributeElement( dataPipeline ? 'label' : 'span', {
					class: classes.join( ' ' )
				} );
			}
		} );

		// Verifies if a to-do list block requires reconversion of a first item downcasted as an item description.
		listEditing.on<ListEditingCheckElementEvent>( 'checkElement', ( evt, { modelElement, viewElement } ) => {
			const isFirstTodoModelParagraphBlock = isDescriptionBlock( modelElement, listEditing.getListAttributeNames() );
			const hasViewClass = viewElement.hasClass( 'todo-list__label__description' );

			if ( hasViewClass != isFirstTodoModelParagraphBlock ) {
				evt.return = true;
				evt.stop();
			}
		} );

		// Verifies if a to-do list block requires reconversion of a checkbox element
		// (for example there is a new paragraph inserted as a first block of a list item).
		listEditing.on<ListEditingCheckElementEvent>( 'checkElement', ( evt, { modelElement, viewElement } ) => {
			const isFirstTodoModelItemBlock = modelElement.getAttribute( 'listType' ) == 'todo' && isFirstBlockOfListItem( modelElement );

			let hasViewItemMarker = false;
			const viewWalker = editor.editing.view.createPositionBefore( viewElement ).getWalker( { direction: 'backward' } );

			for ( const { item } of viewWalker ) {
				if ( item.is( 'element' ) && editor.editing.mapper.toModelElement( item ) ) {
					break;
				}

				if ( item.is( 'element', 'input' ) && item.getAttribute( 'type' ) == 'checkbox' ) {
					hasViewItemMarker = true;
				}
			}

			if ( hasViewItemMarker != isFirstTodoModelItemBlock ) {
				evt.return = true;
				evt.stop();
			}
		} );

		// Make sure that all blocks of the same list item have the same todoListChecked attribute.
		listEditing.on<ListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
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

		// Toggle check state of a to-do list item clicked on the checkbox.
		this.listenTo<ViewDocumentTodoCheckboxChangeEvent>( editing.view.document, 'todoCheckboxChange', ( evt, data ) => {
			const viewTarget = data.target;

			if ( !viewTarget || !viewTarget.is( 'element', 'input' ) ) {
				return;
			}

			const viewPositionAfter = editing.view.createPositionAfter( viewTarget );
			const modelPositionAfter = editing.mapper.toModelPosition( viewPositionAfter );
			const modelElement = modelPositionAfter.parent;

			if ( modelElement && isListItemBlock( modelElement ) && modelElement.getAttribute( 'listType' ) == 'todo' ) {
				this._handleCheckmarkChange( modelElement );
			}
		} );

		// Jump at the start/end of the next node on right arrow key press, when selection is before the checkbox.
		//
		// <blockquote><p>Foo{}</p></blockquote>
		// <ul><li><checkbox/>Bar</li></ul>
		//
		// press: `->`
		//
		// <blockquote><p>Foo</p></blockquote>
		// <ul><li><checkbox/>{}Bar</li></ul>
		//
		this.listenTo<ViewDocumentArrowKeyEvent>(
			editing.view.document,
			'arrowKey',
			jumpOverCheckmarkOnSideArrowKeyPress( model, editor.locale ),
			{ context: '$text' }
		);

		// Map view positions inside the checkbox and wrappers to the position in the first block of the list item.
		this.listenTo<MapperViewToModelPositionEvent>( editing.mapper, 'viewToModelPosition', ( evt, data ) => {
			const viewParent = data.viewPosition.parent as ViewElement;

			const isStartOfListItem = viewParent.is( 'attributeElement', 'li' ) && data.viewPosition.offset == 0;
			const isStartOfListLabel = isLabelElement( viewParent ) && data.viewPosition.offset <= 1;

			const isInInputWrapper = viewParent.is( 'element', 'span' ) &&
				viewParent.getAttribute( 'contenteditable' ) == 'false' &&
				isLabelElement( viewParent.parent );

			if ( !isStartOfListItem && !isStartOfListLabel && !isInInputWrapper ) {
				return;
			}

			const nodeAfter = data.modelPosition!.nodeAfter;

			if ( nodeAfter && nodeAfter.getAttribute( 'listType' ) == 'todo' ) {
				data.modelPosition = model.createPositionAt( nodeAfter, 0 );
			}
		}, { priority: 'low' } );

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
			const lastElementIsTodoList = isTodoListItemElement( lastFocusedCodeBlock );
			const currentElementIsTodoList = isTodoListItemElement( focusParent );

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
 * Returns an upcast converter for to-do list items.
 */
function todoListItemUpcastConverter(): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const { writer, schema } = conversionApi;

		if ( !data.modelRange ) {
			return;
		}

		// Group to-do list items by their listItemId attribute to ensure that all items of the same list item have the same checked state.
		const groupedItems = Array
			.from( data.modelRange.getItems( { shallow: true } ) )
			.filter( ( item ): item is Element =>
				item.getAttribute( 'listType' ) === 'todo' && schema.checkAttribute( item, 'listItemId' )
			)
			.reduce( ( acc, item ) => {
				const listItemId = item.getAttribute( 'listItemId' ) as string;

				if ( !acc.has( listItemId ) ) {
					acc.set( listItemId, getAllListItemBlocks( item ) );
				}

				return acc;
			}, new Map<string, Array<Element>>() );

		// During the upcast, we need to ensure that all items of the same list have the same checked state. From time to time
		// the checked state of the items can be different when the user pastes content from the clipboard with <input type="checkbox">
		// that has checked state set to true. In such cases, we need to ensure that all items of the same list have the same checked state.
		// See more: https://github.com/ckeditor/ckeditor5/issues/15602
		for ( const [ , items ] of groupedItems.entries() ) {
			if ( items.some( item => item.getAttribute( 'todoListChecked' ) ) ) {
				for ( const item of items ) {
					writer.setAttribute( 'todoListChecked', true, item );
				}
			}
		}
	};
}

/**
 * Returns an upcast converter that detects a to-do list checkbox and marks the list item as a to-do list.
 */
function todoItemInputConverter(): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const modelCursor = data.modelCursor;
		const modelItem = modelCursor.parent as Element;
		const viewItem = data.viewItem;

		if ( !conversionApi.consumable.test( viewItem, { name: true } ) ) {
			return;
		}

		if ( viewItem.getAttribute( 'type' ) != 'checkbox' || !modelCursor.isAtStart || !modelItem.hasAttribute( 'listType' ) ) {
			return;
		}

		conversionApi.consumable.consume( viewItem, { name: true } );

		const writer = conversionApi.writer;

		writer.setAttribute( 'listType', 'todo', modelItem );

		if ( data.viewItem.hasAttribute( 'checked' ) ) {
			writer.setAttribute( 'todoListChecked', true, modelItem );
		}

		data.modelRange = writer.createRange( modelCursor );
	};
}

/**
 * Returns an upcast converter that consumes element matching the given matcher pattern.
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
 * Returns an upcast converter that consumes attributes matching the given matcher pattern.
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

/**
 * Returns true if the given list item block should be converted as a description block of a to-do list item.
 */
function isDescriptionBlock( modelElement: Element, listAttributeNames: Array<string> ): boolean {
	return ( modelElement.is( 'element', 'paragraph' ) || modelElement.is( 'element', 'listItem' ) ) &&
		modelElement.getAttribute( 'listType' ) == 'todo' &&
		isFirstBlockOfListItem( modelElement ) &&
		hasOnlyListAttributes( modelElement, listAttributeNames );
}

/**
 * Returns true if only attributes from the given list are present on the model element.
 */
function hasOnlyListAttributes( modelElement: Element, attributeNames: Array<string> ): boolean {
	for ( const attributeKey of modelElement.getAttributeKeys() ) {
		// Ignore selection attributes stored on block elements.
		if ( attributeKey.startsWith( 'selection:' ) ) {
			continue;
		}

		if ( !attributeNames.includes( attributeKey ) ) {
			return false;
		}
	}

	return true;
}

/**
 * Jump at the start and end of a to-do list item.
 */
function jumpOverCheckmarkOnSideArrowKeyPress( model: Model, locale: Locale ): GetCallback<ViewDocumentArrowKeyEvent> {
	return ( eventInfo, domEventData ) => {
		const direction = getLocalizedArrowKeyCodeDirection( domEventData.keyCode, locale.contentLanguageDirection );

		const schema = model.schema;
		const selection = model.document.selection;

		if ( !selection.isCollapsed ) {
			return;
		}

		const position = selection.getFirstPosition()!;
		const parent = position.parent as Element;

		// Right arrow before a to-do list item.
		if ( direction == 'right' && position.isAtEnd ) {
			const newRange = schema.getNearestSelectionRange( model.createPositionAfter( parent ), 'forward' );

			if ( !newRange ) {
				return;
			}

			const newRangeParent = newRange.start.parent;

			if ( newRangeParent && isListItemBlock( newRangeParent ) && newRangeParent.getAttribute( 'listType' ) == 'todo' ) {
				model.change( writer => writer.setSelection( newRange ) );

				domEventData.preventDefault();
				domEventData.stopPropagation();
				eventInfo.stop();
			}
		}
		// Left arrow at the beginning of a to-do list item.
		else if ( direction == 'left' && position.isAtStart && isListItemBlock( parent ) && parent.getAttribute( 'listType' ) == 'todo' ) {
			const newRange = schema.getNearestSelectionRange( model.createPositionBefore( parent ), 'backward' );

			if ( !newRange ) {
				return;
			}

			model.change( writer => writer.setSelection( newRange ) );

			domEventData.preventDefault();
			domEventData.stopPropagation();
			eventInfo.stop();
		}
	};
}

/**
 * Returns true if the given element is a label element of a to-do list item.
 */
function isLabelElement( viewElement: ViewElement | ViewDocumentFragment | null ): boolean {
	return !!viewElement && viewElement.is( 'attributeElement' ) && viewElement.hasClass( 'todo-list__label' );
}

/**
 * Returns true if the given element is a list item model element of a to-do list.
 */
function isTodoListItemElement( element: Element | DocumentFragment | null ): boolean {
	if ( !element ) {
		return false;
	}

	if ( !element.is( 'element', 'paragraph' ) && !element.is( 'element', 'listItem' ) ) {
		return false;
	}

	return element.getAttribute( 'listType' ) == 'todo';
}
