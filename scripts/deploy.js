const hre = require("hardhat");

async function main() {
  const EncryptedPdfCredits = await hre.ethers.getContractFactory("EncryptedPdfCredits");
  const encryptedPdfCredits = await EncryptedPdfCredits.deploy();

  await encryptedPdfCredits.waitForDeployment();

  console.log(
    `EncryptedPdfCredits deployed to ${encryptedPdfCredits.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
