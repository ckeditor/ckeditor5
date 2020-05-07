/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module widget/widgettypearound/mouseoveroutobserver
 */

import DomEventObserver from '@ckeditor/ckeditor5-engine/src/view/observer/domeventobserver';

/**
 * TODO
 *
 * @extends module:engine/view/observer/domeventobserver~DomEventObserver
 */
export default class MouseOverOutObserver extends DomEventObserver {
	/**
	 * @inheritDoc
	 */
	constructor( view ) {
		super( view );

		this.domEventType = [ 'mouseover', 'mouseout' ];
		this.useCapture = true;
	}

	/**
	 * @inheritDoc
	 */
	onDomEvent( domEvent ) {
		this.fire( domEvent.type, domEvent );
	}
}
