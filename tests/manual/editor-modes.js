/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, Event, LICENSE_KEY, localStorage */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';
import ExportPdf from '@ckeditor/ckeditor5-export-pdf/src/exportpdf';
import ExportWord from '@ckeditor/ckeditor5-export-word/src/exportword';
import TrackChanges from '@ckeditor/ckeditor5-track-changes/src/trackchanges';
import CommentsOnly from '@ckeditor/ckeditor5-comments/src/commentsonly';
import StandardEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/standardeditingmode';
import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode';
import RevisionHistory from '@ckeditor/ckeditor5-revision-history/src/revisionhistory';
import Table from '@ckeditor/ckeditor5-table/src/table';

const STORAGE_KEY_REVISIONS = 'ls-sample-revision-history-revisions';
const STORAGE_KEY_CONTENT = 'ls-sample-revision-history-content';

document.querySelector( '#clear-revision-history' ).addEventListener( 'click', () => {
	localStorage.removeItem( STORAGE_KEY_REVISIONS );
	localStorage.removeItem( STORAGE_KEY_CONTENT );
	window.location.reload();
} );

// Application data will be available under a global variable `appData`.
const appData = {};

// Users data.
appData.users = [
	{
		id: 'user-1',
		name: 'Joe Doe',
		// Note that the avatar is optional.
		avatar: 'https://randomuser.me/api/portraits/thumb/men/26.jpg'
	},
	{
		id: 'user-2',
		name: 'Ella Harper',
		avatar: 'https://randomuser.me/api/portraits/thumb/women/65.jpg'
	}
];

// The ID of the current user.
appData.userId = 'user-1';

class TrackChangesIntegration {
	constructor( editor ) {
		this.editor = editor;
	}

	init() {
		const usersPlugin = this.editor.plugins.get( 'Users' );
		const trackChangesPlugin = this.editor.plugins.get( 'TrackChanges' );

		// Load the users data.
		for ( const user of appData.users ) {
			usersPlugin.addUser( user );
		}

		// Set the current user.
		usersPlugin.defineMe( 'user-1' );

		// Set the adapter to the `TrackChanges#adapter` property.
		trackChangesPlugin.adapter = {
			getSuggestion: suggestionId => {
				return new Promise( resolve => {
					switch ( suggestionId ) {
						case 'suggestion-1':
							resolve( {
								id: 'suggestion-1', type: 'insertion', authorId: 'user-2', createdAt: new Date( 2019, 1, 13, 11, 20, 48 )
							} );

							break;
						case 'suggestion-2':
							resolve( {
								id: 'suggestion-2', type: 'deletion', authorId: 'user-2', createdAt: new Date( 2019, 1, 14, 12, 7, 20 )
							} );

							break;
						case 'suggestion-3':
							resolve( {
								id: 'suggestion-3', type: 'insertion', authorId: 'user-2', createdAt: new Date( 2019, 1, 14, 12, 7, 20 )
							} );

							break;
						case 'suggestion-4':
							resolve( {
								id: 'suggestion-4', type: 'deletion', authorId: 'user-2', createdAt: new Date( 2019, 1, 19, 20, 2, 55 )
							} );

							break;
						case 'suggestion-5':
							resolve( {
								id: 'suggestion-5', type: 'insertion', authorId: 'user-2', createdAt: new Date( 2019, 2, 9, 14, 12, 36 )
							} );

							break;
						case 'suggestion-6':
							resolve( {
								id: 'suggestion-6', type: 'deletion', authorId: 'user-2', createdAt: new Date( 2019, 2, 10, 13, 0, 18 )
							} );

							break;
						case 'suggestion-7':
							resolve( {
								id: 'suggestion-7',
								type: 'formatInline:886cqig6g8rf',
								authorId: 'user-2',
								createdAt: new Date( 2019, 2, 10, 13, 0, 18 ),
								data: {
									commandName: 'bold',
									commandParams: [ {
										forceValue: true
									} ]
								}
							} );

							break;
						case 'suggestion-8':
							resolve( {
								id: 'suggestion-8',
								type: 'formatBlock:698dn3bun9mf',
								authorId: 'user-2',
								createdAt: new Date( 2019, 3, 10, 11, 2, 33 ),
								data: {
									commandName: 'heading',
									commandParams: [ {
										value: 'heading1'
									} ],
									multipleBlocks: false,
									formatGroupId: 'blockName'
								}
							} );

							break;
						case 'suggestion-9':
							resolve( {
								id: 'suggestion-9',
								type: 'formatBlock:kzv0vqgac200',
								authorId: 'user-2',
								createdAt: new Date( 2019, 5, 22, 7, 1, 2 ),
								data: {
									commandName: 'blockQuote',
									commandParams: [ {
										forceValue: true
									} ],
									multipleBlocks: true,
									formatGroupId: 'blockQuote'
								}
							} );

							break;

						case 'suggestion-10':
							resolve( {
								id: 'suggestion-10', type: 'insertion', authorId: 'user-2', createdAt: new Date( 2019, 1, 13, 11, 20, 48 )
							} );

							break;
						case 'suggestion-11':
							resolve( {
								id: 'suggestion-11', type: 'deletion', authorId: 'user-2', createdAt: new Date( 2019, 1, 14, 12, 7, 20 )
							} );

							break;
					}
				} );
			},

			addSuggestion: suggestionData => {
				suggestionData.createdAt = new Date();	// Should be set by the server.
				suggestionData.authorId = 'user-1';		// Should be set by the server.

				return Promise.resolve( suggestionData );
			}
		};

		// Dummy adapter to prevent from throwing.
		this.editor.plugins.get( 'CommentsRepository' ).adapter = {
			getCommentThread: () => Promise.resolve()
		};
	}
}

