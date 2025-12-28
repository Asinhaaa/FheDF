require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepoliaFHEVM: {
      url: "https://eth-sepolia.g.alchemy.com/v2/E7lKhS7HI9u0QNa8HLKFG", // User-provided Sepolia RPC
      // You will need to set your private key in a .env file or as an environment variable
      // accounts: [process.env.PRIVATE_KEY]
    }
  }
};
