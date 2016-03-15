/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

export default class EditableController {
	constructor( modelDocument ) {
		this.model = modelDocument;

		this.mapper = new Mapper();
		this.view = new TreeView();

		this.toView = new ModelConversionDispatcher( {
			writer: this.view.writer,
			mapper: this.mapper
		} );

		this.model.on( 'change', ( evt, type, changeInfo ) => {
			this.toView.convertChange( type, changeInfo );
		} );

		toView.on( 'insert:text', insertText() );
		toView.on( 'remove', remove() );
		toView.on( 'move', move() );
	}

	createRoot( element, name ) {
		const viewRoot = this.view.createRoot( element, name );
		const modelRoot = this.model.createRoot( name );

		this.mapper.bindElements( modelRoot, viewRoot );
	}
}
