/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module bookmark/ui/bookmarkactionsview
 */

import {
	LabelView,
	ButtonView,
	View,
	ViewCollection,
	FocusCycler,
	type FocusableView
} from 'ckeditor5/src/ui.js';

import {
	FocusTracker,
	KeystrokeHandler,
	type LocaleTranslate,
	type Locale
} from 'ckeditor5/src/utils.js';

import { icons } from 'ckeditor5/src/core.js';

// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/bookmarkactions.css';

/**
 * The bookmark actions view class. This view displays the bookmark preview, allows
 * removing or editing the bookmark.
 */
export default class BookmarkActionsView extends View {
	/**
	 * Tracks information about DOM focus in the actions.
	 */
	public readonly focusTracker = new FocusTracker();

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes = new KeystrokeHandler();

	/**
	 * The bookmark preview view.
	 */
	public bookmarkPreviewView: LabelView;

	/**
	 * The remove button view.
	 */
	public removeButtonView: ButtonView;

	/**
	 * The edit bookmark button view.
	 */
	public editButtonView: ButtonView;

	/**
	 * The id preview view.
	 *
	 * @observable
	 */
	declare public id: string | undefined;

	/**
	 * A collection of views that can be focused in the view.
	 */
	private readonly _focusables = new ViewCollection<FocusableView>();

	/**
	 * Helps cycling over {@link #_focusables} in the view.
	 */
	private readonly _focusCycler: FocusCycler;

	declare public t: LocaleTranslate;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		const t = locale.t;

		this.bookmarkPreviewView = this._createBookmarkPreviewView();
		this.removeButtonView = this._createButton( t( 'Remove bookmark' ), icons.remove, 'remove', this.bookmarkPreviewView );
		this.editButtonView = this._createButton( t( 'Edit bookmark' ), icons.pencil, 'edit', this.bookmarkPreviewView );

		this.set( 'id', undefined );

		this._focusCycler = new FocusCycler( {
			focusables: this._focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate fields backwards using the Shift + Tab keystroke.
				focusPrevious: 'shift + tab',

				// Navigate fields forwards using the Tab key.
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-bookmark-actions',
					'ck-responsive-form'
				],

				// https://github.com/ckeditor/ckeditor5-link/issues/90
				tabindex: '-1'
			},

			children: [
				this.bookmarkPreviewView,
				this.editButtonView,
				this.removeButtonView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		const childViews = [
			this.editButtonView,
			this.removeButtonView
		];

		childViews.forEach( v => {
			// Register the view as focusable.
			this._focusables.add( v );

			// Register the view in the focus tracker.
			this.focusTracker.add( v.element! );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Focuses the fist {@link #_focusables} in the actions.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Creates a button view.
	 *
	 * @param label The button label.
	 * @param icon The button icon.
	 * @param eventName An event name that the `ButtonView#execute` event will be delegated to.
	 * @param additionalLabel An additional label outside the button.
	 * @returns The button view instance.
	 */
	private _createButton( label: string, icon: string, eventName: string, additionalLabel: LabelView ): ButtonView {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.delegate( 'execute' ).to( this, eventName );

		// Since button label `id` is bound to the `ariaLabelledBy` property
		// we need to modify this binding to include only the first ID token
		// as this button will be labeled by multiple labels.
		button.labelView.unbind( 'id' );

		button.labelView.bind( 'id' ).to( button, 'ariaLabelledBy', ariaLabelledBy => {
			return getFirstToken( ariaLabelledBy! );
		} );

		button.ariaLabelledBy = `${ button.ariaLabelledBy } ${ additionalLabel.id }`;

		return button;
	}

	/**
	 * Creates a bookmark name preview label.
	 *
	 * @returns The label view instance.
	 */
	private _createBookmarkPreviewView(): LabelView {
		const label = new LabelView( this.locale );

		label.extendTemplate( {
			attributes: {
				class: [
					'ck',
					'ck-bookmark-actions__preview'
				]
			}
		} );

		// Bind label text with the bookmark ID.
		label.bind( 'text' ).to( this, 'id' );

		return label;
	}
}

/**
 * Fired when the {@link ~BookmarkActionsView#editButtonView} is clicked.
 *
 * @eventName ~BookmarkActionsView#edit
 */
export type EditEvent = {
	name: 'edit';
	args: [];
};

/**
 * Fired when the {@link ~BookmarkActionsView#removeButtonView} is clicked.
 *
 * @eventName ~BookmarkActionsView#remove
 */
export type RemoveEvent = {
	name: 'remove';
	args: [];
};

/**
 * Returns the first token from space separated token list.
 */
function getFirstToken( tokenList: string ): string {
	return tokenList.split( ' ' )[ 0 ];
}
