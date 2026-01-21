/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/converters/table-caption-aria-label-handler
 */

import type { Editor } from 'ckeditor5/src/core.js';
import type { DifferItem, ModelElement } from 'ckeditor5/src/engine.js';
import { getCaptionText } from '../tablecaption/utils.js';

/**
 * Injects a listener that updates the `aria-label` attribute on table view elements
 * based on their caption content.
 *
 * @internal
 */
export function injectTableCaptionAriaLabelHandler( editor: Editor ): void {
	const model = editor.model;
	const { mapper, view } = editor.editing;

	model.document.on( 'change:data', () => {
		const tablesToUpdate = collectAffectedTables( model.document.differ.getChanges() );

		for ( const table of tablesToUpdate ) {
			const viewFigure = mapper.toViewElement( table );

			if ( !viewFigure ) {
				continue;
			}

			const captionText = getCaptionText( table );
			const currentAriaLabel = viewFigure.getAttribute( 'aria-label' ) || '';

			if ( captionText === currentAriaLabel ) {
				continue;
			}

			view.change( writer => {
				if ( captionText ) {
					writer.setAttribute( 'aria-label', captionText, viewFigure );
				} else {
					writer.removeAttribute( 'aria-label', viewFigure );
				}
			} );
		}
	} );
}

/**
 * Collects tables that need aria-label update based on model changes.
 */
function collectAffectedTables( changes: Iterable<DifferItem> ): Set<ModelElement> {
	const tables = new Set<ModelElement>();

	for ( const entry of changes ) {
		if ( entry.type === 'attribute' ) {
			continue;
		}

		// Direct table insertion.
		if ( entry.name === 'table' && entry.type === 'insert' ) {
			tables.add( entry.position.nodeAfter as ModelElement );
			continue;
		}

		// Caption inserted/removed directly under table.
		if ( entry.name === 'caption' && entry.position.parent.is( 'element', 'table' ) ) {
			tables.add( entry.position.parent );
			continue;
		}

		// Content change inside a caption - find the parent table.
		const table = ( entry.position.parent as ModelElement ).findAncestor( 'table' );

		if ( table ) {
			tables.add( table );
		}
	}

	return tables;
}
