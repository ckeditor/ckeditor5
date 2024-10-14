/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/ui/linkactionsview
 */

import { ButtonView, View, ViewCollection, FocusCycler, type FocusableView } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type LocaleTranslate } from 'ckeditor5/src/utils.js';
import { type Editor, icons } from 'ckeditor5/src/core.js';
import { type BookmarkEditing } from '@ckeditor/ckeditor5-bookmark';

import { ensureSafeUrl, handleLinkOpening } from '../utils.js';

// See: #8833.
// eslint-disable-next-line ckeditor5-rules/ckeditor-imports
import '@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../../theme/linkactions.css';

import unlinkIcon from '../../theme/icons/unlink.svg';
import type { LinkConfig } from '../linkconfig.js';

/**
 * The link actions view class. This view displays the link preview, allows
 * unlinking or editing the link.
 */
export default class LinkActionsView extends View {
	/**
	 * The editor that the UI belongs to.
	 */
	public readonly editor: Editor;

	/**
	 * Tracks information about DOM focus in the actions.
	 */
	public readonly focusTracker = new FocusTracker();

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes = new KeystrokeHandler();

	/**
	 * The href preview view.
	 */
	public previewButtonView: ButtonView;

	/**
	 * The unlink button view.
	 */
	public unlinkButtonView: ButtonView;

	/**
	 * The edit link button view.
	 */
	public editButtonView: ButtonView;

	/**
	 * The value of the "href" attribute of the link to use in the {@link #previewButtonView}.
	 *
	 * @observable
	 */
	declare public href: string | undefined;

	/**
	 * A collection of views that can be focused in the view.
	 */
	private readonly _focusables = new ViewCollection<FocusableView>();

	/**
	 * Helps cycling over {@link #_focusables} in the view.
	 */
	private readonly _focusCycler: FocusCycler;

	private readonly _linkConfig: LinkConfig;

	private readonly _bookmarkEditing: BookmarkEditing | null;

	declare public t: LocaleTranslate;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor, linkConfig: LinkConfig = {} ) {
		super( editor.locale );

		const t = editor.locale.t;

		this.editor = editor;
		this._bookmarkEditing = editor.plugins.has( 'BookmarkEditing' ) ? editor.plugins.get( 'BookmarkEditing' ) : null;
		this.previewButtonView = this._createPreviewButton();
		this.unlinkButtonView = this._createButton( t( 'Unlink' ), unlinkIcon, 'unlink' );
		this.editButtonView = this._createButton( t( 'Edit link' ), icons.pencil, 'edit' );

		this.set( 'href', undefined );

		this._linkConfig = linkConfig;

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
					'ck-link-actions',
					'ck-responsive-form'
				],

				// https://github.com/ckeditor/ckeditor5-link/issues/90
				tabindex: '-1'
			},

			children: [
				this.previewButtonView,
				this.editButtonView,
				this.unlinkButtonView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		const childViews = [
			this.previewButtonView,
			this.editButtonView,
			this.unlinkButtonView
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
	 * @returns The button view instance.
	 */
	private _createButton( label: string, icon: string, eventName?: string ): ButtonView {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			icon,
			tooltip: true
		} );

		button.delegate( 'execute' ).to( this, eventName );

		return button;
	}

	/**
	 * Creates a link href preview button.
	 *
	 * @returns The button view instance.
	 */
	private _createPreviewButton(): ButtonView {
		const button = new ButtonView( this.locale );
		const bind = this.bindTemplate;
		const t = this.t;

		button.set( {
			withText: true
		} );

		button.extendTemplate( {
			attributes: {
				class: [
					'ck',
					'ck-link-actions__preview'
				],
				href: bind.to( 'href', href => href && ensureSafeUrl( href, this._linkConfig.allowedProtocols ) ),
				target: bind.to( 'href', href => {
					if ( isScrollableToBookmark( href, this._bookmarkEditing ) ) {
						return '_self';
					}

					return '_blank';
				} ),
				rel: bind.to( 'href', href => {
					if ( isScrollableToBookmark( href, this._bookmarkEditing ) ) {
						return 'noopener';
					}

					return 'noopener noreferrer';
				} )
			},
			on: {
				click: bind.to( () => {
					handleLinkOpening( this.href!, this.editor );
				} )
			}
		} );

		button.bind( 'tooltip' ).to( this, 'href', href => {
			if ( isScrollableToBookmark( href, this._bookmarkEditing ) ) {
				return t( 'Scroll to bookmark' );
			}

			return t( 'Open link in new tab' );
		} );

		button.bind( 'label' ).to( this, 'href', href => {
			return href || t( 'This link has no URL' );
		} );

		button.bind( 'isEnabled' ).to( this, 'href', href => !!href );

		button.template!.tag = 'a';

		return button;
	}
}

/**
 * Checks if clicking the link can be scrolled to bookmark when bookmark `id` matches hash `url`.
 */
function isScrollableToBookmark( link: string | undefined, bookmarkEditing: BookmarkEditing | null ): boolean {
	return !!link && link.startsWith( '#' ) && !!bookmarkEditing && !!bookmarkEditing.getElementForBookmarkId( link.slice( 1 ) );
}

/**
 * Fired when the {@link ~LinkActionsView#editButtonView} is clicked.
 *
 * @eventName ~LinkActionsView#edit
 */
export type EditEvent = {
	name: 'edit';
	args: [];
};

/**
 * Fired when the {@link ~LinkActionsView#unlinkButtonView} is clicked.
 *
 * @eventName ~LinkActionsView#unlink
 */
export type UnlinkEvent = {
	name: 'unlink';
	args: [];
};
