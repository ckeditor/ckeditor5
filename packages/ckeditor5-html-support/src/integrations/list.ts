/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/integrations/list
 */

import { isEqual } from 'es-toolkit/compat';
import { Plugin } from 'ckeditor5/src/core.js';
import type { UpcastElementEvent } from 'ckeditor5/src/engine.js';
import type { GetCallback } from 'ckeditor5/src/utils.js';
import type {
	ListEditing,
	ListEditingPostFixerEvent,
	LegacyIndentCommand,
	ListIndentCommand,
	ListType,
	ListUtils
} from '@ckeditor/ckeditor5-list';

import { getHtmlAttributeName, setViewAttributes } from '../utils.js';
import DataFilter, { type DataFilterRegisterEvent } from '../datafilter.js';

/**
 * Provides the General HTML Support integration with the {@link module:list/list~List List} feature.
 */
export default class ListElementSupport extends Plugin {
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
		return 'ListElementSupport' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'ListEditing' ) ) {
			return;
		}

		const schema = editor.model.schema;
		const conversion = editor.conversion;
		const dataFilter = editor.plugins.get( DataFilter );
		const listEditing: ListEditing = editor.plugins.get( 'ListEditing' );
		const listUtils: ListUtils = editor.plugins.get( 'ListUtils' );
		const viewElements = [ 'ul', 'ol', 'li' ];

		// Register downcast strategy.
		// Note that this must be done before document list editing registers conversion in afterInit.
		listEditing.registerDowncastStrategy( {
			scope: 'item',
			attributeName: 'htmlLiAttributes',
			setAttributeOnDowncast: setViewAttributes
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'htmlUlAttributes',
			setAttributeOnDowncast: setViewAttributes
		} );

		listEditing.registerDowncastStrategy( {
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
		listEditing.on<ListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
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
		listEditing.on<ListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			for ( const { node } of listNodes ) {
				const listType = node.getAttribute( 'listType' );

				if ( !listUtils.isNumberedListType( listType ) && node.getAttribute( 'htmlOlAttributes' ) ) {
					writer.removeAttribute( 'htmlOlAttributes', node );
					evt.return = true;
				}

				if ( listUtils.isNumberedListType( listType ) && node.getAttribute( 'htmlUlAttributes' ) ) {
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
		const indentList: LegacyIndentCommand | ListIndentCommand = editor.commands.get( 'indentList' )!;

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
			if ( item.hasAttribute( 'htmlUlAttributes' ) || item.hasAttribute( 'htmlOlAttributes' ) ) {
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
function getAttributeFromListType( listType: ListType ) {
	return listType === 'numbered' || listType == 'customNumbered' ?
		'htmlOlAttributes' :
		'htmlUlAttributes';
}
