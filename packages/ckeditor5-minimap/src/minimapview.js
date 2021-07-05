/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { View } from 'ckeditor5/src/ui';
import { Rect } from 'ckeditor5/src/utils';
import MinimapIframeView from './minimapiframeview';
import MinimapPositionTrackerView from './minimappositiontrackerview';

/**
 * TODO
 */
export default class MinimapView extends View {
	constructor( { locale, scaleRatio, pageStyles, extraClasses, useSimplePreview, domRootClone } ) {
		super( locale );

		const bind = this.bindTemplate;

		this._positionTrackerView = new MinimapPositionTrackerView( locale );
		this._positionTrackerView.delegate( 'drag' ).to( this );
		this._scaleRatio = scaleRatio;

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
	}

	destroy() {
		this._minimapIframeView.destroy();

		super.destroy();
	}

	get height() {
		return new Rect( this.element ).height;
	}

	get scrollHeight() {
		return Math.max( 0, Math.min( this.height, this._minimapIframeView.height ) - this._positionTrackerView.height );
	}

	render() {
		super.render();

		this._minimapIframeView.render();

		this.element.appendChild( this._minimapIframeView.element );
	}

	setContentHeight( newHeight ) {
		this._minimapIframeView.height = newHeight * this._scaleRatio;
	}

	setScrollProgress( newScrollProgress ) {
		// The scrolling should end when the bottom edge of the iframe touches the bottom edge of the minimap.
		if ( this._minimapIframeView.height < this.height ) {
			this._minimapIframeView.top = 0;
			this._positionTrackerView.setTopOffset(
				( this._minimapIframeView.height - this._positionTrackerView.height ) * newScrollProgress
			);
		} else {
			const totalOffset = this._minimapIframeView.height - this.height;

			this._minimapIframeView.top = -totalOffset * newScrollProgress;
			this._positionTrackerView.setTopOffset( ( this.height - this._positionTrackerView.height ) * newScrollProgress );
		}

		this._positionTrackerView.setScrollProgress( Math.round( newScrollProgress * 100 ) );
	}

	setPositionTrackerHeight( trackerHeight ) {
		this._positionTrackerView.setHeight( trackerHeight * this._scaleRatio );
	}

	_handleMinimapClick( data ) {
		if ( data.target === this._positionTrackerView.element ) {
			return;
		}

		const trackerViewRect = new Rect( this._positionTrackerView.element );
		const diff = data.clientY - trackerViewRect.top - trackerViewRect.height / 2;
		const percentage = diff / this._minimapIframeView.height;

		this.fire( 'click', percentage );
	}

	_handleMinimapMouseWheel( data ) {
		this.fire( 'drag', data.deltaY * this._scaleRatio );
	}
}
