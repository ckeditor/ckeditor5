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
import { uid } from 'ckeditor5/src/utils';

import {
	cleanList,
	cleanListItem,
	modelChangePostFixer,
	modelIndentPasteFixer,
	viewModelConverter
} from './converters';
import { getSiblingListItem } from './utils';

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

		// editing.mapper.registerViewToModelLength( 'li', getViewListItemLength );
		data.mapper.registerViewToModelLength( 'li', getViewListItemLength );

		// editing.mapper.on( 'modelToViewPosition', modelToViewPosition( editing.view ) );
		// editing.mapper.on( 'viewToModelPosition', viewToModelPosition( editor.model ) );
		// data.mapper.on( 'modelToViewPosition', modelToViewPosition( editing.view ) );

		editor.conversion.for( 'editingDowncast' )
			.elementToElement( {
				model: 'listItem',
				view: ( modelElement, { writer } ) => {
					const viewElement = writer.createContainerElement(
						'span', { class: 'ck-list-bogus-paragraph' }, { isAllowedInsideAttributeElement: true }
					);

					writer.setCustomProperty( 'listItemId', uid(), viewElement );

					return viewElement;
				}
			} )
			.add( dispatcher => {
				const converter = listItemWrap();

				dispatcher.on( 'attribute:listIndent:listItem', converter );
				dispatcher.on( 'attribute:listType:listItem', converter );
			} );

		editor.conversion.for( 'dataDowncast' )
			.add( dispatcher => {
				dispatcher.on( 'insert:listItem', listItemWrap( { dataPipeline: true } ) );
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

		this.listenTo( editor.model.document, 'change:data', handleDataChange( editor.model, editor.editing ) );

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

function listItemWrap( { dataPipeline } = {} ) {
	const consumer = createAttributesConsumer( { attributes: [ 'listType', 'listIndent' ] } );
	const listItemsIds = new WeakMap();

	return ( evt, data, { writer, mapper, consumable, convertChildren } ) => {
		if ( data.item.is( 'selection' ) ) {
			return;
		}

		const listItem = data.item;

		// Consume attributes on the converted items.
		if ( !consumer( listItem, consumable ) ) {
			return;
		}

		const viewElement = mapper.toViewElement( listItem );
		let viewRange;

		if ( viewElement ) {
			// First, unwrap the item from current list wrappers.
			let attributeElement = viewElement.parent;

			while ( attributeElement.is( 'attributeElement' ) && [ 'ul', 'ol', 'li' ].includes( attributeElement.name ) ) {
				const parentElement = attributeElement.parent;

				// Make a clone of an attribute element that only includes properties of generic list (i.e., without list styles).
				const element = writer.createAttributeElement( attributeElement.name, null, {
					priority: attributeElement.priority,
					id: attributeElement.id
				} );

				writer.unwrap( writer.createRangeOn( viewElement ), element );

				attributeElement = parentElement;
			}

			viewRange = writer.createRangeOn( viewElement );
		} else if ( dataPipeline && evt.name == 'insert:listItem' ) {
			if ( !consumable.consume( data.item, evt.name ) ) {
				return;
			}

			const slotElement = writer.createContainerElement( '$slot', null, { isAllowedInsideAttributeElement: true } );
			const viewPosition = mapper.toViewPosition( data.range.start );

			mapper.bindElements( data.item, slotElement );
			writer.insert( viewPosition, slotElement );

			convertChildren( data.item );

			viewRange = writer.move( writer.createRangeIn( slotElement ), viewPosition );
			writer.remove( slotElement );
			mapper.unbindViewElement( slotElement );
		}

		// Then wrap them with the new list wrappers.
		const listItemIndent = listItem.getAttribute( 'listIndent' );

		if ( listItemIndent === null ) {
			return;
		}

		let listItemId = viewElement && ( viewElement.getCustomProperty( 'listItemId' ) || listItemsIds.get( listItem ) );

		if ( !listItemId ) {
			listItemsIds.set( listItem, listItemId = uid() );
		}

		let listType = listItem.getAttribute( 'listType' );
		let currentListItem = listItem;

		for ( let indent = listItemIndent; indent >= 0; indent-- ) {
			const listItemViewElement = createListItemElement( writer, indent, listItemId );
			const listViewElement = createListElement( writer, indent, listType );

			if ( dataPipeline ) {
				listItemViewElement.getFillerOffset = getListItemFillerOffset;
			}

			viewRange = writer.wrap( viewRange, listItemViewElement );
			viewRange = writer.wrap( viewRange, listViewElement );

			if ( indent == 0 ) {
				break;
			}

			currentListItem = getSiblingListItem( currentListItem, { smallerIndent: true, listIndent: indent } );

			const currentListItemViewElement = mapper.toViewElement( currentListItem );

			listItemId = currentListItemViewElement ?
				currentListItemViewElement.getCustomProperty( 'listItemId' ) :
				listItemsIds.get( currentListItem );
			listType = currentListItem.getAttribute( 'listType' );
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

function handleDataChange( model, editing ) {
	return () => {
		const changes = model.document.differ.getChanges();

		for ( const entry of changes ) {
			let position = null;

			if ( entry.type == 'insert' && entry.name == 'listItem' ) {
				position = entry.position.getShiftedBy( entry.length );
			} else if ( entry.type == 'remove' && entry.name == 'listItem' ) {
				position = entry.position;
			} else if ( entry.type == 'attribute' && entry.attributeKey.startsWith( 'list' ) ) {
				position = entry.range.start.getShiftedBy( 1 );
			}

			if ( !position ) {
				continue;
			}

			const changedListItem = position.nodeBefore;
			const followingListItem = position.nodeAfter;

			if ( !changedListItem || !changedListItem.is( 'element', 'listItem' ) ) {
				continue;
			}

			if ( !followingListItem || !followingListItem.is( 'element', 'listItem' ) ) {
				continue;
			}

			let indent;

			if ( entry.type == 'remove' ) {
				indent = entry.attributes.get( 'listIndent' );
			} else if ( entry.type == 'attribute' && entry.attributeKey == 'listIndent' ) {
				indent = Math.min( changedListItem.getAttribute( 'listIndent' ), entry.attributeOldValue );
			} else {
				indent = changedListItem.getAttribute( 'listIndent' );
			}

			for (
				let currentNode = followingListItem;
				currentNode && currentNode.is( 'element', 'listItem' );
				currentNode = currentNode.nextSibling
			) {
				if ( currentNode.getAttribute( 'listIndent' ) <= indent ) {
					break;
				}

				if ( !editing.mapper.toViewElement( currentNode ) ) {
					continue;
				}

				// TODO this could trigger refreshAttribute( currentNode, 'listIndent' )
				editing.reconvertItem( currentNode );
				console.log( '-- refresh item', currentNode.childCount ? currentNode.getChild( 0 ).data : currentNode );
			}
		}
	};
}

function getListItemFillerOffset() {
	for ( const [ idx, child ] of Array.from( this.getChildren() ).entries() ) {
		if ( child.is( 'uiElement' ) ) {
			continue;
		}

		// There is no content before a nested list so render a block filler just before the nested list.
		if ( child.is( 'element', 'ul' ) || child.is( 'element', 'ol' ) ) {
			return idx;
		} else {
			return null;
		}
	}

	// Render block filler at the end of element (after all ui elements).
	return this.childCount;
}
