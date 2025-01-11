// Share represents a part of the one byte secret (GF(256)) in Shamir's Secret Sharing scheme.
export type Share = [number, number]

// Slice represents a sequence of shares, each derived byte-by-byte from a secret.
export type Slice = Share[]
