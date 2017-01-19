/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/listengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ListCommand from './listcommand';
import IndentCommand from './indentcommand';

import {
	cleanList,
	modelViewInsertion,
	modelViewChangeType,
	modelViewMergeAfter,
	modelViewRemove,
	modelViewMove,
	modelViewSplitOnInsert,
	modelViewChangeIndent,
	viewModelConverter,
	modelToViewPosition,
	viewToModelPosition
} from './converters';

/**
 * The engine of the lists feature. It handles creating, editing and removing lists and list items.
 * It registers the `numberedList`, `bulletedList`, `indentList` and `outdentList` commands.
 *
 * @extends module:core/plugin~Plugin
 */
export default class ListEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		// Schema.
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

		editing.modelToView.on( 'move:listItem', modelViewMove );
		editing.modelToView.on( 'move', modelViewMergeAfter, { priority: 'low' } );
		data.modelToView.on( 'move:listItem', modelViewMove );
		data.modelToView.on( 'move', modelViewMergeAfter, { priority: 'low' } );

		editing.modelToView.on( 'changeAttribute:indent:listItem', modelViewChangeIndent );
		data.modelToView.on( 'changeAttribute:indent:listItem', modelViewChangeIndent );

		data.viewToModel.on( 'element:li', viewModelConverter );
		data.viewToModel.on( 'element:ul', cleanList, { priority: 'high' } );
		data.viewToModel.on( 'element:ol', cleanList, { priority: 'high' } );

		// Register commands for numbered and bulleted list.
		editor.commands.set( 'numberedList', new ListCommand( editor, 'numbered' ) );
		editor.commands.set( 'bulletedList', new ListCommand( editor, 'bulleted' ) );

		// Register commands for indenting.
		editor.commands.set( 'indentList', new IndentCommand( editor, 'forward' ) );
		editor.commands.set( 'outdentList', new IndentCommand( editor, 'backward' ) );
	}
}
