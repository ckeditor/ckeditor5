/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { Enter } from 'ckeditor5/src/enter';
import { Delete } from 'ckeditor5/src/typing';
import { CKEditorError, uid } from 'ckeditor5/src/utils';

import { listItemUpcastConverter, listItemDowncastConverter } from './converters';
import { getListItemElements } from './utils';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class DocumentListEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'DocumentListEditing';
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

		if ( editor.plugins.has( 'ListEditing' ) ) {
			/**
			 * The DocumentList feature can not be loaded together with List plugin.
			 *
			 * @error document-list-feature-conflict
			 * @param {String} conflictPlugin Name of the plugin.
			 */
			throw new CKEditorError( 'document-list-feature-conflict', this, { conflictPlugin: 'ListEditing' } );
		}

		editor.model.schema.extend( '$block', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		editor.model.schema.extend( '$blockObject', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );
		editor.model.schema.extend( '$container', { allowAttributes: [ 'listType', 'listIndent', 'listItemId' ] } );

		editor.model.document.registerPostFixer( writer => modelChangePostFixer( editor.model, writer ) );

		editor.data.mapper.registerViewToModelLength( 'li', createViewListItemModelLength( editor.data.mapper, editor.model.schema ) );

		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:li', listItemUpcastConverter() );
		} );

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			const attributes = [ 'listItemId', 'listType', 'listIndent' ];
			const converter = listItemDowncastConverter( attributes, editor.model );

			dispatcher.on( 'insert:paragraph', converter, { priority: 'high' } );

			for ( const attributeName of attributes ) {
				dispatcher.on( `attribute:${ attributeName }`, converter );
			}
		} );

		editor.conversion.for( 'dataDowncast' ).add( dispatcher => {
			const attributes = [ 'listItemId', 'listType', 'listIndent' ];
			const converter = listItemDowncastConverter( attributes, editor.model, { dataPipeline: true } );

			dispatcher.on( 'insert:paragraph', converter, { priority: 'high' } );

			for ( const attributeName of attributes ) {
				dispatcher.on( `attribute:${ attributeName }`, converter );
			}
		} );

		this.listenTo( editor.model.document, 'change:data', handleDataChange( editor.model, editor.editing ) );

		editor.model.on( 'insertContent', createModelIndentPasteFixer( editor.model ), { priority: 'high' } );

		this._enableEnterHandling();
	}

	/**
	 * TODO
	 *
	 * @private
	 */
	_enableEnterHandling() {
		const editor = this.editor;
		const enterCommand = editor.commands.get( 'enter' );

		if ( enterCommand ) {
			this.listenTo( enterCommand, 'afterExecute', ( evt, { writer } ) => {
				const position = editor.model.document.selection.getFirstPosition();
				const positionParent = position.parent;

				if ( positionParent.hasAttribute( 'listItemId' ) && position.isAtEnd ) {
					const lastListItemElement = getListItemElements( positionParent, editor.model ).pop();

					if ( lastListItemElement == positionParent ) {
						writer.setAttribute( 'listItemId', uid(), lastListItemElement );
					}
				}
			} );
		}
	}
}

