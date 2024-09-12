/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/ui/bookmarkview
 */

import {
	View,
	FormHeaderView,
	CssTransitionDisablerMixin,
	type ViewWithCssTransitionDisabler,
	type ViewCollection
} from 'ckeditor5/src/ui.js';
import {
	type Locale
} from 'ckeditor5/src/utils.js';
import BookmarkFormView, { type BookmarkFormValidatorCallback } from './bookmarkformview.js';

import '../../theme/bookmark.css';

/**
 * The bookmark form view controller class.
 *
 * See {@link module:bookmark/ui/bookmarkformview~BookmarkFormView}.
 */
export default class BookmarkView extends View {
	/**
	 * A collection of form child views in the form.
	 */
	public readonly children: ViewCollection;

	/**
	 * The form view displayed inside the balloon.
	 */
	public formView: BookmarkFormView & ViewWithCssTransitionDisabler;

	/**
	 * The bookmark header inside the balloon.
	 */
	private _formHeader: FormHeaderView;

	/**
	 * Creates an instance of the {@link module:bookmark/ui/bookmarkformview~BookmarkFormView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param locale The localization services instance.
	 * @param validators Form validators used by {@link #isValid}.
	 */
	constructor( locale: Locale, validators: Array<BookmarkFormValidatorCallback> ) {
		super( locale );

		this.children = this.createCollection();

		this.formView = new ( CssTransitionDisablerMixin( BookmarkFormView ) )( locale, validators );
		this._formHeader = new FormHeaderView( locale, {
			label: this.t!( 'Bookmark' )
		} );

		const classList = [ 'ck', 'ck-bookmark-view' ];

		this.children.add( this._formHeader );
		this.children.add( this.formView );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: classList,

				// https://github.com/ckeditor/ckeditor5-link/issues/90
				tabindex: '-1'
			},

			children: this.children
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();
	}
}
