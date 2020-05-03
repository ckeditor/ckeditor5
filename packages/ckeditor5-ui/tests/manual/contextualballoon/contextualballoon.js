/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
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
			view: data => {
				const color = data.markerName.split( ':' )[ 2 ];

				return { classes: 'highlight ' + color };
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
			stackId: 'custom-' + marker.name.split( ':' )[ 1 ],
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
		const viewRange = editing.mapper.toViewRange( marker.getRange() );

		return editing.view.domConverter.viewRangeToDom( viewRange );
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, BalloonToolbar, CustomStackHighlight, Mention ],
		toolbar: [ 'bold', 'link' ],
		balloonToolbar: [ 'bold', 'link' ],
		mention: {
			feeds: [
				{
					marker: '@',
					feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ]
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		editor.model.change( writer => {
			const root = editor.model.document.getRoot();

			[
				{ id: 1, start: [ 1, 5 ], end: [ 1, 26 ], color: 'yellow' },
				{ id: 2, start: [ 1, 2 ], end: [ 1, 33 ], color: 'green' },
				{ id: 3, start: [ 5, 20 ], end: [ 5, 35 ], color: 'blue' },
				{ id: 4, start: [ 5, 15 ], end: [ 5, 40 ], color: 'pink' },
				{ id: 5, start: [ 5, 10 ], end: [ 5, 45 ], color: 'yellow' }
			].forEach( data => {
				writer.addMarker( `highlight:${ data.id }:${ data.color }`, {
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
