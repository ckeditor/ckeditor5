/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/arialiveannouncer
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import type { Locale, ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
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
 * To announce a state change to an editor feature named `'Some feature'`, use the {@link #announce} method:
 * ```ts
 * editor.ui.ariaLiveAnnouncer.announce( 'Some feature', 'Text of an announcement.' );
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
	}

	/**
	 * Appends empty `aria-live` announcement region. Some of screen readers tend to not read newly added
	 * regions with already filled text content. Appending empty region before any action prevents
	 * that behavior and screen readers are forced to read updated text.
	 */
	public registerRegion( regionName: string ): void {
		this.announce( regionName, '' );
	}

	/**
	 * Sets an announcement text to an aria region associated with a specific editor feature. The text is then
	 * announced by a screen reader to the user.
	 *
	 * If the aria region of a given name does not exist, it will be created and can be re-used later. The name of the region
	 * groups announcements originating from a specific editor feature and does not get announced by a screen reader.
	 *
	 * Using multiple regions allows for many announcements to be emitted in a short period of time. Changes to ARIA-live announcements
	 * are captured by a screen reader and read out in the order they were emitted.
	 *
	 * The default announcement politeness level is `'polite'`.
	 *
	 * ```ts
	 * // Most screen readers will queue announcements from multiple aria-live regions and read them out in the order they were emitted.
 	 * editor.ui.ariaLiveAnnouncer.announce( 'image', 'Image uploaded.' );
 	 * editor.ui.ariaLiveAnnouncer.announce( 'network', 'Connection lost. Reconnecting.' );
 	 * ```
	 */
	public announce(
		regionName: string,
		announcement: string,
		attributes: AriaLiveAnnouncerPolitenessValue | AriaLiveAnnounceConfig = AriaLiveAnnouncerPoliteness.POLITE
	): void {
		const editor = this.editor;

		if ( !this.view ) {
			this.view = new AriaLiveAnnouncerView( editor.locale );
			editor.ui.view.body.add( this.view );
		}

		let regionView = this.view.regionViews.find( view => view.regionName === regionName );

		if ( !regionView ) {
			regionView = new AriaLiveAnnouncerRegionView( this.view.locale! );
			this.view.regionViews.add( regionView );
		}

		const { politeness, allowReadAgain, isUnsafeHTML }: AriaLiveAnnounceConfig = typeof attributes === 'string' ? {
			politeness: attributes
		} : attributes;

		// Handle edge case when:
		//
		// 	1. user enters code block #1 with PHP language.
		//  2. user enters code block #2 with PHP language.
		//	3. user leaves code block #2 and comes back to code block #1 with identical language
		//
		// In this scenario `announcement` will be identical (`Leaving PHP code block, entering PHP code block`)
		// Screen reader will not detect this change because `aria-live` is identical with previous one and
		// will skip reading the label.
		//
		// Try to bypass this issue by toggling non readable character at the end of phrase.
		if ( allowReadAgain && regionView.content === announcement ) {
			// eslint-disable-next-line no-irregular-whitespace
			announcement = `${ announcement } `;
		}

		regionView.set( {
			regionName,
			isUnsafeHTML: !!isUnsafeHTML,
			content: announcement,
			politeness
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
 * The view that represents a single `aria-live` region (e.g. for a specific editor feature) and its text.
 */
export class AriaLiveAnnouncerRegionView extends View {
	/**
	 * Current content of the region.
	 */
	declare public content: string;

	/**
	 * Indication that region has HTML content.
	 */
	declare public isUnsafeHTML: boolean;

	/**
	 * Current politeness level of the region.
	 */
	declare public politeness: typeof AriaLiveAnnouncerPoliteness[ keyof typeof AriaLiveAnnouncerPoliteness ];

	/**
	 * A unique name of the region, usually associated with a specific editor feature or system.
	 */
	declare public regionName: string;

	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'regionName', '' );
		this.set( 'content', '' );
		this.set( 'isUnsafeHTML', false );
		this.set( 'politeness', AriaLiveAnnouncerPoliteness.POLITE );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				role: 'region',
				'data-region': bind.to( 'regionName' ),
				'aria-live': bind.to( 'politeness' )
			}
		} );

		this.on<ObservableChangeEvent<string>>( 'change:content', ( evt, name, content ) => {
			this.element![ this.isUnsafeHTML ? 'innerHTML' : 'innerText' ] = content;
		} );
	}
}

type AriaLiveAnnouncerPolitenessValue = typeof AriaLiveAnnouncerPoliteness[ keyof typeof AriaLiveAnnouncerPoliteness ];

type AriaLiveAnnounceConfig = {
	politeness: AriaLiveAnnouncerPolitenessValue;
	allowReadAgain?: boolean;
	isUnsafeHTML?: boolean;
};
