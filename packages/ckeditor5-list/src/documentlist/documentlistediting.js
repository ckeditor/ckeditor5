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

import { listItemUpcastConverter, listItemDowncastConverter } from './conversion';
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

		editor.conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on( 'element:li', listItemUpcastConverter() );
		} );

		editor.conversion.for( 'downcast' ).add( dispatcher => {
			const attributes = [ 'listItemId', 'listType', 'listIndent' ];
			const converter = listItemDowncastConverter( attributes );

			for ( const attributeName of attributes ) {
				dispatcher.on( `attribute:${ attributeName }`, converter );
			}
		} );

		this.listenTo( editor.model.document, 'change:data', handleDataChange( editor.model, editor.editing ) );

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
					const lastListItemElement = getListItemElements( positionParent ).pop();

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

