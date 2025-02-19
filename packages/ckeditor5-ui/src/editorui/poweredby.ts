/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/editorui/poweredby
 */

import { IconProjectLogo } from '@ckeditor/ckeditor5-icons';
import { parseBase64EncodedObject, type Locale } from '@ckeditor/ckeditor5-utils';

import View from '../view.js';
import Badge from '../badge/badge.js';
import IconView from '../icon/iconview.js';
import type { Editor, UiConfig } from '@ckeditor/ckeditor5-core';

const DEFAULT_LABEL = 'Powered by';

type PoweredByConfig = Required<UiConfig>[ 'poweredBy' ];

/**
 * A helper that enables the "powered by" feature in the editor and renders a link to the project's
 * webpage next to the bottom of the editable element (editor root, source editing area, etc.) when the editor is focused.
 *
 * @private
 */
export default class PoweredBy extends Badge {
	constructor( editor: Editor ) {
		super( editor, { balloonClass: 'ck-powered-by-balloon' } );
	}

	/**
	 * Enables "powered by" label.
	 */
	protected override _isEnabled(): boolean {
		const editor = this.editor;
		const forceVisible = editor.config.get( 'ui.poweredBy.forceVisible' );

		if ( forceVisible ) {
			return true;
		}

		const licenseKey = editor.config.get( 'licenseKey' )!;

		if ( licenseKey == 'GPL' ) {
			return true;
		}

		const licenseContent = parseBase64EncodedObject( licenseKey.split( '.' )[ 1 ] );

		if ( !licenseContent ) {
			return true;
		}

		return !licenseContent.whiteLabel;
	}

	/**
	 * Creates a "powered by" badge content.
	 */
	protected override _createBadgeContent(): View<HTMLElement> {
		return new PoweredByView( this.editor.locale, this._getNormalizedConfig().label );
	}

	/**
	 * Returns the normalized configuration for the "powered by" badge.
	 * It takes the user configuration into account and falls back to the default one.
	 */
	protected override _getNormalizedConfig(): Required<PoweredByConfig> {
		const badgeConfig = super._getNormalizedConfig();
		const userConfig = this.editor.config.get( 'ui.poweredBy' ) || {};
		const position = userConfig.position || badgeConfig.position;
		const verticalOffset = position === 'inside' ? 5 : badgeConfig.verticalOffset;

		return {
			position,
			side: userConfig.side || badgeConfig.side,
			label: userConfig.label === undefined ? DEFAULT_LABEL : userConfig.label,
			verticalOffset: userConfig.verticalOffset !== undefined ? userConfig.verticalOffset : verticalOffset,
			horizontalOffset: userConfig.horizontalOffset !== undefined ? userConfig.horizontalOffset : badgeConfig.horizontalOffset,
			forceVisible: !!userConfig.forceVisible
		};
	}
}

/**
 * A view displaying a "powered by" label and project logo wrapped in a link.
 */
class PoweredByView extends View<HTMLDivElement> {
	/**
	 * Creates an instance of the "powered by" view.
	 *
	 * @param locale The localization services instance.
	 * @param label The label text.
	 */
	constructor( locale: Locale, label: string | null ) {
		super( locale );

		const iconView = new IconView();
		const bind = this.bindTemplate;

		iconView.set( {
			content: IconProjectLogo,
			isColorInherited: false
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-powered-by' ],
				'aria-hidden': true
			},
			children: [
				{
					tag: 'a',
					attributes: {
						href: 'https://ckeditor.com/powered-by-ckeditor/?utm_source=ckeditor&' +
							'utm_medium=referral&utm_campaign=701Dn000000hVgmIAE_powered_by_ckeditor_logo',
						target: '_blank',
						tabindex: '-1'
					},
					children: [
						...label ? [
							{
								tag: 'span',
								attributes: {
									class: [ 'ck', 'ck-powered-by__label' ]
								},
								children: [ label ]
							}
						] : [],
						iconView
					],
					on: {
						dragstart: bind.to( evt => evt.preventDefault() )
					}
				}
			]
		} );
	}
}
