/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { Plugin, type Editor } from 'ckeditor5/src/core';
import { BalloonPanelView, IconView, View } from 'ckeditor5/src/ui';
import type { PositionOptions, Rect } from 'ckeditor5/src/utils';

// import poweredByIcon from '../theme/icons/poweredby.svg';
import poweredByIcon from '../theme/icons/ckeditor.svg';
import '../theme/poweredby.css';

// const ICON_WIDTH = 112;
// const ICON_HEIGHT = 10;
const ICON_WIDTH = 52;
const ICON_HEIGHT = 10;
const OFF_THE_SCREEN_POSITION = {
	top: -9999999,
	left: -9999999,
	name: 'invalid'
};

/**
 * TODO
 */
export default class PoweredBy extends Plugin {
	/**
	 * TODO
	 */
	declare private _poweredByView: View;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'PoweredBy' {
		return 'PoweredBy';
	}

	/**
	 * TODO
	 */
	public init(): void {
		this._poweredByView = this._createPoweredByView();

		this.editor.on( 'ready', this._handleEditorReady.bind( this ) );
	}

	/**
	 * TODO
	 */
	private _handleEditorReady(): void {
		const editor = this.editor;
		const balloon = new BalloonPanelView();

		balloon.content.add( this._poweredByView );
		balloon.withArrow = false;
		balloon.class = 'ck-powered-by-balloon';

		editor.ui.view.body.add( balloon );
		editor.ui.focusTracker.add( this._poweredByView.element! );

		editor.ui.focusTracker.on( 'change:isFocused', ( evt, data, isFocused ) => {
			if ( isFocused ) {
				const attachOptions = getBalloonAttachOptions( editor );

				if ( attachOptions ) {
					balloon.pin( attachOptions );
				}
			} else {
				balloon.unpin();
			}
		} );

		// TODO: on image loaded
		editor.ui.on( 'update', () => {
			if ( editor.ui.focusTracker.isFocused ) {
				const attachOptions = getBalloonAttachOptions( editor );

				if ( attachOptions ) {
					balloon.unpin();
					balloon.pin( attachOptions );
				}
			}
		} );

		// TODO: ~~Support for cases where the watermark gets cropped by parent with overflow: hidden~~.
		// TODO: Debounce.
		// TODO: Probably hide during scroll.
	}

	/**
	 * TODO
	 *
	 * @returns
	 */
	private _createPoweredByView(): View {
		const poweredByView = new View();
		const iconView = new IconView();

		iconView.content = poweredByIcon;
		iconView.isColorInherited = false;

		iconView.extendTemplate( {
			attributes: {
				style: {
					width: ICON_WIDTH + 'px',
					height: ICON_HEIGHT + 'px'
				}
			}
		} );

		poweredByView.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-powered-by' ]
			},
			children: [
				{
					tag: 'a',
					attributes: {
						href: 'https://ckeditor.com',
						target: '_blank',
						tabindex: '-1'
					},
					children: [
						{
							tag: 'span',
							attributes: {
								class: [ 'ck', 'ck-powered-by__label' ]
							},
							children: [ 'Powered by' ]
						},
						iconView
					]
				}
			]
		} );

		return poweredByView;
	}
}

function getBalloonAttachOptions( editor: Editor ): Partial<PositionOptions> | null {
	const focusedDomRoot = getFocusedDOMRoot( editor );

	if ( !focusedDomRoot ) {
		return null;
	}

	const positioningFunction = editor.locale.contentLanguageDirection === 'ltr' ?
		getLowerRightCornerPosition( focusedDomRoot ) :
		getLowerLeftCornerPosition( focusedDomRoot );

	return {
		target: focusedDomRoot,
		// TODO: Make the side configurable.
		positions: [ positioningFunction ]
	};
}

function getLowerRightCornerPosition( focusedDomRoot: HTMLElement ) {
	return getLowerCornerPosition( focusedDomRoot, ( rootRect, balloonRect ) => {
		return rootRect.left + rootRect.width - balloonRect.width - 5;
	} );
}

function getLowerLeftCornerPosition( focusedDomRoot: HTMLElement ) {
	return getLowerCornerPosition( focusedDomRoot, rootRect => {
		return rootRect.left + 5;
	} );
}

function getLowerCornerPosition(
	focusedDomRoot: HTMLElement,
	getBalloonLeft: ( rootRect: Rect, balloonRect: Rect ) => number
) {
	return ( rootRect: Rect, balloonRect: Rect ) => {
		const visibleRootRect = rootRect.getVisible();

		// Root cropped by ancestors.
		if ( !visibleRootRect ) {
			return OFF_THE_SCREEN_POSITION;
		}

		const isRootNarrow = rootRect.width < 250;
		const balloonTop = rootRect.bottom - balloonRect.height / 2;
		const balloonLeft = getBalloonLeft( rootRect, balloonRect );
		const newBalloonRect = balloonRect.clone().moveTo( balloonLeft, balloonTop );

		visibleRootRect.moveBy( 0, balloonRect.height / 2 );

		// The watermark cannot be positioned in this corner because the corner is "not visible enough".
		if ( newBalloonRect.getIntersectionArea( visibleRootRect ) < newBalloonRect.getArea() ) {
			return OFF_THE_SCREEN_POSITION;
		}

		return {
			top: balloonTop,
			left: balloonLeft,
			name: isRootNarrow ? 'narrow' : 'default'
		};
	};
}

function getFocusedDOMRoot( editor: Editor ) {
	for ( const [ , domRoot ] of editor.editing.view.domRoots ) {
		if ( domRoot.ownerDocument.activeElement === domRoot || domRoot.contains( domRoot.ownerDocument.activeElement ) ) {
			return domRoot;
		}
	}

	return null;
}
