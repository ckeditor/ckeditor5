import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import PuzzlePiece from './icons/puzzle-piece.svg';
import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

export default class InsertArticleUI extends Plugin {
	static get pluginName() {
        return 'InsertArticle';
    }

    init() {
        const editor = this.editor;
        const t = editor.t;

        editor.ui.componentFactory.add('InsertArticle', locale => {

            const dropdownView = createDropdown(locale);

			// Configure dropdown's button properties:
			dropdownView.buttonView.set( {
				label: t('Insert Article'),
				icon: PuzzlePiece,
				tooltip: true,
				class: "insert-article-btn"
			});

			dropdownView.render();

			// Create Heading for Panel
			const panelContent = document.createElement("div");
			panelContent.setAttribute("data-controller", "editor--insert-article");
			panelContent.innerHTML = `
				<h3>Insert Article</h3>
				<p>Insert article allows you to embed content of existing articles into your article.</p>
				<input type="search" name="search articles to insert" class="search-articles-to-insert" placeholder="Search for an existing article" data-action="input->editor--insert-article#search" data-editor--insert-article-target="input">
				<ul class="articles-list" data-editor--insert-article-target="list">

				</ul>
			`;

			dropdownView.panelView.element.appendChild(panelContent);

			document.body.appendChild(dropdownView.element);

            return dropdownView;
        });
    }
}
