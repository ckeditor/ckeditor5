/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/search/text/searchtextqueryview
 */
import { IconCancel, IconLoupe } from '@ckeditor/ckeditor5-icons';
import ButtonView from '../../button/buttonview.js';
import IconView from '../../icon/iconview.js';
import LabeledFieldView, { type LabeledFieldViewCreator } from '../../labeledfield/labeledfieldview.js';
import { createLabeledInputText } from '../../labeledfield/utils.js';
import type InputBase from '../../input/inputbase.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';

/**
 * A search input field for the {@link module:ui/search/text/searchtextview~SearchTextView} component.
 *
 * @internal
 * @extends module:ui/labeledfield/labeledfieldview~LabeledFieldView
 */
export default class SearchTextQueryView<
	TQueryFieldView extends InputBase<HTMLInputElement | HTMLTextAreaElement>
> extends LabeledFieldView<TQueryFieldView> {
	/**
	 * The loupe icon displayed next to the {@link #fieldView}.
	 */
	public iconView?: IconView;

	/**
	 * The button that clears and focuses the {@link #fieldView}.
	 */
	public resetButtonView?: ButtonView;

	/**
	 * A reference to the view configuration.
	 */
	private readonly _viewConfig: SearchTextQueryViewConfig<TQueryFieldView>;

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
			this.iconView = new IconView();
			this.iconView.content = IconLoupe;
			this.fieldWrapperChildren.add( this.iconView, 0 );

			this.extendTemplate( {
				attributes: {
					class: 'ck-search__query_with-icon'
				}
			} );
		}

		if ( this._viewConfig.showResetButton ) {
			this.resetButtonView = new ButtonView( locale );
			this.resetButtonView.set( {
				label: t( 'Clear' ),
				icon: IconCancel,
				class: 'ck-search__reset',
				isVisible: false,
				tooltip: true
			} );

			this.resetButtonView.on( 'execute', () => {
				this.reset();
				this.focus();
				this.fire<SearchTextQueryViewResetEvent>( 'reset' );
			} );

			this.resetButtonView.bind( 'isVisible' ).to( this.fieldView, 'isEmpty', isEmpty => !isEmpty );

			this.fieldWrapperChildren.add( this.resetButtonView );

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
		this.fieldView.reset();

		if ( this._viewConfig.showResetButton ) {
			this.resetButtonView!.isVisible = false;
		}
	}
}

/**
 * An event fired when the field is reset using the
 * {@link module:ui/search/text/searchtextqueryview~SearchTextQueryView#resetButtonView}.
 *
 * @eventName ~SearchTextQueryView#reset
 */
export type SearchTextQueryViewResetEvent = {
	name: 'reset';
	args: [];
};

/**
 * The configuration of the {@link module:ui/search/text/searchtextqueryview~SearchTextQueryView} view.
 */
export interface SearchTextQueryViewConfig<TConfigSearchField extends InputBase<HTMLInputElement | HTMLTextAreaElement>> {

	/**
	 * The human-readable label of the search field.
	 */
	label: string;

	/**
	 * Determines whether the button that resets the search should be visible.
	 *
	 * @default true
	 */
	showResetButton?: boolean;

	/**
	 * Determines whether the loupe icon should be visible.
	 *
	 * @default true
	 */
	showIcon?: boolean;

	/**
	 * The function that creates the search field input view. By default, a plain
	 * {@link module:ui/inputtext/inputtextview~InputTextView} is used for this purpose.
	 */
	creator?: LabeledFieldViewCreator<TConfigSearchField>;
}
