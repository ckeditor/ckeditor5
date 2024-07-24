/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editableui/inline/inlineeditableuiview
 */

import EditableUIView from '../editableuiview.js';

import type { EditingView } from '@ckeditor/ckeditor5-engine';
import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The inline editable UI class implementing an inline {@link module:ui/editableui/editableuiview~EditableUIView}.
 */
export default class InlineEditableUIView extends EditableUIView {
	/**
	 * The callback that is used during rendering for setting the `aria-label` attribute value.
	 */
	private readonly _getAriaLabelValue: InlineEditableAriaLabelCallback;

	/**
	 * Creates an instance of the InlineEditableUIView class.
	 *
	 * @param locale The locale instance.
	 * @param editingView The editing view instance the editable is related to.
	 * @param editableElement The editable element. If not specified, the
	 * {@link module:ui/editableui/editableuiview~EditableUIView}
	 * will create it. Otherwise, the existing element will be used.
	 * @param options Additional configuration of the view.
	 * @param options.label The label of the editable for assistive technologies. If not provided, a default label is used or,
	 * the existing `aria-label` attribute value from the specified `editableElement` is preserved.
	 */
	constructor(
		locale: Locale,
		editingView: EditingView,
		editableElement?: HTMLElement,
		options: {
			label?: InlineEditableAriaLabelCallback | string;
		} = {}
	) {
		super( locale, editingView, editableElement );

		const t = this.locale!.t;

		this.extendTemplate( {
			attributes: {
				role: 'textbox',
				class: 'ck-editor__editable_inline'
			}
		} );

		this._getAriaLabelValue = () => t( 'Rich Text Editor. Editing area: %0', this.name! );

		// String format.
		if ( typeof options.label === 'string' ) {
			this._getAriaLabelValue = () => options.label as string;
		}
		// Object format.
		else if ( options.label ) {
			this._getAriaLabelValue = options.label;
		}
		// No configuration. Attempting to preserve an existing DOM element value.
		else if ( editableElement ) {
			const preExistingLabelValue = editableElement.getAttribute( 'aria-label' );

			if ( preExistingLabelValue ) {
				this._getAriaLabelValue = () => preExistingLabelValue;
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		const editingView = this._editingView;

		editingView.change( writer => {
			const viewRoot = editingView.document.getRoot( this.name! );

			writer.setAttribute( 'aria-label', this._getAriaLabelValue( this ), viewRoot! );
		} );
	}
}

type InlineEditableAriaLabelCallback = ( view: InlineEditableUIView ) => string;
