import InternalBlockEditing from './Internalblockediting';
import InternalBlockUI from './Internalblockui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import "./styles.css";

export default class InternalBlock extends Plugin {
	static get requires() {
		return [InternalBlockEditing, InternalBlockUI];
	}
}
