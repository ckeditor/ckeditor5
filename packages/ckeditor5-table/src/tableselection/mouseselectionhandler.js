/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tableselection/mouseselectionhandler
 */

import mix from '@ckeditor/ckeditor5-utils/src/mix';
import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';

import { findAncestor } from '../commands/utils';
import MouseEventsObserver from './mouseeventsobserver';

export default class MouseSelectionHandler {
	constructor( tableSelection, editing ) {
		const view = editing.view;
		const viewDocument = view.document;
		const mapper = editing.mapper;

		view.addObserver( MouseEventsObserver );

		this.listenTo( viewDocument, 'mousedown', ( eventInfo, domEventData ) => {
			const tableCell = getModelTableCellFromViewEvent( domEventData, mapper );

			if ( !tableCell ) {
				tableSelection.stopSelection();
				tableSelection.clearSelection();

				return;
			}

			tableSelection.startSelectingFrom( tableCell );
		} );

		this.listenTo( viewDocument, 'mousemove', ( eventInfo, domEventData ) => {
			if ( !tableSelection._isSelecting ) {
				return;
			}

			const tableCell = getModelTableCellFromViewEvent( domEventData, mapper );

			if ( !tableCell ) {
				return;
			}

			tableSelection.setSelectingTo( tableCell );
		} );

		this.listenTo( viewDocument, 'mouseup', ( eventInfo, domEventData ) => {
			if ( !tableSelection._isSelecting ) {
				return;
			}

			const tableCell = getModelTableCellFromViewEvent( domEventData, mapper );

			tableSelection.stopSelection( tableCell );
		} );

		this.listenTo( viewDocument, 'mouseleave', () => {
			if ( !tableSelection._isSelecting ) {
				return;
			}

			tableSelection.stopSelection();
		} );
	}
}

mix( MouseSelectionHandler, ObservableMixin );

// Finds model table cell for given DOM event - ie. for 'mousedown'.
function getModelTableCellFromViewEvent( domEventData, mapper ) {
	const viewTargetElement = domEventData.target;
	const modelElement = mapper.toModelElement( viewTargetElement );

	if ( !modelElement ) {
		return;
	}

	if ( modelElement.is( 'tableCell' ) ) {
		return modelElement;
	}

	return findAncestor( 'tableCell', modelElement );
}
