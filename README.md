<div align="center">
<h1>DiceSlice</h1>
<p><b>DiceSlice brings secure and simple secret sharing to your browser.<br><br>
Visit <a href="https://diceslice.io">diceslice.io</a></b></p>
</div>

## Contents

- [Introduction](#introduction)
- [How it works](#how-it-works)
- [Project setup](#project-setup)
- [Roadmap](#roadmap)
- [Limitations](#limitations)
- [Alternatives](#alternatives)
- [License](#license)

## Introduction

> **'DiceSlice'**, a fusion of **'Dice'** (symbolizing randomness) and **'Slice'** (a part)

DiceSlice is a web application providing simple and secure secret sharing.
It encrypts your data with a randomly generated key and distributes your data across multiple 'slice files'.
Subsequently, your data can only be decrypted by combining a predetermined number (threshold) of these files.

Confidentiality and integrity of your data are guaranteed utilizing Shamir's Secret Sharing and AES/GCM (see [How it works](#how-it-works)). Importantly, DiceSlice **runs entirely offline in your browser**, ensuring that your data never leaves its confines.

Visit <a href="/">the website</a> to learn more about the use cases.

## How it works

DiceSlice is designed to generate _slice files_, intended for the secure distribution and subsequent reassembly of encrypted content (i.e., your secret).
The generation process uses a randomly generated 256-bit cryptographic encryption key shared across all slice files.

To ensure confidentiality and integrity of the content, AES-256/GCM is used for encryption, backed by the robust Web Crypto API.
DiceSlice implements the Shamir's Secret Sharing (SSS) algorithm within the GF(256) finite field.
This algorithm is used to derive key slices from the encryption key, and vice versa.
Each key slice, unique to its corresponding slice file, comprises a sequence of shares derived byte-by-byte from the encryption key's byte sequence.
Subsequently, SSS is used to reconstruct the encryption key from the key slices in a similar manner, allowing for the decryption of the content.

Below is a streamlined diagram illustrating the process of generating slice files:

![Slice File Creation](./slicefile.svg 'Slice File Generation')
_\*Encryption key size is actually 32 bytes (256 bits)._

## Project setup

The library is written in TypeScript, leveraging Vite for the build setup and Vitest for testing.
It employs web workers (utilizing Comlink) to do the heavy lifting on buffers in background threads.
The user interface of DiceSlice is built using Svelte and Tailwind CSS.

To build DiceSlice:

```bash
npm install
npm run build
```

## Roadmap

The features on this list are being explored in no particular order and may not be implemented.

- Input/view text-encoded slice files
- CLI for secret assembly
- Commitments for integrity validation of slice keys (see [Limitations](#Limitations))
- Asymmetric slice files, by including multiple slice keys per file
- Optional password protection
- User-provided encryption key
- Key slices only, no payload
- Raise file size limit using chunking (see [Limitations](#Limitations))
- Include the secret assembly form as html in slice files

Feel free to contribute to the project by opening an issue or submitting a pull request.

## Limitations

- Slice keys lack verifiable integrity (see [Verifiable secret sharing](https://en.wikipedia.org/wiki/Verifiable_secret_sharing)), in contrast to the secret, which is protected by AES/GCM encryption for authenticated encryption.
- The maximum size for secrets is ~ 2 GB, as SubtleCrypto.encrypt() operates on ArrayBuffer objects, which are loaded into memory as a single block with a browser-dependent size limit.

## Alternatives

- [Horcrux](https://github.com/jesseduffield/horcrux): CLI, no data integrity protection.
- [SSSS](http://point-at-infinity.org/ssss/): CLI, limited to key size of 128 bytes.
- [Haystack](https://github.com/henrysdev/haystack): CLI, with password support, no threshold option.

## License

MIT
