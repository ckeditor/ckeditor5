/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import uid from '../../utils/uid.js';
import View from '../../ui/view.js';
import Template from '../../ui/template.js';

const arrowLeftOffset = 30;
const arrowTopOffset = 15;

/**
 * The balloon panel view class.
 *
 * See {@link ui.balloonPanel.BalloonPanel}.
 *
 * TODO: extends BalloonPanelView
 *
 * @memberOf link.ui
 * @extends ui.View
 */
export default class LinkBalloonPanelView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const t = this.t;
		const bind = this.bind;
		const urlFieldId = `ck-input-${ uid() }`;

		this.template = new Template( {
			tag: 'div',

			attributes: {
				class: [
					'ck-balloon-panel',
					'ck-link-balloon-panel',
					bind.to( 'arrow', ( value ) =>  `ck-balloon-panel_arrow_${ value }` ),
					bind.if( 'isVisible', 'ck-balloon-panel_visible' ),
				],

				style: {
					top: bind.to( 'top', ( value ) => `${ value }px` ),
					left: bind.to( 'left', ( value ) => `${ value }px` ),
					maxWidth: bind.to( 'maxWidth', ( value ) => `${ value }px` ),
					maxHeight: bind.to( 'maxHeight', ( value ) => `${ value }px` ),
				}
			},

			children: [
				{
					tag: 'label',
					attributes: {
						class: [
							'ck-input__label'
						],
						for: urlFieldId
					},
					children: [
						t( 'Link URL' )
					]
				},
				{
					tag: 'input',
					attributes: {
						class: [
							'ck-input',
							'ck-input-text'
						],
						id: urlFieldId,
						type: 'text',
						value: bind.to( 'url' )
					},
					on: {
						change: bind.to( 'urlChange' )
					}
				},
				{
					tag: 'div',
					attributes: {
						class: [
							'ck-balloon-panel__buttons'
						]
					}
				}
			]
		} );

		this.register( 'buttons', '.ck-balloon-panel__buttons' );
	}

	show() {
		this.model.isVisible = true;
	}

	hide() {
		this.model.isVisible = false;
	}

	getVisibleViewportRect( limiterElement ) {
		const limiterRect = new AbsoluteDomRect( limiterElement, 'limiter' );
		const windowScrollX = window.scrollX;
		const windowScrollY = window.scrollY;
		const bodyWidth = document.body.clientWidth;
		const bodyHeight = document.body.clientHeight;

		// 	[Viewport]
		// 	+---------------------------------------+
		// 	|                        [Limiter]      |
		// 	|                        +----------------------+
		// 	|                        |##############|       |
		// 	|                        |##############|       |
		// 	|                        |##############|       |
		// 	|                        +-------^--------------+
		// 	|                                |      |
		// 	+--------------------------------|------+
		//                                   |
		//                                    \- [Visible Viewport Rect]
		//
		return new AbsoluteDomRect( {
			top: Math.max( limiterRect.top, windowScrollY ),
			left: Math.max( limiterRect.left, windowScrollX ),
			right: Math.min( limiterRect.right, bodyWidth + windowScrollX ),
			bottom: Math.min( limiterRect.bottom, bodyHeight + windowScrollY )
		}, 'visibleViewportRect' );
	}

	attachTo( elementOrRange, limiterElement ) {
		this.show();

		const elementOrRangeRect = new AbsoluteDomRect( elementOrRange, 'elementOrRange' );
		const panelRect = new AbsoluteDomRect( this.element );
		const visibleViewportRect = this.getVisibleViewportRect( limiterElement );

		// visibleViewportRect.paint();
		// elementOrRangeRect.paint();

		this.smartAttachTo( [
			// [     ]
			//    ^
			// +--------------+
			// |              |
			// +--------------+
			panelRect.clone( 'se' ).moveTo( {
				top: elementOrRangeRect.bottom + arrowTopOffset,
				left: elementOrRangeRect.left + elementOrRangeRect.width / 2 - arrowLeftOffset
			} ),

			//          [     ]
			//             ^
			// +--------------+
			// |              |
			// +--------------+
			panelRect.clone( 'sw' ).moveTo( {
				top: elementOrRangeRect.bottom + arrowTopOffset,
				left: elementOrRangeRect.left + elementOrRangeRect.width / 2 - panelRect.width + arrowLeftOffset
			} ),

			// +--------------+
			// |              |
			// +--------------+
			//    V
			// [     ]
			panelRect.clone( 'ne' ).moveTo( {
				top: elementOrRangeRect.top - panelRect.height - arrowTopOffset,
				left: elementOrRangeRect.left + elementOrRangeRect.width / 2 - arrowLeftOffset
			} ),

			// +--------------+
			// |              |
			// +--------------+
			//             V
			//          [     ]
			panelRect.clone( 'nw' ).moveTo( {
				top: elementOrRangeRect.top - panelRect.height - arrowTopOffset,
				left: elementOrRangeRect.left + elementOrRangeRect.width / 2 - panelRect.width + arrowLeftOffset
			} )
		], visibleViewportRect );
	}

	smartAttachTo( rects, visibleViewportRect ) {
		let maxIntersectRect;
		let maxIntersectArea = -1;

		for ( let rect of rects ) {
			const intersectArea = rect.getIntersectArea( visibleViewportRect );
			// rect.paint();

			if ( intersectArea > maxIntersectArea ) {
				maxIntersectRect = rect;
				maxIntersectArea = intersectArea;
			}
		}

		this.model.arrow = maxIntersectRect.name;
		this.model.top = maxIntersectRect.top;
		this.model.left = maxIntersectRect.left;
	}
}

