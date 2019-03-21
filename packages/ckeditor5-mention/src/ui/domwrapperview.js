/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/ui/domwrapperview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';

export default class DomWrapperView extends View {
	constructor( locale, domNode ) {
		super( locale );

		this.template = false;
		this.domNode = domNode;

		this.domNode.classList.add( 'ck-button' );

		this.set( 'isOn', false );

		this.on( 'change:isOn', ( evt, name, isOn ) => {
			if ( isOn ) {
				this.domNode.classList.add( 'ck-on' );
				this.domNode.classList.remove( 'ck-off' );
			} else {
				this.domNode.classList.add( 'ck-off' );
				this.domNode.classList.remove( 'ck-on' );
			}
		} );

		this.listenTo( this.domNode, 'click', () => {
			this.fire( 'execute' );
		} );
	}

	render() {
		super.render();

		this.element = this.domNode;
	}
}
