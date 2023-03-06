/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistcommand
 */

import type { Element } from 'ckeditor5/src/engine';
import { Command, type Editor } from 'ckeditor5/src/core';
import {
	splitListItemBefore,
	expandListBlocksToCompleteItems,
	getListItemBlocks,
	getListItems,
	removeListAttributes,
	outdentFollowingItems,
	ListItemUid,
	sortBlocks,
	getSelectedBlockObject,
	isListItemBlock
} from './utils/model';

/**
 * The list command. It is used by the {@link module:list/documentlist~DocumentList document list feature}.
 */
export default class DocumentListCommand extends Command {
	/**
	 * The type of the list created by the command.
	 */
	public readonly type: 'numbered' | 'bulleted';

	/**
	 * A flag indicating whether the command is active, which means that the selection starts in a list of the same type.
	 *
	 * @observable
	 * @readonly
	 */
	public declare value: boolean;

	/**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param type List type that will be handled by this command.
	 */
	constructor( editor: Editor, type: 'numbered' | 'bulleted' ) {
		super( editor );

		this.type = type;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.value = this._getValue();
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Executes the list command.
	 *
	 * @fires execute
	 * @fires afterExecute
	 * @param options Command options.
	 * @param options.forceValue If set, it will force the command behavior. If `true`, the command will try to convert the
	 * selected items and potentially the neighbor elements to the proper list items. If set to `false` it will convert selected elements
	 * to paragraphs. If not set, the command will toggle selected elements to list items or paragraphs, depending on the selection.
	 */
	public override execute( options: { forceValue?: boolean } = {} ): void {
		const model = this.editor.model;
		const document = model.document;
		const selectedBlockObject = getSelectedBlockObject( model );

		const blocks = Array.from( document.selection.getSelectedBlocks() )
			.filter( block => model.schema.checkAttribute( block, 'listType' ) );

		// Whether we are turning off some items.
		const turnOff = options.forceValue !== undefined ? !options.forceValue : this.value;

		model.change( writer => {
			if ( turnOff ) {
				const lastBlock = blocks[ blocks.length - 1 ];

				// Split the first block from the list item.
				const itemBlocks = getListItemBlocks( lastBlock, { direction: 'forward' } );
				const changedBlocks = [];

				if ( itemBlocks.length > 1 ) {
					changedBlocks.push( ...splitListItemBefore( itemBlocks[ 1 ], writer ) );
				}

				// Convert list blocks to plain blocks.
				changedBlocks.push( ...removeListAttributes( blocks, writer ) );

				// Outdent items following the selected list item.
				changedBlocks.push( ...outdentFollowingItems( lastBlock, writer ) );

				this._fireAfterExecute( changedBlocks );
			}
			// Turning on the list items for a collapsed selection inside a list item.
			else if ( ( selectedBlockObject || document.selection.isCollapsed ) && isListItemBlock( blocks[ 0 ] ) ) {
				const changedBlocks = getListItems( selectedBlockObject || blocks[ 0 ] );

				for ( const block of changedBlocks ) {
					writer.setAttribute( 'listType', this.type, block );
				}

				this._fireAfterExecute( changedBlocks );
			}
			// Turning on the list items for a non-collapsed selection.
			else {
				const changedBlocks = [];

				for ( const block of blocks ) {
					// Promote the given block to the list item.
					if ( !block.hasAttribute( 'listType' ) ) {
						writer.setAttributes( {
							listIndent: 0,
							listItemId: ListItemUid.next(),
							listType: this.type
						}, block );

						changedBlocks.push( block );
					}
					// Change the type of list item.
					else {
						for ( const node of expandListBlocksToCompleteItems( block, { withNested: false } ) ) {
							if ( node.getAttribute( 'listType' ) != this.type ) {
								writer.setAttribute( 'listType', this.type, node );
								changedBlocks.push( node );
							}
						}
					}
				}

				this._fireAfterExecute( changedBlocks );
			}
		} );
	}

	/**
	 * Fires the `afterExecute` event.
	 *
	 * @param changedBlocks The changed list elements.
	 */
	private _fireAfterExecute( changedBlocks: Array<Element> ) {
		this.fire<DocumentListCommandAfterExecuteEvent>( 'afterExecute', sortBlocks( new Set( changedBlocks ) ) );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */
	private _getValue(): boolean {
		const selection = this.editor.model.document.selection;
		const blocks = Array.from( selection.getSelectedBlocks() );

		if ( !blocks.length ) {
			return false;
		}

		for ( const block of blocks ) {
			if ( block.getAttribute( 'listType' ) != this.type ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */
	private _checkEnabled(): boolean {
		const selection = this.editor.model.document.selection;
		const schema = this.editor.model.schema;
		const blocks = Array.from( selection.getSelectedBlocks() );

		if ( !blocks.length ) {
			return false;
		}

		// If command value is true it means that we are in list item, so the command should be enabled.
		if ( this.value ) {
			return true;
		}

		for ( const block of blocks ) {
			if ( schema.checkAttribute( block, 'listType' ) ) {
				return true;
			}
		}

		return false;
	}
}

/**
 * Event fired by the {@link ~DocumentListCommand#execute} method.
 *
 * It allows to execute an action after executing the {@link ~DocumentListCommand#execute} method,
 * for example adjusting attributes of changed list items.
 *
 * @internal
 * @eventName ~DocumentListCommand#afterExecute
 */
export type DocumentListCommandAfterExecuteEvent = {
	name: 'afterExecute';
	args: [ changedBlocks: Array<Element> ];
};
