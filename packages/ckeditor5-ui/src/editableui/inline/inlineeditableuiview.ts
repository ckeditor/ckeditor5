/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editableui/inline/inlineeditableuiview
 */

import EditableUIView from '../editableuiview';

import type { View } from '@ckeditor/ckeditor5-engine';
import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * The inline editable UI class implementing an inline {@link module:ui/editableui/editableuiview~EditableUIView}.
 */
export default class InlineEditableUIView extends EditableUIView {
	/**
	 * A function that gets called with the instance of this view as an argument and should return a string that
	 * represents the label of the editable for assistive technologies.
	 */
	private readonly _generateLabel: ( view: InlineEditableUIView ) => string;

	/**
	 * Creates an instance of the InlineEditableUIView class.
	 *
	 * @param locale The locale instance.
	 * @param editingView The editing view instance the editable is related to.
	 * @param editableElement The editable element. If not specified, the
	 * {@link module:ui/editableui/editableuiview~EditableUIView}
	 * will create it. Otherwise, the existing element will be used.
	 * @param options Additional configuration of the view.
	 * @param options.label A function that gets called with the instance of this view as an argument
	 * and should return a string that represents the label of the editable for assistive technologies. If not provided,
	 * a default label generator is used.
	 */
	constructor(
		locale: Locale,
		editingView: View,
		editableElement?: HTMLElement,
		options: { label?: ( view: InlineEditableUIView ) => string } = {}
	) {
		super( locale, editingView, editableElement );

		const t = locale.t;

		this.extendTemplate( {
			attributes: {
				role: 'textbox',
				class: 'ck-editor__editable_inline'
			}
		} );

		this._generateLabel = options.label || ( () => t( 'Editor editing area: %0', this.name! ) );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		const editingView = this._editingView;

		editingView.change( writer => {
			const viewRoot = editingView.document.getRoot( this.name! );

			writer.setAttribute( 'aria-label', this._generateLabel( this ), viewRoot! );
		} );
	}
}
