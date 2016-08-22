/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import View from '../../ui/view.js';
import Template from '../../ui/template.js';

/**
 * The box view class.
 *
 * See {@link ui.box.Box}.
 *
 * @memberOf ui.box
 * @extends ui.View
 */
export default class BoxView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bind;

		this.template = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck-box',
					bind.if( 'alignRight', 'ck-box_align_right' )
				]
			}
		} );

		this.register( 'content', el => el );
	}
}
