/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/list/listview
 */

import View from '../view';
import FocusCycler from '../focuscycler';

import type ListItemView from './listitemview';
import type DropdownPanelFocusable from '../dropdown/dropdownpanelfocusable';
import type ViewCollection from '../viewcollection';

import {
	FocusTracker,
	KeystrokeHandler,
	type CollectionAddEvent,
	type CollectionRemoveEvent,
	type Locale
} from '@ckeditor/ckeditor5-utils';

import '../../theme/components/list/list.css';

/**
 * The list view class.
 */
export default class ListView extends View<HTMLUListElement> implements DropdownPanelFocusable {
	/**
	 * Collection of the child list views.
	 */
	public readonly items: ViewCollection;

	/**
	 * Tracks information about DOM focus in the list.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Label used by assistive technologies to describe this list element.
	 *
	 * @observable
	 */
	declare public ariaLabel: string | undefined;

	/**
	 * Helps cycling over focusable {@link #items} in the list.
	 */
	private readonly _focusCycler: FocusCycler;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.items = this.createCollection();
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this._focusCycler = new FocusCycler( {
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate list items backwards using the arrowup key.
				focusPrevious: 'arrowup',

				// Navigate toolbar items forwards using the arrowdown key.
				focusNext: 'arrowdown'
			}
		} );

		this.set( 'ariaLabel', undefined );

		this.setTemplate( {
			tag: 'ul',

			attributes: {
				class: [
					'ck',
					'ck-reset',
					'ck-list'
				],
				'aria-label': bind.to( 'ariaLabel' )
			},

			children: this.items
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		// Items added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			this.focusTracker.add( item.element! );
		}

		this.items.on<CollectionAddEvent<ListItemView>>( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element! );
		} );

		this.items.on<CollectionRemoveEvent<ListItemView>>( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element! );
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
	 * Focuses the first focusable in {@link #items}.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable in {@link #items}.
	 */
	public focusLast(): void {
		this._focusCycler.focusLast();
	}
}
