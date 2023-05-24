import EmbeddedIFrameEditing from './embeddediframeediting';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import "./styles.css";

export default class EmbeddedIFrame extends Plugin {
	static get requires() {
		return [EmbeddedIFrameEditing];
	}
}
