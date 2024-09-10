/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/editorui/poweredby
 */

import type { Editor, UiConfig } from '@ckeditor/ckeditor5-core';
import {
	DomEmitterMixin,
	Rect,
	verifyLicense,
	type PositionOptions,
	type Locale
} from '@ckeditor/ckeditor5-utils';
import BalloonPanelView from '../panel/balloon/balloonpanelview.js';
import IconView from '../icon/iconview.js';
import View from '../view.js';
import { throttle, type DebouncedFunc } from 'lodash-es';

import poweredByIcon from '../../theme/icons/project-logo.svg';

const ICON_WIDTH = 53;
const ICON_HEIGHT = 10;
// ⚠ Note, whenever changing the threshold, make sure to update the docs/support/managing-ckeditor-logo.md docs
// as this information is also mentioned there ⚠.
const NARROW_ROOT_HEIGHT_THRESHOLD = 50;
const NARROW_ROOT_WIDTH_THRESHOLD = 350;
const DEFAULT_LABEL = 'Powered by';

type PoweredByConfig = Required<UiConfig>[ 'poweredBy' ];

/**
 * A helper that enables the "powered by" feature in the editor and renders a link to the project's
 * webpage next to the bottom of the editable element (editor root, source editing area, etc.) when the editor is focused.
 *
 * @private
 */
export default class PoweredBy extends /* #__PURE__ */ DomEmitterMixin() {
	/**
	 * Editor instance the helper was created for.
	 */
	private readonly editor: Editor;

	/**
	 * A reference to the balloon panel hosting and positioning the "powered by" link and logo.
	 */
	private _balloonView: BalloonPanelView | null;

	/**
	 * A throttled version of the {@link #_showBalloon} method meant for frequent use to avoid performance loss.
	 */
	private _showBalloonThrottled: DebouncedFunc<() => void>;

	/**
	 * A reference to the last editable element (root, source editing area, etc.) focused by the user.
	 * Since the focus can move to other focusable elements in the UI, this reference allows positioning the balloon over the
	 * right element whether the user is typing or using the UI.
	 */
	private _lastFocusedEditableElement: HTMLElement | null;

	/**
	 * Creates a "powered by" helper for a given editor. The feature is initialized on Editor#ready
	 * event.
	 *
	 * @param editor
	 */
	constructor( editor: Editor ) {
		super();

		this.editor = editor;
		this._balloonView = null;
		this._lastFocusedEditableElement = null;
		this._showBalloonThrottled = throttle( this._showBalloon.bind( this ), 50, { leading: true } );

		editor.on( 'ready', this._handleEditorReady.bind( this ) );
	}

	/**
	 * Destroys the "powered by" helper along with its view.
	 */
	public destroy(): void {
		const balloon = this._balloonView;

		if ( balloon ) {
			// Balloon gets destroyed by the body collection.
			// The powered by view gets destroyed by the balloon.
			balloon.unpin();
			this._balloonView = null;
		}

		this._showBalloonThrottled.cancel();
		this.stopListening();
	}

	/**
	 * Enables "powered by" label once the editor (ui) is ready.
	 */
	private _handleEditorReady(): void {
		const editor = this.editor;
		const forceVisible = !!editor.config.get( 'ui.poweredBy.forceVisible' );

		/* istanbul ignore next -- @preserve */
		if ( !forceVisible && verifyLicense( editor.config.get( 'licenseKey' ) ) === 'VALID' ) {
			return;
		}

		// No view means no body collection to append the powered by balloon to.
		if ( !editor.ui.view ) {
			return;
		}

		editor.ui.focusTracker.on( 'change:isFocused', ( evt, data, isFocused ) => {
			this._updateLastFocusedEditableElement();

			if ( isFocused ) {
				this._showBalloon();
			} else {
				this._hideBalloon();
			}
		} );

		editor.ui.focusTracker.on( 'change:focusedElement', ( evt, data, focusedElement ) => {
			this._updateLastFocusedEditableElement();

			if ( focusedElement ) {
				this._showBalloon();
			}
		} );

		editor.ui.on( 'update', () => {
			this._showBalloonThrottled();
		} );
	}

	/**
	 * Creates an instance of the {@link module:ui/panel/balloon/balloonpanelview~BalloonPanelView balloon panel}
	 * with the "powered by" view inside ready for positioning.
	 */
	private _createBalloonView(): void {
		const editor = this.editor;
		const balloon = this._balloonView = new BalloonPanelView();
		const poweredByConfig = getNormalizedConfig( editor );
		const view = new PoweredByView( editor.locale, poweredByConfig.label );

		balloon.content.add( view );
		balloon.set( {
			class: 'ck-powered-by-balloon'
		} );

		editor.ui.view.body.add( balloon );

		this._balloonView = balloon;
	}

	/**
	 * Attempts to display the balloon with the "powered by" view.
	 */
	private _showBalloon(): void {
		if ( !this._lastFocusedEditableElement ) {
			return;
		}

		const attachOptions = getBalloonAttachOptions( this.editor, this._lastFocusedEditableElement );

		if ( attachOptions ) {
			if ( !this._balloonView ) {
				this._createBalloonView();
			}

			this._balloonView!.pin( attachOptions );
		}
	}

