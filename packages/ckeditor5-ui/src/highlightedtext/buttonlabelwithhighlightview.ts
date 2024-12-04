/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/highlightedtext/buttonlabelwithhighlightview
 */

import type ButtonLabel from '../button/buttonlabel.js';
import HighlightedTextView from './highlightedtextview.js';

/**
 * A button label view that can highlight a text fragment.
 */
export default class ButtonLabelWithHighlightView extends HighlightedTextView implements ButtonLabel {
	/**
	 * @inheritDoc
	 */
	declare public style: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public text: string | undefined;

	/**
	 * @inheritDoc
	 */
	declare public id: string | undefined;

	/**
	 * @inheritDoc
	 */
	constructor() {
		super();

		this.set( {
			style: undefined,
			text: undefined,
			id: undefined
		} );

		const bind = this.bindTemplate;

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-button__label'
				],
				style: bind.to( 'style' ),
				id: bind.to( 'id' )
			}
		} );
	}
}