// TODO
function handleDataChange( model, editing ) {
	return () => {
		const changes = model.document.differ.getChanges();

		for ( const entry of changes ) {
			let position = null;

			if ( entry.type == 'insert' && entry.attributes.has( 'listItemId' ) ) {
				position = entry.position.getShiftedBy( entry.length );
			} else if ( entry.type == 'remove' && entry.attributes.has( 'listItemId' ) ) {
				position = entry.position;
			} else if ( entry.type == 'attribute' && entry.attributeKey.startsWith( 'list' ) ) {
				position = entry.range.start.getShiftedBy( 1 );
			}

			if ( !position ) {
				continue;
			}

			const changedListItem = position.nodeBefore;
			const followingListItem = position.nodeAfter;

			if ( !changedListItem || !changedListItem.is( 'element' ) || !changedListItem.hasAttribute( 'listItemId' ) ) {
				continue;
			}

			if ( !followingListItem || !followingListItem.is( 'element' ) || !followingListItem.hasAttribute( 'listItemId' ) ) {
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

			// TODO Refresh bogus vs not bogus.

			for (
				let currentNode = followingListItem;
				currentNode && currentNode.is( 'element' ) && currentNode.hasAttribute( 'listItemId' );
				currentNode = currentNode.nextSibling
			) {
				if ( currentNode.getAttribute( 'listIndent' ) <= indent ) {
					break;
				}

				if ( !editing.mapper.toViewElement( currentNode ) ) {
					continue;
				}

				editing.reconvertItem( currentNode );
				// @if CK_DEBUG // console.log( 'Refresh item', currentNode.childCount ? currentNode.getChild( 0 ).data : currentNode );
			}
		}
	};
}

/**
 * TODO
 *
 * Post-fixer that reacts to changes on document and fixes incorrect model states.
 *
 * In the example below, there is a correct list structure.
 * Then the middle element is removed so the list structure will become incorrect:
 *
 *		<listItem listType="bulleted" listIndent=0>Item 1</listItem>
 *		<listItem listType="bulleted" listIndent=1>Item 2</listItem>   <--- this is removed.
 *		<listItem listType="bulleted" listIndent=2>Item 3</listItem>
 *
 * The list structure after the middle element is removed:
 *
 * 		<listItem listType="bulleted" listIndent=0>Item 1</listItem>
 *		<listItem listType="bulleted" listIndent=2>Item 3</listItem>
 *
 * Should become:
 *
 *		<listItem listType="bulleted" listIndent=0>Item 1</listItem>
 *		<listItem listType="bulleted" listIndent=1>Item 3</listItem>   <--- note that indent got post-fixed.
 *
 * @param {module:engine/model/model~Model} model The data model.
 * @param {module:engine/model/writer~Writer} writer The writer to do changes with.
 * @returns {Boolean} `true` if any change has been applied, `false` otherwise.
 */
export function modelChangePostFixer( model, writer ) {
	const changes = model.document.differ.getChanges();
	const itemToListHead = new Map();

	let applied = false;

	// TODO this should also fix listItemId attribute values

	for ( const entry of changes ) {
		if ( entry.type == 'insert' && entry.attributes.has( 'listItemId' ) ) {
			_addListToFix( entry.position );
		} else if ( entry.type == 'insert' && !entry.attributes.has( 'listItemId' ) ) {
			if ( entry.name != '$text' ) {
				// In case of renamed element.
				const item = entry.position.nodeAfter;

				for ( const attributeName of [ 'listIndent', 'listType', 'listStyle' ] ) {
					if ( item.hasAttribute( attributeName ) ) {
						writer.removeAttribute( attributeName, item );

						applied = true;
					}
				}

				for ( const { item: innerItem, previousPosition } of model.createRangeIn( item ) ) {
					if ( innerItem.is( 'element' ) && innerItem.hasAttribute( 'listItemId' ) ) {
						_addListToFix( previousPosition );
					}
				}
			}

			const posAfter = entry.position.getShiftedBy( entry.length );

			_addListToFix( posAfter );
		} else if ( entry.type == 'remove' && entry.attributes.has( 'listItemId' ) ) {
			_addListToFix( entry.position );
		} else if ( entry.type == 'attribute' && entry.attributeKey == 'listIndent' ) {
			_addListToFix( entry.range.start );
		} else if ( entry.type == 'attribute' && entry.attributeKey == 'listType' ) {
			_addListToFix( entry.range.start );
		}
	}

	for ( const listHead of itemToListHead.values() ) {
		_fixListIndents( listHead );
		_fixListTypes( listHead );
	}

	return applied;

	function _addListToFix( position ) {
		const previousNode = position.nodeBefore;

		if ( !previousNode || !previousNode.hasAttribute( 'listItemId' ) ) {
			const item = position.nodeAfter;

			if ( item && item.hasAttribute( 'listItemId' ) ) {
				itemToListHead.set( item, item );
			}
		} else {
			let listHead = previousNode;

			if ( itemToListHead.has( listHead ) ) {
				return;
			}

			for (
				// Cache previousSibling and reuse for performance reasons. See #6581.
				let previousSibling = listHead.previousSibling;
				previousSibling && previousSibling.hasAttribute( 'listItemId' );
				previousSibling = listHead.previousSibling
			) {
				listHead = previousSibling;

				if ( itemToListHead.has( listHead ) ) {
					return;
				}
			}

			itemToListHead.set( previousNode, listHead );
		}
	}

	function _fixListIndents( item ) {
		let maxIndent = 0;
		let fixBy = null;

		while ( item && item.hasAttribute( 'listItemId' ) ) {
			const itemIndent = item.getAttribute( 'listIndent' );

			if ( itemIndent > maxIndent ) {
				let newIndent;

				if ( fixBy === null ) {
					fixBy = itemIndent - maxIndent;
					newIndent = maxIndent;
				} else {
					if ( fixBy > itemIndent ) {
						fixBy = itemIndent;
					}

					newIndent = itemIndent - fixBy;
				}

				writer.setAttribute( 'listIndent', newIndent, item );

				applied = true;
			} else {
				fixBy = null;
				maxIndent = item.getAttribute( 'listIndent' ) + 1;
			}

			item = item.nextSibling;
		}
	}

	function _fixListTypes( item ) {
		let typesStack = [];
		let prev = null;

		while ( item && item.hasAttribute( 'listItemId' ) ) {
			const itemIndent = item.getAttribute( 'listIndent' );

			if ( prev && prev.getAttribute( 'listIndent' ) > itemIndent ) {
				typesStack = typesStack.slice( 0, itemIndent + 1 );
			}

			if ( itemIndent != 0 ) {
				if ( typesStack[ itemIndent ] ) {
					const type = typesStack[ itemIndent ];

					if ( item.getAttribute( 'listType' ) != type ) {
						writer.setAttribute( 'listType', type, item );

						applied = true;
					}
				} else {
					typesStack[ itemIndent ] = item.getAttribute( 'listType' );
				}
			}

			prev = item;
			item = item.nextSibling;
		}
	}
}

// TODO
function createViewListItemModelLength( mapper, schema ) {
	function getViewListItemModelLength( element ) {
		let length = 0;

		// First count model size of nested lists.
		for ( const child of element.getChildren() ) {
			if ( child.name == 'ul' || child.name == 'ol' ) {
				for ( const item of child.getChildren() ) {
					length += getViewListItemModelLength( item );
				}
			}
		}

		let hasBlocks = false;

		// Then add the size of block elements or in case of content directly in the LI add 1.
		for ( const child of element.getChildren() ) {
			if ( child.name != 'ul' && child.name != 'ol' ) {
				const modelElement = mapper.toModelElement( child );

				// If the content is not mapped (attribute element or a text)
				// or is inline then this is a content directly in the LI.
				if ( !modelElement || schema.isInline( modelElement ) ) {
					return length + 1;
				}

				// There are some blocks in LI so count their model length.
				length += mapper.getModelLength( child );
				hasBlocks = true;
			}
		}

		// If the LI was empty or contained only nested lists.
		if ( !hasBlocks ) {
			length += 1;
		}

		// Return model length or 1 for a single empty LI.
		return length;
	}

	return getViewListItemModelLength;
}

/**
 * TODO
 *
 * A fixer for pasted content that includes list items.
 *
 * It fixes indentation of pasted list items so the pasted items match correctly to the context they are pasted into.
 *
 * Example:
 *
 *		<listItem listType="bulleted" listIndent=0>A</listItem>
 *		<listItem listType="bulleted" listIndent=1>B^</listItem>
 *		// At ^ paste:  <listItem listType="bulleted" listIndent=4>X</listItem>
 *		//              <listItem listType="bulleted" listIndent=5>Y</listItem>
 *		<listItem listType="bulleted" listIndent=2>C</listItem>
 *
 * Should become:
 *
 *		<listItem listType="bulleted" listIndent=0>A</listItem>
 *		<listItem listType="bulleted" listIndent=1>BX</listItem>
 *		<listItem listType="bulleted" listIndent=2>Y/listItem>
 *		<listItem listType="bulleted" listIndent=2>C</listItem>
 *
 */
function createModelIndentPasteFixer( model ) {
	return ( evt, [ content, selectable ] ) => {
		// Check whether inserted content starts from a `listItem`. If it does not, it means that there are some other
		// elements before it and there is no need to fix indents, because even if we insert that content into a list,
		// that list will be broken.
		// Note: we also need to handle singular elements because inserting item with indent 0 into 0,1,[],2
		// would create incorrect model.
		let item = content.is( 'documentFragment' ) ? content.getChild( 0 ) : content;

		let selection;

		if ( !selectable ) {
			selection = model.document.selection;
		} else {
			selection = model.createSelection( selectable );
		}

		if ( item && item.hasAttribute( 'listItemId' ) ) {
			// Get a reference list item. Inserted list items will be fixed according to that item.
			const pos = selection.getFirstPosition();
			let refItem = null;

			if ( pos.parent.hasAttribute( 'listItemId' ) ) {
				refItem = pos.parent;
			} else if ( pos.nodeBefore && pos.nodeBefore.hasAttribute( 'listItemId' ) ) {
				refItem = pos.nodeBefore;
			}

			// If there is `refItem` it means that we do insert list items into an existing list.
			if ( refItem ) {
				// First list item in `data` has indent equal to 0 (it is a first list item). It should have indent equal
				// to the indent of reference item. We have to fix the first item and all of it's children and following siblings.
				// Indent of all those items has to be adjusted to reference item.
				const indentChange = refItem.getAttribute( 'listIndent' );

				// Fix only if there is anything to fix.
				if ( indentChange > 0 ) {
					model.change( writer => {
						// Adjust indent of all "first" list items in inserted data.
						while ( item && item.hasAttribute( 'listItemId' ) ) {
							writer.setAttribute( 'listIndent', item.getAttribute( 'listIndent' ) + indentChange, item );

							item = item.nextSibling;
						}
					} );
				}
			}
		}
	};
}
