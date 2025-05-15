/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module style/integrations/table
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { Element } from 'ckeditor5/src/engine.js';
import type { TableUtils } from '@ckeditor/ckeditor5-table';

import type { DataFilter } from '@ckeditor/ckeditor5-html-support';

import StyleUtils, {
	type BlockStyleDefinition,
	type StyleUtilsGetAffectedBlocksEvent,
	type StyleUtilsIsEnabledForBlockEvent,
	type StyleUtilsConfigureGHSDataFilterEvent
} from '../styleutils.js';

export default class TableStyleSupport extends Plugin {
	private _tableUtils!: TableUtils;
	private _styleUtils!: StyleUtils;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableStyleSupport' as const;
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
	public static get requires() {
		return [ StyleUtils ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		if ( !editor.plugins.has( 'TableEditing' ) ) {
			return;
		}

		this._styleUtils = editor.plugins.get( StyleUtils );
		this._tableUtils = this.editor.plugins.get( 'TableUtils' );

		this.listenTo<StyleUtilsIsEnabledForBlockEvent>( this._styleUtils, 'isStyleEnabledForBlock', ( evt, [ definition, block ] ) => {
			if ( this._isApplicable( definition, block ) ) {
				evt.return = this._isStyleEnabledForBlock( definition, block );
				evt.stop();
			}
		}, { priority: 'high' } );

		this.listenTo<StyleUtilsGetAffectedBlocksEvent>( this._styleUtils, 'getAffectedBlocks', ( evt, [ definition, block ] ) => {
			if ( this._isApplicable( definition, block ) ) {
				evt.return = this._getAffectedBlocks( definition, block );
				evt.stop();
			}
		}, { priority: 'high' } );

		this.listenTo<StyleUtilsConfigureGHSDataFilterEvent>(
			this._styleUtils,
			'configureGHSDataFilter',
			( evt, [ { block } ] ) => {
				const ghsDataFilter: DataFilter = this.editor.plugins.get( 'DataFilter' );

				ghsDataFilter.loadAllowedConfig(
					block
						.filter( definition => definition.element == 'figcaption' )
						.map( definition => ( { name: 'caption', classes: definition.classes } ) )
				);
			}
		);
	}

	/**
	 * Checks if this plugin's custom logic should be applied for defintion-block pair.
	 *
	 * @param definition Style definition that is being considered.
	 * @param block Block element to check if should be styled.
	 * @returns True if the defintion-block pair meet the plugin criteria, false otherwise.
	 */
	private _isApplicable( definition: BlockStyleDefinition, block: Element ): boolean {
		if ( [ 'td', 'th' ].includes( definition.element ) ) {
			return block.name == 'tableCell';
		}

		if ( [ 'thead', 'tbody' ].includes( definition.element ) ) {
			return block.name == 'table';
		}

		return false;
	}

	/**
	 * Checks if the style definition should be applied to selected block.
	 *
	 * @param definition Style definition that is being considered.
	 * @param block Block element to check if should be styled.
	 * @returns True if the block should be style with the style description, false otherwise.
	 */
	private _isStyleEnabledForBlock( definition: BlockStyleDefinition, block: Element ): boolean {
		if ( [ 'td', 'th' ].includes( definition.element ) ) {
			const location = this._tableUtils.getCellLocation( block )!;

			const tableRow = block.parent!;
			const table = tableRow.parent as Element;

			const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
			const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;
			const isHeadingCell = location.row < headingRows || location.column < headingColumns;

			if ( definition.element == 'th' ) {
				return isHeadingCell;
			} else {
				return !isHeadingCell;
			}
		}

		if ( [ 'thead', 'tbody' ].includes( definition.element ) ) {
			const headingRows = block.getAttribute( 'headingRows' ) as number || 0;

			if ( definition.element == 'thead' ) {
				return headingRows > 0;
			} else {
				return headingRows < this._tableUtils.getRows( block );
			}
		}

		/* istanbul ignore next -- @preserve */
		return false;
	}

	/**
	 * Gets all blocks that the style should be applied to.
	 *
	 * @param definition Style definition that is being considered.
	 * @param block A block element from selection.
	 * @returns An array with the block that was passed as an argument if meets the criteria, null otherwise.
	 */
	private _getAffectedBlocks( definition: BlockStyleDefinition, block: Element ): Array<Element> | null {
		if ( !this._isStyleEnabledForBlock( definition, block ) ) {
			return null;
		}

		return [ block ];
	}
}
