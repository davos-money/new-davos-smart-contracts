const hre = require("hardhat");
const {ethers, upgrades} = require("hardhat");

async function main() {

    // Variables Declaration
    let [deployer] = await ethers.getSigners();
    let ceaMATICc, 
        ceVault, 
        aMATICb, 
        aMATICc, 
        dMatic, 
        cerosRouter;
    // External Addresses
    let _aMATICc = "0xaC32206a73C8406D74eB21cF7bd060bf841e64aD", 
        _wMatic = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
        _dex = "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        _dexPairFee = "3000";
        _swapPool = "0xFCC0937847030e91567c78a147e6e36F719Dc46b",
        _priceGetter = "0x081CCd6331b816584F42cBAa09c556798F41fef7";

    // Contracts Fetching
    this.CeaMATICc = await hre.ethers.getContractFactory("CeToken");
    this.CeVault = await hre.ethers.getContractFactory("CeVault");
    this.AMATICb = await hre.ethers.getContractFactory("aMATICb");
    this.AMATICc = await hre.ethers.getContractFactory("aMATICc");
    this.DMatic = await hre.ethers.getContractFactory("dMATIC");
    this.CerosRouter = await hre.ethers.getContractFactory("CerosRouter");

    // Contracts deployment and initialization
    ceaMATICc = await upgrades.deployProxy(this.CeaMATICc, ["CEROS aMATICc Vault Token", "ceaMATICc"], {initializer: "initialize"});
    await ceaMATICc.deployed();
    let ceaMATICcImplementation = await upgrades.erc1967.getImplementationAddress(ceaMATICc.address);
    console.log("ceaMATICc  : " + ceaMATICc.address);
    console.log("imp        : " + ceaMATICcImplementation);

    // aMATICb = await upgrades.deployProxy(this.AMATICb, [deployer.address], {initializer: "initialize"});
    // await aMATICb.deployed();
    // let aMATICbImplementation = await upgrades.erc1967.getImplementationAddress(aMATICb.address);
    // console.log("aMATICb    : " + aMATICb.address);
    // console.log("imp        : " + aMATICbImplementation);

    // aMATICc = await upgrades.deployProxy(this.AMATICc, [aMATICb.address, aMATICb.address], {initializer: "initialize"});
    // await aMATICc.deployed();
    // let aMATICcImplementation = await upgrades.erc1967.getImplementationAddress(aMATICc.address);
    // console.log("aMATICc    : " + aMATICc.address); // 0xaC32206a73C8406D74eB21cF7bd060bf841e64aD testnet-version-original
    // console.log("imp        : " + aMATICcImplementation);

    ceVault = await upgrades.deployProxy(this.CeVault, ["CEROS aMATICc Vault", ceaMATICc.address, _aMATICc], {initializer: "initialize"});
    await ceVault.deployed();
    let ceVaultImplementation = await upgrades.erc1967.getImplementationAddress(ceVault.address);
    console.log("ceVault    : " + ceVault.address);
    console.log("imp        : " + ceVaultImplementation);

    dMatic = await upgrades.deployProxy(this.DMatic, [], {initializer: "initialize"});
    await dMatic.deployed();
    let dMaticImplementation = await upgrades.erc1967.getImplementationAddress(dMatic.address);
    console.log("dMatic     : " + dMatic.address);
    console.log("imp        : " + dMaticImplementation);

    cerosRouter = await upgrades.deployProxy(this.CerosRouter, [_aMATICc, _wMatic, ceaMATICc.address, ceVault.address, _dex, _dexPairFee, _swapPool, _priceGetter], {initializer: "initialize"}, {gasLimit: 2000000});
    await cerosRouter.deployed();
    let cerosRouterImplementation = await upgrades.erc1967.getImplementationAddress(cerosRouter.address);
    console.log("cerosRouter: " + cerosRouter.address);
    console.log("imp        : " + cerosRouterImplementation);

    await ceaMATICc.changeVault(ceVault.address);
    await ceVault.changeRouter(cerosRouter.address);
    
    console.log("Verifying Ceros...");

    // Verify implementations
    await hre.run("verify:verify", {
        address: ceaMATICcImplementation,
    });
    // await hre.run("verify:verify", {
    //     address: aMATICbImplementation,
    // });
    await hre.run("verify:verify", {
        address: aMATICcImplementation,
    });
    await hre.run("verify:verify", {
        address: ceVaultImplementation,
    });
    await hre.run("verify:verify", {
        address: cerosRouterImplementation,
    });

    // Verify proxies
    await hre.run("verify:verify", {
        address: ceaMATICc.address,
        constructorArguments: [
            "CEROS aMATICc Vault Token", "ceaMATICc"
        ],
    });
    await hre.run("verify:verify", {
        address: aMATICb.address,
        constructorArguments: [
           deployer.address
        ],
    });
    await hre.run("verify:verify", {
        address: aMATICc.address,
        constructorArguments: [
            aMATICb.address, aMATICb.address
        ],
    });
    await hre.run("verify:verify", {
        address: ceVault.address,
        constructorArguments: [
            "CEROS Vault", ceaMATICc.address, aMATICc.address
        ],
    });
    await hre.run("verify:verify", {
        address: cerosRouter.address,
        constructorArguments: [
            _aMATICc, _wMatic, ceaMATICc.address, ceVault.address, _dex, _dexPairFee, _swapPool, _priceGetter
        ],
    });
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
