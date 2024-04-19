/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, CKEditorPlugins, console, window, document */

import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

ClassicEditor
	.create( document.querySelector( '#snippet-table-default-properties' ), {
		extraPlugins: [
			CKEditorPlugins.TableProperties,
			CKEditorPlugins.TableCellProperties
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableProperties: {
				defaultProperties: {
					borderStyle: 'dashed',
					borderColor: 'hsl(90, 75%, 60%)',
					borderWidth: '3px',
					alignment: 'left',
					width: '550px',
					height: '450px'
				}
			},
			tableCellProperties: {
				defaultProperties: {
					horizontalAlignment: 'center',
					verticalAlignment: 'bottom',
					padding: '10px'
				}
			}
		},
		image: {
			toolbar: [
				'imageStyle:block',
				'imageStyle:wrapText',
				'|',
				'imageTextAlternative',
				'|',
				'ckboxImageEdit'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ],
			forceDemoLabel: true
		},
		placeholder: 'Insert the new table with the default styles applied.'
	} )
	.then( editor => {
		window.editorDefaultStyles = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
