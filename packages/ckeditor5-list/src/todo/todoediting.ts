/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/todo/todoediting
 */

import {
	Matcher,
	type View,
	type ViewElement,
	type MapperModelToViewPositionEvent,
	type ElementCreatorFunction,
	type UpcastElementEvent,
	type Element,
	type MatcherPattern
} from 'ckeditor5/src/engine';

import { Plugin } from 'ckeditor5/src/core';
import type { GetCallback } from 'ckeditor5/src/utils';

import { isListItemBlock } from '../documentlist/utils/model';
import DocumentListEditing from '../documentlist/documentlistediting';
import DocumentListCommand from '../documentlist/documentlistcommand';

/**
 * TODO
 */
export default class TodoEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const model = editor.model;

		editor.commands.add( 'todoList', new DocumentListCommand( editor, 'todo' ) );

		model.schema.extend( 'paragraph', {
			allowAttributes: 'todoItemChecked'
		} );

		model.schema.addAttributeCheck( ( context: any, attributeName ) => {
			const item = context.last;

			if ( attributeName == 'todoItemChecked' && isListItemBlock( item ) && item.getAttribute( 'listType' ) != 'todo' ) {
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

		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: {
				name: 'paragraph',
				attributes: 'todoItemChecked'
			},
			view: todoItemViewCreator( { dataPipeline: true } ),
			converterPriority: 'highest'
		} );

		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: {
				name: 'paragraph',
				attributes: 'todoItemChecked'
			},
			view: todoItemViewCreator(),
			converterPriority: 'highest'
		} );

		editor.editing.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', mapModelToViewPosition( editor.editing.view ) );
		editor.data.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', mapModelToViewPosition( editor.editing.view ) );

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
				if ( change.type != 'attribute' || change.attributeKey != 'listType' ) {
					continue;
				}

				const element = change.range.start.nodeAfter!;

				if ( change.attributeNewValue == 'todo' ) {
					if ( !element.hasAttribute( 'todoItemChecked' ) ) {
						writer.setAttribute( 'todoItemChecked', false, element );
						wasFixed = true;
					}
				} else if ( change.attributeOldValue == 'todo' ) {
					if ( element.hasAttribute( 'todoItemChecked' ) ) {
						writer.removeAttribute( 'todoItemChecked', element );
						wasFixed = true;
					}
				}
			}

			return wasFixed;
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
			writer.setAttribute( 'todoItemChecked', true, modelItem );
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
			class: 'todo-list__label'
		}, [
			writer.createEmptyElement( 'input', {
				type: 'checkbox',
				...( modelElement.getAttribute( 'todoItemChecked' ) ? { checked: 'checked' } : null ),
				... ( dataPipeline ? { disabled: 'disabled' } : null )
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