// AbsoluteDomRect always corresponds with what position: absolute would behave.
class AbsoluteDomRect {
	constructor( elementOrRangeOrRect, name ) {
		if ( name ) {
			this.name = name;
		}

		if ( elementOrRangeOrRect instanceof HTMLElement || elementOrRangeOrRect instanceof Range ) {
			const elementRect = elementOrRangeOrRect.getBoundingClientRect();
			const bodyRect = document.body.getBoundingClientRect();

			this.top = elementRect.top - bodyRect.top;
			this.right = elementRect.right - bodyRect.left;
			this.bottom = elementRect.bottom - bodyRect.top;
			this.left = elementRect.left - bodyRect.left;
			this.width = elementRect.width;
			this.height = elementRect.height;
		} else {
			Object.assign( this, elementOrRangeOrRect );

			if ( typeof width == 'undefined' ) {
				this.width = this.right - this.left;
			}

			if ( typeof height == 'undefined' ) {
				this.height = this.bottom - this.top;
			}
		}
	}

	clone( newName ) {
		return new AbsoluteDomRect( this, newName );
	}

	moveTo( { top, left } ) {
		this.top = top;
		this.right = left + this.width;
		this.bottom = top + this.height;
		this.left = left;

		return this;
	}

	getIntersectArea( rect ) {
		const hOverlap = Math.max( 0, Math.min( this.right, rect.right ) - Math.max( this.left, rect.left ) );
		const vOverlap = Math.max( 0, Math.min( this.bottom, rect.bottom ) - Math.max( this.top, rect.top ) );

		return hOverlap * vOverlap;
	}

	paint() {
		this.painter = document.createElement( 'div' );
		this.painter.style.backgroundColor = 'rgba(255,0,0,.05)';
		this.painter.style.color = '#000';
		this.painter.style.position = 'absolute';
		this.painter.style.display = 'flex';
		this.painter.style.justifyContent = 'center';
		this.painter.style.alignItems = 'center';
		this.painter.style.left = this.left + 'px';
		this.painter.style.top = this.top + 'px';
		this.painter.style.width = this.width + 'px';
		this.painter.style.height = this.height + 'px';
		this.painter.style.outline = '1px solid rgba(255,0,0,.3)';
		this.painter.innerHTML = this.name;

		document.body.appendChild( this.painter );
	}
}
