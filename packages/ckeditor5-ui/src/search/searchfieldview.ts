/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/search/searchfieldview
 */

import ButtonView from '../button/buttonview';
import IconView from '../icon/iconview';
import LabeledFieldView from '../labeledfield/labeledfieldview';
import { createLabeledInputText } from '../labeledfield/utils';
import type InputView from '../input/inputview';
import type { Locale } from '@ckeditor/ckeditor5-utils';

import { icons } from '@ckeditor/ckeditor5-core';

/**
 * A search input field for the {@link module:ui/search/searchview~SearchView} component.
 *
 * @private
 * @extends module:ui/labeledfield/labeledfieldview~LabeledFieldView
 */
export default class SearchFieldView extends LabeledFieldView<InputView> {
	/**
	 * The loupe icon displayed next to the {@link #fieldView}.
	 */
	public loupeIconView: IconView;

	/**
	 * The button that clears and focuses the {@link #fieldView}.
	 */
	public clearButtonView: ButtonView;

	/**
	 * @inheritDoc
	 */
	constructor(
		locale: Locale,
		viewCreator = createLabeledInputText,
		label: string
	) {
		super( locale, viewCreator );

		const t = locale.t;

		this.label = label;
		this.loupeIconView = new IconView();
		this.loupeIconView.content = icons.loupe;

		this.clearButtonView = new ButtonView( locale );
		this.clearButtonView.set( {
			label: t( 'Clear' ),
			icon: icons.cancel,
			class: 'ck-search__clear-search',
			isVisible: false,
			tooltip: true
		} );

		this.clearButtonView.on( 'execute', () => {
			this.reset();
			this.focus();
			this.fire<SearchFieldViewResetEvent>( 'reset' );
		} );

		this.clearButtonView.bind( 'isVisible' ).to( this.fieldView, 'isEmpty', isEmpty => !isEmpty );

		this.fieldWrapperChildren.add( this.loupeIconView, 0 );
		this.fieldWrapperChildren.add( this.clearButtonView );
	}

	/**
	 * Resets the search field to its default state.
	 */
	public reset(): void {
		// This addresses a bug in input value handling. The one-way binding between fieldView#value->fieldView.element#value
		// does clear the value of the DOM element if fieldView#value was not previously set but the user typed in the input.
		// (fieldView#value is '', text was typed in the input, resetting fieldView#value '' does not trigger #change in observable)
		this.fieldView.value = this.fieldView.element!.value = '';

		this.clearButtonView.isVisible = false;
	}
}

/**
 * An event fired when the field is reset using the
 * {@link module:ui/search/searchfieldview~SearchFieldView#clearButtonView}.
 *
 * @eventName ~SearchFieldView#reset
 */
export type SearchFieldViewResetEvent = {
	name: 'reset';
	args: [];
};
