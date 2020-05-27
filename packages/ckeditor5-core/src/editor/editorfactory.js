/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import getDataFromElement from '@ckeditor/ckeditor5-utils/src/dom/getdatafromelement';
import attachToForm from './utils/attachtoform';
import secureSourceElement from './utils/securesourceelement';
import setDataInElement from '@ckeditor/ckeditor5-utils/src/dom/setdatainelement';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import { isElement } from 'lodash-es';

/**
 * A factory/helper for classes implementing the Editor class. It provides two main methods to be used
 * during the editor class implementation:
 *
 *	* `new EditorFactory().create()`: the logic for the creation of an editor.
 *	* `new EditorFactory().destroy()`: the logic for destroying an editor.
 *
 * The above methods call various methods in the EditorFactory class, which allows for customizing every
 * step of the editor creation by inheriting EditorFactory in a custom factory class.
 * See the ClassicEditor class for an example.
 */
export default class EditorFactory {
	create( EditorClass, sourceElementOrData = '', config = {} ) {
		const editor = new EditorClass( sourceElementOrData, config );

		const args = [ editor, sourceElementOrData, config ];

		return Promise.resolve()
			.then( () => this.checkInitialData( ...args ) )
			.then( () => this.initModel( ...args ) )
			.then( () => this.initSourceElement( ...args ) )
			.then( () => this.initPlugins( ...args ) )
			.then( () => this.initUI( ...args ) )
			.then( () => this.initData( ...args ) )
			.then( () => this.fireReady( ...args ) )
			.then( () => editor );
	}

	destroy( editor ) {
		if ( editor.sourceElement ) {
			setDataInElement( editor.sourceElement, editor.getData() );
		}

		editor.ui.destroy();

		return Promise.resolve();
	}

	checkInitialData( editor, sourceElementOrData, config ) {
		if ( !isElement( sourceElementOrData ) && config.initialData ) {
			// Documented in core/editor/editorconfig.jdoc.
			// eslint-disable-next-line ckeditor5-rules/ckeditor-error-message
			throw new CKEditorError( 'editor-create-initial-data', null );
		}
	}

	initModel( editor ) {
		editor.model.document.createRoot();
	}

	initSourceElement( editor, sourceElementOrData ) {
		if ( isElement( sourceElementOrData ) ) {
			editor.sourceElement = sourceElementOrData;

			secureSourceElement( editor );

			if ( editor.updateSourceElement ) {
				attachToForm( editor );
			}
		}
	}

	initPlugins( editor ) {
		return editor.initPlugins();
	}

	initUI( editor ) {
		return editor.ui.init();
	}

	initData( editor, sourceElementOrData, config ) {
		const initialData = config.initialData || getInitialData( sourceElementOrData );

		// If no plugin has defined the data processor, go with the default.
		if ( !editor.data.processor ) {
			editor.data.processor = new HtmlDataProcessor( editor.data.viewDocument );
		}

		return editor.data.init( initialData );
	}

	fireReady( editor ) {
		editor.fire( 'ready' );
	}
}

function getInitialData( sourceElementOrData ) {
	return isElement( sourceElementOrData ) ? getDataFromElement( sourceElementOrData ) : sourceElementOrData;
}
