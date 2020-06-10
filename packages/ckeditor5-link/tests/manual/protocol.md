## Link protocol

This test checks whether:
- `config.link.defaultProtocol` applies.
- when input value starts with a protocol-like syntax (like `http://` etc.) or any non-word (like `#` or `/`) then `defaultProtocol` won't be applied.
- the plugin dynamically change link protocol to `mailto:` when email address was detected.
