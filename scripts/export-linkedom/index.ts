import esbuild from 'esbuild';
import { createEsbuildLicensePlugin } from '../util/licenses';

esbuild.build({
    entryPoints: ['./scripts/export-linkedom/linkedom.js'],
    outfile: './src/public/linkedom-bundle.js',
    bundle: true,
    minify: false,
    legalComments: 'eof',
    allowOverwrite: true,
    plugins: [createEsbuildLicensePlugin('./src/public/THIRD_PARTY_LICENSES.md')],
});
