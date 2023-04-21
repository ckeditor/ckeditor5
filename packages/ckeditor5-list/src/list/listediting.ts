/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/list/listediting
 */

import ListCommand from './listcommand';
import IndentCommand from './indentcommand';
import ListUtils from './listutils';

import { Plugin, type MultiCommand } from 'ckeditor5/src/core';

import { Enter, type ViewDocumentEnterEvent } from 'ckeditor5/src/enter';
import { Delete, type ViewDocumentDeleteEvent } from 'ckeditor5/src/typing';

import type {
	DowncastAttributeEvent,
	DowncastInsertEvent,
	DowncastRemoveEvent,
	Element,
	MapperModelToViewPositionEvent,
	MapperViewToModelPositionEvent,
	ModelInsertContentEvent,
	UpcastElementEvent,
	ViewDocumentTabEvent,
	ViewElement
} from 'ckeditor5/src/engine';

import {
	cleanList,
	cleanListItem,
	modelViewInsertion,
	modelViewChangeType,
	modelViewMergeAfterChangeType,
	modelViewMergeAfter,
	modelViewRemove,
	modelViewSplitOnInsert,
	modelViewChangeIndent,
	modelChangePostFixer,
	modelIndentPasteFixer,
	viewModelConverter,
	modelToViewPosition,
	viewToModelPosition
} from './converters';

import '../../theme/list.css';

/**
 * The engine of the list feature. It handles creating, editing and removing lists and list items.
 *
 * It registers the `'numberedList'`, `'bulletedList'`, `'indentList'` and `'outdentList'` commands.
 */
export default class ListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'ListEditing' {
		return 'ListEditing';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Enter, Delete, ListUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Schema.
		// Note: in case `$block` will ever be allowed in `listItem`, keep in mind that this feature
		// uses `Selection#getSelectedBlocks()` without any additional processing to obtain all selected list items.
		// If there are blocks allowed inside list item, algorithms using `getSelectedBlocks()` will have to be modified.
		editor.model.schema.register( 'listItem', {
			inheritAllFrom: '$block',
			allowAttributes: [ 'listType', 'listIndent' ]
		} );

		// Converters.
		const data = editor.data;
		const editing = editor.editing;

		editor.model.document.registerPostFixer( writer => modelChangePostFixer( editor.model, writer ) );

		editing.mapper.registerViewToModelLength( 'li', getViewListItemLength );
		data.mapper.registerViewToModelLength( 'li', getViewListItemLength );

		editing.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', modelToViewPosition( editing.view ) );
		editing.mapper.on<MapperViewToModelPositionEvent>( 'viewToModelPosition', viewToModelPosition( editor.model ) );
		data.mapper.on<MapperModelToViewPositionEvent>( 'modelToViewPosition', modelToViewPosition( editing.view ) );

