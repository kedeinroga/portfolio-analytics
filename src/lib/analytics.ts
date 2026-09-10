import * as gtag from './gtag';

export const logPageView = (url: string) => {
  gtag.pageview(new URL(url, window.location.origin));
};

export const logPageViewSpecificSection = (section: string) => {
  gtag.event({
    action: 'view_section',
    category: 'navigation',
    label: section,
    value: 1
  });
};

export const logCvDownload = (language: string = 'unknown') => {
  gtag.event({
    action: 'cv_download',
    category: 'engagement',
    label: `cv_download_${language}`,
    value: 1
  });
};
