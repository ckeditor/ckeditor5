/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/listengine
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
 * It registers the `numberedList`, `bulletedList`, `indentList` and `outdentList` commands.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListEngine extends Plugin {
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
		// Note: in case `$block` will be ever allowed in `listItem`, keep in mind that this feature
		// uses `Selection#getSelectedBlocks()` without any additional processing to obtain all selected list items.
		// If there are blocks allowed inside list item, algorithms using `getSelectedBlocks()` will have to be modified.
		const schema = editor.document.schema;
		schema.registerItem( 'listItem', '$block' );
		schema.allow( {
			name: 'listItem',
			inside: '$root',
			attributes: [ 'type', 'indent' ]
		} );
		schema.requireAttributes( 'listItem', [ 'type', 'indent' ] );

		// Converters.
		const data = editor.data;
		const editing = editor.editing;

		this.editor.document.on( 'change', modelChangePostFixer( this.editor.document ), { priority: 'high' } );

		// Unbind all moved model elements before conversion happens. This is important for converters.
		// TODO: fix this when changes are converted on `changesDone`.
		this.editor.document.on( 'change', ( evt, type, changes ) => {
			if ( type == 'move' ) {
				for ( const item of changes.range.getItems() ) {
					if ( item.is( 'listItem' ) ) {
						editing.mapper.unbindModelElement( item );
					}
				}
			}
		}, { priority: 'high' } );

		editing.mapper.registerViewToModelLength( 'li', getViewListItemLength );
		data.mapper.registerViewToModelLength( 'li', getViewListItemLength );

		editing.mapper.on( 'modelToViewPosition', modelToViewPosition );
		editing.mapper.on( 'viewToModelPosition', viewToModelPosition );
		data.mapper.on( 'modelToViewPosition', modelToViewPosition );

		editing.modelToView.on( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
		editing.modelToView.on( 'insert:listItem', modelViewInsertion );
		data.modelToView.on( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
		data.modelToView.on( 'insert:listItem', modelViewInsertion );

		// Only change converter is needed. List item's type attribute is required, so it's adding is handled when
		// list item is added and you cannot remove it.
		editing.modelToView.on( 'changeAttribute:type:listItem', modelViewChangeType );
		data.modelToView.on( 'changeAttribute:type:listItem', modelViewChangeType );

		editing.modelToView.on( 'remove:listItem', modelViewRemove );
		editing.modelToView.on( 'remove', modelViewMergeAfter, { priority: 'low' } );
		data.modelToView.on( 'remove:listItem', modelViewRemove );
		data.modelToView.on( 'remove', modelViewMergeAfter, { priority: 'low' } );

		editing.modelToView.on( 'changeAttribute:indent:listItem', modelViewChangeIndent );
		data.modelToView.on( 'changeAttribute:indent:listItem', modelViewChangeIndent );

		data.viewToModel.on( 'element:ul', cleanList, { priority: 'high' } );
		data.viewToModel.on( 'element:ol', cleanList, { priority: 'high' } );
		data.viewToModel.on( 'element:li', cleanListItem, { priority: 'high' } );
		data.viewToModel.on( 'element:li', viewModelConverter );

		// Fix indentation of pasted items.
		data.on( 'insertContent', modelIndentPasteFixer, { priority: 'high' } );

		// Register commands for numbered and bulleted list.
		editor.commands.add( 'numberedList', new ListCommand( editor, 'numbered' ) );
		editor.commands.add( 'bulletedList', new ListCommand( editor, 'bulleted' ) );

		// Register commands for indenting.
		editor.commands.add( 'indentList', new IndentCommand( editor, 'forward' ) );
		editor.commands.add( 'outdentList', new IndentCommand( editor, 'backward' ) );
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
