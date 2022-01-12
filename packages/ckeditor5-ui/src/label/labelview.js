/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/label/labelview
 */

import View from '../view';
import uid from '@ckeditor/ckeditor5-utils/src/uid';

import '../../theme/components/label/label.css';

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

		/**
		 * An unique id of the label. It can be used by other UI components to reference
		 * the label, for instance, using the `aria-describedby` DOM attribute.
		 *
		 * @member {String} #id
		 */
		this.id = `ck-editor__label_${ uid() }`;

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'label',
			attributes: {
				class: [
					'ck',
					'ck-label'
				],
				id: this.id,
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
