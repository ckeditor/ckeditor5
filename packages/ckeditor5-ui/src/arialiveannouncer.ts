/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/arialiveannouncer
 */

import type { DomConverter } from '@ckeditor/ckeditor5-engine';
import type { Editor } from '@ckeditor/ckeditor5-core';
import type { Locale } from '@ckeditor/ckeditor5-utils';
import type ViewCollection from './viewcollection.js';
import View from './view.js';

import '../theme/components/arialiveannouncer/arialiveannouncer.css';

/**
 * The politeness level of an `aria-live` announcement.
 *
 * Available keys are:
 * * `AriaLiveAnnouncerPoliteness.POLITE`,
 * * `AriaLiveAnnouncerPoliteness.ASSERTIVE`
 *
 * [Learn more](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions#Politeness_levels).
 */
export const AriaLiveAnnouncerPoliteness = {
	POLITE: 'polite',
	ASSERTIVE: 'assertive'
} as const;

/**
 * An accessibility helper that manages all ARIA live regions associated with an editor instance. ARIA live regions announce changes
 * to the state of the editor features.
 *
 * These announcements are consumed and propagated by screen readers and give users a better understanding of the current
 * state of the editor.
 *
 * To announce a state change to an editor use the {@link #announce} method:
 *
 * ```ts
 * editor.ui.ariaLiveAnnouncer.announce( 'Text of an announcement.' );
 * ```
 */
export default class AriaLiveAnnouncer {
	/**
	 * The editor instance.
	 */
	public readonly editor: Editor;

	/**
	 * The view that aggregates all `aria-live` regions.
	 */
	public view?: AriaLiveAnnouncerView;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		this.editor = editor;

		/**
		 * Some screen readers only look at changes in the aria-live region.
		 * They might not read a region that already has content when it is added.
		 * To stop this problem, make sure to set up regions for all politeness settings when the editor starts.
		 */
		editor.once( 'ready', () => {
			for ( const politeness of Object.values( AriaLiveAnnouncerPoliteness ) ) {
				this.announce( '', politeness );
			}
		} );
	}

	/**
	 * Sets an announcement text to an aria region that is then announced by a screen reader to the user.
	 *
	 * If the aria region of a specified politeness does not exist, it will be created and can be re-used later.
	 *
	 * The default announcement politeness level is `'polite'`.
	 *
	 * ```ts
	 * // Most screen readers will queue announcements from multiple aria-live regions and read them out in the order they were emitted.
 	 * editor.ui.ariaLiveAnnouncer.announce( 'Image uploaded.' );
 	 * editor.ui.ariaLiveAnnouncer.announce( 'Connection lost. Reconnecting.' );
 	 * ```
	 */
	public announce(
		announcement: string,
		attributes: AriaLiveAnnouncerPolitenessValue | AriaLiveAnnounceConfig = AriaLiveAnnouncerPoliteness.POLITE
	): void {
		const editor = this.editor;

		if ( !editor.ui.view ) {
			return;
		}

		if ( !this.view ) {
			this.view = new AriaLiveAnnouncerView( editor.locale );
			editor.ui.view.body.add( this.view );
		}

		const { politeness, isUnsafeHTML }: AriaLiveAnnounceConfig = typeof attributes === 'string' ? {
			politeness: attributes
		} : attributes;

		let politenessRegionView = this.view.regionViews.find( view => view.politeness === politeness );

		if ( !politenessRegionView ) {
			politenessRegionView = new AriaLiveAnnouncerRegionView( editor, politeness );
			this.view.regionViews.add( politenessRegionView );
		}

		politenessRegionView.announce( {
			announcement,
			isUnsafeHTML
		} );
	}
}

/**
 * The view that aggregates all `aria-live` regions.
 */
export class AriaLiveAnnouncerView extends View {
	/**
	 * A collection of all views that represent individual `aria-live` regions.
	 */
	public readonly regionViews: ViewCollection<AriaLiveAnnouncerRegionView>;

	constructor( locale: Locale ) {
		super( locale );

		this.regionViews = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-aria-live-announcer'
				]
			},
			children: this.regionViews
		} );
	}
}

/**
 * The view that represents a single `aria-live`.
 */
export class AriaLiveAnnouncerRegionView extends View {
	/**
	 * Current politeness level of the region.
	 */
	public readonly politeness: AriaLiveAnnouncerPolitenessValue;

	/**
	 * DOM converter used to sanitize unsafe HTML passed to {@link #announce} method.
	 */
	private _domConverter: DomConverter;

	/**
	 * Interval used to remove additions. It prevents accumulation of added nodes in region.
	 */
	private _pruneAnnouncementsInterval: ReturnType<typeof setInterval> | null;

	constructor( editor: Editor, politeness: AriaLiveAnnouncerPolitenessValue ) {
		super( editor.locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				'aria-live': politeness,
				'aria-relevant': 'additions'
			},
			children: [
				{
					tag: 'ul',
					attributes: {
						class: [
							'ck',
							'ck-aria-live-region-list'
						]
					}
				}
			]
		} );

		editor.on( 'destroy', () => {
			if ( this._pruneAnnouncementsInterval !== null ) {
				clearInterval( this._pruneAnnouncementsInterval! );
				this._pruneAnnouncementsInterval = null;
			}
		} );

		this.politeness = politeness;
		this._domConverter = editor.data.htmlProcessor.domConverter;
		this._pruneAnnouncementsInterval = setInterval( () => {
			if ( this.element && this._listElement!.firstChild ) {
				this._listElement!.firstChild!.remove();
			}
		}, 5000 );
	}

	/**
	 * Appends new announcement to region.
	 */
	public announce( { announcement, isUnsafeHTML }: AriaLiveAppendContentAttributes ): void {
		if ( !announcement.trim().length ) {
			return;
		}

		const messageListItem = document.createElement( 'li' );

		if ( isUnsafeHTML ) {
			this._domConverter.setContentOf( messageListItem, announcement );
		} else {
			messageListItem.innerText = announcement;
		}

		this._listElement!.appendChild( messageListItem );
	}

	/**
	 * Return current announcements list HTML element.
	 */
	private get _listElement(): HTMLElement | null {
		return this.element!.querySelector( 'ul' )!;
	}
}

type AriaLiveAnnouncerPolitenessValue = typeof AriaLiveAnnouncerPoliteness[ keyof typeof AriaLiveAnnouncerPoliteness ];

type AriaLiveAppendContentAttributes = {
	announcement: string;
	isUnsafeHTML?: boolean;
};

type AriaLiveAnnounceConfig = {
	politeness: AriaLiveAnnouncerPolitenessValue;
	isUnsafeHTML?: boolean;
};
