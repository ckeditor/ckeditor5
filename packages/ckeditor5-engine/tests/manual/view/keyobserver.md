* Expected initialization: `foo{}bar`.
* Press some keys - nothing should be added to editor's contents.
* When press some key - event `keydown` should be logged. When the key is released - event `keyup` should be logged.
* You can hold the key in order to check whether `keydown` event is fired multiple times. After releasing the key, `keyup` event should be fired once.
* Check whether key events are logged to the console with proper data:
  * `keyCode`,
  * `altKey`,
  * `ctrlKey` (covers <kbd>Ctrl</kbd> and <kbd>Cmd</kbd>),
  * `shitKey`,
  * `domTarget` and `target`.
