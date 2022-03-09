import TabEditing from './tabediting';
import TabUI from './tabui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import "./styles.css";

export default class Tab extends Plugin {
	static get requires() {
		return [TabEditing, TabUI];
	}
}
