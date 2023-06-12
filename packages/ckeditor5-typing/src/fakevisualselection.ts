/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/fakevisualselection
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { delay, type ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import type { ViewDocumentSelectionChangeEvent, DowncastAddMarkerEvent } from '@ckeditor/ckeditor5-engine';

import '../theme/fakevisualselection.css';

const VISUAL_SELECTION_MARKER_NAME = 'fake-visual-selection';

/**
 * Displays a fake visual selection when the editable is blurred.
 */
export default class FakeVisualSelection extends Plugin {
	private readonly _hideFakeVisualSelectionDelayed = delay( () => this._hideFakeVisualSelection(), 0 );

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'FakeVisualSelection' {
		return 'FakeVisualSelection';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const view = editor.editing.view;

		this.listenTo<ObservableChangeEvent>( view.document, 'change:isFocused', ( evt, prop, isFocused ) => {
			if ( !isFocused ) {
				this._showFakeVisualSelection();
			}
		}, { priority: 'low' } );

		this.listenTo<ObservableChangeEvent>( view.document, 'change:isFocused', ( evt, prop, isFocused ) => {
			if ( isFocused ) {
				this._hideFakeVisualSelectionDelayed();
			}
		}, { priority: 'high' } );

		this.listenTo<ViewDocumentSelectionChangeEvent>( view.document, 'selectionChange', () => {
			if ( view.document.isFocused ) {
				this._hideFakeVisualSelectionDelayed();
			}
		} );

		editor.conversion.for( 'editingDowncast' )
			// Consume a fake visual selection marker on a highlightable widget or widget editable.
			.add( dispatcher => {
				dispatcher.on<DowncastAddMarkerEvent>(
					`addMarker:${ VISUAL_SELECTION_MARKER_NAME }`,
					( evt, data, conversionApi ): void => {
						if ( !data.item || !data.item.is( 'element' ) ) {
							return;
						}

						if ( !conversionApi.consumable.test( data.item, evt.name ) ) {
							return;
						}

						const viewElement = conversionApi.mapper.toViewElement( data.item );

						if ( viewElement && viewElement.getCustomProperty( 'addHighlight' ) ) {
							for ( const { item } of editor.model.createRangeOn( data.item ) ) {
								conversionApi.consumable.consume( item, evt.name );
							}
						}
					}
				);
			} )
			// Renders a fake visual selection marker on an expanded selection.
			.markerToHighlight( {
				model: VISUAL_SELECTION_MARKER_NAME,
				view: {
					classes: [ 'ck-fake-visual-selection' ]
					// priority: 5
				}
			} )
			// Renders a fake visual selection marker on a collapsed selection.
			.markerToElement( {
				model: VISUAL_SELECTION_MARKER_NAME,
				view: {
					name: 'span',
					classes: [ 'ck-fake-visual-selection', 'ck-fake-visual-selection_collapsed' ]
				}
			} );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._hideFakeVisualSelectionDelayed.cancel();
		super.destroy();
	}

	/**
	 * Displays a fake visual selection when the contextual balloon is displayed.
	 *
	 * This adds a marker into the document that is rendered as a highlight on selected text fragment.
	 */
	private _showFakeVisualSelection(): void {
		const model = this.editor.model;

		model.change( writer => {
			const range = model.document.selection.getFirstRange()!;

			if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
				writer.updateMarker( VISUAL_SELECTION_MARKER_NAME, { range } );
			} else {
				if ( range.start.isAtEnd ) {
					const startPosition = range.start.getLastMatchingPosition(
						( { item } ) => !model.schema.isContent( item ),
						{ boundaries: range }
					);

					writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
						usingOperation: false,
						affectsData: false,
						range: writer.createRange( startPosition, range.end )
					} );
				} else {
					writer.addMarker( VISUAL_SELECTION_MARKER_NAME, {
						usingOperation: false,
						affectsData: false,
						range
					} );
				}
			}
		} );
	}

	/**
	 * Hides the fake visual selection created in {@link #_showFakeVisualSelection}.
	 */
	private _hideFakeVisualSelection(): void {
		const model = this.editor.model;

		if ( model.markers.has( VISUAL_SELECTION_MARKER_NAME ) ) {
			model.change( writer => {
				writer.removeMarker( VISUAL_SELECTION_MARKER_NAME );
			} );
		}
	}
}
