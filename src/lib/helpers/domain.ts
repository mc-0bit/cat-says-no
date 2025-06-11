import psl from 'psl';
import { get } from 'svelte/store';

// TODO: refactor to not be braindead :P
export const getDomainName = (url: string) => {
    if (url.includes('/')) {
        const urlObject = new URL(url);
        const parsed = psl.parse(urlObject.hostname);
        if (parsed.error) {
            console.error(parsed.error.message);
            return;
        }
        return parsed.domain ?? undefined;
    }

    if (!psl.isValid(url)) return;
    const parsed = psl.parse(url);
    if (parsed.error) {
        console.error(parsed.error.message);
        return;
    }
    return parsed.domain ?? undefined;
};

export const isDomainExcluded = async (domain: string) => {
    const { excludedDomains } = get(settingStore);
    return excludedDomains.includes(domain);
};

export const excludeDomain = async (url: string) => {
    const domain = getDomainName(url);
    if (!domain) return false;

    if (await isDomainExcluded(domain)) return false;

    const settings = get(settingStore);
    settings.excludedDomains.push(domain);
    settingStore.set(settings);
    return true;
};

export const removeDomainExclusion = async (url: string) => {
    const domain = getDomainName(url);
    if (!domain) return false;

    const settings = get(settingStore);
    const newExcludedDomains = settings.excludedDomains.filter((excludedDomain) => excludedDomain !== domain);
    settings.excludedDomains = newExcludedDomains;
    settingStore.set(settings);
    return true;
};
