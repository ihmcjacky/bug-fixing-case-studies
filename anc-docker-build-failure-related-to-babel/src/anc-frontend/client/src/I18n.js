
import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';
import CommonConstant from './constants/common';

const {langList} = CommonConstant;

export const initI18n = (lang) => {
    let lng = lang;
    if (!langList.find(l => l === lang)) {
        lng = 'en';
    }
    i18n.use(Backend)
        .use(initReactI18next)
        .init({
            lng,
            fallbackLng: 'en',
            // have a common namespace used around the full app
            ns: ['translate'],
            defaultNS: 'translate',
            // eslint-disable-next-line no-undef
            // debug: process.env.NODE_ENV === 'development' ? true : false,
            debug: false,
            interpolation: {
                escapeValue: false, // not needed for react!!
                format(value, format) {
                    if (format === 'uppercase') return value.toUpperCase();
                    return value;
                },
            },
            react: {
                transSupportBasicHtmlNodes: true,
                transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
                useSuspense: false,
            },
            load: 'currentOnly',
            backend: {
                // path where resources get loaded from, or a function
                // returning a path:
                // function(lngs, namespaces) { return customPath; }
                // the returned path will interpolate lng, ns if provided like giving a static path
                loadPath: '/locales/{{lng}}/{{ns}}.json',
            },
        }, (err, t) => {
            if (err) console.log('i18n load error', err);
        });
};

export const changeLang = (lang) => {
    if (!langList.find(l => l === lang)) {
        // invalid lang code
        return;
    }
    i18n.changeLanguage(lang);
};

export default i18n;
