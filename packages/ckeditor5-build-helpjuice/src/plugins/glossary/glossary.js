import GlossaryEditing, { _toGlossaryAttribute } from './glossaryediting';
import GlossaryUI from './glossaryui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import './styles.css'

export default class Glossary extends Plugin {
	toGlossaryAttribute( viewElement, data ) {
		return _toGlossaryAttribute( viewElement, data );
	}

	static get requires() {
		return [GlossaryEditing, GlossaryUI];
	}

	static get pluginName() {
		return 'Glossary';
	}
}
