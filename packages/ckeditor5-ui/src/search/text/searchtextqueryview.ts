/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/search/text/searchtextqueryview
 */

import ButtonView from '../../button/buttonview';
import IconView from '../../icon/iconview';
import LabeledFieldView, { type LabeledFieldViewCreator } from '../../labeledfield/labeledfieldview';
import { createLabeledInputText } from '../../labeledfield/utils';
import type InputBase from '../../input/inputbase';
import type { Locale } from '@ckeditor/ckeditor5-utils';

import { icons } from '@ckeditor/ckeditor5-core';

/**
 * A search input field for the {@link module:ui/search/text/searchtextview~SearchTextView} component.
 *
 * @private
 * @extends module:ui/labeledfield/labeledfieldview~LabeledFieldView
 */
export default class SearchTextQueryView<
	TQueryFieldView extends InputBase<HTMLInputElement | HTMLTextAreaElement>
> extends LabeledFieldView<TQueryFieldView> {
	/**
	 * The loupe icon displayed next to the {@link #fieldView}.
	 */
	public loupeIconView?: IconView;

	/**
	 * The button that clears and focuses the {@link #fieldView}.
	 */
	public clearButtonView?: ButtonView;

	/**
	 * TODO
	 */
	private _viewConfig: SearchTextQueryViewConfig<TQueryFieldView>;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale, config: SearchTextQueryViewConfig<TQueryFieldView> ) {
		const t = locale.t;
		const viewConfig = Object.assign( {}, {
			showResetButton: true,
			showIcon: true,
			creator: createLabeledInputText
		}, config );

		super( locale, viewConfig.creator as any );

		this.label = config.label;
		this._viewConfig = viewConfig;

		if ( this._viewConfig.showIcon ) {
			this.loupeIconView = new IconView();
			this.loupeIconView.content = icons.loupe;
			this.fieldWrapperChildren.add( this.loupeIconView, 0 );

			this.extendTemplate( {
				attributes: {
					class: 'ck-search__query_with-icon'
				}
			} );
		}

		if ( this._viewConfig.showResetButton ) {
			this.clearButtonView = new ButtonView( locale );
			this.clearButtonView.set( {
				label: t( 'Clear' ),
				icon: icons.cancel,
				class: 'ck-search__reset',
				isVisible: false,
				tooltip: true
			} );

			this.clearButtonView.on( 'execute', () => {
				this.reset();
				this.focus();
				this.fire<SearchTextQueryViewResetEvent>( 'reset' );
			} );

			this.clearButtonView.bind( 'isVisible' ).to( this.fieldView, 'isEmpty', isEmpty => !isEmpty );

			this.fieldWrapperChildren.add( this.clearButtonView );

			this.extendTemplate( {
				attributes: {
					class: 'ck-search__query_with-reset'
				}
			} );
		}
	}

	/**
	 * Resets the search field to its default state.
	 */
	public reset(): void {
		// This addresses a bug in input value handling. The one-way binding between fieldView#value->fieldView.element#value
		// does clear the value of the DOM element if fieldView#value was not previously set but the user typed in the input.
		// (fieldView#value is '', text was typed in the input, resetting fieldView#value '' does not trigger #change in observable)
		this.fieldView.value = this.fieldView.element!.value = '';

		if ( this._viewConfig.showResetButton ) {
			this.clearButtonView!.isVisible = false;
		}
	}
}

/**
 * An event fired when the field is reset using the
 * {@link module:ui/search/text/searchtextqueryview~SearchTextQueryView#clearButtonView}.
 *
 * @eventName ~SearchTextQueryView#reset
 */
export type SearchTextQueryViewResetEvent = {
	name: 'reset';
	args: [];
};

/**
 * TODO
 */
export interface SearchTextQueryViewConfig<TConfigSearchField extends InputBase<HTMLInputElement | HTMLTextAreaElement>> {

	/**
	 * The human-readable label of the search field.
	 */
	label: string;

	/**
	 * TODO
	 */
	showResetButton?: boolean;

	/**
	 * TODO
	 */
	showIcon?: boolean;

	/**
	 * The function that creates the search field input view. By default, a plain
	 * {@link module:ui/inputtext/inputtextview~InputTextView} is used for this purpose.
	 */
	creator?: LabeledFieldViewCreator<TConfigSearchField>;
}