		editor.conversion.for( 'editingDowncast' )
			.add( dispatcher => {
				dispatcher.on<DowncastInsertEvent<Element>>( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
				dispatcher.on<DowncastInsertEvent<Element>>( 'insert:listItem', modelViewInsertion( editor.model ) );
				dispatcher.on<DowncastAttributeEvent<Element>>( 'attribute:listType:listItem', modelViewChangeType, { priority: 'high' } );
				dispatcher.on<DowncastAttributeEvent<Element>>(
					'attribute:listType:listItem', modelViewMergeAfterChangeType, { priority: 'low' } );
				dispatcher.on<DowncastAttributeEvent<Element>>( 'attribute:listIndent:listItem', modelViewChangeIndent( editor.model ) );
				dispatcher.on<DowncastRemoveEvent>( 'remove:listItem', modelViewRemove( editor.model ) );
				dispatcher.on<DowncastRemoveEvent>( 'remove', modelViewMergeAfter, { priority: 'low' } );
			} );

		editor.conversion.for( 'dataDowncast' )
			.add( dispatcher => {
				dispatcher.on<DowncastInsertEvent<Element>>( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
				dispatcher.on<DowncastInsertEvent<Element>>( 'insert:listItem', modelViewInsertion( editor.model ) );
			} );

		editor.conversion.for( 'upcast' )
			.add( dispatcher => {
				dispatcher.on<UpcastElementEvent>( 'element:ul', cleanList, { priority: 'high' } );
				dispatcher.on<UpcastElementEvent>( 'element:ol', cleanList, { priority: 'high' } );
				dispatcher.on<UpcastElementEvent>( 'element:li', cleanListItem, { priority: 'high' } );
				dispatcher.on<UpcastElementEvent>( 'element:li', viewModelConverter );
			} );

		// Fix indentation of pasted items.
		editor.model.on<ModelInsertContentEvent>( 'insertContent', modelIndentPasteFixer, { priority: 'high' } );

		// Register commands for numbered and bulleted list.
		editor.commands.add( 'numberedList', new ListCommand( editor, 'numbered' ) );
		editor.commands.add( 'bulletedList', new ListCommand( editor, 'bulleted' ) );

		// Register commands for indenting.
		editor.commands.add( 'indentList', new IndentCommand( editor, 'forward' ) );
		editor.commands.add( 'outdentList', new IndentCommand( editor, 'backward' ) );

		const viewDocument = editing.view.document;

		// Overwrite default Enter key behavior.
		// If Enter key is pressed with selection collapsed in empty list item, outdent it instead of breaking it.
		this.listenTo<ViewDocumentEnterEvent>( viewDocument, 'enter', ( evt, data ) => {
			const doc = this.editor.model.document;
			const positionParent = doc.selection.getLastPosition()!.parent;

			if ( doc.selection.isCollapsed && positionParent.name == 'listItem' && positionParent.isEmpty ) {
				this.editor.execute( 'outdentList' );

				data.preventDefault();
				evt.stop();
			}
		}, { context: 'li' } );

		// Overwrite default Backspace key behavior.
		// If Backspace key is pressed with selection collapsed on first position in first list item, outdent it. #83
		this.listenTo<ViewDocumentDeleteEvent>( viewDocument, 'delete', ( evt, data ) => {
			// Check conditions from those that require less computations like those immediately available.
			if ( data.direction !== 'backward' ) {
				return;
			}

			const selection = this.editor.model.document.selection;

			if ( !selection.isCollapsed ) {
				return;
			}

			const firstPosition = selection.getFirstPosition()!;

			if ( !firstPosition.isAtStart ) {
				return;
			}

			const positionParent = firstPosition.parent;

			if ( positionParent.name !== 'listItem' ) {
				return;
			}

			const previousIsAListItem = positionParent.previousSibling && ( positionParent.previousSibling as any ).name === 'listItem';

			if ( previousIsAListItem ) {
				return;
			}

			this.editor.execute( 'outdentList' );

			data.preventDefault();
			evt.stop();
		}, { context: 'li' } );

		this.listenTo<ViewDocumentTabEvent>( editor.editing.view.document, 'tab', ( evt, data ) => {
			const commandName = data.shiftKey ? 'outdentList' : 'indentList';
			const command = this.editor.commands.get( commandName )!;

			if ( command.isEnabled ) {
				editor.execute( commandName );

				data.stopPropagation();
				data.preventDefault();
				evt.stop();
			}
		}, { context: 'li' } );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const commands = this.editor.commands;

		const indent = commands.get( 'indent' ) as MultiCommand;
		const outdent = commands.get( 'outdent' ) as MultiCommand;

		if ( indent ) {
			indent.registerChildCommand( commands.get( 'indentList' )! );
		}

		if ( outdent ) {
			outdent.registerChildCommand( commands.get( 'outdentList' )! );
		}
	}
}

function getViewListItemLength( element: ViewElement ) {
	let length = 1;

	for ( const child of element.getChildren() as Iterable<ViewElement> ) {
		if ( child.name == 'ul' || child.name == 'ol' ) {
			for ( const item of child.getChildren() ) {
				length += getViewListItemLength( item as ViewElement );
			}
		}
	}

	return length;
}
