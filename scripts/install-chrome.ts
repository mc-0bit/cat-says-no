import { detectBrowserPlatform, resolveBuildId, Browser, install, getInstalledBrowsers } from '@puppeteer/browsers';
import fs from 'fs-extra';
import path from 'pathe';
import 'dotenv/config';

async function addChromePathToEnv(path: string) {
    if (!fs.existsSync('.env')) {
        await fs.writeFile('.env', `CHROME_PATH=${path}`);
    } else if (!process.env.CHROME_PATH) {
        await fs.appendFile('.env', `\nCHROME_PATH=${path}`);
    } else if (process.env.CHROME_PATH !== path) {
        const env = await fs.readFile('.env', 'utf8');
        const newEnv = env.replace('CHROME_PATH=.*', `CHROME_PATH=${path}`);
        await fs.writeFile('.env', newEnv);
    }
}

const installedBrowsers = await getInstalledBrowsers({ cacheDir: '.' });

if (installedBrowsers.length > 0) {
    const installedBrowser = installedBrowsers.sort((a, b) => {
        const aBuildId = a.buildId.split('.');
        const bBuildId = b.buildId.split('.');
        return Number(bBuildId[0]) - Number(aBuildId[0]);
    })[0];

    if (installedBrowser) {
        await addChromePathToEnv(path.normalize(installedBrowser.executablePath));
    }

    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
}

const platform = await detectBrowserPlatform();
if (!platform) {
    throw new Error('Could not detect platform');
}

const buildId = await resolveBuildId(Browser.CHROME, platform!, 'stable');

const installedBrowser = await install({
    browser: Browser.CHROME,
    buildId,
    platform,
    cacheDir: '.',
    unpack: true,
});

await addChromePathToEnv(path.normalize(installedBrowser.executablePath));
