/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module minimap/minimapview
 */

import { View } from 'ckeditor5/src/ui';
import { Rect } from 'ckeditor5/src/utils';

import MinimapIframeView from './minimapiframeview';
import MinimapPositionTrackerView from './minimappositiontrackerview';

/**
 * The main view of the minimap. It renders the original content but scaled down with a tracker element
 * visualizing the subset of the content visible to the user and allowing interactions (scrolling, dragging).
 *
 * @private
 * @extends module:ui/view~View
 */
export default class MinimapView extends View {
	/**
	 * Creates an instance of the minimap view.
	 *
	 * @param {module:utils/locale~Locale} locale
	 * @param {Object} options
	 * @param {HTMLElement} options.domRootClone
	 * @param {Array} options.pageStyles
	 * @param {Number} options.scaleRatio
	 * @param {Boolean} [options.useSimplePreview]
	 * @param {String} [options.extraClasses]
	 */
	constructor( { locale, scaleRatio, pageStyles, extraClasses, useSimplePreview, domRootClone } ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * An instance of the tracker view displayed over the minimap.
		 *
		 * @protected
		 * @readonly
		 * @member {module:minimap/minimappositiontrackerview~MinimapPositionTrackerView}
		 */
		this._positionTrackerView = new MinimapPositionTrackerView( locale );
		this._positionTrackerView.delegate( 'drag' ).to( this );

		/**
		 * The scale ratio of the minimap relative to the original editing DOM root with the content.
		 *
		 * @protected
		 * @readonly
		 * @member {Number}
		 */
		this._scaleRatio = scaleRatio;

		/**
		 * An instance of the iframe view that hosts the minimap.
		 *
		 * @protected
		 * @readonly
		 * @member {module:minimap/minimapiframeview~MinimapIframeView}
		 */
		this._minimapIframeView = new MinimapIframeView( locale, {
			useSimplePreview,
			pageStyles,
			extraClasses,
			scaleRatio,
			domRootClone
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-minimap'
				]
			},
			children: [
				this._positionTrackerView
			],
			on: {
				click: bind.to( this._handleMinimapClick.bind( this ) ),
				wheel: bind.to( this._handleMinimapMouseWheel.bind( this ) )
			}
		} );

		/**
		 * Fired when the minimap view is clicked.
		 *
		 * @event click
		 * @param {Number} progress The number between 0 and 1 representing a place in the minimap (its height) that was clicked.
		 */

		/**
		 * Fired when the position tracker is dragged or the minimap is scrolled via mouse wheel.
		 *
		 * @event drag
		 * @param {Number} movementY The vertical movement of the minimap as a result of dragging or scrolling.
		 */
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._minimapIframeView.destroy();

		super.destroy();
	}

	/**
	 * Returns the DOM {@link module:utils/dom/rect~Rect} height of the minimap.
	 *
	 * @readonly
	 * @member {Number}
	 */
	get height() {
		return new Rect( this.element ).height;
	}

	/**
	 * Returns the number of available space (pixels) the position tracker (visible subset of the content) can use to scroll vertically.
	 *
	 * @readonly
	 * @member {Number}
	 */
	get scrollHeight() {
		return Math.max( 0, Math.min( this.height, this._minimapIframeView.height ) - this._positionTrackerView.height );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this._minimapIframeView.render();

		this.element.appendChild( this._minimapIframeView.element );
	}

	/**
	 * Sets the new height of the minimap (in px) to respond to the changes in the original editing DOM root.
	 *
	 * **Note**:The provided value should be the `offsetHeight` of the original editing DOM root.
	 *
	 * @param {Number} newHeight
	 */
	setContentHeight( newHeight ) {
		this._minimapIframeView.setHeight( newHeight * this._scaleRatio );
	}

	/**
	 * Sets the minimap scroll progress.
	 *
	 * The minimap scroll progress is linked to the original editing DOM root and its scrollable container (ancestor).
	 * Changing the progress will alter the vertical position of the minimap (and its position tracker) and give the user an accurate
	 * overview of the visible document.
	 *
	 * **Note**: The value should be between 0 and 1. 0 when the DOM root has not been scrolled, 1 when the
	 * scrolling has reached the end.
	 *
	 * @param {Number} newScrollProgress
	 */
	setScrollProgress( newScrollProgress ) {
		const iframeView = this._minimapIframeView;
		const positionTrackerView = this._positionTrackerView;

		// The scrolling should end when the bottom edge of the iframe touches the bottom edge of the minimap.
		if ( iframeView.height < this.height ) {
			iframeView.setTopOffset( 0 );
			positionTrackerView.setTopOffset( ( iframeView.height - positionTrackerView.height ) * newScrollProgress );
		} else {
			const totalOffset = iframeView.height - this.height;

			iframeView.setTopOffset( -totalOffset * newScrollProgress );
			positionTrackerView.setTopOffset( ( this.height - positionTrackerView.height ) * newScrollProgress );
		}

		positionTrackerView.setScrollProgress( Math.round( newScrollProgress * 100 ) );
	}

	/**
	 * Sets the new height of the tracker (in px) to visualize the subset of the content visible to the user.
	 *
	 * @param {Number} trackerHeight
	 */
	setPositionTrackerHeight( trackerHeight ) {
		this._positionTrackerView.setHeight( trackerHeight * this._scaleRatio );
	}

	/**
	 * @private
	 * @param {Event} data DOM event data
	 */
	_handleMinimapClick( data ) {
		const positionTrackerView = this._positionTrackerView;

		if ( data.target === positionTrackerView.element ) {
			return;
		}

		const trackerViewRect = new Rect( positionTrackerView.element );
		const diff = data.clientY - trackerViewRect.top - trackerViewRect.height / 2;
		const percentage = diff / this._minimapIframeView.height;

		this.fire( 'click', percentage );
	}

	/**
	 * @private
	 * @param {Event} data DOM event data
	 */
	_handleMinimapMouseWheel( data ) {
		this.fire( 'drag', data.deltaY * this._scaleRatio );
	}
}
