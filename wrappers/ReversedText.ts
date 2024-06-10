import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type ReversedTextConfig = {};

export function reversedTextConfigToCell(config: ReversedTextConfig): Cell {
    return beginCell().endCell();
}

export class ReversedText implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new ReversedText(address);
    }

    static createFromConfig(config: ReversedTextConfig, code: Cell, workchain = 0) {
        const data = reversedTextConfigToCell(config);
        const init = { code, data };
        return new ReversedText(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendTextToReverse(provider: ContractProvider, via: Sender, value: bigint, text: string) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0, 32).storeStringTail(text).endCell()
        });
    }
}