class RevisionsAdapter extends Plugin {
	static get requires() {
		return [ 'RevisionHistory' ];
	}

	init() {
		const editor = this.editor;
		const revisionHistory = editor.plugins.get( 'RevisionHistory' );
		const revisionsDataString = localStorage.getItem( STORAGE_KEY_REVISIONS );
		const revisionsData = JSON.parse( revisionsDataString ) || [];

		revisionHistory.adapter = {
			getRevisions: () => {
				const revisionsNoData = revisionsData.map( revisionData => {
					const filtered = { ...revisionData };

					delete filtered.data;
					// delete filtered.metaData;

					return filtered;
				} );

				console.log( 'adapter#getRevisions' );
				console.log( revisionsNoData );

				return Promise.resolve( revisionsNoData );
			},
			getRevision: ( { revisionId } ) => {
				const revisionData = revisionsData.find( data => data.id == revisionId );

				console.log( 'adapter#getRevision' );
				console.log( revisionData );

				return Promise.resolve( revisionData );
			},
			updateRevision: revisionData => {
				console.log( 'adapter#updateRevision' );
				console.log( revisionData );

				const revision = revisionsData.find( data => data.id == revisionData.id );

				for ( const i in revisionData ) {
					revision[ i ] = revisionData[ i ];
				}

				localStorage.setItem( STORAGE_KEY_REVISIONS, JSON.stringify( revisionsData ) );

				if ( revisionData.data ) {
					localStorage.setItem( STORAGE_KEY_CONTENT, editor.getData() );
				}

				return Promise.resolve();
			},
			addRevision: revisionData => {
				console.log( 'adapter#addRevision' );
				console.log( revisionData );

				revisionsData.push( revisionData );

				localStorage.setItem( STORAGE_KEY_REVISIONS, JSON.stringify( revisionsData ) );
				localStorage.setItem( STORAGE_KEY_CONTENT, editor.getData() );

				return Promise.resolve();
			}
		};
	}
}

function createEditor() {
	const state = {
		modes: {
			readOnly: false,
			commentsOnly: false,
			trackChanges: false,
			restrictedEditing: false
		}
	};

	reloadEditor( state.modes );

	document.querySelectorAll( '[name=readonly]' ).forEach( element => element.addEventListener( 'change', e => {
		state.modes.readOnly = e.target.id !== 'read-only-no';
		document.dispatchEvent( new Event( 'editorModeUpdated' ) );
	} ) );

	document.querySelectorAll( '[name=commentsonly]' ).forEach( element => element.addEventListener( 'change', e => {
		state.modes.commentsOnly = e.target.id !== 'comments-only-no';
		document.dispatchEvent( new Event( 'editorModeUpdated' ) );
	} ) );

	document.querySelectorAll( '[name=trackchanges]' ).forEach( element => element.addEventListener( 'change', e => {
		state.modes.trackChanges = e.target.id !== 'track-changes-no';
		document.dispatchEvent( new Event( 'editorModeUpdated' ) );
	} ) );

	document.querySelectorAll( '[name=restrictedediting]' ).forEach( element => element.addEventListener( 'change', e => {
		state.modes.restrictedEditing = e.target.id !== 'restricted-editing-no';
		document.dispatchEvent( new Event( 'editorModeUpdated' ) );
	} ) );

	document.addEventListener( 'editorModeUpdated', () => {
		reloadEditor( state.modes );
		updateTrackChangesInfo( state );
	} );
}

