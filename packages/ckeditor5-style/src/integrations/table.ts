/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Plugin } from 'ckeditor5/src/core';
import type { Element } from 'ckeditor5/src/engine';
import type { TableUtils } from '@ckeditor/ckeditor5-table';

import type { DataFilter } from '@ckeditor/ckeditor5-html-support';

import StyleUtils, {
	type BlockStyleDefinition,
	type StyleUtilsGetAffectedBlocksEvent,
	type StyleUtilsIsEnabledForBlockEvent,
	type StyleUtilsConfigureGHSDataFilterEvent
} from '../styleutils';

/**
 * @module style/integrations/tablestylesupport
 */

export default class TableStyleSupport extends Plugin {
	private _tableUtils!: TableUtils;
	private _styleUtils!: StyleUtils;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'TableStyleSupport' {
		return 'TableStyleSupport';
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
						.map( definition => {
							return { name: 'caption', classes: definition.classes };
						} )
				);
			}
		);
	}

	private _isApplicable( definition: BlockStyleDefinition, block: Element ): boolean {
		return [ 'td', 'th' ].includes( definition.element ) && block.name == 'tableCell';
	}

	/**
	 * TODO
	 */
	private _isStyleEnabledForBlock( definition: BlockStyleDefinition, block: Element ): boolean {
		const location = this._tableUtils.getCellLocation( block )!;

		const tableRow = block.parent!;
		const table = tableRow.parent as Element;

		const headingRows = table.getAttribute( 'headingRows' ) as number || 0;
		const headingColumns = table.getAttribute( 'headingColumns' ) as number || 0;
		const isHeadingCell = location.row < headingRows || location.column < headingColumns;

		if ( definition.element == 'th' ) {
			return isHeadingCell;
		}
		else {
			return !isHeadingCell;
		}
	}

	/**
	 * TODO
	 */
	private _getAffectedBlocks( definition: BlockStyleDefinition, block: Element ): Array<Element> | null {
		if ( !this._isStyleEnabledForBlock( definition, block ) ) {
			return null;
		}
		return [ block ];
	}
}
