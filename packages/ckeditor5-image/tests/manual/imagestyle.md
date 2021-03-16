## ImageStyle feature

### The editor with inline images

#### Image toolbar

* Toolbar for each of the two images should contain two split buttons ("Wrap text", "Break text") and one regular button ("In line").
* On the first image the "Break text" button should be highlighted.
	- After opening the drop-down the nested button "Centered image" should be highlighted.
* On the second image the "In line" button should be highlighted.
	- After opening the drop-down the nested button "Left aligned image" should be highlighted.
* The highlighted "Break text" button on teh first image should look and behave like the drop-down:
	- it should have uniform background with the arrow on hover,
	- it should have uniform background with the arrow if it"s open,
	- it should open on click on the icon or the arrow,
	- it should close on click on the icon or the arrow,
* The not highlighted "Wrap text" button on the first image should look and behave like the split button:
	- the arrow and the icon should be separated visually on hover
	- it should have uniform background with the arrow if it"s open,
	- clicking the icon should change the image styling and should not open the drop-down
	- clicking the arrow should open the drop-down without affecting the image styling

#### Image styling

* The first image
	- Clicking on the nested buttons of the "Break text" drop-down:
		* Should display the image between the paragraphs aligned to the left/center/right.
		* Image shouldn"t have any margins.
		* If the image fills the full width of the editor window, clicking the buttons should have no effect.
	- Clicking on the nested buttons of the "Wrap text" drop-down:
		* Should make the "Wrap text" button highlighted.
		* The image should have the top, bottom and side margins and should be aligned to the left/right.
		* The text should be wrapped around the image if there is enough space for that.
		* If the button was clicked after one of the "Break text" options, the `img` should be wrapped with the `figure` HTML element.
		* If the button was clicked after the "In line" option, the `img` should be wrapped with the `span` HTML element.
	- Clicking on the "In line" button:
		* The image should have no margins.
		* The text should not be wrapped around the image (it is displayed in the empty paragraph)
	- Pasting the image into the paragraph:
		* Click the "In line" button and copy the image.
		* Paste the image inside of the text.
		* It should be aligned to the baseline of the text and displayed in the middle of the text line if there is enough space for that.

* The second image
	- Clicking on the nested buttons of the "Wrap text" drop-down:
		* Should make the "Wrap text" button highlighted.
		* The image should have the top, bottom and side margins and should be aligned to the left/right.
		* The text should be wrapped around the image if there is enough space for that.
		* If the button was clicked after one of the "Break text" options, the `img` should be wrapped with the `figure` HTML element.
		* If the button was clicked after the "In line" option, the `img` should be wrapped with the `span` HTML element.
	- Clicking on the "In line" button:
		* The image should have no margins and should be displayed in the text line.
	- Clicking on the nested buttons of the "Break text" drop-down:
		* Should display the image between the paragraphs aligned to the left/center/right.
		* Image shouldn"t have any margins.

### The "semantic–oriented" editor

* Click on image - toolbar with icons should appear. "Full size image" icon should be selected.
* Click on "Side image" icon. Image should be aligned to right.
* Click on "Full size image" icon. Image should be back to its original state.
* Resize the browser window so the scrollbar is visible. Click on image and scroll editor contents - check if toolbar is placed in proper position.

### The "formatting–oriented" editor

* Click on image - toolbar with icons should appear. "Centered image" icon should be selected.
* Check if other icons icons change the alignment of the image.