	/**
	 * Hides the "powered by" balloon if already visible.
	 */
	private _hideBalloon(): void {
		if ( this._balloonView ) {
			this._balloonView!.unpin();
		}
	}

	/**
	 * Updates the {@link #_lastFocusedEditableElement} based on the state of the global focus tracker.
	 */
	private _updateLastFocusedEditableElement(): void {
		const editor = this.editor;
		const isFocused = editor.ui.focusTracker.isFocused;
		const focusedElement = editor.ui.focusTracker.focusedElement! as HTMLElement;

		if ( !isFocused || !focusedElement ) {
			this._lastFocusedEditableElement = null;

			return;
		}

		const editableEditorElements = Array.from( editor.ui.getEditableElementsNames() ).map( name => {
			return editor.ui.getEditableElement( name );
		} );

		if ( editableEditorElements.includes( focusedElement ) ) {
			this._lastFocusedEditableElement = focusedElement;
		} else {
			// If it's none of the editable element, then the focus is somewhere in the UI. Let's display powered by
			// over the first element then.
			this._lastFocusedEditableElement = editableEditorElements[ 0 ]!;
		}
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
	 * @param label The label text.
	 */
	constructor( locale: Locale, label: string | null ) {
		super( locale );

		const iconView = new IconView();
		const bind = this.bindTemplate;

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
				class: [ 'ck', 'ck-powered-by' ],
				'aria-hidden': true
			},
			children: [
				{
					tag: 'a',
					attributes: {
						href: 'https://ckeditor.com/?utm_source=ckeditor&' +
							'utm_medium=referral&utm_campaign=701Dn000000hVgmIAE_powered_by_ckeditor_logo',
						target: '_blank',
						tabindex: '-1'
					},
					children: [
						...label ? [
							{
								tag: 'span',
								attributes: {
									class: [ 'ck', 'ck-powered-by__label' ]
								},
								children: [ label ]
							}
						] : [],
						iconView
					],
					on: {
						dragstart: bind.to( evt => evt.preventDefault() )
					}
				}
			]
		} );
	}
}

function getBalloonAttachOptions( editor: Editor, focusedEditableElement: HTMLElement ): Partial<PositionOptions> | null {
	const poweredByConfig = getNormalizedConfig( editor )!;
	const positioningFunction = poweredByConfig.side === 'right' ?
		getLowerRightCornerPosition( focusedEditableElement, poweredByConfig ) :
		getLowerLeftCornerPosition( focusedEditableElement, poweredByConfig );

	return {
		target: focusedEditableElement,
		positions: [ positioningFunction ]
	};
}

function getLowerRightCornerPosition( focusedEditableElement: HTMLElement, config: PoweredByConfig ) {
	return getLowerCornerPosition( focusedEditableElement, config, ( rootRect, balloonRect ) => {
		return rootRect.left + rootRect.width - balloonRect.width - config.horizontalOffset;
	} );
}

function getLowerLeftCornerPosition( focusedEditableElement: HTMLElement, config: PoweredByConfig ) {
	return getLowerCornerPosition( focusedEditableElement, config, rootRect => rootRect.left + config.horizontalOffset );
}

function getLowerCornerPosition(
	focusedEditableElement: HTMLElement,
	config: PoweredByConfig,
	getBalloonLeft: ( visibleEditableElementRect: Rect, balloonRect: Rect ) => number
) {
	return ( visibleEditableElementRect: Rect, balloonRect: Rect ) => {
		const editableElementRect = new Rect( focusedEditableElement );

		if ( editableElementRect.width < NARROW_ROOT_WIDTH_THRESHOLD || editableElementRect.height < NARROW_ROOT_HEIGHT_THRESHOLD ) {
			return null;
		}

		let balloonTop;

		if ( config.position === 'inside' ) {
			balloonTop = editableElementRect.bottom - balloonRect.height;
		}
		else {
			balloonTop = editableElementRect.bottom - balloonRect.height / 2;
		}

		balloonTop -= config.verticalOffset;

		const balloonLeft = getBalloonLeft( editableElementRect, balloonRect );

		// Clone the editable element rect and place it where the balloon would be placed.
		// This will allow getVisible() to work from editable element's perspective (rect source).
		// and yield a result as if the balloon was on the same (scrollable) layer as the editable element.
		const newBalloonPositionRect = visibleEditableElementRect
			.clone()
			.moveTo( balloonLeft, balloonTop )
			.getIntersection( balloonRect.clone().moveTo( balloonLeft, balloonTop ) )!;

		const newBalloonPositionVisibleRect = newBalloonPositionRect.getVisible();

		if ( !newBalloonPositionVisibleRect || newBalloonPositionVisibleRect.getArea() < balloonRect.getArea() ) {
			return null;
		}

		return {
			top: balloonTop,
			left: balloonLeft,
			name: `position_${ config.position }-side_${ config.side }`,
			config: {
				withArrow: false
			}
		};
	};
}

function getNormalizedConfig( editor: Editor ): PoweredByConfig {
	const userConfig = editor.config.get( 'ui.poweredBy' );
	const position = userConfig && userConfig.position || 'border';

	return {
		position,
		label: DEFAULT_LABEL,
		verticalOffset: position === 'inside' ? 5 : 0,
		horizontalOffset: 5,

		side: editor.locale.contentLanguageDirection === 'ltr' ? 'right' : 'left',
		...userConfig
	};
}
