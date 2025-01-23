/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module emoji/ui/emojitypingview
 */

import { type FocusableView, FocusCycler, SearchInfoView, View, type ViewCollection } from 'ckeditor5/src/ui.js';
import { FocusTracker, KeystrokeHandler, type Locale } from 'ckeditor5/src/utils.js';
import EmojiGridView, { type EmojiSearchQueryCallback } from './emojigridview.js';
import type { SkinToneId } from '../emojiconfig.js';
import type { EmojiCategory } from '../emojidatabase.js';

import '../../theme/emojitypingview.css';

/**
 * A view that glues pieces of the emoji dropdown panel together.
 */
export default class EmojiTypingView extends View<HTMLDivElement> {
	/**
	 * A collection of the focusable children of the view.
	 */
	public readonly items: ViewCollection<FocusableView>;

	/**
	 * Tracks information about the DOM focus in the view.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Helps cycling over focusable {@link #items} in the view.
	 */
	public readonly focusCycler: FocusCycler;

	/**
	 * An instance of the `EmojiGridView`.
	 */
	public readonly gridView: EmojiGridView;

	/**
	 * An instance of the `EmojiGridView`.
	 */
	public readonly infoView: SearchInfoView;

	/**
	 * @inheritDoc
	 */
	constructor(
		locale: Locale,
		{ emojiGroups, getEmojiBySearchQuery, skinTone }: {
			emojiGroups: Array<EmojiCategory>;
			getEmojiBySearchQuery: EmojiSearchQueryCallback;
			skinTone: SkinToneId;
		}
	) {
		super( locale );

		const categoryName = emojiGroups[ 0 ].title;

		this.gridView = new EmojiGridView( locale, {
			categoryName,
			emojiGroups,
			getEmojiBySearchQuery,
			skinTone
		} );
		this.infoView = new SearchInfoView();

		this.items = this.createCollection();
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();
		this.focusCycler = new FocusCycler( {
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				focusPrevious: 'shift + tab',
				focusNext: 'tab'
			}
		} );

		this.setTemplate( {
			tag: 'div',
			children: [
				this.gridView,
				{
					tag: 'div',
					children: [
						this.infoView
					],
					attributes: {
						class: [ 'ck', 'ck-search__results' ]
					}
				}
			],
			attributes: {
				tabindex: '-1',
				class: [ 'ck', 'ck-emoji', 'ck-search', 'ck-emoji_balloon' ]
			}
		} );

		this.items.add( this.gridView );
		this.items.add( this.infoView );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.focusTracker.add( this.gridView.element! );
		this.focusTracker.add( this.infoView.element! );

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
	 * Focuses the first focusable in {@link #items}.
	 */
	public focus(): void {
		const tile = this.gridView.tiles.first;

		if ( tile ) {
			tile.element!.classList.add( 'ck-focus' );
		}
	}

	public search( searchQuery: string ): void {
		this.gridView.tiles.forEach( tile => {
			tile.element!.classList.remove( 'ck-focus' );
		} );

		const t = this.locale!.t;

		if ( searchQuery.length < 2 ) {
			this.infoView.set( {
				primaryText: t( 'Keep on typing to see the emoji.' ),
				secondaryText: t( 'The query must contain at least two characters.' ),
				isVisible: true
			} );

			this.gridView.isEmpty = true;

			return;
		}

		const { resultsCount } = this.gridView.filter( new RegExp( searchQuery ) );

		if ( !resultsCount ) {
			this.infoView.set( {
				primaryText: t( 'No emojis were found matching "%0".', searchQuery ),
				secondaryText: t( 'Please try a different phrase or check the spelling.' ),
				isVisible: true
			} );
		} else {
			this.infoView.set( {
				isVisible: false
			} );
		}
	}
}
