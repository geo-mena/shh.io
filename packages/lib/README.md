# shh.io lib

This package contains the core functionalities of [shh.io](https://shh.tofi.pro/), an open-source project that aims to provide a simple and secure way to share e2e encrypted notes.

## Installation

```bash
# with npm
npm install @geomena/lib

# with yarn
yarn add @geomena/lib

# with pnpm
pnpm add @geomena/lib
```

## Usage

```javascript
import { createNote } from '@geomena/lib';

const { noteUrl } = await createNote({
    content: 'Hello, World!',
    password: 'password',
    ttlInSeconds: 3600,
    deleteAfterReading: true,
});

console.log(noteUrl);
```

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](./LICENSE) file for more information.

## Credits and Acknowledgements

This project is crafted with ❤️ by [geomena](https://geomena.com).
