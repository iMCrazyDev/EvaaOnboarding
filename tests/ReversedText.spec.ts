import {
    Blockchain,
    BlockchainTransaction,
    SandboxContract,
    TreasuryContract
} from '@ton/sandbox';
import { Cell, toNano, TransactionComputeVm, TransactionDescriptionGeneric } from '@ton/core';
import { ReversedText } from '../wrappers/ReversedText';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

function reverseString(str: string): string {
    return str.split('').reverse().join('');
}

describe('ReversedText', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('ReversedText');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let reversedText: SandboxContract<ReversedText>;

    let verifyReverse: (tx: BlockchainTransaction, text: string) => void;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        reversedText = blockchain.openContract(ReversedText.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await reversedText.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: reversedText.address,
            deploy: true,
            success: true,
        });

        verifyReverse = (tx: BlockchainTransaction, text: string) => {
            const reversed = reverseString(text);
            const body = tx.inMessage!.body.beginParse();
            body.skip(32);
            expect(reversed).toStrictEqual(body.loadStringTail());
        }
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and reversedText are ready to use
    });

    it('test -> tset', async () => {
        const text = 'test';
        const result = await reversedText.sendTextToReverse(deployer.getSender(), toNano('1'), text);
        verifyReverse(result.transactions[2], text);
        // console.log(((result.transactions[1].description as TransactionDescriptionGeneric).computePhase as TransactionComputeVm).gasUsed);
    });

    it('long text', async () => {
        const text = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';
        const result = await reversedText.sendTextToReverse(deployer.getSender(), toNano('1'), text);
        verifyReverse(result.transactions[2], text);
        // console.log(((result.transactions[1].description as TransactionDescriptionGeneric).computePhase as TransactionComputeVm).gasUsed);
    });

    it('one cell max', async () => {
        const text = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dum';
        const result = await reversedText.sendTextToReverse(deployer.getSender(), toNano('1'), text);
        verifyReverse(result.transactions[2], text);
        // console.log(((result.transactions[1].description as TransactionDescriptionGeneric).computePhase as TransactionComputeVm).gasUsed);
    });

    it('one cell max + 8 bits', async () => {
        const text = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dumm';
        const result = await reversedText.sendTextToReverse(deployer.getSender(), toNano('1'), text);
        verifyReverse(result.transactions[2], text);
        // console.log(((result.transactions[1].description as TransactionDescriptionGeneric).computePhase as TransactionComputeVm).gasUsed);
    });

    it('one cell max + next cell max', async () => {
        const text = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It h';
        const result = await reversedText.sendTextToReverse(deployer.getSender(), toNano('1'), text);
        verifyReverse(result.transactions[2], text);
        // console.log(((result.transactions[1].description as TransactionDescriptionGeneric).computePhase as TransactionComputeVm).gasUsed);
    });
});
