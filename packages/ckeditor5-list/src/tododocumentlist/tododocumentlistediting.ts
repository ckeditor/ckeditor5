/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/tododocumentlist/tododocumentlistediting
 */

import {
	Matcher,
	type View,
	type ViewElement,
	type MapperModelToViewPositionEvent,
	type ElementCreatorFunction,
	type UpcastElementEvent,
	type Element,
	type MatcherPattern,
	type Model,
	type ViewDocumentArrowKeyEvent,
	type ViewDocumentKeyDownEvent
} from 'ckeditor5/src/engine';

import {
	getCode,
	getLocalizedArrowKeyCodeDirection,
	parseKeystroke,
	type Locale,
	type GetCallback
} from 'ckeditor5/src/utils';

import { Plugin } from 'ckeditor5/src/core';

import { isListItemBlock, removeListAttributes } from '../documentlist/utils/model';
import DocumentListEditing, { type DocumentListEditingPostFixerEvent } from '../documentlist/documentlistediting';
import DocumentListCommand from '../documentlist/documentlistcommand';
import CheckTodoDocumentListCommand from './checktododocumentlistcommand';
import InputChangeObserver, { type ViewDocumentInputChangeEvent } from './inputchangeobserver';

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

		editor.commands.add( 'todoList', new DocumentListCommand( editor, 'todo' ) );

		const checkTodoListCommand = new CheckTodoDocumentListCommand( editor );

		// Register `checkTodoList` command and add `todoListCheck` command as an alias for backward compatibility.
		editor.commands.add( 'checkTodoList', checkTodoListCommand );
		editor.commands.add( 'todoListCheck', checkTodoListCommand );

		editor.editing.view.addObserver( InputChangeObserver );

		model.schema.extend( 'paragraph', {
			allowAttributes: 'todoListChecked'
		} );

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

		// editor.conversion.for( 'dataDowncast' ).elementToElement( {
		// 	model: {
		// 		name: 'paragraph',
		// 		attributes: 'todoListChecked'
		// 	},
		// 	view: todoItemViewCreator( { dataPipeline: true } ),
		// 	converterPriority: 'highest'
		// } );

		// editor.conversion.for( 'editingDowncast' ).elementToElement( {
		// 	model: {
		// 		name: 'paragraph',
		// 		attributes: 'todoListChecked'
		// 	},
		// 	view: todoItemViewCreator(),
		// 	converterPriority: 'highest'
		// } );

		// editor.editing.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', mapModelToViewPosition( editor.editing.view ) );
		// editor.data.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', mapModelToViewPosition( editor.editing.view ) );

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

		// Make sure that only paragraphs can be a to-do list item.
		// this.listenTo<DocumentListEditingPostFixerEvent>( documentListEditing, 'postFixer', ( evt, { listNodes, writer } ) => {
		// 	let applied = false;
		//
		// 	for ( const { node } of listNodes ) {
		// 		if ( node.getAttribute( 'listType' ) == 'todo' && node.name != 'paragraph' ) {
		// 			removeListAttributes( node, writer );
		// 			applied = true;
		// 		}
		// 	}
		//
		// 	evt.return = applied || evt.return;
		// } );

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
		// this.listenTo<ViewDocumentArrowKeyEvent>(
		// 	editor.editing.view.document,
		// 	'arrowKey',
		// 	jumpOverCheckmarkOnSideArrowKeyPress( model, editor.locale ),
		// 	{ context: 'li' }
		// );

		// Toggle check state of selected to-do list items on keystroke.
		this.listenTo<ViewDocumentKeyDownEvent>( editor.editing.view.document, 'keydown', ( evt, data ) => {
			if ( getCode( data ) === ITEM_TOGGLE_KEYSTROKE ) {
				editor.execute( 'checkTodoList' );
				evt.stop();
			}
		}, { priority: 'high' } );

		this.listenTo<ViewDocumentInputChangeEvent>( editor.editing.view.document, 'inputChange', ( evt, data ) => {
			const viewTarget = data.target;

			if ( !viewTarget || !viewTarget.is( 'element', 'input' ) ) {
				return;
			}

			const viewElement = editor.editing.mapper.findMappedViewAncestor( editor.editing.view.createPositionAt( data.target.nextSibling!, 0 ) );
			const modelElement = editor.editing.mapper.toModelElement( viewElement );

			if ( modelElement && isListItemBlock( modelElement ) && modelElement.getAttribute( 'listType' ) == 'todo' ) {
				editor.execute( 'checkTodoList', {
					selection: editor.model.createSelection( modelElement, 'end' )
				} );
			}
		} );

		editor.editing.mapper.registerViewToModelLength( 'input', viewElement => {
			// TODO verify if this is a to-do list checkbox
			return 0;
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

/**
 * TODO
 */
function todoItemViewCreator( { dataPipeline }: { dataPipeline?: boolean } = {} ): ElementCreatorFunction {
	return ( modelElement, { writer } ) => {
		if ( modelElement.getAttribute( 'listType' ) != 'todo' ) {
			return null;
		}

		// Using `<p>` in data pipeline in case there are some markers on it and transparentRendering will render it anyway.
		const viewElement = dataPipeline ?
			writer.createContainerElement( 'p' ) :
			writer.createContainerElement( 'span', { class: 'ck-list-bogus-paragraph' } );

		if ( dataPipeline ) {
			writer.setCustomProperty( 'dataPipeline:transparentRendering', true, viewElement );
		}

		const labelWithCheckbox = writer.createContainerElement( 'label', {
			class: 'todo-list__label',
			...( !dataPipeline ? { contenteditable: false } : null )
		}, [
			writer.createEmptyElement( 'input', {
				type: 'checkbox',
				...( modelElement.getAttribute( 'todoListChecked' ) ? { checked: 'checked' } : null ),
				... ( dataPipeline ? { disabled: 'disabled' } : { tabindex: '-1' } )
			} )
		] );

		const descriptionSpan = writer.createContainerElement( 'span', {
			class: 'todo-list__label__description'
		} );

		writer.insert( writer.createPositionAt( viewElement, 0 ), labelWithCheckbox );

		// The `<label>` should include all the content only in data pipeline
		// to avoid toggling checkbox while placing selection in the description.
		writer.insert(
			dataPipeline ?
				writer.createPositionAt( labelWithCheckbox, 'end' ) :
				writer.createPositionAt( viewElement, 'end' ),
			descriptionSpan
		);

		return viewElement;
	};
}

/**
 * A model-to-view position at zero offset mapper.
 *
 * This helper ensures that position inside todo-list in the view is mapped after the checkbox.
 *
 * It only handles the position at the beginning of a list item as other positions are properly mapped be the default mapper.
 */
function mapModelToViewPosition( view: View ): GetCallback<MapperModelToViewPositionEvent> {
	return ( evt, data ) => {
		const modelPosition = data.modelPosition;
		const parent = modelPosition.parent;

		if ( !isListItemBlock( parent ) || parent.getAttribute( 'listType' ) != 'todo' ) {
			return;
		}

		const viewLi = data.mapper.toViewElement( parent )!;
		const descSpan = findDescription( viewLi, view );

		if ( descSpan ) {
			data.viewPosition = data.mapper.findPositionIn( descSpan, modelPosition.offset );
		}
	};
}

/**
 * TODO
 */
function findDescription( viewItem: ViewElement, view: View ) {
	for ( const value of view.createRangeIn( viewItem ) ) {
		if ( value.item.is( 'containerElement', 'span' ) && value.item.hasClass( 'todo-list__label__description' ) ) {
			return value.item;
		}
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

		if ( isListItemBlock( parent ) && parent.getAttribute( 'listType' ) == 'todo' && position.isAtStart ) {
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
