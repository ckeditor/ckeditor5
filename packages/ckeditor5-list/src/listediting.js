/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listediting
 */

import ListCommand from './listcommand';
import IndentCommand from './indentcommand';

import { Plugin } from 'ckeditor5/src/core';
import { Enter } from 'ckeditor5/src/enter';
import { Delete } from 'ckeditor5/src/typing';

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
import { createViewListItemElement, getSiblingListItem } from './utils';
import ModelSelection from '@ckeditor/ckeditor5-engine/src/model/selection';
import DocumentSelection from '@ckeditor/ckeditor5-engine/src/model/documentselection';
import { uid } from '@ckeditor/ckeditor5-utils';

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
	static get pluginName() {
		return 'ListEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Enter, Delete ];
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
			allowAttributes: [ 'listType', 'listIndent', 'listItemId' ]
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

		// editor.conversion.for( 'editingDowncast' )
		// 	.add( dispatcher => {
		// 		dispatcher.on( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
		// 		dispatcher.on( 'insert:listItem', modelViewInsertion( editor.model ) );
		// 		dispatcher.on( 'attribute:listType:listItem', modelViewChangeType, { priority: 'high' } );
		// 		dispatcher.on( 'attribute:listType:listItem', modelViewMergeAfterChangeType, { priority: 'low' } );
		// 		dispatcher.on( 'attribute:listIndent:listItem', modelViewChangeIndent( editor.model ) );
		// 		dispatcher.on( 'remove:listItem', modelViewRemove( editor.model ) );
		// 		dispatcher.on( 'remove', modelViewMergeAfter, { priority: 'low' } );
		// 	} );

		editor.conversion.for( 'editingDowncast' )
			.elementToElement( {
				model: 'listItem',
				view: ( modelElement, { writer } ) => writer.createContainerElement(
					'span', { classes: 'ck-list-bogus-paragraph' }, { isAllowedInsideAttributeElement: true }
				)
			} )
			.add( dispatcher => {
				const converter = listItemWrap( editor.model );

				dispatcher.on( 'attribute:listIndent:listItem', converter );
				dispatcher.on( 'attribute:listType:listItem', converter );
			} );

		editor.conversion.for( 'dataDowncast' )
			.add( dispatcher => {
				dispatcher.on( 'insert', modelViewSplitOnInsert, { priority: 'high' } );
				dispatcher.on( 'insert:listItem', modelViewInsertion( editor.model ) );
			} );

		editor.conversion.for( 'upcast' )
			.add( dispatcher => {
				dispatcher.on( 'element:ul', cleanList, { priority: 'high' } );
				dispatcher.on( 'element:ol', cleanList, { priority: 'high' } );
				dispatcher.on( 'element:li', cleanListItem, { priority: 'high' } );
				dispatcher.on( 'element:li', viewModelConverter );
			} );

		// Fix indentation of pasted items.
		editor.model.on( 'insertContent', modelIndentPasteFixer, { priority: 'high' } );

		// Register commands for numbered and bulleted list.
		editor.commands.add( 'numberedList', new ListCommand( editor, 'numbered' ) );
		editor.commands.add( 'bulletedList', new ListCommand( editor, 'bulleted' ) );

		// Register commands for indenting.
		editor.commands.add( 'indentList', new IndentCommand( editor, 'forward' ) );
		editor.commands.add( 'outdentList', new IndentCommand( editor, 'backward' ) );

		const viewDocument = editing.view.document;

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
		}, { context: 'li' } );

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
		}, { context: 'li' } );

		const getCommandExecuter = commandName => {
			return ( data, cancel ) => {
				const command = this.editor.commands.get( commandName );

				if ( command.isEnabled ) {
					this.editor.execute( commandName );
					cancel();
				}
			};
		};

		editor.keystrokes.set( 'Tab', getCommandExecuter( 'indentList' ) );
		editor.keystrokes.set( 'Shift+Tab', getCommandExecuter( 'outdentList' ) );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const commands = this.editor.commands;

		const indent = commands.get( 'indent' );
		const outdent = commands.get( 'outdent' );

		if ( indent ) {
			indent.registerChildCommand( commands.get( 'indentList' ) );
		}

		if ( outdent ) {
			outdent.registerChildCommand( commands.get( 'outdentList' ) );
		}
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

