/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgetresize/sizeview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';

/**
 * A view displaying the proposed new element size during the resizing.
 *
 * @protected
 * @extends {module:ui/view~View}
 */
export default class SizeView extends View {
	constructor() {
		super();

		/**
		 * The visibility of the view defined based on the existence of the host proposed dimensions.
		 *
		 * @private
		 * @observable
		 * @readonly
		 * @member {Boolean} #_isVisible
		 */

		/**
		 * The text that will be displayed in the `SizeView` child.
		 * It can be formatted as the pixel values (e.g. 10x20) or the percentage value (e.g. 10%).
		 *
		 * @private
		 * @observable
		 * @readonly
		 * @member {Boolean} #_label
		 */

		/**
		 * The position of the view defined based on the host size and active handle position.
		 *
		 * @private
		 * @observable
		 * @readonly
		 * @member {String} #_viewPosition
		 */

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-size-view',
					bind.to( '_viewPosition', value => value ? `ck-orientation-${ value }` : '' )
				],
				style: {
					display: bind.if( '_isVisible', 'none', visible => !visible )
				}
			},
			children: [ {
				text: bind.to( '_label' )
			} ]
		} );
	}

	/**
	 * A method used for binding the `SizeView` instance properties to the `ResizeState` instance observable properties.
	 *
	 * @protected
	 * @param {module:widget/widgetresize~ResizerOptions} options
	 * An object defining the resizer options, used for setting the proper size label.
	 * @param {module:widget/widgetresize/resizerstate~ResizeState} resizeState
	 * The `ResizeState` class instance, used for keeping the `SizeView` state up to date.
	 */
	_bindToState( options, resizeState ) {
		this.bind( '_isVisible' ).to( resizeState, 'proposedWidth', resizeState, 'proposedHeight', ( width, height ) =>
			width !== null && height !== null );

		this.bind( '_label' ).to(
			resizeState, 'proposedHandleHostWidth',
			resizeState, 'proposedHandleHostHeight',
			resizeState, 'proposedWidthPercents',
			( width, height, widthPercents ) => {
				if ( options.unit === 'px' ) {
					return `${ width }×${ height }`;
				} else {
					return `${ widthPercents }%`;
				}
			}
		);

		this.bind( '_viewPosition' ).to(
			resizeState, 'activeHandlePosition',
			resizeState, 'proposedHandleHostWidth',
			resizeState, 'proposedHandleHostHeight',
			// If the widget is too small to contain the size label, display the label above.
			( position, width, height ) => width < 50 || height < 50 ? 'above-center' : position
		);
	}

	/**
	 * A method used for cleaning up. It removes the bindings and hides the view.
	 *
	 * @protected
	 */
	_dismiss() {
		this.unbind();
		this._isVisible = false;
	}
}
