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
	 * The cached options object passed to the constructor.
	 */
	private readonly _options: InlineEditableUIViewOptions;

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
		options: InlineEditableUIViewOptions = {}
	) {
		super( locale, editingView, editableElement );

		this._options = options;

		this.extendTemplate( {
			attributes: {
				role: 'textbox',
				class: 'ck-editor__editable_inline'
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		const editingView = this._editingView;

		editingView.change( writer => {
			const viewRoot = editingView.document.getRoot( this.name! );

			writer.setAttribute( 'aria-label', this.getEditableAriaLabel(), viewRoot! );
		} );
	}

	/**
	 * Returns a normalized label for the editable view based on the environment.
	 */
	public getEditableAriaLabel(): string {
		const t = this.locale!.t;
		const label = this._options.label;
		const editableElement = this._editableElement;
		const editableName = this.name!;

		if ( typeof label == 'string' ) {
			return label;
		} else if ( typeof label === 'object' ) {
			return label[ editableName ];
		} else if ( typeof label === 'function' ) {
			return label( this );
		} else if ( editableElement ) {
			const existingLabel = editableElement.getAttribute( 'aria-label' );

			if ( existingLabel ) {
				return existingLabel;
			}
		}

		return t( 'Rich Text Editor. Editing area: %0', editableName );
	}
}

type InlineEditableUIViewOptions = {
	label?: ( ( view: InlineEditableUIView ) => string ) | string | Record<string, string>;
};
