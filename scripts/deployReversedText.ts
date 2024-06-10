import { toNano } from '@ton/core';
import { ReversedText } from '../wrappers/ReversedText';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const reversedText = provider.open(ReversedText.createFromConfig({}, await compile('ReversedText')));

    await reversedText.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(reversedText.address);

    // run methods on `reversedText`
}
