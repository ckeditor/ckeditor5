/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
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
		// Note: in case `$block` will ever be allowed in `listItem`, keep in mind that this feature
		// uses `Selection#getSelectedBlocks()` without any additional processing to obtain all selected list items.
		// If there are blocks allowed inside list item, algorithms using `getSelectedBlocks()` will have to be modified.
		editor.model.schema.register( 'listItem', {
			inheritAllFrom: '$block',
			allowAttributes: [ 'type', 'indent' ]
		} );

		// Converters.
		const data = editor.data;
		const editing = editor.editing;

		editor.model.document.registerPostFixer( writer => modelChangePostFixer( editor.model, writer ) );

		editing.mapper.registerViewToModelLength( 'li', getViewListItemLength );
		data.mapper.registerViewToModelLength( 'li', getViewListItemLength );

		editing.mapper.on( 'modelToViewPosition', modelToViewPosition );
		editing.mapper.on( 'viewToModelPosition', viewToModelPosition );
		data.mapper.on( 'modelToViewPosition', modelToViewPosition );

		editing.modelToView.on( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
		editing.modelToView.on( 'insert:listItem', modelViewInsertion );
		data.modelToView.on( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
		data.modelToView.on( 'insert:listItem', modelViewInsertion );

		editing.modelToView.on( 'attribute:type:listItem', modelViewChangeType );
		data.modelToView.on( 'attribute:type:listItem', modelViewChangeType );
		editing.modelToView.on( 'attribute:indent:listItem', modelViewChangeIndent );
		data.modelToView.on( 'attribute:indent:listItem', modelViewChangeIndent );

		editing.modelToView.on( 'remove:listItem', modelViewRemove );
		editing.modelToView.on( 'remove', modelViewMergeAfter, { priority: 'low' } );
		data.modelToView.on( 'remove:listItem', modelViewRemove );
		data.modelToView.on( 'remove', modelViewMergeAfter, { priority: 'low' } );

		data.viewToModel.on( 'element:ul', cleanList, { priority: 'high' } );
		data.viewToModel.on( 'element:ol', cleanList, { priority: 'high' } );
		data.viewToModel.on( 'element:li', cleanListItem, { priority: 'high' } );
		data.viewToModel.on( 'element:li', viewModelConverter );

		// Fix indentation of pasted items.
		editor.model.on( 'insertContent', modelIndentPasteFixer, { priority: 'high' } );

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
