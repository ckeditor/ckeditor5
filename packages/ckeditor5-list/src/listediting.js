/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/listediting
 */

import ListCommand from './listcommand';
import IndentCommand from './indentcommand';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import {
	cleanList,
	cleanListItem,
	modelViewInsertion,
	modelViewChangeType,
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

/**
 * The engine of the list feature. It handles creating, editing and removing lists and list items.
 *
 * It registers the `'numberedList'`, `'bulletedList'`, `'indentList'` and `'outdentList'` commands.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Paragraph ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
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

		editing.mapper.on( 'modelToViewPosition', modelToViewPosition( editing.view ) );
		editing.mapper.on( 'viewToModelPosition', viewToModelPosition( editor.model ) );
		data.mapper.on( 'modelToViewPosition', modelToViewPosition( editing.view ) );

		editing.downcastDispatcher.on( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
		editing.downcastDispatcher.on( 'insert:listItem', modelViewInsertion( editor.model ) );
		data.downcastDispatcher.on( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
		data.downcastDispatcher.on( 'insert:listItem', modelViewInsertion( editor.model ) );

		editing.downcastDispatcher.on( 'attribute:listType:listItem', modelViewChangeType );
		data.downcastDispatcher.on( 'attribute:listType:listItem', modelViewChangeType );
		editing.downcastDispatcher.on( 'attribute:listIndent:listItem', modelViewChangeIndent( editor.model ) );
		data.downcastDispatcher.on( 'attribute:listIndent:listItem', modelViewChangeIndent( editor.model ) );

		editing.downcastDispatcher.on( 'remove:listItem', modelViewRemove( editor.model ) );
		editing.downcastDispatcher.on( 'remove', modelViewMergeAfter, { priority: 'low' } );
		data.downcastDispatcher.on( 'remove:listItem', modelViewRemove( editor.model ) );
		data.downcastDispatcher.on( 'remove', modelViewMergeAfter, { priority: 'low' } );

		data.upcastDispatcher.on( 'element:ul', cleanList, { priority: 'high' } );
		data.upcastDispatcher.on( 'element:ol', cleanList, { priority: 'high' } );
		data.upcastDispatcher.on( 'element:li', cleanListItem, { priority: 'high' } );
		data.upcastDispatcher.on( 'element:li', viewModelConverter );

		// Fix indentation of pasted items.
		editor.model.on( 'insertContent', modelIndentPasteFixer, { priority: 'high' } );

		// Register commands for numbered and bulleted list.
		editor.commands.add( 'numberedList', new ListCommand( editor, 'numbered' ) );
		editor.commands.add( 'bulletedList', new ListCommand( editor, 'bulleted' ) );

		// Register commands for indenting.
		editor.commands.add( 'indentList', new IndentCommand( editor, 'forward' ) );
		editor.commands.add( 'outdentList', new IndentCommand( editor, 'backward' ) );

		const viewDocument = this.editor.editing.view.document;

		// Overwrite default Enter key behavior.
		// If Enter key is pressed with selection collapsed in empty list item, outdent it instead of breaking it.
		this.listenTo( viewDocument, 'enter', ( evt, data ) => {
			const doc = this.editor.model.document;
			const positionParent = doc.selection.getLastPosition().parent;

			if ( doc.selection.isCollapsed && positionParent.name == 'listItem' && positionParent.isEmpty ) {
				this.editor.execute( 'outdentList' );

				data.preventDefault();
				evt.stop();
			}
		} );

		// Overwrite default Backspace key behavior.
		// If Backspace key is pressed with selection collapsed on first position in first list item, outdent it. #83
		this.listenTo( viewDocument, 'delete', ( evt, data ) => {
			// Check conditions from those that require less computations like those immediately available.
			if ( data.direction !== 'backward' ) {
				return;
			}

			const selection = this.editor.model.document.selection;

			if ( !selection.isCollapsed ) {
				return;
			}

			const firstPosition = selection.getFirstPosition();

			if ( !firstPosition.isAtStart ) {
				return;
			}

			const positionParent = firstPosition.parent;

			if ( positionParent.name !== 'listItem' ) {
				return;
			}

			const previousIsAListItem = positionParent.previousSibling && positionParent.previousSibling.name === 'listItem';

			if ( previousIsAListItem ) {
				return;
			}

			this.editor.execute( 'outdentList' );

			data.preventDefault();
			evt.stop();
		}, { priority: 'high' } );

		const getCommandExecuter = commandName => {
			return ( data, cancel ) => {
				const command = this.editor.commands.get( commandName );

				if ( command.isEnabled ) {
					this.editor.execute( commandName );
					cancel();
				}
			};
		};

		this.editor.keystrokes.set( 'Tab', getCommandExecuter( 'indentList' ) );
		this.editor.keystrokes.set( 'Shift+Tab', getCommandExecuter( 'outdentList' ) );
	}
}

function getViewListItemLength( element ) {
	let length = 1;

	for ( const child of element.getChildren() ) {
		if ( child.name == 'ul' || child.name == 'ol' ) {
			for ( const item of child.getChildren() ) {
				length += getViewListItemLength( item );
			}
		}
	}

	return length;
}
