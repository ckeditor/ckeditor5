import InternalBlockEditing from './internalblockediting';
import InternalBlockUI from './internalblockui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import "./styles.css";

export default class InternalBlock extends Plugin {
	static get requires() {
		return [InternalBlockEditing, InternalBlockUI];
	}
}
