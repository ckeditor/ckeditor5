/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/icon/cssiconview
 */

import View from '../view.js';

import '../../theme/components/icon/cssicon.css';

export type CssIconVariable = `--ck-icon-${ string }`;

/**
 * The icon view class.
 */
export default class CssIconView extends View {
	/**
   * Name of the CSS variable that holds the icon content.
   *
   * @observable
   */
	declare public variable: CssIconVariable | undefined;

	/**
   * Color of the icon.
   *
   * @observable
   */
	declare public color: string;

	/**
   * Width of the icon.
   *
   * @observable
   */
	declare public width: number;

	/**
   * Height of the icon.
   *
   * @observable
   */
	declare public height: number;

	/**
   * Controls whether the icon is visible.
   *
   * @observable
   * @default true
   */
	declare public isVisible: boolean;

	/**
   * @inheritDoc
   */
	constructor() {
		super();

		const bind = this.bindTemplate;

		this.set( 'variable', undefined );
		this.set( 'color', '' );
		this.set( 'width', 0 );
		this.set( 'height', 0 );
		this.set( 'isVisible', true );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-css-icon',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				],
				style: [
					bind.to( 'variable', value => `--ck-icon: var(${ value });` ),
					bind.to( 'color', value => value ? `--ck-icon-color: ${ value };` : '' ),
					bind.to( 'width', value => value ? `--ck-icon-width: ${ value }px;` : '' ),
					bind.to( 'height', value => value ? `--ck-icon-height: ${ value }px;` : '' )
				],
				'aria-hidden': true
			}
		} );
	}
}
