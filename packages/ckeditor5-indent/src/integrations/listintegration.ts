/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module indent/integrations/listintegration
 */

import {
	type ListEditingPostFixerEvent,
	type GetCallback
} from 'ckeditor5';
import { Plugin } from 'ckeditor5/src/core.js';
import {
	addMarginStylesRules,
	type UpcastElementEvent
} from 'ckeditor5/src/engine.js';

/**
 * This integration enables using block indentation feature with lists.
 */
export class ListIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListIntegration' as const;
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

		if ( !this.editor.plugins.has( 'ListEditing' ) ) {
			return;
		}

		const listEditing = editor.plugins.get( 'ListEditing' );

		editor.data.addStyleProcessorRules( addMarginStylesRules );

		this._setupConversionUsingOffsetForListBlock();

		// Make sure that all items in a single list (items at the same level & listType) have the same blockIndentList attribute value.
		listEditing.on<ListEditingPostFixerEvent>( 'postFixer', ( evt, { listNodes, writer } ) => {
			for ( const { node, previousNodeInList } of listNodes ) {
				// This is a first item of a nested list.
				if ( !previousNodeInList ) {
					continue;
				}

				if ( previousNodeInList.getAttribute( 'listType' ) != node.getAttribute( 'listType' ) ) {
					continue;
				}

				const prevNodeValue = previousNodeInList.getAttribute( 'blockIndentList' );

				if ( node.getAttribute( 'blockIndentList' ) !== prevNodeValue ) {
					if ( prevNodeValue ) {
						writer.setAttribute( 'blockIndentList', prevNodeValue, node );
					} else {
						writer.removeAttribute( 'blockIndentList', node );
					}

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
		const model = editor.model;
		const schema = model.schema;

		if ( !editor.plugins.has( 'ListEditing' ) ) {
			return;
		}

		schema.extend( '$listItem', { allowAttributes: [ 'blockIndentList' ] } );
		schema.setAttributeProperties( 'blockIndentList', { isFormatting: true } );

		model.schema.addAttributeCheck( context => {
			const item = context.last;

			if ( !item.getAttribute( 'listItemId' ) ) {
				return false;
			}
		}, 'blockIndentList' );
	}

	/**
	 * Setups conversion for using offset indents.
	 */
	private _setupConversionUsingOffsetForListBlock(): void {
		const editor = this.editor;
		const conversion = editor.conversion;
		const locale = editor.locale;
		const marginProperty = locale.contentLanguageDirection === 'rtl' ? 'margin-right' : 'margin-left';
		const listEditing = editor.plugins.get( 'ListEditing' );

		conversion.for( 'upcast' ).add( dispatcher => {
			dispatcher.on<UpcastElementEvent>( 'element:ol', listBlockIndentUpcastConverter( marginProperty ) );
			dispatcher.on<UpcastElementEvent>( 'element:ul', listBlockIndentUpcastConverter( marginProperty ) );
		} );

		listEditing.registerDowncastStrategy( {
			scope: 'list',
			attributeName: 'blockIndentList',

			setAttributeOnDowncast( writer, value, element ) {
				if ( value ) {
					writer.setStyle( marginProperty, value as string, element );
				}
			}
		} );
	}
}

function listBlockIndentUpcastConverter( marginProperty: string ): GetCallback<UpcastElementEvent> {
	return ( evt, data, conversionApi ) => {
		const { writer, consumable } = conversionApi;

		if ( !data.modelRange ) {
			Object.assign( data, conversionApi.convertChildren( data.viewItem, data.modelCursor ) );
		}

		const marginValue = data.viewItem.getStyle( marginProperty );
		let applied = false;
		let indentLevel;

		for ( const item of data.modelRange!.getItems( { shallow: true } ) ) {
			if ( indentLevel === undefined ) {
				indentLevel = item.getAttribute( 'listIndent' );
			}

			if ( item.hasAttribute( 'blockIndentList' ) ) {
				continue;
			}

			if ( item.getAttribute( 'listIndent' ) !== indentLevel ) {
				continue;
			}

			writer.setAttribute( 'blockIndentList', marginValue, item );
			applied = true;
		}

		if ( applied ) {
			consumable.consume( data.viewItem, { styles: marginProperty } );
		}
	};
}
