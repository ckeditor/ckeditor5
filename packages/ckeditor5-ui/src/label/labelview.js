/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/label/labelview
 */

import View from '../view';
import Template from '../template';

/**
 * The label view class.
 *
 * @extends module:ui/view~View
 */
export default class LabelView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * The text of the label.
		 *
		 * @observable
		 * @member {String} #text
		 */
		this.set( 'text' );

		/**
		 * The `for` attribute of the label (i.e. to pair with an `<input>` element).
		 *
		 * @observable
		 * @member {String} #for
		 */
		this.set( 'for' );

		const bind = this.bindTemplate;

		this.template = new Template( {
			tag: 'label',
			attributes: {
				class: [
					'ck-label'
				],
				for: bind.to( 'for' )
			},
			children: [
				{
					text: bind.to( 'text' )
				}
			]
		} );
	}
}
