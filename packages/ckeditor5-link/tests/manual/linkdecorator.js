/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { LinkImage } from '../../src/linkimage.js';

// Just to have nicely styled switchbutton;
import '@ckeditor/ckeditor5-ui/theme/preload/ckeditor5-ui/components/list/list.css';

window.editors = {};

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, LinkImage ],
		toolbar: [ 'link', 'undo', 'redo' ],
		link: {
			decorators: {
				isExternal: {
					mode: 'manual',
					label: 'Open in a new tab',
					attributes: {
						target: '_blank',
						rel: 'noopener noreferrer'
					},
					defaultValue: true
				},
				isDownloadable: {
					mode: 'manual',
					label: 'Downloadable',
					attributes: {
						download: 'download'
					}
				},
				isGallery: {
					mode: 'manual',
					label: 'Gallery link',
					classes: 'gallery'
				},
				isNofollow: {
					mode: 'manual',
					label: 'No Follow',
					attributes: {
						rel: 'nofollow'
					}
				},
				isSponsored: {
					mode: 'manual',
					label: 'Sponsored',
					attributes: {
						rel: 'sponsored'
					}
				}
			}
		},
		image: {
			toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative', '|', 'linkImage' ]
		}
	} )
	.then( editor => {
		CKEditorInspector.attach( { manual: editor } );
		window.editors.manualDecorators = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor2' ), {
		plugins: [ ArticlePluginSet, LinkImage ],
		toolbar: [ 'link', 'undo', 'redo' ],
		link: {
			decorators: {
				isTelephone: {
					mode: 'automatic',
					callback: url => url.startsWith( 'tel:' ),
					attributes: {
						class: 'phone'
					}
				},
				isInternal: {
					mode: 'automatic',
					callback: url => url.startsWith( '#' ),
					attributes: {
						class: 'internal'
					}
				}
			},
			addTargetToExternalLinks: true
		},
		image: {
			toolbar: [ 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative', '|', 'linkImage' ]
		}
	} )
	.then( editor => {
		CKEditorInspector.attach( { automatic: editor } );
		window.editors.automaticDecorators = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
