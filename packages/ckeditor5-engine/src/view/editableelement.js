/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ContainerElement from './containerelement.js';

import mix from '../../utils/mix.js';
import ObservableMixin from '../../utils/observablemixin.js';

/**
 * Editable element which be a {@link view.engine.RootEditableElement root} or nested editable area in the editor.
 *
 * @memberOf engine.view
 * @extends engine.view.ContainerElement
 * @mixes utils.ObservaleMixin
 */
export default class EditableElement extends ContainerElement {
	/**
	 * Creates an editable element.
	 */
	constructor( name, attrs, children ) {
		super( name, attrs, children );
		/**
		 * Whether the editable is in read-write or read-only mode.
		 *
		 * @observable
		 * @member {Boolean} engine.view.EditableElement#isReadOnly
		 */
		this.set( 'isReadOnly', false );
	}
}

mix( EditableElement, ObservableMixin );
