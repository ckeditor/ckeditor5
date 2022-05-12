import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BookIcon from './icons/book-icon.svg';

export default class GlossaryUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add('glossary', locale => {
			const buttonView = new ButtonView(locale);

			buttonView.set({
				label: t('Insert Glossary'),
				icon: BookIcon,
				tooltip: true,
				class: "insert-glossary-btn"
			});

			// Execute the command when the button is clicked (executed).
			this.listenTo(buttonView, 'execute', () => {
				const glossaryModal = document.getElementById("new-glossary-term-modal");
				let glossaryTermExpression = glossaryModal.querySelector("#glossary_term_expression");
				let glossaryTermDefinition = glossaryModal.querySelector("#glossary_term_definition");

				const range = editor.model.document.selection.getFirstRange()
				let selection = "";
				for (const item of range.getItems()) {
					if (item.data) {
						selection += item.data;
					}
				}

				if (selection.length) {
					// WE USE `window.getSelection()` BECAUSE EDITOR SELECTION DOESN'T ACCEPT `getBoundingClientRect`
					const position = window.getSelection().getRangeAt(0).getBoundingClientRect();
					// SET BODY TO FOCUS MODE AND SHOW MODAL ON CORRECT POSITION
					document.body.classList.add("focus-mode");
					glossaryModal.style.display = "block";
					glossaryModal.style.top = position.top + 20 + "px";
					glossaryModal.style.left = position.left - 165 + position.width/2 + "px";
					// SET TERM EXPRESSION
					glossaryTermExpression.value = selection;
					glossaryTermDefinition.value = "";
					// WE NEED TO USE SET TIMEOUT IN ORDER TO FOCUS TEXTAREA
					setTimeout(() => {
						glossaryTermDefinition.focus();
					}, 10);
				} else {
					this.createMessage('comment-message error', 'You must select some text in order to create a comment');
				}
			});

			return buttonView;
		});
	}

	createMessage(classes, text) {
		let message = document.createElement("div");
		message.className = classes;
		message.textContent = text;
		document.getElementById("article-comments").append(message);
		message.style.display = "block";

		setTimeout(() => message.remove(), 3000);
	}
}
