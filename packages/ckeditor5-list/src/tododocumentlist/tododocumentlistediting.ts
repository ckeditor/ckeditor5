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
	type Model,
	type Element,
	type MatcherPattern,
	type ViewElement,
	type ViewDocumentKeyDownEvent,
	type ViewDocumentArrowKeyEvent,
	type MapperViewToModelPositionEvent,
	type ViewDocumentFragment
} from 'ckeditor5/src/engine';

import {
	getCode,
	parseKeystroke,
	getLocalizedArrowKeyCodeDirection,
	type GetCallback,
	type Locale
} from 'ckeditor5/src/utils';

import { Plugin } from 'ckeditor5/src/core';

import { isFirstBlockOfListItem, isListItemBlock } from '../documentlist/utils/model';
import DocumentListEditing, {
	type DocumentListEditingCheckElementEvent,
	type DocumentListEditingPostFixerEvent
} from '../documentlist/documentlistediting';
import DocumentListCommand from '../documentlist/documentlistcommand';
import CheckTodoDocumentListCommand from './checktododocumentlistcommand';
import TodoCheckboxChangeObserver, { type ViewDocumentTodoCheckboxChangeEvent } from './todocheckboxchangeobserver';

const ITEM_TOGGLE_KEYSTROKE = parseKeystroke( 'Ctrl+Enter' );

/**
 * The engine of the to-do list feature. It handles creating, editing and removing to-do lists and their items.
 *
 * It registers the entire functionality of the {@link module:list/documentlist/documentlistediting~DocumentListEditing list editing plugin}
 * and extends it with the commands:
 *
 * - `'todoList'`,
 * - `'checkTodoList'`,
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
		const documentListEditing = editor.plugins.get( DocumentListEditing );
		const multiBlock = editor.config.get( 'list.multiBlock' );
		const elementName = multiBlock ? 'paragraph' : 'listItem';

		editor.commands.add( 'todoList', new DocumentListCommand( editor, 'todo' ) );
		editor.commands.add( 'checkTodoList', new CheckTodoDocumentListCommand( editor ) );

		editing.view.addObserver( TodoCheckboxChangeObserver );

		model.schema.extend( '$listItem', { allowAttributes: 'todoListChecked' } );

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
				if ( isDescriptionBlock( element, documentListEditing.getListAttributeNames() ) ) {
					return writer.createContainerElement( 'span', { class: 'todo-list__label__description' } );
				}
			},
			converterPriority: 'highest'
		} );

		documentListEditing.registerDowncastStrategy( {
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

		documentListEditing.registerDowncastStrategy( {
			scope: 'itemMarker',
			attributeName: 'todoListChecked',

			createElement( writer, modelElement, { dataPipeline } ) {
				if ( modelElement.getAttribute( 'listType' ) != 'todo' ) {
					return null;
				}

				const viewElement = writer.createEmptyElement( 'input', {
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

				return writer.createContainerElement( 'span', { contenteditable: 'false' }, viewElement );
			},

			canWrapElement( modelElement ) {
				return isDescriptionBlock( modelElement, documentListEditing.getListAttributeNames() );
			},

			createWrapperElement( writer, modelElement, { dataPipeline } ) {
				const classes = [ 'todo-list__label' ];

				if ( !isDescriptionBlock( modelElement, documentListEditing.getListAttributeNames() ) ) {
					classes.push( 'todo-list__label_without-description' );
				}

				return writer.createAttributeElement( dataPipeline ? 'label' : 'span', {
					class: classes.join( ' ' )
				} );
			}
		} );

		// We need to register the model length callback for the view checkbox input because it has no mapped model element.
		// The to-do list item checkbox does not use the UIElement because it would be trimmed by ViewRange#getTrimmed()
		// and removing the default remove converter would not include checkbox in the range to remove.
		editing.mapper.registerViewToModelLength( 'input', viewElement => {
			if (
				viewElement.getAttribute( 'type' ) == 'checkbox' &&
				viewElement.findAncestor( { classes: 'todo-list__label' } )
			) {
				return 0;
			}

			return editing.mapper.toModelElement( viewElement ) ? 1 : 0;
		} );

		// Verifies if a to-do list block requires reconversion of a first item downcasted as an item description.
		documentListEditing.on<DocumentListEditingCheckElementEvent>( 'checkElement', ( evt, { modelElement, viewElement } ) => {
			const isFirstTodoModelParagraphBlock = isDescriptionBlock( modelElement, documentListEditing.getListAttributeNames() );
			const hasViewClass = viewElement.hasClass( 'todo-list__label__description' );

			if ( hasViewClass != isFirstTodoModelParagraphBlock ) {
				evt.return = true;
				evt.stop();
			}
		} );

		// Verifies if a to-do list block requires reconversion of a checkbox element
		// (for example there is a new paragraph inserted as a first block of a list item).
		documentListEditing.on<DocumentListEditingCheckElementEvent>( 'checkElement', ( evt, { modelElement, viewElement } ) => {
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
