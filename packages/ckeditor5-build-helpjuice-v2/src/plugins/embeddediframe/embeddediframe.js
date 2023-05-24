import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import EmbeddedIFrameEditing from './embeddediframeediting';
import EmbeddedIFrameToolbar from './embeddediframetoolbar';
import ResizeEmbeddedIFrameUI from './resizeembeddediframeui';
import "./styles.css";

export default class EmbeddedIFrame extends Plugin {
	static get requires() {
		return [EmbeddedIFrameEditing, EmbeddedIFrameToolbar, ResizeEmbeddedIFrameUI];
	}
}
