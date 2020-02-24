/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/tooltip/tooltipview
 */

import View from '../view';

import '../../theme/components/tooltip/tooltip.css';

/**
 * The tooltip view class.
 *
 * @extends module:ui/view~View
 */
export default class TooltipView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * The text of the tooltip visible to the user.
		 *
		 * @observable
		 * @member {String} #text
		 */
		this.set( 'text', '' );

		/**
		 * The position of the tooltip (south or north).
		 *
		 *		+-----------+
		 *		|   north   |
		 *		+-----------+
		 *		      V
		 *		  [element]
		 *
		 *		  [element]
		 *		      ^
		 *		+-----------+
		 *		|   south   |
		 *		+-----------+
		 *
		 * @observable
		 * @default 's'
		 * @member {'s'|'n'} #position
		 */
		this.set( 'position', 's' );

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck',
					'ck-tooltip',
					bind.to( 'position', position => 'ck-tooltip_' + position ),
					bind.if( 'text', 'ck-hidden', value => !value.trim() )
				]
			},
			children: [
				{
					tag: 'span',

					attributes: {
						class: [
							'ck',
							'ck-tooltip__text'
						]
					},

					children: [
						{
							text: bind.to( 'text' )
						}
					]
				}
			]
		} );
	}
}
