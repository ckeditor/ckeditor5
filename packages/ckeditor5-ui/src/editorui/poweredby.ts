/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editorui/poweredby
 */

import type { Editor } from '@ckeditor/ckeditor5-core';
import { DomEmitterMixin, type PositionOptions, Rect, type Locale, findClosestScrollableAncestor } from '@ckeditor/ckeditor5-utils';
import BalloonPanelView from '../panel/balloon/balloonpanelview';
import IconView from '../icon/iconview';
import View from '../view';

import poweredByIcon from '../../theme/icons/project-logo.svg';

const POWERED_BY_VIEW_SYMBOL = Symbol( '_poweredByView' );
const POWERED_BY_BALLOON_SYMBOL = Symbol( '_poweredByBalloon' );
const ICON_WIDTH = 52;
const ICON_HEIGHT = 10;
const NARROW_ROOT_WIDTH_THRESHOLD = 250;
const OFF_THE_SCREEN_POSITION = {
	top: -9999999,
	left: -9999999,
	name: 'invalid'
};

/**
 * A helper that enables the "powered by" feature in the editor and renders a link to the project's
 * webpage next to the bottom of the editing root when the editor is focused.
 *
 * The helper uses a {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView balloon panel}
 * to position the link with the logo.
 *
 * @private
 */
export default class PoweredBy extends DomEmitterMixin() {
	/**
	 * A reference to the view displaying a link with a label and a project logo.
	 */
	private [ POWERED_BY_VIEW_SYMBOL ]: PoweredByView | null;

	/**
	 * A reference to the balloon panel hosting and positioning the "powered by" view.
	 */
	private [ POWERED_BY_BALLOON_SYMBOL ]: BalloonPanelView | null;

	/**
	 * Editor instance the helper was created for.
	 */
	private editor: Editor | null;

	/**
	 * Creates a "powered by" helper for a given editor. The feature is initialized on Editor#ready
	 * event.
	 *
	 * @param editor
	 */
	constructor( editor: Editor ) {
		super();

		this.editor = editor;

		this[ POWERED_BY_VIEW_SYMBOL ] = new PoweredByView( editor.locale );
		this[ POWERED_BY_BALLOON_SYMBOL ] = null;

		editor.on( 'ready', this._handleEditorReady.bind( this ) );
	}

	/**
	 * Destroys the "powered by" helper along with its view.
	 */
	public destroy(): void {
		this[ POWERED_BY_BALLOON_SYMBOL ]!.unpin();

		this[ POWERED_BY_VIEW_SYMBOL ]!.destroy();
		this[ POWERED_BY_BALLOON_SYMBOL ]!.destroy();

		this.stopListening();

		this.editor = this[ POWERED_BY_VIEW_SYMBOL ] = this[ POWERED_BY_BALLOON_SYMBOL ] = null;
	}

	/**
	 * Enables "powered by" label once the editor (ui) is ready.
	 */
	private _handleEditorReady(): void {
		const editor = this.editor!;
		const balloon = this[ POWERED_BY_BALLOON_SYMBOL ] = new BalloonPanelView();

		balloon.content.add( this[ POWERED_BY_VIEW_SYMBOL ]! );
		balloon.withArrow = false;
		balloon.class = 'ck-powered-by-balloon';

		editor.ui.view.body.add( balloon );
		editor.ui.focusTracker.add( balloon.element! );

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

		editor.ui.on( 'update', () => {
			if ( !editor.ui.focusTracker.isFocused ) {
				return;
			}

			const attachOptions = getBalloonAttachOptions( editor );

			if ( attachOptions ) {
				balloon.unpin();
				balloon.pin( attachOptions );
			}
		} );

		// TODO: ~~Support for cases where the watermark gets cropped by parent with overflow: hidden~~.
		// TODO: Debounce.
		// TODO: Probably hide during scroll.
		// TODO: Problem with Rect#isVisible() and floating editors (comments) vs. hiding the view when cropped by parent with overflow.
		// TODO: Update position once an image loaded.
		// TODO: Make the position (side) configurable.
	}
}

/**
 * A view displaying a "powered by" label and project logo wrapped in a link.
 */
class PoweredByView extends View<HTMLDivElement> {
	/**
	 * Created an instance of the "powered by" view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		const iconView = new IconView();

		iconView.set( {
			content: poweredByIcon,
			isColorInherited: false
		} );

		iconView.extendTemplate( {
			attributes: {
				style: {
					width: ICON_WIDTH + 'px',
					height: ICON_HEIGHT + 'px'
				}
			}
		} );

		this.setTemplate( {
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

		const isRootNarrow = rootRect.width < NARROW_ROOT_WIDTH_THRESHOLD;
		const balloonTop = rootRect.bottom - balloonRect.height / 2;
		const balloonLeft = getBalloonLeft( rootRect, balloonRect );
		const firstScrollableRootAncestor = findClosestScrollableAncestor( focusedDomRoot );

		if ( firstScrollableRootAncestor ) {
			const firstScrollableRootAncestorRect = new Rect( firstScrollableRootAncestor );

			// The watermark cannot be positioned in this corner because the corner is "not visible enough".
			if ( visibleRootRect.bottom + balloonRect.height / 2 > firstScrollableRootAncestorRect.bottom ) {
				return OFF_THE_SCREEN_POSITION;
			}
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
