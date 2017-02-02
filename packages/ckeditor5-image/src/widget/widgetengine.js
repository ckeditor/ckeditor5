/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/widget/widgetengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import RootEditable from '@ckeditor/ckeditor5-engine/src/view/rooteditableelement';
import { WIDGET_SELECTED_CLASS_NAME, isWidget } from './utils';

/**
 * The widget engine plugin.
 * Registers model to view selection converter for editing pipeline. It is hooked after default selection conversion.
 * If converted selection is placed around widget element, selection is marked as fake. Additionally, proper CSS class
 * is added to indicate that widget has been selected.
 *
 * @extends module:core/plugin~Plugin.
 */
export default class WidgetEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		let previouslySelected;

		// Model to view selection converter.
		// Converts selection placed over widget element to fake selection
		this.editor.editing.modelToView.on( 'selection', ( evt, data, consumable, conversionApi ) => {
			// Remove selected class from previously selected widget.
			if ( previouslySelected && previouslySelected.hasClass( WIDGET_SELECTED_CLASS_NAME ) ) {
				previouslySelected.removeClass( WIDGET_SELECTED_CLASS_NAME );
			}

			const viewSelection = conversionApi.viewSelection;

			// Add CSS class if selection is placed inside nested editable that belongs to widget.
			const editableElement = viewSelection.editableElement;

			if ( editableElement && !( editableElement instanceof RootEditable ) ) {
				const widget = editableElement.findAncestor( element => isWidget( element ) );

				if ( widget ) {
					widget.addClass( WIDGET_SELECTED_CLASS_NAME );
					previouslySelected = widget;

					return;
				}
			}

			// Check if widget was clicked or some sub-element.
			const selectedElement = viewSelection.getSelectedElement();

			if ( !selectedElement || !isWidget( selectedElement ) ) {
				return;
			}

			viewSelection.setFake( true );
			selectedElement.addClass( WIDGET_SELECTED_CLASS_NAME );
			previouslySelected = selectedElement;
		}, { priority: 'low' } );
	}
}
