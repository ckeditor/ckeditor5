/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import BalloonToolbar from '../../../src/toolbar/balloon/balloontoolbar';
import ContextualBalloon from '../../../src/panel/balloon/contextualballoon';
import View from '../../../src/view';

class CustomStackHighlight {
	static get requires() {
		return [ ContextualBalloon ];
	}

	constructor( editor ) {
		this.editor = editor;

		this._markerToView = new Map();
	}

	init() {
		this.editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: 'highlight',
			view: () => {
				return { classes: 'highlight' };
			}
		} );

		this.editor.model.document.selection.markers.on( 'add', ( evt, item ) => this._add( item ) );
		this.editor.model.document.selection.markers.on( 'remove', ( evt, item ) => this._remove( item ) );
	}

	_add( marker ) {
		const view = new View();

		view.setTemplate( {
			tag: 'p',
			attributes: {
				class: 'custom-view'
			},
			children: [
				{ text: 'View in separate stack.' }
			]
		} );

		this._markerToView.set( marker, view );

		this.editor.plugins.get( ContextualBalloon ).add( {
			view,
			stackId: 'custom',
			position: {
				target: this._getMarkerDomElement( marker )
			}
		} );
	}

	_remove( marker ) {
		this.editor.plugins.get( ContextualBalloon ).remove( this._markerToView.get( marker ) );
		this._markerToView.delete( marker );
	}

	_getMarkerDomElement( marker ) {
		const editing = this.editor.editing;
		const viewElement = Array.from( editing.mapper.markerNameToElements( marker.name ).values() )[ 0 ];

		return editing.view.domConverter.mapViewToDom( viewElement );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, BalloonToolbar, CustomStackHighlight ],
		toolbar: [ 'bold', 'link' ],
		balloonToolbar: [ 'bold', 'link' ]
	} )
	.then( editor => {
		window.editor = editor;

		editor.model.change( writer => {
			const root = editor.model.document.getRoot();

			[
				{ id: 1, start: [ 1, 5 ], end: [ 1, 26 ] },
				{ id: 2, start: [ 5, 5 ], end: [ 5, 26 ] },
				{ id: 3, start: [ 10, 5 ], end: [ 10, 26 ] }
			].forEach( data => {
				writer.addMarker( `highlight:${ data.id }`, {
					range: writer.createRange(
						writer.createPositionFromPath( root, data.start ),
						writer.createPositionFromPath( root, data.end )
					),
					usingOperation: true
				} );
			} );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
