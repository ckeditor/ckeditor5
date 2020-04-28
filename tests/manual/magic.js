/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, IntersectionObserver */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import TreeWalker from '@ckeditor/ckeditor5-engine/src/view/treewalker';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import indexOf from '@ckeditor/ckeditor5-utils/src/dom/indexof';

class AccessTools extends Plugin {
	init() {
		this._initMagicBlock();
	}

	_getViewElements() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const viewRoot = editingView.document.getRoot();

		const walker = new TreeWalker( {
			startPosition: editingView.createPositionAt( viewRoot, 0 ),
			ignoreElementEnd: true
		} );

		return [ ...walker ]
			.map( walkerValue => {
				const item = walkerValue.item;

				if ( !item.is( 'element' ) ) {
					return;
				}

				return item;
			} )
			.filter( element => element );
	}

	_initMagicBlock() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const intersectionObserver = new IntersectionObserver( onIntersectionChange );

		function onIntersectionChange( entries ) {
			entries.forEach( entry => {
				if ( entry.intersectionRatio > 0 ) {
					// entry.target.style = 'outline: 1px solid red';
				} else {
					// entry.target.style = 'outline: none';
				}
			} );
		}

		editingView.document.registerPostFixer( writer => {
			let elements = this._getViewElements();

			for ( const element of elements ) {
				if ( element.is( 'uiElement' ) && element.hasClass( 'magic-block' ) ) {
					if ( !isMagicBlockStillNeeded( element ) ) {
						writer.remove( element );

						continue;
					}
				}
			}

			elements = this._getViewElements();

			for ( const element of elements ) {
				if ( !element.is( 'containerElement' ) ) {
					continue;
				}

				if ( !element.previousSibling && isWidget( element ) ) {
					insertMagicBlockAt( writer, writer.createPositionBefore( element ) );
				}

				if ( isWidget( element ) && ( !element.nextSibling || isWidget( element.nextSibling ) ) ) {
					insertMagicBlockAt( writer, writer.createPositionAfter( element ) );
				}
			}
		} );

		editingView.on( 'render', () => {
			intersectionObserver.disconnect();

			this._getViewElements()
				.forEach( element => {
					intersectionObserver.observe( editingView.domConverter.mapViewToDom( element ) );
				} );
		} );

		editor.ui.on( 'ready', () => {
			const domRoot = editingView.getDomRoot();

			domRoot.addEventListener( 'mousedown', evt => {
				if ( evt.target.classList.contains( 'magic-block' ) ) {
					const viewPosition = editingView.domConverter.domPositionToView( evt.target.parentNode, indexOf( evt.target ) );
					const modelPosition = editor.editing.mapper.toModelPosition( viewPosition );

					editor.model.change( writer => {
						const paragraph = writer.createElement( 'paragraph' );

						writer.insert( paragraph, modelPosition );
						writer.setSelection( paragraph, 0 );
					} );

					editingView.scrollToTheSelection();
				}
			} );
		} );

		function insertMagicBlockAt( writer, position ) {
			const magicBlock = writer.createUIElement( 'p', { class: 'magic-block' }, function( domDocument ) {
				const domElement = this.toDomElement( domDocument );

				domElement.textContent = '\u00a0';

				return domElement;
			} );

			writer.insert( position, magicBlock );
		}

		function isMagicBlockStillNeeded( magicBlock ) {
			if ( !magicBlock.previousSibling && isWidget( magicBlock.nextSibling ) ) {
				return true;
			}

			if ( !magicBlock.nextSibling && isWidget( magicBlock.previousSibling ) ) {
				return true;
			}

			if ( isWidget( magicBlock.previousSibling ) && isWidget( magicBlock.nextSibling ) ) {
				return true;
			}

			return false;
		}

		function isWidget( node ) {
			if ( !node.is( 'element' ) ) {
				return false;
			}

			return !!node.getCustomProperty( 'widget' );
		}
	}
}

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, AccessTools ],
		toolbar: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'outdent',
			'indent',
			'|',
			'blockQuote',
			'insertTable',
			'mediaEmbed',
			'undo',
			'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