function reloadEditor( modes ) {
	let initialData = null;

	if ( window.editor ) {
		initialData = window.editor.getData();
		window.editor.destroy();
	}

	const plugins = [
		ArticlePluginSet, FindAndReplace, CloudServices, ImageUpload, ExportPdf, ExportWord, TrackChanges, TrackChangesIntegration,
		CommentsOnly, RevisionHistory, RevisionsAdapter, Table
	];

	const toolbar = [
		'heading',
		'|',
		'trackChanges',
		'|',
		'comment',
		'|',
		'revisionHistory',
		'|',
		'bold', 'italic',
		'|',
		'insertTable',
		'|',
		'undo', 'redo', 'findAndReplace',
		'|',
		'exportPdf', 'exportWord'
	];

	if ( modes.restrictedEditing ) {
		plugins.push( RestrictedEditingMode );
		toolbar.push( 'restrictedEditing' );
	} else {
		plugins.push( StandardEditingMode );
		toolbar.push( 'restrictedEditingException' );
	}

	const config = {
		plugins,
		toolbar,
		image: {
			toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		},
		placeholder: 'Type the content here!',
		commentsOnly: modes.commentsOnly,
		sidebar: {
			container: document.querySelector( '#sidebar-container' )
		},
		revisionHistory: {
			editorContainer: document.querySelector( '#editor-container' ),
			viewerContainer: document.querySelector( '#revision-viewer-container' ),
			viewerEditorElement: document.querySelector( '#revision-viewer-editor' ),
			viewerSidebarContainer: document.querySelector( '#revision-viewer-sidebar' )
		},
		cloudServices: CS_CONFIG,
		licenseKey: LICENSE_KEY,
		collaboration: {
			channelId: 'channelId'
		}
	};

	if ( initialData ) {
		config.initialData = initialData;
	}

	ClassicEditor
		.create( document.querySelector( '#editor' ), config )
		.then( editor => {
			window.editor = editor;

			document.getElementById( 'clear-content' ).addEventListener( 'click', () => {
				editor.setData( '' );
			} );

			editor.isReadOnly = modes.readOnly;

			if ( modes.trackChanges ) {
				editor.commands.get( 'trackChanges' ).execute();
			}
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

function updateTrackChangesInfo( state ) {
	const trackChangesInfo = document.querySelector( '.track-changes-info' );
	const affectingContentList = trackChangesInfo.querySelector( '.affects-content-true' );
	const nonAffectingContentList = trackChangesInfo.querySelector( '.affects-content-false' );

	if ( state.modes.trackChanges ) {
		trackChangesInfo.classList.remove( 'hidden' );
	} else {
		trackChangesInfo.classList.add( 'hidden' );
	}

	const insertElement = ( name, affectsContent ) => {
		const listItem = document.createElement( 'li' );
		listItem.appendChild( document.createTextNode( name ) );

		if ( affectsContent ) {
			affectingContentList.appendChild( listItem );
		} else {
			nonAffectingContentList.appendChild( listItem );
		}
	};

	const tcCommand = window.editor.commands.get( 'trackChanges' );

	for ( const commandName of window.editor.commands.names() ) {
		const command = window.editor.commands.get( commandName );

		if ( !command.affectsContent && !tcCommand._enabledCommands.has( command ) ) {
			insertElement( commandName, command.affectsContent );
		}

		if ( !command.affectsContent || tcCommand._enabledCommands.has( command ) ) {
			continue;
		}

		insertElement( commandName, command.affectsContent );
	}
}

createEditor();
