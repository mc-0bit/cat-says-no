import fs from 'fs-extra';
import esbuild from 'esbuild';
import { createEsbuildLicensePlugin } from './util/licenses';
import type { PluginConfig } from '@/lib/plugins/plugin-config';
import crypto from 'node:crypto';
import 'dotenv/config';

await fs.ensureDir('dist');
const BASE_PATH = process.env.PROD ? 'https://github.com/mc-0bit/cat-says-no/blob/master/dist/search-plugin-fuzzy' : 'http://localhost:8080/dist';

const plugins = fs.readdirSync('plugins');

for (const plugin of plugins) {
    const config = (await import(`../plugins/${plugin}/config.ts`)).default as PluginConfig;

    await fs.ensureDir(`dist/${plugin}`);

    await (fs.existsSync(`plugins/${plugin}/icon.png`)
        ? fs.copyFile(`plugins/${plugin}/icon.png`, `dist/${plugin}/icon.png`)
        : fs.copyFile(`src/public/assets/fallback-icon.png`, `dist/${plugin}/icon.png`));

    config.iconUrl = `${BASE_PATH}/${plugin}/icon.png`;
    config.scriptUrl = `${BASE_PATH}/${plugin}/index.js`;
    config.sourceUrl = `${BASE_PATH}/${plugin}/config.json`;

    await esbuild.build({
        entryPoints: [`plugins/${plugin}/index.ts`],
        outfile: `dist/${plugin}/index.js`,
        bundle: true,
        minify: true,
        legalComments: 'eof',
        allowOverwrite: true,
        plugins: [createEsbuildLicensePlugin(`dist/${plugin}/THIRD_PARTY_LICENSES.md`)],
    });

    if (!process.env.PUBLIC_KEY || !process.env.PRIVATE_KEY) {
        throw new Error('PUBLIC_KEY and PRIVATE_KEY environment variables are required');
    }

    const privateKey = atob(process.env.PRIVATE_KEY);
    const publicKey = atob(process.env.PUBLIC_KEY);

    const data = await fs.readFile(`dist/${plugin}/index.js`);
    const sign = crypto.createSign('sha256');
    sign.update(data);
    sign.end();
    const signature = sign.sign(privateKey);

    config.pluginPublicKey = btoa(publicKey);
    config.pluginSignature = signature.toString('base64');

    await fs.writeJSON(`dist/${plugin}/config.json`, config, {
        spaces: 4,
    });
}