function listItemWrap( model ) {
	const consumer = createAttributesConsumer( { attributes: [ 'listType', 'listIndent' ] } );
	const listItemsMap = new WeakMap();

	return ( evt, data, conversionApi ) => {
		if ( data.item.is( 'selection' ) ) {
			return;
		}

		if ( !consumer( data.item, conversionApi.consumable ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const listItems = [ data.item ];

		if ( evt.name == 'attribute:listType:listItem' ) {
			const listIndent = listItems[ 0 ].getAttribute( 'listIndent' );
			let currentListItem = listItems[ 0 ].nextSibling;

			while (
				currentListItem &&
				currentListItem.is( 'element', 'listItem' ) &&
				currentListItem.getAttribute( 'listIndent' ) > listIndent
			) {
				listItems.push( currentListItem );
				currentListItem = currentListItem.nextSibling;
			}
		}

		for ( const listItem of listItems ) {
			let viewRange = conversionApi.mapper.toViewRange( model.createRangeOn( listItem ) );

			// First, unwrap the range from current wrapper.
			if ( listItemsMap.has( listItem ) ) {
				const listItemMap = listItemsMap.get( listItem );

				for ( let i = listItemMap.length - 1; i >= 0; i-- ) {
					const { listItemId, listType } = listItemMap[ i ];

					const listItemViewElement = createListItemElement( viewWriter, i, listItemId );
					const listViewElement = createListElement( viewWriter, i, listType );

					viewRange = viewWriter.unwrap( viewRange, listViewElement );
					viewRange = viewWriter.unwrap( viewRange, listItemViewElement );
				}
			}

			const listItemIndent = listItem.getAttribute( 'listIndent' );

			if ( listItemIndent !== null ) {
				const listItemMap = [];
				let currentListItem = listItem;

				for ( let i = listItemIndent; i >= 0; i-- ) {
					const listItemId = currentListItem.getAttribute( 'listItemId' );
					const listType = currentListItem.getAttribute( 'listType' );

					listItemMap[ i ] = {
						listItemId,
						listType
					};

					const listItemViewElement = createListItemElement( viewWriter, i, listItemId );
					const listViewElement = createListElement( viewWriter, i, listType );

					viewRange = viewWriter.wrap( viewRange, listItemViewElement );
					viewRange = viewWriter.wrap( viewRange, listViewElement );

					currentListItem = getSiblingListItem( currentListItem, { smallerIndent: true, listIndent: i } );
				}

				listItemsMap.set( listItem, listItemMap );
			}
		}
	};
}

function createListElement( writer, indent, type, id ) {
	return writer.createAttributeElement( type == 'numbered' ? 'ol' : 'ul', null, {
		priority: indent / 100,
		id
	} );
}

function createListItemElement( writer, indent, id ) {
	return writer.createAttributeElement( 'li', null, {
		priority: ( indent + 0.5 ) / 100,
		id
	} );
}

function createAttributesConsumer( model ) {
	return ( node, consumable, options = {} ) => {
		const events = [];

		// Collect all set attributes that are triggering conversion.
		for ( const attributeName of model.attributes ) {
			if ( node.hasAttribute( attributeName ) ) {
				events.push( `attribute:${ attributeName }` );
			}
		}

		if ( !events.every( event => consumable.test( node, event ) !== false ) ) {
			return false;
		}

		if ( !options.preflight ) {
			events.forEach( event => consumable.consume( node, event ) );
		}

		return true;
	};
}

