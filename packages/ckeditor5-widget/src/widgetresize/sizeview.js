/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import View from '@ckeditor/ckeditor5-ui/src/view';

/**
 * A view displaying the proposed new element size during the resizing.
 *
 * @extends {module:ui/view~View}
 */
export default class SizeView extends View {
	constructor() {
		/**
		 * The position of the view defined based on the host size and active handle position.
		 *
		 * @private
		 * @observable
		 * @member {String} #viewPosition
		 */

		super();

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-size-view',
					bind.to( 'viewPosition', value => value ? `ck-orientation-${ value }` : '' )
				],
				style: {
					display: bind.if( 'isVisible', 'none', visible => !visible )
				}
			},
			children: [ {
				text: bind.to( 'label' )
			} ]
		} );
	}

	bindToState( options, resizerState ) {
		this.bind( 'isVisible' ).to( resizerState, 'proposedWidth', resizerState, 'proposedHeight', ( width, height ) =>
			width !== null && height !== null );

		this.bind( 'label' ).to(
			resizerState, 'proposedHandleHostWidth',
			resizerState, 'proposedHandleHostHeight',
			resizerState, 'proposedWidthPercents',
			( width, height, widthPercents ) => {
				if ( options.unit === 'px' ) {
					return `${ width }×${ height }`;
				} else {
					return `${ widthPercents }%`;
				}
			}
		);

		this.bind( 'viewPosition' ).to(
			resizerState, 'activeHandlePosition',
			resizerState, 'proposedHandleHostWidth',
			resizerState, 'proposedHandleHostHeight',
			// If the image is too small to contain the size label, display the label above.
			( position, width, height ) => width < 50 || height < 50 ? 'above-center' : position
		);
	}

	dismiss() {
		this.unbind();
		this.isVisible = false;
	}
}
