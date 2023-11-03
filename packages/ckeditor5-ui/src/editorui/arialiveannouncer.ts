/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import type { Locale } from '@ckeditor/ckeditor5-utils';
import type ViewCollection from '../viewcollection';
import View from '../view';

/**
 * The politeness level of an `aria-live` announcement.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions#Politeness_levels
 */
export enum AriaLiveAnnouncerPoliteness {
	POLITE = 'polite',
	ASSERTIVE = 'assertive'
}

/**
 * An accessibility helper that manages all ARIA live regions associated with an editor instance. ARIA live regions announce changes
 * to the state of the editor features.
 *
 * These announcements are consumed and propagated by screen readers and give users a better understanding of the current
 * state of the editor.
 *
 * To announce a state change to an editor feature named `'Some feature'`, use the {@link #setText} method:
 * ```ts
 * editor.ui.ariaLiveAnnouncer.setText( 'Some feature', 'Text of an announcement.' );
 * ```
 */
export default class AriaLiveAnnouncer {
	/**
	 * The view that aggregates all `aria-live` regions.
	 */
	public readonly view: AriaLiveAnnouncerView;

	constructor( editor: Editor ) {
		this.view = new AriaLiveAnnouncerView( editor.locale );

		editor.on( 'ready', () => {
			editor.ui.view.body.add( this.view );
		} );
	}

	/**
	 * Sets an announcement text to an aria region associated with a specific editor feature.
	 *
	 * If the aria region of a given name does not exist, it will be created and can be re-used later.
	 */
	public setText( regionName: string, text: string, politeness: AriaLiveAnnouncerPoliteness = AriaLiveAnnouncerPoliteness.POLITE ): void {
		let regionView = this.view.regionViews.find( view => view.regionName === regionName );

		if ( !regionView ) {
			regionView = new AriaLiveAnnouncerRegionView( this.view.locale! );
			this.view.regionViews.add( regionView );
		}

		regionView.set( {
			regionName,
			text,
			politeness
		} );
	}
}

/**
 * The view that aggregates all `aria-live` regions.
 */
class AriaLiveAnnouncerView extends View {
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
 * The view that represents a single `aria-live` region (e.g. for a specific editor feature).
 */
class AriaLiveAnnouncerRegionView extends View {
	/**
	 * Current text of the region.
	 */
	declare public text: string;

	/**
	 * Current politeness level of the region.
	 */
	declare public politeness: AriaLiveAnnouncerPoliteness;

	/**
	 * A unique name of the region, usually associated with a specific editor feature or system.
	 */
	declare public regionName: string;

	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'regionName', '' );
		this.set( 'text', '' );
		this.set( 'politeness', AriaLiveAnnouncerPoliteness.POLITE );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				role: 'region',
				'data-region': bind.to( 'regionName' ),
				'aria-live': bind.to( 'politeness' )
			},
			children: [
				{ text: bind.to( 'text' ) }
			]
		} );
	}
}
