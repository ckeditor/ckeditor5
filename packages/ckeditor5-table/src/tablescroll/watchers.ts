/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/tablescroll/watchers
 */

import { Collection, type EventInfo } from '@ckeditor/ckeditor5-utils';
import type { EditingView, Model, ModelElement, ModelDocumentChangeEvent } from '@ckeditor/ckeditor5-engine';

/**
 * Creates a live collection of all `table` model elements present in the document and keeps it
 * up to date as tables are inserted, moved, or removed.
 *
 * @internal
 */
export function watchTableModelElements( model: Model ): Collection<ModelElement> {
	const tables: Collection<ModelElement> = new Collection();

	model.document.on<ModelDocumentChangeEvent>( 'change', () => {
		const documentChanges = model.document.differ.getChanges();
		const insertedTables = new Set<ModelElement>();
		const movedTables = new Set<ModelElement>();

		for ( const change of documentChanges ) {
			if ( change.type === 'insert' && change.name !== '$text' && change.position.nodeAfter ) {
				const range = model.createRangeOn( change.position.nodeAfter );

				for ( const item of range.getItems() ) {
					if ( !item.is( 'element', 'table' ) ) {
						continue;
					}

					if ( tables.has( item ) ) {
						movedTables.add( item );
					} else {
						insertedTables.add( item );
					}
				}
			}
		}

		for ( const table of Array.from( tables ) ) {
			if ( table.root.rootName !== '$graveyard' ) {
				continue;
			}

			insertedTables.delete( table );
			movedTables.delete( table );

			if ( tables.has( table ) ) {
				tables.remove( table );
			}
		}

		for ( const table of movedTables ) {
			/* v8 ignore else -- @preserve */
			if ( tables.has( table ) ) {
				tables.remove( table );
			}
		}

		if ( insertedTables.size || movedTables.size ) {
			tables.addMany( [ ...insertedTables, ...movedTables ] );
		}
	} );

	return tables;
}

/**
 * Observes the DOM width of every editing root and calls `onResize` whenever any of them changes width.
 * Height-only changes are ignored, since only a root's width can make a table overflow it.
 *
 * @internal
 */
export function watchRootsWidthResize( view: EditingView, onResize: () => void ): () => void {
	const { roots } = view.document;
	const observedRoots = new Map<string, ResizeObserver>();
	const lastKnownWidths = new Map<string, number>();

	const attachRoot = ( rootName: string ) => {
		if ( observedRoots.has( rootName ) ) {
			return;
		}

		const domRoot = view.getDomRoot( rootName );

		if ( !domRoot ) {
			return;
		}

		const observer = new ResizeObserver( entries => {
			for ( const entry of entries ) {
				const width = entry.contentRect.width;

				if ( lastKnownWidths.get( rootName ) === width ) {
					continue;
				}

				lastKnownWidths.set( rootName, width );
				onResize();
			}
		} );

		observer.observe( domRoot );
		observedRoots.set( rootName, observer );
	};

	const detachRoot = ( rootName: string ) => {
		const observer = observedRoots.get( rootName );

		if ( observer ) {
			observer.disconnect();
			observedRoots.delete( rootName );
			lastKnownWidths.delete( rootName );
		}
	};

	const onRootAdd = ( evt: EventInfo, viewRoot: { rootName: string } ) => attachRoot( viewRoot.rootName );
	const onRootRemove = ( evt: EventInfo, viewRoot: { rootName: string } ) => detachRoot( viewRoot.rootName );

	const attachAllRoots = () => {
		for ( const root of roots ) {
			attachRoot( root.rootName );
		}
	};

	attachAllRoots();

	roots.on( 'add', onRootAdd );
	roots.on( 'remove', onRootRemove );
	view.on( 'render', attachAllRoots );

	return () => {
		roots.off( 'add', onRootAdd );
		roots.off( 'remove', onRootRemove );
		view.off( 'render', attachAllRoots );

		for ( const observer of observedRoots.values() ) {
			observer.disconnect();
		}

		observedRoots.clear();
		lastKnownWidths.clear();
	};
}
