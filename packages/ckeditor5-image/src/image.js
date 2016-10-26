/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import ImageEngine from './imageengine.js';
import ViewRange from '../engine/view/range.js';
import ModelLiveRange from '../engine/model/liverange.js';
import ModelRange from '../engine/model/range.js';
import ViewPosition from '../engine/view/position.js';
import ViewSelection from '../engine/view/selection.js';
import MouseDownObserver from './mousedownobserver.js';

export default class Image extends Feature {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ImageEngine ];
	}

	init() {
		const editor = this.editor;
		const modelDocument = editor.document;
		const viewDocument = editor.editing.view;
		const editingPipeline = editor.editing;
		const selected = new Set();

		// Prevent selection change on mousedown.
		viewDocument.addObserver( MouseDownObserver );
		viewDocument.on( 'mousedown', ( eventInfo, domEventData ) => {
			const target = domEventData.target;

			if ( isImageWidget( target ) ) {
				domEventData.preventDefault();

				if ( !viewDocument.isFocused ) {
					viewDocument.focus();
				}

				const viewRange = ViewRange.createOn( target );
				const modelRange = ModelLiveRange.createFromRange( editingPipeline.mapper.toModelRange( viewRange ) );

				modelDocument.enqueueChanges( ( ) => {
					modelDocument.selection.setRanges( [ modelRange ] );
				} );
			}
		} );

		// Handle selection placing inside figure - convert it to selecting whole image widget.
		viewDocument.on( 'selectionChange', ( eventInfo, data ) => {
			const newSelection = data.newSelection;

			if ( newSelection.rangeCount && newSelection.getFirstPosition().parent.name == 'figure' ) {
				eventInfo.stop();

				const viewRange = ViewRange.createOn( newSelection.getFirstPosition().parent );
				const modelRange = ModelLiveRange.createFromRange( editingPipeline.mapper.toModelRange( viewRange ) );

				modelDocument.enqueueChanges( ( ) => {
					modelDocument.selection.setRanges( [ modelRange ] );
				} );
			}
		}, { priority: 'high' } );

		viewDocument.on( 'keydown', ( eventInfo, data ) => {
			const viewSelection = viewDocument.selection;

			if ( viewSelection.isFake && !viewSelection.isCollapsed && viewSelection.rangeCount == 1 ) {
				const nodeAfter = viewSelection.anchor.nodeAfter;
				const nodeBefore = viewSelection.focus.nodeBefore;

				if ( nodeAfter === nodeBefore && isImageWidget( nodeAfter ) ) {
					// Stop to prevent default fake selection handling.
					eventInfo.stop();

					// Prevent selection change.
					data.preventDefault();

					if ( data.keyCode == 39 || data.keyCode == 40 ) {
						// TODO: Check if sibling exists.
						// const modelElement = editingPipeline.mapper.toModelElement( nodeAfter.nextSibling );
						// const modelPosition = ModelPosition.createAt( modelElement );
						// const modelRange = new ModelLiveRange( modelPosition );
						//
						// modelDocument.enqueueChanges( () => {
						// 	modelDocument.selection.setRanges( [ modelRange ] );
						// } );
						const viewPosition = ViewPosition.createAt( nodeAfter.nextSibling );
						const viewRange = new ViewRange( viewPosition );
						const newSelection = new ViewSelection();

						newSelection.addRange( viewRange );

						viewDocument.fire( 'selectionChange', {
							oldSelection: viewDocument.selection,
							newSelection: newSelection,
							domSelection: null
						} );
					}

					if ( data.keyCode == 37 || data.keyCode == 38 ) {
						// const modelElement = editingPipeline.mapper.toModelElement( nodeAfter.previousSibling );
						// const modelPosition = ModelPosition.createAt( modelElement, 'end' );
						// const modelRange = new ModelLiveRange( modelPosition );
						//
						// modelDocument.enqueueChanges( () => {
						// 	modelDocument.selection.setRanges( [ modelRange ] );
						// } );

						const viewPosition = ViewPosition.createAt( nodeAfter.previousSibling, 'end' );
						const viewRange = new ViewRange( viewPosition );
						const newSelection = new ViewSelection();

						newSelection.addRange( viewRange );

						viewDocument.fire( 'selectionChange', {
							oldSelection: viewDocument.selection,
							newSelection: newSelection,
							domSelection: null
						} );
					}
				}
			}
		} );

		// Handle selection conversion.
		editingPipeline.modelToView.on( 'selection', ( evt, data, consumable, conversionApi ) => {
			const viewSelection = conversionApi.viewSelection;
			const range = data.selection.getFirstRange();
			const nodeAfterStart = range.start.nodeAfter;

			// remove selection from all selected widgets
			for ( let viewElement of selected ) {
				viewElement.removeClass( 'selected' );
			}

			// This could be just one element instead of set.
			selected.clear();

			if ( !data.selection.isCollapsed && nodeAfterStart && nodeAfterStart.name == 'image' && ModelRange.createOn( nodeAfterStart ).isEqual( range ) ) {
				viewSelection.setFake( true, { label: 'image fake selection' } );
				const viewElement = conversionApi.mapper.toViewElement( nodeAfterStart );
				viewElement.addClass( 'selected' );
				selected.add( viewElement );
			}
		}, { priority: 'low' } );
	}
}

function isImageWidget( viewElement ) {
	// TODO: check CSS class.
	return viewElement.isWidget && viewElement.name == 'figure' && viewElement.hasClass( 'image' );
}
