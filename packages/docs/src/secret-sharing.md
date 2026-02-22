---
outline: deep
---

# Shamir's Secret Sharing

shh.io supports **Shamir's Secret Sharing (SSS)**, a cryptographic method that splits a secret into multiple parts called **shares**. A minimum number of shares (the **threshold**) must be combined to reconstruct the secret — any fewer shares reveal absolutely nothing about the original secret.

This feature is entirely **client-side**. The server never sees the encryption key or the shares. The zero-knowledge architecture is fully preserved.

## Why Secret Sharing?

Standard note sharing relies on a single link. If that link is compromised, the note is exposed. Secret sharing adds a layer of **distributed trust**: no single person (or intercepted link) can decrypt the note alone.

Common use cases:

- **Team credentials**: Split access among team members so no individual can act alone.
- **Digital inheritance**: Distribute shares to family members — a threshold can reconstruct access if needed.
- **Multi-party approval**: Require K-of-N stakeholders to agree before sensitive information is revealed.
- **Backup distribution**: Spread shares across different locations or devices to protect against single points of failure.

## How It Works

### Creating a Shared Note

#### 1. Note Creation

Just like a standard note, you enter your content and optionally set a password and expiration options.

#### 2. Key Generation & Encryption

A **base key** is generated, a **master key** is derived (with optional password via **PBKDF2 with SHA-256**), and the note is encrypted with **AES-GCM** — identical to the standard flow described in [How It Works](/how-it-works).

#### 3. Key Splitting

Instead of putting the base key directly in the URL, the base key is split into **N shares** using Shamir's Secret Sharing over the finite field **GF(256)**. You choose:

- **Total shares (N)**: How many unique links to generate (2–10).
- **Threshold (K)**: How many shares are needed to reconstruct the key (2–N).

Each share is a mathematically independent piece. Any K shares can reconstruct the original key, but K−1 shares provide **zero information** about the key — this is an information-theoretic guarantee, not just computational difficulty.

#### 4. Sending to Server

The encrypted note is stored on the server exactly like a standard note. The server has no awareness that SSS is being used — the payload is identical.

#### 5. Link Generation

Instead of one link, **N unique links** are generated. Each link contains:

```
https://shh.tofi.pro/note/{noteId}#sss:{K}:{N}:{shareIndex}:{shareData}[:pw][:dar]
```

- `sss` — identifies this as a secret sharing link.
- `K` — threshold needed to decrypt.
- `N` — total number of shares.
- `shareIndex` — which share this link carries (1–N).
- `shareData` — the share data (base64url-encoded).
- `pw` — present if the note is password-protected.
- `dar` — present if the note is deleted after reading.

The share data is part of the URL hash fragment, so it is **never sent to the server**.

#### 6. Distribution

You share each link with a different person. Each recipient gets exactly one share.

### Decrypting a Shared Note

#### 7. Opening a Share Link

When a recipient opens their share link, the app detects the `sss:` prefix in the hash fragment and enters **secret sharing mode**.

#### 8. Share Collection

The recipient sees their share information (e.g., "You have share 2 of 5") and a progress indicator showing how many shares have been collected versus the threshold.

To collect additional shares, other recipients paste their share URLs into the input field on the page.

#### 9. Key Reconstruction

Once the threshold is reached, the app automatically combines the collected shares using **Lagrange interpolation** over GF(256) to reconstruct the original base key.

#### 10. Password Prompt (If Applicable)

If the note is password-protected, the recipient is prompted for the password after the key is reconstructed — same as the standard flow.

#### 11. Decryption

The master key is derived and the note is decrypted with **AES-GCM**, just like a standard note.

### Delete After Reading with SSS

When a shared note has the **delete after reading** option enabled, the app handles it carefully:

- On first load, the app only **checks that the note exists** on the server — it does not fetch (and consume) the note.
- The destructive fetch is **deferred** until the threshold is reached.
- Before fetching, the recipient sees a warning that the note will be deleted from the server after reading — consistent with the standard delete-after-reading behavior.

This ensures the note is not consumed before enough shares have been collected.

## The Math Behind SSS

Shamir's Secret Sharing is based on the mathematical property that **K points define a unique polynomial of degree K−1**.

1. For each byte of the secret, a random polynomial of degree K−1 is generated where the constant term (the y-intercept) is the secret byte.
2. The polynomial is evaluated at N distinct points (x = 1, 2, ..., N) to produce N shares.
3. To reconstruct, any K shares are used with **Lagrange interpolation** to recover the polynomial and extract the constant term (the secret byte).

All arithmetic is performed in the **Galois Field GF(256)** using the irreducible polynomial `0x11d`, ensuring operations stay within the byte range (0–255) without overflow. Addition is XOR, and multiplication uses precomputed logarithm/exponent lookup tables for efficiency.

> [!INFO]
> This is a well-established cryptographic primitive. The security guarantee is **information-theoretic**: with fewer than K shares, an attacker gains literally zero information about the secret, regardless of their computational power.

## Compatibility

Secret sharing is compatible with all existing note options:

- **Password protection**: The password is required in addition to the threshold shares.
- **Delete after reading**: The note is consumed only after the threshold is met.
- **TTL expiration**: The note expires normally based on the configured time-to-live.
- **File attachments**: Attached files are encrypted and decrypted as part of the note payload.

## Next Steps

- Learn more about the standard encryption process in [How It Works](/how-it-works).
- Try the feature on the [live instance](https://shh.tofi.pro).
- [Self-host](/self-hosting/docker) your own instance for full control.
