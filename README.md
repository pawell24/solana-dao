# Solana DAO Project

## Overview

This project is built using the **Anchor Framework** for the Solana blockchain, combining Rust for backend smart contracts and Node.js for frontend interaction. Follow the steps below to set up, deploy, and interact with the project.

---

## Prerequisites

Before you begin, ensure the following dependencies are installed on your machine:

### 1. **Solana CLI**

- Install Solana CLI by following the [official installation guide](https://docs.solana.com/cli/install-solana-cli-tools):
  ```bash
  sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
  solana --version
  ```

### 2. **Anchor CLI**

- Install Anchor CLI using Cargo:
  ```bash
  cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
  anchor --version
  ```

### 3. **Node.js & npm**

- Download and install Node.js from the [official website](https://nodejs.org/):
  ```bash
  node -v
  npm -v
  ```

### 4. **Rust**

- Install Rust using Rustup:
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  rustup install stable
  rustup update
  ```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install Dependencies

#### For Rust and Solana programs:

```bash
anchor build
```

#### For Node.js:

```bash
npm install
```

---

## Configuration

### 1. Configure Solana

- Generate a Solana keypair (if not already created):
  ```bash
  solana-keygen new --outfile ~/.config/solana/id.json
  ```
- Set the Solana cluster to `devnet`:
  ```bash
  solana config set --url devnet
  ```

### 2. Obtain Test Solana (SOL) for Deployment

To deploy programs on the **devnet**, you need a small amount of SOL in your test wallet. Request test SOL by using the following command:

```bash
solana airdrop 2
```

- Verify the balance:
  ```bash
  solana balance
  ```

> **Note:** If the faucet is not working, you can use the [Solana Faucet](https://solfaucet.com/) to obtain test SOL for your wallet.

### 3. Deploy the Smart Contract

```bash
anchor deploy
```

### 4. Update Program ID

Replace all occurrences of the old program ID with the new program ID after deployment:

- Update the program ID in:
  - `Anchor.toml`
  - `src/lib.rs` (in your program's source directory)
  - Any frontend files using the program ID.
- Use the following command to automate this:
  ```bash
  grep -rl '<OLD_PROGRAM_ID>' . | xargs sed -i 's/<OLD_PROGRAM_ID>/<NEW_PROGRAM_ID>/g'
  ```

---

## Usage

### 1. Initialize DAO

- Run the migration script:
  ```bash
  node migrations/init.js
  ```
- Update the `migrations/consts.js` file with necessary configurations.
- Use additional scripts (e.g., `mint_tokens.js`) to mint tokens or interact with the DAO.

### 2. Frontend Setup

Navigate to the `frontend-dao` directory:

```bash
cd frontend-dao
```

- Install dependencies:
  ```bash
  yarn
  ```
- Update `utils/consts.ts` with the correct constants (e.g., program ID, wallet address).
- Run the development server:
  ```bash
  yarn dev
  ```
- Access the application at `http://localhost:5173/`.

### 3. Token Interaction

Ensure your wallet is funded with tokens connected to the DAO for full interaction.

---

## Testing

Run automated tests with Anchor:

```bash
anchor test
```

---

## Troubleshooting

- **CLI Tools Missing:** Ensure `solana` and `anchor` commands are in your system's PATH.
- **Failed Transactions:** Restart the local validator:
  ```bash
  solana-test-validator --reset
  ```
- **Rebuild Errors:** Rebuild the Anchor project:
  ```bash
  anchor build
  ```

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License.
