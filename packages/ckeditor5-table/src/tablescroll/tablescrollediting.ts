/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablescroll/tablescrollediting
 */

import { throttle } from 'es-toolkit/compat';

import { Plugin, type Editor, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { global, type Collection, type CollectionChangeEvent, type EventInfo } from '@ckeditor/ckeditor5-utils';
import type {
	ModelElement,
	ViewElement,
	DowncastAttributeEvent,
	DowncastInsertEvent
} from '@ckeditor/ckeditor5-engine';

import { TableEditing } from '../tableediting.js';
import type { TableType } from '../tableconfig.js';

import { watchTableModelElements, watchRootsWidthResize, watchRootsScroll } from './watchers.js';
import { getWidthInPixels, isWidthProbeNeeded } from './measure.js';
import { getContainerContentWidth } from '../tablecolumnresize/utils.js';

/**
 * The table scrolling editing plugin.
 */
export class TableScrollEditing extends Plugin {
	/**
	 * Stops the `scroll` listeners set up by {@link #_watchFiguresScroll}.
	 */
	private _stopWatchingRootsScroll?: () => void;

	/**
	 * Stops the `resize` observers set up by {@link #_watchRootEditables}.
	 */
	private _stopWatchingRootsResize?: () => void;

	/**
	 * The throttled recalculation callback set up by {@link #_watchRootEditables}, kept so {@link #destroy}
	 * can cancel any call still pending. `undefined` until {@link #init} has run.
	 */
	private _throttledRecalculateAll?: ReturnType<typeof throttle<() => void>>;

	/**
	 * Tables queued by {@link #_updateAfterRender}.
	 */
	private _tablesToUpdateAfterRender = new Set<ModelElement>();

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TableScrollEditing' as const;
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
	public static get requires(): PluginDependenciesOf<[ TableEditing ]> {
		return [ TableEditing ];
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		editor.config.define( 'table.tableScroll.tableTypes', [ 'content' ] );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const { editor } = this;
		const tables = watchTableModelElements( editor.model );

		this._watchNewTables( tables );
		this._watchRootEditables( tables );
		this._registerConversion();
		this._watchColumnResize();
		this._watchFiguresScroll();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._stopWatchingRootsScroll?.();
		this._stopWatchingRootsResize?.();
		this._throttledRecalculateAll?.cancel();

		super.destroy();
	}

	/**
	 * Whether a given table may overflow its container and become horizontally scrollable, and whether
	 * column/table resizing is allowed to grow it past the container's width.
	 *
	 * @internal
	 */
	public _isTableScrollable( table: ModelElement ): boolean {
		if ( table.parent !== table.root ) {
			return false;
		}

		const tableType: TableType = ( table.getAttribute( 'tableType' ) as TableType ) || 'content';
		const scrollableTableTypes = this.editor.config.get( 'table.tableScroll.tableTypes' )!;

		return scrollableTableTypes.includes( tableType );
	}

	/**
	 * Determines whether a table overflows its container and applies the corresponding view state:
	 * the `ck-table-overflowing` class on the figure, and the actual (possibly container-exceeding)
	 * width on the inner `<table>` and a sibling `<figcaption>`, if present.
	 *
	 * @internal
	 */
	public _updateTableScrollOverflowState( table: ModelElement, tableWidthOverride?: string | null ): void {
		const { editor } = this;
		const domRoot = editor.editing.view.getDomRoot( table.root.rootName! );

		if ( !domRoot ) {
			return;
		}

		const viewFigure = editor.editing.mapper.toViewElement( table );

		if ( !viewFigure ) {
			return;
		}

		const viewTable = findChildElement( viewFigure, 'table' );

		if ( !viewTable ) {
			return;
		}

		const viewFigcaption = findChildElement( viewFigure, 'figcaption' );

		let tableWidth: string | null = null;
		let hasTableWidthSource = false;

		if ( tableWidthOverride !== undefined ) {
			tableWidth = tableWidthOverride;
			hasTableWidthSource = true;
		} else if ( table.hasAttribute( 'tableWidth' ) ) {
			tableWidth = table.getAttribute( 'tableWidth' ) as string;
			hasTableWidthSource = true;
		}

		// Nothing (`TableProperties` / `TableColumnResizeEditing`) has ever set a `tableWidth`
		// on this table, so this plugin has no width of its own to manage here. Bail out without
		// touching the figure/table/figcaption styles, as they may have been set by something else,
		// e.g. GHS through `htmlFigureAttributes`.
		if ( !hasTableWidthSource ) {
			return;
		}

		const domFigure = editor.editing.view.domConverter.mapViewToDom( viewFigure );

		// A table that is just being downcast is not rendered yet, and a probed width may depend on the figure's font.
		if ( !domFigure && tableWidth && isWidthProbeNeeded( tableWidth ) ) {
			this._updateAfterRender( table );

			return;
		}

		const containerWidth = getContainerContentWidth( domRoot );
		const tableWidthInPixels = tableWidth ?
			getWidthInPixels( { width: tableWidth, containerWidth, domFontSource: domFigure || domRoot } ) :
			0;

		const isOverflowing = this._isTableScrollable( table ) && tableWidthInPixels > containerWidth;

		if ( isOverflowing ) {
			this._scheduleScrollOffsetSync( viewFigure );
		}

		editor.editing.view.change( writer => {
			if ( isOverflowing ) {
				writer.removeStyle( 'width', viewFigure );
				writer.addClass( 'ck-table-overflowing', viewFigure );
				writer.setStyle( 'width', tableWidth!, viewTable );

				if ( viewFigcaption ) {
					// In pixels, as the caption has its own font size, so e.g. `em` would resolve differently on it.
					writer.setStyle( 'width', `${ tableWidthInPixels }px`, viewFigcaption );
				}
			} else {
				if ( tableWidth ) {
					writer.setStyle( 'width', tableWidth, viewFigure );
				} else {
					writer.removeStyle( 'width', viewFigure );
				}

				if ( viewFigcaption ) {
					writer.removeStyle( 'width', viewFigcaption );
				}

				writer.removeClass( 'ck-table-overflowing', viewFigure );
				writer.removeStyle( 'width', viewTable );
				writer.removeStyle( '--ck-table-scroll-offset', viewFigure );
			}
		} );
	}

	/**
	 * Updates the overflow state of a table once the view is rendered. All tables queued before the render
	 * are updated in a single view change.
	 */
	private _updateAfterRender( table: ModelElement ): void {
		const { view } = this.editor.editing;

		if ( !this._tablesToUpdateAfterRender.size ) {
			view.once( 'render', () => {
				const tables = Array.from( this._tablesToUpdateAfterRender );

				this._tablesToUpdateAfterRender.clear();

				view.change( () => {
					for ( const table of tables ) {
						this._updateTableScrollOverflowState( table );
					}
				} );
			} );
		}

		this._tablesToUpdateAfterRender.add( table );
	}

	/**
	 * Schedules a re-read of the widget figure's actual `scrollLeft` into `--ck-table-scroll-offset`, once
	 * the render reflecting the change that triggered it has actually happened - see the call site for why
	 * this can't just read (and force a reflow for) `scrollLeft` immediately instead.
	 */
	private _scheduleScrollOffsetSync( viewFigure: ViewElement ): void {
		const { view } = this.editor.editing;

		view.once( 'render', () => {
			const domFigure = view.domConverter.mapViewToDom( viewFigure );

			/* v8 ignore else -- @preserve */
			if ( domFigure ) {
				view.change( writer => {
					writer.setStyle( '--ck-table-scroll-offset', `${ domFigure.scrollLeft }px`, viewFigure );
				} );
			}
		} );
	}

	/**
	 * Registers editing-only downcast listeners that keep overflow state in sync.
	 */
	private _registerConversion(): void {
		const { editor } = this;

		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on<DowncastAttributeEvent<ModelElement>>( 'attribute:tableWidth:table', ( evt, data ) => {
				this._updateTableScrollOverflowState( data.item, data.attributeNewValue as string | null );
			}, { priority: 'low' } );

			dispatcher.on<DowncastAttributeEvent<ModelElement>>( 'attribute:tableType:table', ( evt, data ) => {
				this._updateTableScrollOverflowState( data.item );
			}, { priority: 'low' } );

			dispatcher.on<DowncastInsertEvent<ModelElement>>( 'insert:caption', ( evt, data ) => {
				const modelTable = data.item.parent as ModelElement | null;

				if ( modelTable?.is( 'element', 'table' ) ) {
					this._updateTableScrollOverflowState( modelTable );
				}
			}, { priority: 'lowest' } );

			dispatcher.on<DowncastInsertEvent<ModelElement>>( 'insert:table', ( evt, data ) => {
				this._updateTableScrollOverflowState( data.item );
			}, { priority: 'lowest' } );
		} );
	}

	/**
	 * Keeps every overflowing table's `--ck-table-scroll-offset` custom property in sync with its
	 * `scrollLeft`, using a single delegated listener instead of one native listener per table.
	 */
	private _watchFiguresScroll(): void {
		const { editor } = this;
		const { view } = editor.editing;

		const onScroll = ( evt: EventInfo, domEvent: Event ) => {
			const domFigure = domEvent.target as HTMLElement;

			if ( !domFigure.classList?.contains( 'ck-table-overflowing' ) ) {
				return;
			}

			const viewFigure = view.domConverter.mapDomToView( domFigure ) as ViewElement | undefined;

			if ( !viewFigure ) {
				return;
			}

			view.change( writer => {
				writer.setStyle( '--ck-table-scroll-offset', `${ domFigure.scrollLeft }px`, viewFigure );
			} );
		};

		this._stopWatchingRootsScroll = watchRootsScroll( view, onScroll );
	}

	/**
	 * Listen for column resize events and updates proper view element size.
	 */
	private _watchColumnResize(): void {
		const { editor } = this;
		const { plugins } = editor;

		if ( !plugins.has( 'TableColumnResizeEditing' ) ) {
			return;
		}

		const columnResizeEditing = plugins.get( 'TableColumnResizeEditing' );

		this.listenTo( columnResizeEditing, '_setResizingTableWidth', ( evt, [ , viewFigure, width ] ) => {
			evt.stop();

			const modelTable = editor.editing.mapper.toModelElement( viewFigure as ViewElement ) as ModelElement;

			this._updateTableScrollOverflowState( modelTable, width as string | null );
		}, { priority: 'high' } );

		this.listenTo( columnResizeEditing, '_getResizingTableWidth', ( evt, [ viewFigure ] ) => {
			evt.stop();

			evt.return = getWidthHoldingElement( viewFigure as ViewElement ).getStyle( 'width' )!;
		}, { priority: 'high' } );
	}

	/**
	 * Re-evaluates the overflow state of every table whenever the window or an editing root is resized.
	 */
	private _watchRootEditables( tables: Collection<ModelElement> ): void {
		const { editor } = this;

		const recalculateAll = () => {
			const resizingTable = getCurrentlyResizingTable( editor );

			for ( const table of tables ) {
				if ( table === resizingTable ) {
					continue;
				}

				this._updateTableScrollOverflowState( table );
			}
		};

		this._throttledRecalculateAll = throttle( recalculateAll, 100 );
		this._stopWatchingRootsResize = watchRootsWidthResize( editor.editing.view, this._throttledRecalculateAll );

		editor.ui.view.listenTo( global.window, 'resize', this._throttledRecalculateAll );
		editor.once( 'ready', recalculateAll );
	}

	/**
	 * Evaluates the overflow state of every newly inserted table.
	 */
	private _watchNewTables( tables: Collection<ModelElement> ): void {
		this.listenTo<CollectionChangeEvent<ModelElement>>( tables, 'change', ( evt, data ) => {
			for ( const table of data.added ) {
				this._updateTableScrollOverflowState( table );
			}
		} );
	}
}

/**
 * Returns the table for which a column resize is currently in progress, if the
 * `TableColumnResizeEditing` plugin is loaded and such a resize is active.
 */
function getCurrentlyResizingTable( editor: Editor ): ModelElement | null {
	const { plugins } = editor;

	if ( !plugins.has( 'TableColumnResizeEditing' ) ) {
		return null;
	}

	return plugins.get( 'TableColumnResizeEditing' ).resizingTable;
}

/**
 * Returns whichever element - the widget's `<figure>` or its inner `<table>` - currently holds the
 * table's actual (possibly container-exceeding) width: the `<table>` while overflowing, the `<figure>`
 * otherwise.
 */
function getWidthHoldingElement( viewFigure: ViewElement ): ViewElement {
	return (
		viewFigure.hasClass( 'ck-table-overflowing' ) ?
			findChildElement( viewFigure, 'table' )! :
			viewFigure
	);
}

/**
 * Finds a direct child element of `parent` by its name.
 */
function findChildElement( parent: ViewElement, elementName: string ): ViewElement | undefined {
	return Array
		.from( parent.getChildren() )
		.find( ( child ): child is ViewElement => child.is( 'element', elementName ) );
}
