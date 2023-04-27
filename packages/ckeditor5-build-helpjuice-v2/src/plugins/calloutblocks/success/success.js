import SuccessEditing from './successediting';
import SuccessUI from './successui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import "./styles.css";

export default class Info extends Plugin {
	static get requires() {
		return [SuccessEditing, SuccessUI];
	}
}
