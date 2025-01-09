/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/editorui/evaluationbadge
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import { parseBase64EncodedObject, type Locale } from '@ckeditor/ckeditor5-utils';

import View from '../view.js';
import Badge, { type BadgeConfig } from '../badge/badge.js';

/**
 * A helper that enables the "evaluation badge" feature in the editor at the bottom of the editable element
 * (editor root, source editing area, etc.) when the editor is focused.
 *
 * @private
 */
export default class EvaluationBadge extends Badge {
	private licenseTypeMessage: Record<string, string> = {
		evaluation: 'For evaluation purposes only',
		trial: 'For evaluation purposes only',
		development: 'For development purposes only'
	};

	constructor( editor: Editor ) {
		super( editor, { balloonClass: 'ck-evaluation-badge-balloon' } );
	}

	/**
	 * Enables "evaluation badge" label.
	 */
	protected override _isEnabled(): boolean {
		const editor = this.editor;
		const licenseKey = editor.config.get( 'licenseKey' )!;
		const licenseType = getLicenseTypeFromLicenseKey( licenseKey );

		return Boolean( licenseType && this.licenseTypeMessage[ licenseType ] );
	}

	/**
	 * Creates the content of the "evaluation badge".
	 */
	protected override _createBadgeContent(): View<HTMLElement> {
		const licenseKey = this.editor.config.get( 'licenseKey' )!;
		const licenseType = getLicenseTypeFromLicenseKey( licenseKey )!;

		return new EvaluationBadgeView( this.editor.locale, this.licenseTypeMessage[ licenseType ] );
	}

	/**
	 * Returns the normalized configuration for the "evaluation badge".
	 * It takes 'ui.poweredBy' configuration into account to determine the badge position and side.
	 */
	protected override _getNormalizedConfig(): BadgeConfig {
		const badgeConfig = super._getNormalizedConfig();
		const userConfig = this.editor.config.get( 'ui.poweredBy' ) || {};
		const position = userConfig.position || badgeConfig.position;
		const poweredBySide = userConfig.side || badgeConfig.side;

		return {
			position,
			side: poweredBySide === 'left' ? 'right' : 'left',
			verticalOffset: badgeConfig.verticalOffset,
			horizontalOffset: badgeConfig.horizontalOffset
		};
	}
}

/**
 * A view displaying the "evaluation badge".
 */
class EvaluationBadgeView extends View<HTMLDivElement> {
	/**
	 * Creates an instance of the "evaluation badge" view.
	 *
	 * @param locale The localization services instance.
	 * @param label The label text.
	 */
	constructor( locale: Locale, label: string ) {
		super( locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-evaluation-badge' ],
				'aria-hidden': true
			},
			children: [
				{
					tag: 'span',
					attributes: {
						class: [ 'ck', 'ck-evaluation-badge__label' ]
					},
					children: [ label ]
				}
			]
		} );
	}
}

/**
 * Returns the license type based on the license key.
 */
function getLicenseTypeFromLicenseKey( licenseKey: string ): string | null {
	if ( licenseKey == 'GPL' ) {
		return 'GPL';
	}

	const licenseContent = parseBase64EncodedObject( licenseKey.split( '.' )[ 1 ] );

	if ( !licenseContent ) {
		return null;
	}

	return licenseContent.licenseType || 'production';
}
