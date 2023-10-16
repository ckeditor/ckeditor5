/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import View from '../view';
import type { Locale } from '@ckeditor/ckeditor5-utils';
import type ViewCollection from '../viewcollection';

enum AriaLiveAnnouncerPoliteness {
	POLITE = 'polite',
	ASSERTIVE = 'assertive'
}

/**
 * TODO
 */
export default class AriaLiveAnnouncer {
	public readonly view: AriaLiveAnnouncerView;

	constructor( editor: Editor ) {
		this.view = new AriaLiveAnnouncerView( editor.locale );

		editor.on( 'ready', () => {
			editor.ui.view.body.add( this.view );
		} );
	}

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

class AriaLiveAnnouncerView extends View {
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

class AriaLiveAnnouncerRegionView extends View {
	declare public text: string;
	declare public politeness: AriaLiveAnnouncerPoliteness;
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
