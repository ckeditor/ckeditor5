import { Plugin } from 'ckeditor5/src/core';
import SourceEditingUI from './sourceeditingui';

import '../theme/sourceediting.css';

export default class SourceEditing extends Plugin {
	static get pluginName() {
		return 'SourceEditing';
	}

	static get requires() {
		return [ SourceEditingUI ];
	}

	init() {
		this.editor.plugins.get( 'SourceEditingUI' ).delegate( 'execute' ).to( this );
	}
}
