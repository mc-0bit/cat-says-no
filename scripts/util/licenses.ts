// @ts-ignore
import esbuildPluginLicense from 'esbuild-plugin-license';
import rollupPluginLicense from 'rollup-plugin-license';

function licenseTemplate(dependencies: any) {
    return dependencies
        .map((dependency: any) => {
            return `## ${dependency.packageJson.name}:${dependency.packageJson.version} -- ${dependency.packageJson.license}\n\n${dependency.licenseText}`;
        })
        .join('\n');
}

function licenseTemplateRollup(dependencies: any) {
    return dependencies
        .map((dependency: any) => {
            return `## ${dependency.name}:${dependency.version} -- ${dependency.license}\n\n${dependency.licenseText}`;
        })
        .join('\n');
}

export function createEsbuildLicensePlugin(file: string) {
    return esbuildPluginLicense({
        thirdParty: {
            output: {
                file,
                template: licenseTemplate,
            },
        },
    });
}

export function createRollupLicensePlugin(file: string) {
    return rollupPluginLicense({
        thirdParty: {
            output: {
                file: `./.tmp/licenses/${file}.md`,
                template: licenseTemplateRollup,
            },
        },
    });
}
