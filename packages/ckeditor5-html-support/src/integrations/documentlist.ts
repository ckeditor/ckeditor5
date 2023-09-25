/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/integrations/documentlist
 */

import { isEqual } from 'lodash-es';
import { Plugin } from 'ckeditor5/src/core';
import type { UpcastElementEvent } from 'ckeditor5/src/engine';
import type { GetCallback } from 'ckeditor5/src/utils';
import type {
	DocumentListEditing,
	DocumentListEditingPostFixerEvent,
	IndentCommand,
	DocumentListIndentCommand
} from '@ckeditor/ckeditor5-list';

import { getHtmlAttributeName, setViewAttributes } from '../utils';
import DataFilter, { type DataFilterRegisterEvent } from '../datafilter';

/**
 * Provides the General HTML Support integration with the {@link module:list/documentlist~DocumentList Document List} feature.
 */
export default class DocumentListElementSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ DataFilter ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'DocumentListElementSupport' as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'DocumentListEditing' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );
		const documentListEditing: DocumentListEditing = editor.plugins.get( 'DocumentListEditing' );
		const viewElements = [ 'ul', 'ol', 'li' ];

		// Register downcast strategy.
		// Note that this must be done before document list editing registers conversion in afterInit.
		documentListEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'htmlLiAttributes',
			setAttributeOnDowncast: setViewAttributes
		} );

		documentListEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'htmlUlAttributes',
			setAttributeOnDowncast: setViewAttributes
		} );

		documentListEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'htmlOlAttributes',
			setAttributeOnDowncast: setViewAttributes
		} );

		dataFilter.on<DataFilterRegisterEvent>( 'register', ( evt, definition ) => {
			if ( !viewElements.includes( definition.view! ) ) {
				return;
			}

			evt.stop();

			// Do not register same converters twice.
			if ( schema.checkAttribute( '$block', 'htmlLiAttributes' ) ) {
				return;
			}

			const allowAttributes = viewElements.map( element => getHtmlAttributeName( element ) );

			schema.extend( '$listItem', { allowAttributes } );

			conversion.for( 'upcast' ).add( dispatcher => {
				dispatcher.on<UpcastElementEvent>(
					'element:ul', viewToModelListAttributeConverter( 'htmlUlAttributes', dataFilter ), { priority: 'low' }
				);
				dispatcher.on<UpcastElementEvent>(
					'element:ol', viewToModelListAttributeConverter( 'htmlOlAttributes', dataFilter ), { priority: 'low' }
				);
				dispatcher.on<UpcastElementEvent>(
					'element:li', viewToModelListAttributeConverter( 'htmlLiAttributes', dataFilter ), { priority: 'low' }
				);
			} );
		} );

		// Make sure that all items in a single list (items at the same level & listType) have the same properties.
		documentListEditing.on<DocumentListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			for ( const { node, previousNodeInList } of listNodes ) {
				// This is a first item of a nested list.
				if ( !previousNodeInList ) {
					continue;
				}

				if ( previousNodeInList.getAttribute( 'listType' ) == node.getAttribute( 'listType' ) ) {
					const attribute = getAttributeFromListType( previousNodeInList.getAttribute( 'listType' ) );
					const value = previousNodeInList.getAttribute( attribute );

					if (
						!isEqual( node.getAttribute( attribute ), value ) &&
						writer.model.schema.checkAttribute( node, attribute )
					) {
						writer.setAttribute( attribute, value, node );
						evt.return = true;
					}
				}

				if ( previousNodeInList.getAttribute( 'listItemId' ) == node.getAttribute( 'listItemId' ) ) {
					const value = previousNodeInList.getAttribute( 'htmlLiAttributes' );

					if (
						!isEqual( node.getAttribute( 'htmlLiAttributes' ), value ) &&
						writer.model.schema.checkAttribute( node, 'htmlLiAttributes' )
					) {
						writer.setAttribute( 'htmlLiAttributes', value, node );
						evt.return = true;
					}
				}
			}
		} );

		// Remove `ol` attributes from `ul` elements and vice versa.
		documentListEditing.on<DocumentListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			for ( const { node } of listNodes ) {
				const listType = node.getAttribute( 'listType' );

				if ( listType !== 'numbered' && node.getAttribute( 'htmlOlAttributes' ) ) {
					writer.removeAttribute( 'htmlOlAttributes', node );
					evt.return = true;
				}

				if ( listType === 'numbered' && node.getAttribute( 'htmlUlAttributes' ) ) {
					writer.removeAttribute( 'htmlUlAttributes', node );
					evt.return = true;
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;

		if ( !editor.commands.get( 'indentList' ) ) {
			return;
		}

		// Reset list attributes after indenting list items.
		const indentList: IndentCommand | DocumentListIndentCommand = editor.commands.get( 'indentList' )!;
		this.listenTo( indentList, 'afterExecute', ( evt, changedBlocks ) => {
			editor.model.change( writer => {
				for ( const node of changedBlocks ) {
					const attribute = getAttributeFromListType( node.getAttribute( 'listType' ) );

					if ( !editor.model.schema.checkAttribute( node, attribute ) ) {
						continue;
					}

					// Just reset the attribute.
					// If there is a previous indented list that this node should be merged into,
					// the postfixer will unify all the attributes of both sub-lists.
					writer.setAttribute( attribute, {}, node );
				}
			} );
		} );
	}
}

/**
 * View-to-model conversion helper preserving allowed attributes on {@link TODO}
 * feature model element.
 *
 * @returns Returns a conversion callback.
 */
function viewToModelListAttributeConverter( attributeName: string, dataFilter: DataFilter ): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const viewElement = data.viewItem;

		if ( !data.modelRange ) {
			Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		const viewAttributes = dataFilter.processViewAttributes( viewElement, conversionApi );

		for ( const item of data.modelRange!.getItems( { shallow: true } ) ) {
			// Apply only to list item blocks.
			if ( !item.hasAttribute( 'listItemId' ) ) {
				continue;
			}

			// Set list attributes only on same level items, those nested deeper are already handled
			// by the recursive conversion.
			if ( item.hasAttribute( attributeName ) ) {
				continue;
			}

			if ( conversionApi.writer.model.schema.checkAttribute( item, attributeName ) ) {
				conversionApi.writer.setAttribute( attributeName, viewAttributes || {}, item );
			}
		}
	};
}

/**
 * Returns HTML attribute name based on provided list type.
 */
function getAttributeFromListType( listType: 'bulleted' | 'numbered' | 'todo' ) {
	return listType === 'numbered' ?
		'htmlOlAttributes' :
		'htmlUlAttributes';
}
