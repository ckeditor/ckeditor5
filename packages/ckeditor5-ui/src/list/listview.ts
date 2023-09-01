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
import ListItemGroupView from './listitemgroupview';
import type DropdownPanelFocusable from '../dropdown/dropdownpanelfocusable';
import ViewCollection from '../viewcollection';

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
	 * The collection of focusable views in the list. It is used to determine accessible navigation
	 * between the {@link module:ui/list/listitemview~ListItemView list items} and
	 * {@link module:ui/list/listgroupview~ListGroupView list groups}.
	 */
	public readonly focusables: ViewCollection;

	/**
	 * Collection of the child list views.
	 */
	public readonly items: ViewCollection<ListItemView | ListItemGroupView>;

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
	 * (Optional) The ARIA property reflected by the `aria-ariaLabelledBy` DOM attribute used by assistive technologies.
	 *
	 * @observable
	 */
	declare public ariaLabelledBy?: string | undefined;

	/**
	 * The property reflected by the `role` DOM attribute to be used by assistive technologies.
	 *
	 * @observable
	 */
	declare public role: string | undefined;

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

		this.focusables = new ViewCollection();
		this.items = this.createCollection();
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this._focusCycler = new FocusCycler( {
			focusables: this.focusables,
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
		this.set( 'ariaLabelledBy', undefined );
		this.set( 'role', undefined );

		this.setTemplate( {
			tag: 'ul',

			attributes: {
				class: [
					'ck',
					'ck-reset',
					'ck-list'
				],
				role: bind.to( 'role' ),
				'aria-label': bind.to( 'ariaLabel' ),
				'aria-labelledby': bind.to( 'ariaLabelledBy' )
			},

			children: this.items
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		const registerItem = ( item: ListItemView ) => {
			if ( this.focusables.has( item ) ) {
				return;
			}

			this.focusTracker.add( item.element! );
			this.focusables.add( item );
		};

		const registerGroupItems = ( group: ListItemGroupView ) => {
			for ( const child of group.items ) {
				registerItem( child as ListItemView );
			}
		};

		// Items added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			if ( item instanceof ListItemGroupView ) {
				registerGroupItems( item );
			} else {
				registerItem( item );
			}
		}

		this.items.on<CollectionAddEvent<ListItemView>>( 'add', ( evt, item ) => {
			if ( item instanceof ListItemGroupView ) {
				registerGroupItems( item );
			} else {
				registerItem( item );
			}
		} );

		this.items.on<CollectionRemoveEvent<ListItemView>>( 'remove', ( evt, item ) => {
			if ( item instanceof ListItemGroupView ) {
				for ( const child of item.items ) {
					this.focusTracker.remove( child.element! );
					this.focusables.remove( child );
				}
			} else {
				this.focusTracker.remove( item.element! );
				this.focusables.remove( item );
			}
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
