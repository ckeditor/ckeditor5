/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/list/listview
 */

import View from '../view.js';
import FocusCycler, { type FocusableView } from '../focuscycler.js';

import ListItemView from './listitemview.js';
import ListItemGroupView from './listitemgroupview.js';
import type ListSeparatorView from './listseparatorview.js';
import type DropdownPanelFocusable from '../dropdown/dropdownpanelfocusable.js';
import ViewCollection from '../viewcollection.js';

import {
	FocusTracker,
	KeystrokeHandler,
	type Locale,
	type GetCallback,
	type CollectionChangeEvent
} from '@ckeditor/ckeditor5-utils';

import '../../theme/components/list/list.css';

/**
 * The list view class.
 */
export default class ListView extends View<HTMLUListElement> implements DropdownPanelFocusable {
	/**
	 * The collection of focusable views in the list. It is used to determine accessible navigation
	 * between the {@link module:ui/list/listitemview~ListItemView list items} and
	 * {@link module:ui/list/listitemgroupview~ListItemGroupView list groups}.
	 */
	public readonly focusables: ViewCollection<FocusableView>;

	/**
	 * Collection of the child list views.
	 */
	public readonly items: ViewCollection<ListItemView | ListItemGroupView | ListSeparatorView>;

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
	 * A cached map of {@link module:ui/list/listitemgroupview~ListItemGroupView} to `change` event listeners for their `items`.
	 * Used for accessibility and keyboard navigation purposes.
	 */
	private readonly _listItemGroupToChangeListeners: WeakMap<ListItemGroupView, GetCallback<ListItemsChangeEvent>> = new WeakMap();

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

		// Items added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			if ( item instanceof ListItemGroupView ) {
				this._registerFocusableItemsGroup( item );
			} else if ( item instanceof ListItemView ) {
				this._registerFocusableListItem( item );
			}
		}

		this.items.on<ListItemsChangeEvent>( 'change', ( evt, data ) => {
			for ( const removed of data.removed ) {
				if ( removed instanceof ListItemGroupView ) {
					this._deregisterFocusableItemsGroup( removed );
				} else if ( removed instanceof ListItemView ) {
					this._deregisterFocusableListItem( removed );
				}
			}

			for ( const added of Array.from( data.added ).reverse() ) {
				if ( added instanceof ListItemGroupView ) {
					this._registerFocusableItemsGroup( added, data.index );
				} else {
					this._registerFocusableListItem( added, data.index );
				}
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
	 * Focuses the first focusable in {@link #items}.
	 */
	public focusFirst(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable in {@link #items}.
	 */
	public focusLast(): void {
		this._focusCycler.focusLast();
	}

	/**
	 * Registers a list item view in the focus tracker.
	 *
	 * @param item The list item view to be registered.
	 * @param index Index of the list item view in the {@link #items} collection. If not specified, the item will be added at the end.
	 */
	private _registerFocusableListItem( item: ListItemView, index?: number ) {
		this.focusTracker.add( item.element! );
		this.focusables.add( item, index );
	}

	/**
	 * Removes a list item view from the focus tracker.
	 *
	 * @param item The list item view to be removed.
	 */
	private _deregisterFocusableListItem( item: ListItemView ) {
		this.focusTracker.remove( item.element! );
		this.focusables.remove( item );
	}

	/**
	 * Gets a callback that will be called when the `items` collection of a {@link module:ui/list/listitemgroupview~ListItemGroupView}
	 * change.
	 *
	 * @param groupView The group view for which the callback will be created.
	 * @returns The callback function to be used for the items `change` event listener in a group.
	 */
	private _getOnGroupItemsChangeCallback( groupView: ListItemGroupView ): GetCallback<ListItemsChangeEvent> {
		return ( evt, data ) => {
			for ( const removed of data.removed ) {
				this._deregisterFocusableListItem( removed );
			}

			for ( const added of Array.from( data.added ).reverse() ) {
				this._registerFocusableListItem( added, this.items.getIndex( groupView ) + data.index );
			}
		};
	}

	/**
	 * Registers a list item group view (and its children) in the focus tracker.
	 *
	 * @param groupView A group view to be registered.
	 * @param groupIndex Index of the group view in the {@link #items} collection. If not specified, the group will be added at the end.
	 */
	private _registerFocusableItemsGroup( groupView: ListItemGroupView, groupIndex?: number ) {
		Array.from( groupView.items ).forEach( ( child, childIndex ) => {
			const registeredChildIndex = typeof groupIndex !== 'undefined' ? groupIndex + childIndex : undefined;

			this._registerFocusableListItem( child as ListItemView, registeredChildIndex );
		} );

		const groupItemsChangeCallback = this._getOnGroupItemsChangeCallback( groupView );

		// Cache the reference to the callback in case the group is removed (see _deregisterFocusableItemsGroup()).
		this._listItemGroupToChangeListeners.set( groupView, groupItemsChangeCallback );

		groupView.items.on<ListItemsChangeEvent>( 'change', groupItemsChangeCallback );
	}

	/**
	 * Removes a list item group view (and its children) from the focus tracker.
	 *
	 * @param groupView The group view to be removed.
	 */
	private _deregisterFocusableItemsGroup( groupView: ListItemGroupView ) {
		for ( const child of groupView.items ) {
			this._deregisterFocusableListItem( child as ListItemView );
		}

		groupView.items.off( 'change', this._listItemGroupToChangeListeners.get( groupView )! );
		this._listItemGroupToChangeListeners.delete( groupView );
	}
}

// There's no support for nested groups yet.
type ListItemsChangeEvent = CollectionChangeEvent<ListItemView>;
