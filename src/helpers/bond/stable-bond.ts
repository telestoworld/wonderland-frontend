import { ContractInterface } from "ethers";
import { Bond, BondOpts } from "./bond";
import { BondType } from "./constants";
import { Networks } from "../../constants/blockchain";
import { StaticJsonRpcProvider } from "@ethersproject/providers";
import { getAddresses } from "../../constants/addresses";

export interface StableBondOpts extends BondOpts {
    readonly reserveContractAbi: ContractInterface;
}

export class StableBond extends Bond {
    readonly isLP = false;
    readonly reserveContractAbi: ContractInterface;
    readonly displayUnits: string;

    constructor(stableBondOpts: StableBondOpts) {
        super(BondType.StableAsset, stableBondOpts);

        // For stable bonds the display units are the same as the actual token
        this.displayUnits = stableBondOpts.displayName;
        this.reserveContractAbi = stableBondOpts.reserveContractAbi;
    }

    public async getTreasuryBalance(networkID: Networks, provider: StaticJsonRpcProvider) {
        console.log("treasyru balance")
        const addresses = getAddresses(networkID);
        const token = this.getContractForReserve(networkID, provider);
        const tokenAmount = await token.balanceOf(addresses.TREASURY_ADDRESS);
        console.log(token,tokenAmount,addresses);
        return tokenAmount / Math.pow(10, 18);
    }

    public async getTokenAmount(networkID: Networks, provider: StaticJsonRpcProvider) {
        return this.getTreasuryBalance(networkID, provider);
    }

    public getTelestoAmount(networkID: Networks, provider: StaticJsonRpcProvider) {
        return new Promise<number>(reserve => reserve(0));
    }
}

// These are special bonds that have different valuation methods
export interface CustomBondOpts extends StableBondOpts {}

export class CustomBond extends StableBond {
    constructor(customBondOpts: CustomBondOpts) {
        super(customBondOpts);

        this.getTreasuryBalance = async (networkID: Networks, provider: StaticJsonRpcProvider) => {
            const tokenAmount = await super.getTreasuryBalance(networkID, provider);
            const tokenPrice = this.getTokenPrice();

            return tokenAmount * tokenPrice;
        };
    }
}
