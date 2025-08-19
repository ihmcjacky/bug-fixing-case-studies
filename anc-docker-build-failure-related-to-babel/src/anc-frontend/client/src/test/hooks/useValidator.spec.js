import { renderHook } from '@testing-library/react-hooks'
import useValidator from '../../util/useValidator';
import i18n from '../../I18n';

jest.mock('../../I18n', () => ({
    t: jest.fn()
}))

const mockI18n = () => {
    i18n.t.mockImplementation((string) => string)
};

const configData = {
    meshSettings: {
        clusterId: 'p2uiteam2',
        managementIp: '10.240.222.224',
        managementNetmask: '255.255.0.0',
        bpduFilter: 'enable',
        country: 'HK',
        encType: 'psk2',
        encKey: 'p2wtadmin',
        e2eEnc: 'enable',
        e2eEncKey: 'p2wtadmin1234',
        globalRoamingRSSIMargin: 5,
        globalDiscoveryInterval: 1000,
        globalHeartbeatInterval: 300,
        globalHeartbeatTimeout: 5000,
        globalStaleTimeout: 30000,
        globalTimezone: 'UTC',
    },
    radioSettings: {
        '127.0.17.10': {
            radio0: {
                wirelessMode: '11AC',
                txpower: '20',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 5,
                rssiFilterLower: 255,
                rssiFilterUpper: 255,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '48',
                centralFreq: '48',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'none',
                },
                profileId: {
                    nbr: '1',
                },
            },
            radio1: {
                wirelessMode: '11AC',
                txpower: '19',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 6,
                rssiFilterLower: -91,
                rssiFilterUpper: -14,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '149',
                centralFreq: '149',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'none',
                },
                profileId: {
                    nbr: '1',
                },
            },
            radio2: {
                wirelessMode: '11AC',
                txpower: '21',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 5,
                rssiFilterLower: -85,
                rssiFilterUpper: -14,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '157',
                centralFreq: '157',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'blacklist',
                    macList: ['64:9A:12:22:40:20'],
                },
                profileId: {
                    nbr: '1',
                },
            },
        },
        '127.2.36.2': {
            radio0: {
                wirelessMode: '11AC',
                txpower: '20',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 5,
                rssiFilterLower: 255,
                rssiFilterUpper: 255,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '48',
                centralFreq: '48',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'none',
                },
                profileId: {
                    nbr: '1',
                },
            },
            radio1: {
                wirelessMode: '11AC',
                txpower: '17',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 5,
                rssiFilterLower: 255,
                rssiFilterUpper: 255,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '40',
                centralFreq: '36',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'none',
                },
                profileId: {
                    nbr: '1',
                },
            },
            radio2: {
                wirelessMode: '11AC',
                txpower: '22',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 5,
                rssiFilterLower: -85,
                rssiFilterUpper: 255,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '157',
                centralFreq: '157',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'none',
                },
                profileId: {
                    nbr: '1',
                },
            },
        },
    },
    nodeSettings: {
        '127.0.17.10': {
            hostname: 'UI-224',
            acl: {},
        },
        '127.2.36.2': {
            hostname: 'UI-226',
            acl: {
                whitelist: {},
                blacklist: {
                    source: ['12:12:12:12:12:12'],
                    destination: ['12:12:12:12:12:13'],
                },
            },
        },
    },
    ethernetSettings: {
        '127.0.17.10': {
            eth0: {
                ethernetLink: 'disable',
                mtu: 1500,
            },
            eth1: {
                ethernetLink: 'enable',
                mtu: 1500,
            },
        },
        '127.2.36.2': {
            eth0: {
                ethernetLink: 'enable',
                mtu: 1500,
            },
            eth1: {
                ethernetLink: 'enable',
                mtu: 1500,
            },
        },
    },
    profileSettings: {
        '127.0.17.10': {
            nbr: {
                1: {
                    maxNbr: '17',
                },
                2: {
                    maxNbr: 'disable',
                },
                3: {
                    maxNbr: 'disable',
                },
            },
        },
        '127.2.36.2': {
            nbr: {
                1: {
                    maxNbr: 'disable',
                },
                2: {
                    maxNbr: 'disable',
                },
                3: {
                    maxNbr: 'disable',
                },
            },
        },
    },
};
const configOptions = {
    meshSettings: {
        clusterId: {
            type: 'regex',
            data: '^[0-9a-zA-Z_-]{1,16}$',
        },
        managementIp: {
            type: 'regex',
            data:
                '^(?:25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}$',
        },
        managementNetmask: {
            type: 'regex',
            data:
                '^((1(28|92)|2(24|4[08]|5[245]))(\\.0){3}|(255\\.)(1(28|92)|2(24|4[08]|5[245]))(\\.0){2}|(255\\.){2}(1(28|92)|2(24|4[08]|5[245]))(\\.0)|(255\\.){3}(1(28|92)|2(24|4[08]|5[245])))$',
        },
        bpduFilter: {
            type: 'enum',
            data: [
                {
                    actualValue: 'enable',
                    displayValue: 'Enable',
                },
                {
                    actualValue: 'disable',
                    displayValue: 'Disable',
                },
            ],
        },
        country: {
            type: 'enum',
            data: [
                {
                    actualValue: 'AL',
                    displayValue: 'Albania',
                },
                {
                    actualValue: 'DZ',
                    displayValue: 'Algeria',
                },
                {
                    actualValue: 'AR',
                    displayValue: 'Argentina',
                },
                {
                    actualValue: 'AU',
                    displayValue: 'Australia',
                },
                {
                    actualValue: 'AT',
                    displayValue: 'Austria',
                },
                {
                    actualValue: 'AZ',
                    displayValue: 'Azerbaijan',
                },
                {
                    actualValue: 'BY',
                    displayValue: 'Belarus',
                },
                {
                    actualValue: 'BE',
                    displayValue: 'Belgium',
                },
                {
                    actualValue: 'BZ',
                    displayValue: 'Belize',
                },
                {
                    actualValue: 'BO',
                    displayValue: 'Bolivia',
                },
                {
                    actualValue: 'BR',
                    displayValue: 'Brazil',
                },
                {
                    actualValue: 'BN',
                    displayValue: 'Brunei Darussalam',
                },
                {
                    actualValue: 'BG',
                    displayValue: 'Bulgaria',
                },
                {
                    actualValue: 'CA',
                    displayValue: 'Canada',
                },
                {
                    actualValue: 'CL',
                    displayValue: 'Chile',
                },
                {
                    actualValue: 'CN',
                    displayValue: 'China',
                },
                {
                    actualValue: 'CO',
                    displayValue: 'Colombia',
                },
                {
                    actualValue: 'HR',
                    displayValue: 'Croatia',
                },
                {
                    actualValue: 'CY',
                    displayValue: 'Cyprus',
                },
                {
                    actualValue: 'CZ',
                    displayValue: 'Czech Republic',
                },
                {
                    actualValue: 'DB',
                    displayValue: 'Debug',
                },
                {
                    actualValue: 'DK',
                    displayValue: 'Denmark',
                },
                {
                    actualValue: 'DO',
                    displayValue: 'Dominican Republic',
                },
                {
                    actualValue: 'EE',
                    displayValue: 'Estonia',
                },
                {
                    actualValue: 'FI',
                    displayValue: 'Finland',
                },
                {
                    actualValue: 'FR',
                    displayValue: 'France',
                },
                {
                    actualValue: 'GE',
                    displayValue: 'Georgia',
                },
                {
                    actualValue: 'DE',
                    displayValue: 'Germany',
                },
                {
                    actualValue: 'GR',
                    displayValue: 'Greece',
                },
                {
                    actualValue: 'GT',
                    displayValue: 'Guatemala',
                },
                {
                    actualValue: 'HN',
                    displayValue: 'Honduras',
                },
                {
                    actualValue: 'HK',
                    displayValue: 'Hong Kong SAR',
                },
                {
                    actualValue: 'HU',
                    displayValue: 'Hungary',
                },
                {
                    actualValue: 'IS',
                    displayValue: 'Iceland',
                },
                {
                    actualValue: 'IN',
                    displayValue: 'India',
                },
                {
                    actualValue: 'ID',
                    displayValue: 'Indonesia',
                },
                {
                    actualValue: 'IR',
                    displayValue: 'Iran',
                },
                {
                    actualValue: 'IE',
                    displayValue: 'Ireland',
                },
                {
                    actualValue: 'IL',
                    displayValue: 'Israel',
                },
                {
                    actualValue: 'IT',
                    displayValue: 'Italy',
                },
                {
                    actualValue: 'JM',
                    displayValue: 'Jamaica',
                },
                {
                    actualValue: 'JP',
                    displayValue: 'Japan',
                },
                {
                    actualValue: 'JO',
                    displayValue: 'Jordan',
                },
                {
                    actualValue: 'KE',
                    displayValue: 'Kenya',
                },
                {
                    actualValue: 'KR',
                    displayValue: 'Korea Republic',
                },
                {
                    actualValue: 'KW',
                    displayValue: 'Kuwait',
                },
                {
                    actualValue: 'LV',
                    displayValue: 'Latvia',
                },
                {
                    actualValue: 'LB',
                    displayValue: 'Lebanon',
                },
                {
                    actualValue: 'LI',
                    displayValue: 'Liechtenstein',
                },
                {
                    actualValue: 'LT',
                    displayValue: 'Lithuania',
                },
                {
                    actualValue: 'LU',
                    displayValue: 'Luxembourg',
                },
                {
                    actualValue: 'MO',
                    displayValue: 'Macau SAR',
                },
                {
                    actualValue: 'MK',
                    displayValue: 'Macedonia',
                },
                {
                    actualValue: 'MY',
                    displayValue: 'Malaysia',
                },
                {
                    actualValue: 'MX',
                    displayValue: 'Mexico',
                },
                {
                    actualValue: 'MC',
                    displayValue: 'Monaco',
                },
                {
                    actualValue: 'MA',
                    displayValue: 'Morocco',
                },
                {
                    actualValue: 'NL',
                    displayValue: 'Netherlands',
                },
                {
                    actualValue: 'NZ',
                    displayValue: 'New Zealand',
                },
                {
                    actualValue: 'NI',
                    displayValue: 'Nicaragua',
                },
                {
                    actualValue: 'NO',
                    displayValue: 'Norway',
                },
                {
                    actualValue: 'OM',
                    displayValue: 'Oman',
                },
                {
                    actualValue: 'PK',
                    displayValue: 'Pakistan',
                },
                {
                    actualValue: 'PA',
                    displayValue: 'Panama',
                },
                {
                    actualValue: 'PY',
                    displayValue: 'Paraguay',
                },
                {
                    actualValue: 'PE',
                    displayValue: 'Peru',
                },
                {
                    actualValue: 'PH',
                    displayValue: 'Philippines',
                },
                {
                    actualValue: 'PL',
                    displayValue: 'Poland',
                },
                {
                    actualValue: 'PT',
                    displayValue: 'Portugal',
                },
                {
                    actualValue: 'PR',
                    displayValue: 'Puerto Rico',
                },
                {
                    actualValue: 'QA',
                    displayValue: 'Qatar',
                },
                {
                    actualValue: 'RO',
                    displayValue: 'Romania',
                },
                {
                    actualValue: 'RU',
                    displayValue: 'Russia',
                },
                {
                    actualValue: 'SA',
                    displayValue: 'Saudi Arabia',
                },
                {
                    actualValue: 'SG',
                    displayValue: 'Singapore',
                },
                {
                    actualValue: 'SK',
                    displayValue: 'Slovakia',
                },
                {
                    actualValue: 'SI',
                    displayValue: 'Slovenia',
                },
                {
                    actualValue: 'ZA',
                    displayValue: 'South Africa',
                },
                {
                    actualValue: 'ES',
                    displayValue: 'Spain',
                },
                {
                    actualValue: 'SE',
                    displayValue: 'Sweden',
                },
                {
                    actualValue: 'CH',
                    displayValue: 'Switzerland',
                },
                {
                    actualValue: 'TW',
                    displayValue: 'Taiwan',
                },
                {
                    actualValue: 'TH',
                    displayValue: 'Thailand',
                },
                {
                    actualValue: 'TT',
                    displayValue: 'Trinidad And Tobago',
                },
                {
                    actualValue: 'TN',
                    displayValue: 'Tunisia',
                },
                {
                    actualValue: 'TR',
                    displayValue: 'Turkey',
                },
                {
                    actualValue: 'AE',
                    displayValue: 'United Arab Emirates',
                },
                {
                    actualValue: 'GB',
                    displayValue: 'United Kingdom',
                },
                {
                    actualValue: 'US',
                    displayValue: 'United States',
                },
                {
                    actualValue: 'UY',
                    displayValue: 'Uruguay',
                },
                {
                    actualValue: 'UZ',
                    displayValue: 'Uzbekistan',
                },
                {
                    actualValue: 'VE',
                    displayValue: 'Venezuela',
                },
                {
                    actualValue: 'VN',
                    displayValue: 'Vietnam',
                },
                {
                    actualValue: 'ZW',
                    displayValue: 'Zimbabwe',
                },
            ],
        },
        encKey: {
            type: 'regex',
            data: '^[0-9a-zA-Z_-]{8,16}$',
        },
        e2eEnc: {
            type: 'enum',
            data: [
                {
                    actualValue: 'enable',
                    displayValue: 'Enable',
                },
                {
                    actualValue: 'disable',
                    displayValue: 'Disable',
                },
            ],
        },
        e2eEncKey: {
            type: 'regex',
            data: '^[0-9a-zA-Z_-]{8,32}$',
        },
        globalRoamingRSSIMargin: {
            type: 'int',
            data: {
                min: 0,
                max: 50,
            },
        },
        globalDiscoveryInterval: {
            type: 'int',
            data: {
                min: 100,
                max: 1024000,
            },
        },
        globalHeartbeatInterval: {
            type: 'int',
            data: {
                min: 100,
                max: 1000,
            },
        },
        globalHeartbeatTimeout: {
            type: 'int',
            data: {
                min: 500,
                max: 5000,
            },
        },
        globalStaleTimeout: {
            type: 'int',
            data: {
                min: 100,
                max: 1024000,
            },
        },
        globalTimezone: {
            type: 'enum',
            data: [
                {
                    actualValue: 'Africa/Abidjan',
                    displayValue: 'Africa/Abidjan',
                },
                {
                    actualValue: 'Africa/Accra',
                    displayValue: 'Africa/Accra',
                },
                {
                    actualValue: 'Africa/Addis_Ababa',
                    displayValue: 'Africa/Addis_Ababa',
                },
                {
                    actualValue: 'Africa/Algiers',
                    displayValue: 'Africa/Algiers',
                },
                {
                    actualValue: 'Africa/Asmara',
                    displayValue: 'Africa/Asmara',
                },
                {
                    actualValue: 'Africa/Asmera',
                    displayValue: 'Africa/Asmera',
                },
                {
                    actualValue: 'Africa/Bamako',
                    displayValue: 'Africa/Bamako',
                },
                {
                    actualValue: 'Africa/Bangui',
                    displayValue: 'Africa/Bangui',
                },
                {
                    actualValue: 'Africa/Banjul',
                    displayValue: 'Africa/Banjul',
                },
                {
                    actualValue: 'Africa/Bissau',
                    displayValue: 'Africa/Bissau',
                },
                {
                    actualValue: 'Africa/Blantyre',
                    displayValue: 'Africa/Blantyre',
                },
                {
                    actualValue: 'Africa/Brazzaville',
                    displayValue: 'Africa/Brazzaville',
                },
                {
                    actualValue: 'Africa/Bujumbura',
                    displayValue: 'Africa/Bujumbura',
                },
                {
                    actualValue: 'Africa/Cairo',
                    displayValue: 'Africa/Cairo',
                },
                {
                    actualValue: 'Africa/Casablanca',
                    displayValue: 'Africa/Casablanca',
                },
                {
                    actualValue: 'Africa/Ceuta',
                    displayValue: 'Africa/Ceuta',
                },
                {
                    actualValue: 'Africa/Conakry',
                    displayValue: 'Africa/Conakry',
                },
                {
                    actualValue: 'Africa/Dakar',
                    displayValue: 'Africa/Dakar',
                },
                {
                    actualValue: 'Africa/Dar_es_Salaam',
                    displayValue: 'Africa/Dar_es_Salaam',
                },
                {
                    actualValue: 'Africa/Djibouti',
                    displayValue: 'Africa/Djibouti',
                },
                {
                    actualValue: 'Africa/Douala',
                    displayValue: 'Africa/Douala',
                },
                {
                    actualValue: 'Africa/El_Aaiun',
                    displayValue: 'Africa/El_Aaiun',
                },
                {
                    actualValue: 'Africa/Freetown',
                    displayValue: 'Africa/Freetown',
                },
                {
                    actualValue: 'Africa/Gaborone',
                    displayValue: 'Africa/Gaborone',
                },
                {
                    actualValue: 'Africa/Harare',
                    displayValue: 'Africa/Harare',
                },
                {
                    actualValue: 'Africa/Johannesburg',
                    displayValue: 'Africa/Johannesburg',
                },
                {
                    actualValue: 'Africa/Juba',
                    displayValue: 'Africa/Juba',
                },
                {
                    actualValue: 'Africa/Kampala',
                    displayValue: 'Africa/Kampala',
                },
                {
                    actualValue: 'Africa/Khartoum',
                    displayValue: 'Africa/Khartoum',
                },
                {
                    actualValue: 'Africa/Kigali',
                    displayValue: 'Africa/Kigali',
                },
                {
                    actualValue: 'Africa/Kinshasa',
                    displayValue: 'Africa/Kinshasa',
                },
                {
                    actualValue: 'Africa/Lagos',
                    displayValue: 'Africa/Lagos',
                },
                {
                    actualValue: 'Africa/Libreville',
                    displayValue: 'Africa/Libreville',
                },
                {
                    actualValue: 'Africa/Lome',
                    displayValue: 'Africa/Lome',
                },
                {
                    actualValue: 'Africa/Luanda',
                    displayValue: 'Africa/Luanda',
                },
                {
                    actualValue: 'Africa/Lubumbashi',
                    displayValue: 'Africa/Lubumbashi',
                },
                {
                    actualValue: 'Africa/Lusaka',
                    displayValue: 'Africa/Lusaka',
                },
                {
                    actualValue: 'Africa/Malabo',
                    displayValue: 'Africa/Malabo',
                },
                {
                    actualValue: 'Africa/Maputo',
                    displayValue: 'Africa/Maputo',
                },
                {
                    actualValue: 'Africa/Maseru',
                    displayValue: 'Africa/Maseru',
                },
                {
                    actualValue: 'Africa/Mbabane',
                    displayValue: 'Africa/Mbabane',
                },
                {
                    actualValue: 'Africa/Mogadishu',
                    displayValue: 'Africa/Mogadishu',
                },
                {
                    actualValue: 'Africa/Monrovia',
                    displayValue: 'Africa/Monrovia',
                },
                {
                    actualValue: 'Africa/Nairobi',
                    displayValue: 'Africa/Nairobi',
                },
                {
                    actualValue: 'Africa/Ndjamena',
                    displayValue: 'Africa/Ndjamena',
                },
                {
                    actualValue: 'Africa/Niamey',
                    displayValue: 'Africa/Niamey',
                },
                {
                    actualValue: 'Africa/Nouakchott',
                    displayValue: 'Africa/Nouakchott',
                },
                {
                    actualValue: 'Africa/Ouagadougou',
                    displayValue: 'Africa/Ouagadougou',
                },
                {
                    actualValue: 'Africa/Porto-Novo',
                    displayValue: 'Africa/Porto-Novo',
                },
                {
                    actualValue: 'Africa/Sao_Tome',
                    displayValue: 'Africa/Sao_Tome',
                },
                {
                    actualValue: 'Africa/Timbuktu',
                    displayValue: 'Africa/Timbuktu',
                },
                {
                    actualValue: 'Africa/Tripoli',
                    displayValue: 'Africa/Tripoli',
                },
                {
                    actualValue: 'Africa/Tunis',
                    displayValue: 'Africa/Tunis',
                },
                {
                    actualValue: 'Africa/Windhoek',
                    displayValue: 'Africa/Windhoek',
                },
                {
                    actualValue: 'America/Adak',
                    displayValue: 'America/Adak',
                },
                {
                    actualValue: 'America/Anchorage',
                    displayValue: 'America/Anchorage',
                },
                {
                    actualValue: 'America/Anguilla',
                    displayValue: 'America/Anguilla',
                },
                {
                    actualValue: 'America/Antigua',
                    displayValue: 'America/Antigua',
                },
                {
                    actualValue: 'America/Araguaina',
                    displayValue: 'America/Araguaina',
                },
                {
                    actualValue: 'America/Argentina',
                    displayValue: 'America/Argentina',
                },
                {
                    actualValue: 'America/Argentina/Buenos_Aires',
                    displayValue: 'America/Argentina/Buenos_Aires',
                },
                {
                    actualValue: 'America/Argentina/Catamarca',
                    displayValue: 'America/Argentina/Catamarca',
                },
                {
                    actualValue: 'America/Argentina/ComodRivadavia',
                    displayValue: 'America/Argentina/ComodRivadavia',
                },
                {
                    actualValue: 'America/Argentina/Cordoba',
                    displayValue: 'America/Argentina/Cordoba',
                },
                {
                    actualValue: 'America/Argentina/Jujuy',
                    displayValue: 'America/Argentina/Jujuy',
                },
                {
                    actualValue: 'America/Argentina/La_Rioja',
                    displayValue: 'America/Argentina/La_Rioja',
                },
                {
                    actualValue: 'America/Argentina/Mendoza',
                    displayValue: 'America/Argentina/Mendoza',
                },
                {
                    actualValue: 'America/Argentina/Rio_Gallegos',
                    displayValue: 'America/Argentina/Rio_Gallegos',
                },
                {
                    actualValue: 'America/Argentina/Salta',
                    displayValue: 'America/Argentina/Salta',
                },
                {
                    actualValue: 'America/Argentina/San_Juan',
                    displayValue: 'America/Argentina/San_Juan',
                },
                {
                    actualValue: 'America/Argentina/San_Luis',
                    displayValue: 'America/Argentina/San_Luis',
                },
                {
                    actualValue: 'America/Argentina/Tucuman',
                    displayValue: 'America/Argentina/Tucuman',
                },
                {
                    actualValue: 'America/Argentina/Ushuaia',
                    displayValue: 'America/Argentina/Ushuaia',
                },
                {
                    actualValue: 'America/Aruba',
                    displayValue: 'America/Aruba',
                },
                {
                    actualValue: 'America/Asuncion',
                    displayValue: 'America/Asuncion',
                },
                {
                    actualValue: 'America/Atikokan',
                    displayValue: 'America/Atikokan',
                },
                {
                    actualValue: 'America/Atka',
                    displayValue: 'America/Atka',
                },
                {
                    actualValue: 'America/Bahia',
                    displayValue: 'America/Bahia',
                },
                {
                    actualValue: 'America/Bahia_Banderas',
                    displayValue: 'America/Bahia_Banderas',
                },
                {
                    actualValue: 'America/Barbados',
                    displayValue: 'America/Barbados',
                },
                {
                    actualValue: 'America/Belem',
                    displayValue: 'America/Belem',
                },
                {
                    actualValue: 'America/Belize',
                    displayValue: 'America/Belize',
                },
                {
                    actualValue: 'America/Blanc-Sablon',
                    displayValue: 'America/Blanc-Sablon',
                },
                {
                    actualValue: 'America/Boa_Vista',
                    displayValue: 'America/Boa_Vista',
                },
                {
                    actualValue: 'America/Bogota',
                    displayValue: 'America/Bogota',
                },
                {
                    actualValue: 'America/Boise',
                    displayValue: 'America/Boise',
                },
                {
                    actualValue: 'America/Buenos_Aires',
                    displayValue: 'America/Buenos_Aires',
                },
                {
                    actualValue: 'America/Cambridge_Bay',
                    displayValue: 'America/Cambridge_Bay',
                },
                {
                    actualValue: 'America/Campo_Grande',
                    displayValue: 'America/Campo_Grande',
                },
                {
                    actualValue: 'America/Cancun',
                    displayValue: 'America/Cancun',
                },
                {
                    actualValue: 'America/Caracas',
                    displayValue: 'America/Caracas',
                },
                {
                    actualValue: 'America/Catamarca',
                    displayValue: 'America/Catamarca',
                },
                {
                    actualValue: 'America/Cayenne',
                    displayValue: 'America/Cayenne',
                },
                {
                    actualValue: 'America/Cayman',
                    displayValue: 'America/Cayman',
                },
                {
                    actualValue: 'America/Chicago',
                    displayValue: 'America/Chicago',
                },
                {
                    actualValue: 'America/Chihuahua',
                    displayValue: 'America/Chihuahua',
                },
                {
                    actualValue: 'America/Coral_Harbour',
                    displayValue: 'America/Coral_Harbour',
                },
                {
                    actualValue: 'America/Cordoba',
                    displayValue: 'America/Cordoba',
                },
                {
                    actualValue: 'America/Costa_Rica',
                    displayValue: 'America/Costa_Rica',
                },
                {
                    actualValue: 'America/Creston',
                    displayValue: 'America/Creston',
                },
                {
                    actualValue: 'America/Cuiaba',
                    displayValue: 'America/Cuiaba',
                },
                {
                    actualValue: 'America/Curacao',
                    displayValue: 'America/Curacao',
                },
                {
                    actualValue: 'America/Danmarkshavn',
                    displayValue: 'America/Danmarkshavn',
                },
                {
                    actualValue: 'America/Dawson',
                    displayValue: 'America/Dawson',
                },
                {
                    actualValue: 'America/Dawson_Creek',
                    displayValue: 'America/Dawson_Creek',
                },
                {
                    actualValue: 'America/Denver',
                    displayValue: 'America/Denver',
                },
                {
                    actualValue: 'America/Detroit',
                    displayValue: 'America/Detroit',
                },
                {
                    actualValue: 'America/Dominica',
                    displayValue: 'America/Dominica',
                },
                {
                    actualValue: 'America/Edmonton',
                    displayValue: 'America/Edmonton',
                },
                {
                    actualValue: 'America/Eirunepe',
                    displayValue: 'America/Eirunepe',
                },
                {
                    actualValue: 'America/El_Salvador',
                    displayValue: 'America/El_Salvador',
                },
                {
                    actualValue: 'America/Ensenada',
                    displayValue: 'America/Ensenada',
                },
                {
                    actualValue: 'America/Fort_Wayne',
                    displayValue: 'America/Fort_Wayne',
                },
                {
                    actualValue: 'America/Fortaleza',
                    displayValue: 'America/Fortaleza',
                },
                {
                    actualValue: 'America/Glace_Bay',
                    displayValue: 'America/Glace_Bay',
                },
                {
                    actualValue: 'America/Godthab',
                    displayValue: 'America/Godthab',
                },
                {
                    actualValue: 'America/Goose_Bay',
                    displayValue: 'America/Goose_Bay',
                },
                {
                    actualValue: 'America/Grand_Turk',
                    displayValue: 'America/Grand_Turk',
                },
                {
                    actualValue: 'America/Grenada',
                    displayValue: 'America/Grenada',
                },
                {
                    actualValue: 'America/Guadeloupe',
                    displayValue: 'America/Guadeloupe',
                },
                {
                    actualValue: 'America/Guatemala',
                    displayValue: 'America/Guatemala',
                },
                {
                    actualValue: 'America/Guayaquil',
                    displayValue: 'America/Guayaquil',
                },
                {
                    actualValue: 'America/Guyana',
                    displayValue: 'America/Guyana',
                },
                {
                    actualValue: 'America/Halifax',
                    displayValue: 'America/Halifax',
                },
                {
                    actualValue: 'America/Havana',
                    displayValue: 'America/Havana',
                },
                {
                    actualValue: 'America/Hermosillo',
                    displayValue: 'America/Hermosillo',
                },
                {
                    actualValue: 'America/Indiana',
                    displayValue: 'America/Indiana',
                },
                {
                    actualValue: 'America/Indiana/Indianapolis',
                    displayValue: 'America/Indiana/Indianapolis',
                },
                {
                    actualValue: 'America/Indiana/Knox',
                    displayValue: 'America/Indiana/Knox',
                },
                {
                    actualValue: 'America/Indiana/Marengo',
                    displayValue: 'America/Indiana/Marengo',
                },
                {
                    actualValue: 'America/Indiana/Petersburg',
                    displayValue: 'America/Indiana/Petersburg',
                },
                {
                    actualValue: 'America/Indiana/Tell_City',
                    displayValue: 'America/Indiana/Tell_City',
                },
                {
                    actualValue: 'America/Indiana/Vevay',
                    displayValue: 'America/Indiana/Vevay',
                },
                {
                    actualValue: 'America/Indiana/Vincennes',
                    displayValue: 'America/Indiana/Vincennes',
                },
                {
                    actualValue: 'America/Indiana/Winamac',
                    displayValue: 'America/Indiana/Winamac',
                },
                {
                    actualValue: 'America/Indianapolis',
                    displayValue: 'America/Indianapolis',
                },
                {
                    actualValue: 'America/Inuvik',
                    displayValue: 'America/Inuvik',
                },
                {
                    actualValue: 'America/Iqaluit',
                    displayValue: 'America/Iqaluit',
                },
                {
                    actualValue: 'America/Jamaica',
                    displayValue: 'America/Jamaica',
                },
                {
                    actualValue: 'America/Jujuy',
                    displayValue: 'America/Jujuy',
                },
                {
                    actualValue: 'America/Juneau',
                    displayValue: 'America/Juneau',
                },
                {
                    actualValue: 'America/Kentucky',
                    displayValue: 'America/Kentucky',
                },
                {
                    actualValue: 'America/Kentucky/Louisville',
                    displayValue: 'America/Kentucky/Louisville',
                },
                {
                    actualValue: 'America/Kentucky/Monticello',
                    displayValue: 'America/Kentucky/Monticello',
                },
                {
                    actualValue: 'America/Knox_IN',
                    displayValue: 'America/Knox_IN',
                },
                {
                    actualValue: 'America/Kralendijk',
                    displayValue: 'America/Kralendijk',
                },
                {
                    actualValue: 'America/La_Paz',
                    displayValue: 'America/La_Paz',
                },
                {
                    actualValue: 'America/Lima',
                    displayValue: 'America/Lima',
                },
                {
                    actualValue: 'America/Los_Angeles',
                    displayValue: 'America/Los_Angeles',
                },
                {
                    actualValue: 'America/Louisville',
                    displayValue: 'America/Louisville',
                },
                {
                    actualValue: 'America/Lower_Princes',
                    displayValue: 'America/Lower_Princes',
                },
                {
                    actualValue: 'America/Maceio',
                    displayValue: 'America/Maceio',
                },
                {
                    actualValue: 'America/Managua',
                    displayValue: 'America/Managua',
                },
                {
                    actualValue: 'America/Manaus',
                    displayValue: 'America/Manaus',
                },
                {
                    actualValue: 'America/Marigot',
                    displayValue: 'America/Marigot',
                },
                {
                    actualValue: 'America/Martinique',
                    displayValue: 'America/Martinique',
                },
                {
                    actualValue: 'America/Matamoros',
                    displayValue: 'America/Matamoros',
                },
                {
                    actualValue: 'America/Mazatlan',
                    displayValue: 'America/Mazatlan',
                },
                {
                    actualValue: 'America/Mendoza',
                    displayValue: 'America/Mendoza',
                },
                {
                    actualValue: 'America/Menominee',
                    displayValue: 'America/Menominee',
                },
                {
                    actualValue: 'America/Merida',
                    displayValue: 'America/Merida',
                },
                {
                    actualValue: 'America/Metlakatla',
                    displayValue: 'America/Metlakatla',
                },
                {
                    actualValue: 'America/Mexico_City',
                    displayValue: 'America/Mexico_City',
                },
                {
                    actualValue: 'America/Miquelon',
                    displayValue: 'America/Miquelon',
                },
                {
                    actualValue: 'America/Moncton',
                    displayValue: 'America/Moncton',
                },
                {
                    actualValue: 'America/Monterrey',
                    displayValue: 'America/Monterrey',
                },
                {
                    actualValue: 'America/Montevideo',
                    displayValue: 'America/Montevideo',
                },
                {
                    actualValue: 'America/Montreal',
                    displayValue: 'America/Montreal',
                },
                {
                    actualValue: 'America/Montserrat',
                    displayValue: 'America/Montserrat',
                },
                {
                    actualValue: 'America/Nassau',
                    displayValue: 'America/Nassau',
                },
                {
                    actualValue: 'America/New_York',
                    displayValue: 'America/New_York',
                },
                {
                    actualValue: 'America/Nipigon',
                    displayValue: 'America/Nipigon',
                },
                {
                    actualValue: 'America/Nome',
                    displayValue: 'America/Nome',
                },
                {
                    actualValue: 'America/Noronha',
                    displayValue: 'America/Noronha',
                },
                {
                    actualValue: 'America/North_Dakota',
                    displayValue: 'America/North_Dakota',
                },
                {
                    actualValue: 'America/North_Dakota/Beulah',
                    displayValue: 'America/North_Dakota/Beulah',
                },
                {
                    actualValue: 'America/North_Dakota/Center',
                    displayValue: 'America/North_Dakota/Center',
                },
                {
                    actualValue: 'America/North_Dakota/New_Salem',
                    displayValue: 'America/North_Dakota/New_Salem',
                },
                {
                    actualValue: 'America/Ojinaga',
                    displayValue: 'America/Ojinaga',
                },
                {
                    actualValue: 'America/Panama',
                    displayValue: 'America/Panama',
                },
                {
                    actualValue: 'America/Pangnirtung',
                    displayValue: 'America/Pangnirtung',
                },
                {
                    actualValue: 'America/Paramaribo',
                    displayValue: 'America/Paramaribo',
                },
                {
                    actualValue: 'America/Phoenix',
                    displayValue: 'America/Phoenix',
                },
                {
                    actualValue: 'America/Port-au-Prince',
                    displayValue: 'America/Port-au-Prince',
                },
                {
                    actualValue: 'America/Port_of_Spain',
                    displayValue: 'America/Port_of_Spain',
                },
                {
                    actualValue: 'America/Porto_Acre',
                    displayValue: 'America/Porto_Acre',
                },
                {
                    actualValue: 'America/Porto_Velho',
                    displayValue: 'America/Porto_Velho',
                },
                {
                    actualValue: 'America/Puerto_Rico',
                    displayValue: 'America/Puerto_Rico',
                },
                {
                    actualValue: 'America/Rainy_River',
                    displayValue: 'America/Rainy_River',
                },
                {
                    actualValue: 'America/Rankin_Inlet',
                    displayValue: 'America/Rankin_Inlet',
                },
                {
                    actualValue: 'America/Recife',
                    displayValue: 'America/Recife',
                },
                {
                    actualValue: 'America/Regina',
                    displayValue: 'America/Regina',
                },
                {
                    actualValue: 'America/Resolute',
                    displayValue: 'America/Resolute',
                },
                {
                    actualValue: 'America/Rio_Branco',
                    displayValue: 'America/Rio_Branco',
                },
                {
                    actualValue: 'America/Rosario',
                    displayValue: 'America/Rosario',
                },
                {
                    actualValue: 'America/Santa_Isabel',
                    displayValue: 'America/Santa_Isabel',
                },
                {
                    actualValue: 'America/Santarem',
                    displayValue: 'America/Santarem',
                },
                {
                    actualValue: 'America/Santiago',
                    displayValue: 'America/Santiago',
                },
                {
                    actualValue: 'America/Santo_Domingo',
                    displayValue: 'America/Santo_Domingo',
                },
                {
                    actualValue: 'America/Sao_Paulo',
                    displayValue: 'America/Sao_Paulo',
                },
                {
                    actualValue: 'America/Scoresbysund',
                    displayValue: 'America/Scoresbysund',
                },
                {
                    actualValue: 'America/Shiprock',
                    displayValue: 'America/Shiprock',
                },
                {
                    actualValue: 'America/Sitka',
                    displayValue: 'America/Sitka',
                },
                {
                    actualValue: 'America/St_Barthelemy',
                    displayValue: 'America/St_Barthelemy',
                },
                {
                    actualValue: 'America/St_Johns',
                    displayValue: 'America/St_Johns',
                },
                {
                    actualValue: 'America/St_Kitts',
                    displayValue: 'America/St_Kitts',
                },
                {
                    actualValue: 'America/St_Lucia',
                    displayValue: 'America/St_Lucia',
                },
                {
                    actualValue: 'America/St_Thomas',
                    displayValue: 'America/St_Thomas',
                },
                {
                    actualValue: 'America/St_Vincent',
                    displayValue: 'America/St_Vincent',
                },
                {
                    actualValue: 'America/Swift_Current',
                    displayValue: 'America/Swift_Current',
                },
                {
                    actualValue: 'America/Tegucigalpa',
                    displayValue: 'America/Tegucigalpa',
                },
                {
                    actualValue: 'America/Thule',
                    displayValue: 'America/Thule',
                },
                {
                    actualValue: 'America/Thunder_Bay',
                    displayValue: 'America/Thunder_Bay',
                },
                {
                    actualValue: 'America/Tijuana',
                    displayValue: 'America/Tijuana',
                },
                {
                    actualValue: 'America/Toronto',
                    displayValue: 'America/Toronto',
                },
                {
                    actualValue: 'America/Tortola',
                    displayValue: 'America/Tortola',
                },
                {
                    actualValue: 'America/Vancouver',
                    displayValue: 'America/Vancouver',
                },
                {
                    actualValue: 'America/Virgin',
                    displayValue: 'America/Virgin',
                },
                {
                    actualValue: 'America/Whitehorse',
                    displayValue: 'America/Whitehorse',
                },
                {
                    actualValue: 'America/Winnipeg',
                    displayValue: 'America/Winnipeg',
                },
                {
                    actualValue: 'America/Yakutat',
                    displayValue: 'America/Yakutat',
                },
                {
                    actualValue: 'America/Yellowknife',
                    displayValue: 'America/Yellowknife',
                },
                {
                    actualValue: 'Antarctica/Casey',
                    displayValue: 'Antarctica/Casey',
                },
                {
                    actualValue: 'Antarctica/Davis',
                    displayValue: 'Antarctica/Davis',
                },
                {
                    actualValue: 'Antarctica/DumontDUrville',
                    displayValue: 'Antarctica/DumontDUrville',
                },
                {
                    actualValue: 'Antarctica/Macquarie',
                    displayValue: 'Antarctica/Macquarie',
                },
                {
                    actualValue: 'Antarctica/Mawson',
                    displayValue: 'Antarctica/Mawson',
                },
                {
                    actualValue: 'Antarctica/McMurdo',
                    displayValue: 'Antarctica/McMurdo',
                },
                {
                    actualValue: 'Antarctica/Palmer',
                    displayValue: 'Antarctica/Palmer',
                },
                {
                    actualValue: 'Antarctica/Rothera',
                    displayValue: 'Antarctica/Rothera',
                },
                {
                    actualValue: 'Antarctica/South_Pole',
                    displayValue: 'Antarctica/South_Pole',
                },
                {
                    actualValue: 'Antarctica/Syowa',
                    displayValue: 'Antarctica/Syowa',
                },
                {
                    actualValue: 'Antarctica/Troll',
                    displayValue: 'Antarctica/Troll',
                },
                {
                    actualValue: 'Antarctica/Vostok',
                    displayValue: 'Antarctica/Vostok',
                },
                {
                    actualValue: 'Arctic/Longyearbyen',
                    displayValue: 'Arctic/Longyearbyen',
                },
                {
                    actualValue: 'Asia/Aden',
                    displayValue: 'Asia/Aden',
                },
                {
                    actualValue: 'Asia/Almaty',
                    displayValue: 'Asia/Almaty',
                },
                {
                    actualValue: 'Asia/Amman',
                    displayValue: 'Asia/Amman',
                },
                {
                    actualValue: 'Asia/Anadyr',
                    displayValue: 'Asia/Anadyr',
                },
                {
                    actualValue: 'Asia/Aqtau',
                    displayValue: 'Asia/Aqtau',
                },
                {
                    actualValue: 'Asia/Aqtobe',
                    displayValue: 'Asia/Aqtobe',
                },
                {
                    actualValue: 'Asia/Ashgabat',
                    displayValue: 'Asia/Ashgabat',
                },
                {
                    actualValue: 'Asia/Ashkhabad',
                    displayValue: 'Asia/Ashkhabad',
                },
                {
                    actualValue: 'Asia/Baghdad',
                    displayValue: 'Asia/Baghdad',
                },
                {
                    actualValue: 'Asia/Bahrain',
                    displayValue: 'Asia/Bahrain',
                },
                {
                    actualValue: 'Asia/Baku',
                    displayValue: 'Asia/Baku',
                },
                {
                    actualValue: 'Asia/Bangkok',
                    displayValue: 'Asia/Bangkok',
                },
                {
                    actualValue: 'Asia/Beirut',
                    displayValue: 'Asia/Beirut',
                },
                {
                    actualValue: 'Asia/Bishkek',
                    displayValue: 'Asia/Bishkek',
                },
                {
                    actualValue: 'Asia/Brunei',
                    displayValue: 'Asia/Brunei',
                },
                {
                    actualValue: 'Asia/Calcutta',
                    displayValue: 'Asia/Calcutta',
                },
                {
                    actualValue: 'Asia/Chita',
                    displayValue: 'Asia/Chita',
                },
                {
                    actualValue: 'Asia/Choibalsan',
                    displayValue: 'Asia/Choibalsan',
                },
                {
                    actualValue: 'Asia/Chongqing',
                    displayValue: 'Asia/Chongqing',
                },
                {
                    actualValue: 'Asia/Chungking',
                    displayValue: 'Asia/Chungking',
                },
                {
                    actualValue: 'Asia/Colombo',
                    displayValue: 'Asia/Colombo',
                },
                {
                    actualValue: 'Asia/Dacca',
                    displayValue: 'Asia/Dacca',
                },
                {
                    actualValue: 'Asia/Damascus',
                    displayValue: 'Asia/Damascus',
                },
                {
                    actualValue: 'Asia/Dhaka',
                    displayValue: 'Asia/Dhaka',
                },
                {
                    actualValue: 'Asia/Dili',
                    displayValue: 'Asia/Dili',
                },
                {
                    actualValue: 'Asia/Dubai',
                    displayValue: 'Asia/Dubai',
                },
                {
                    actualValue: 'Asia/Dushanbe',
                    displayValue: 'Asia/Dushanbe',
                },
                {
                    actualValue: 'Asia/Gaza',
                    displayValue: 'Asia/Gaza',
                },
                {
                    actualValue: 'Asia/Harbin',
                    displayValue: 'Asia/Harbin',
                },
                {
                    actualValue: 'Asia/Hebron',
                    displayValue: 'Asia/Hebron',
                },
                {
                    actualValue: 'Asia/Ho_Chi_Minh',
                    displayValue: 'Asia/Ho_Chi_Minh',
                },
                {
                    actualValue: 'Asia/Hong_Kong',
                    displayValue: 'Asia/Hong_Kong',
                },
                {
                    actualValue: 'Asia/Hovd',
                    displayValue: 'Asia/Hovd',
                },
                {
                    actualValue: 'Asia/Irkutsk',
                    displayValue: 'Asia/Irkutsk',
                },
                {
                    actualValue: 'Asia/Istanbul',
                    displayValue: 'Asia/Istanbul',
                },
                {
                    actualValue: 'Asia/Jakarta',
                    displayValue: 'Asia/Jakarta',
                },
                {
                    actualValue: 'Asia/Jayapura',
                    displayValue: 'Asia/Jayapura',
                },
                {
                    actualValue: 'Asia/Jerusalem',
                    displayValue: 'Asia/Jerusalem',
                },
                {
                    actualValue: 'Asia/Kabul',
                    displayValue: 'Asia/Kabul',
                },
                {
                    actualValue: 'Asia/Kamchatka',
                    displayValue: 'Asia/Kamchatka',
                },
                {
                    actualValue: 'Asia/Karachi',
                    displayValue: 'Asia/Karachi',
                },
                {
                    actualValue: 'Asia/Kashgar',
                    displayValue: 'Asia/Kashgar',
                },
                {
                    actualValue: 'Asia/Kathmandu',
                    displayValue: 'Asia/Kathmandu',
                },
                {
                    actualValue: 'Asia/Katmandu',
                    displayValue: 'Asia/Katmandu',
                },
                {
                    actualValue: 'Asia/Khandyga',
                    displayValue: 'Asia/Khandyga',
                },
                {
                    actualValue: 'Asia/Kolkata',
                    displayValue: 'Asia/Kolkata',
                },
                {
                    actualValue: 'Asia/Krasnoyarsk',
                    displayValue: 'Asia/Krasnoyarsk',
                },
                {
                    actualValue: 'Asia/Kuala_Lumpur',
                    displayValue: 'Asia/Kuala_Lumpur',
                },
                {
                    actualValue: 'Asia/Kuching',
                    displayValue: 'Asia/Kuching',
                },
                {
                    actualValue: 'Asia/Kuwait',
                    displayValue: 'Asia/Kuwait',
                },
                {
                    actualValue: 'Asia/Macao',
                    displayValue: 'Asia/Macao',
                },
                {
                    actualValue: 'Asia/Macau',
                    displayValue: 'Asia/Macau',
                },
                {
                    actualValue: 'Asia/Magadan',
                    displayValue: 'Asia/Magadan',
                },
                {
                    actualValue: 'Asia/Makassar',
                    displayValue: 'Asia/Makassar',
                },
                {
                    actualValue: 'Asia/Manila',
                    displayValue: 'Asia/Manila',
                },
                {
                    actualValue: 'Asia/Muscat',
                    displayValue: 'Asia/Muscat',
                },
                {
                    actualValue: 'Asia/Nicosia',
                    displayValue: 'Asia/Nicosia',
                },
                {
                    actualValue: 'Asia/Novokuznetsk',
                    displayValue: 'Asia/Novokuznetsk',
                },
                {
                    actualValue: 'Asia/Novosibirsk',
                    displayValue: 'Asia/Novosibirsk',
                },
                {
                    actualValue: 'Asia/Omsk',
                    displayValue: 'Asia/Omsk',
                },
                {
                    actualValue: 'Asia/Oral',
                    displayValue: 'Asia/Oral',
                },
                {
                    actualValue: 'Asia/Phnom_Penh',
                    displayValue: 'Asia/Phnom_Penh',
                },
                {
                    actualValue: 'Asia/Pontianak',
                    displayValue: 'Asia/Pontianak',
                },
                {
                    actualValue: 'Asia/Pyongyang',
                    displayValue: 'Asia/Pyongyang',
                },
                {
                    actualValue: 'Asia/Qatar',
                    displayValue: 'Asia/Qatar',
                },
                {
                    actualValue: 'Asia/Qyzylorda',
                    displayValue: 'Asia/Qyzylorda',
                },
                {
                    actualValue: 'Asia/Rangoon',
                    displayValue: 'Asia/Rangoon',
                },
                {
                    actualValue: 'Asia/Riyadh',
                    displayValue: 'Asia/Riyadh',
                },
                {
                    actualValue: 'Asia/Saigon',
                    displayValue: 'Asia/Saigon',
                },
                {
                    actualValue: 'Asia/Sakhalin',
                    displayValue: 'Asia/Sakhalin',
                },
                {
                    actualValue: 'Asia/Samarkand',
                    displayValue: 'Asia/Samarkand',
                },
                {
                    actualValue: 'Asia/Seoul',
                    displayValue: 'Asia/Seoul',
                },
                {
                    actualValue: 'Asia/Shanghai',
                    displayValue: 'Asia/Shanghai',
                },
                {
                    actualValue: 'Asia/Singapore',
                    displayValue: 'Asia/Singapore',
                },
                {
                    actualValue: 'Asia/Srednekolymsk',
                    displayValue: 'Asia/Srednekolymsk',
                },
                {
                    actualValue: 'Asia/Taipei',
                    displayValue: 'Asia/Taipei',
                },
                {
                    actualValue: 'Asia/Tashkent',
                    displayValue: 'Asia/Tashkent',
                },
                {
                    actualValue: 'Asia/Tbilisi',
                    displayValue: 'Asia/Tbilisi',
                },
                {
                    actualValue: 'Asia/Tehran',
                    displayValue: 'Asia/Tehran',
                },
                {
                    actualValue: 'Asia/Tel_Aviv',
                    displayValue: 'Asia/Tel_Aviv',
                },
                {
                    actualValue: 'Asia/Thimbu',
                    displayValue: 'Asia/Thimbu',
                },
                {
                    actualValue: 'Asia/Thimphu',
                    displayValue: 'Asia/Thimphu',
                },
                {
                    actualValue: 'Asia/Tokyo',
                    displayValue: 'Asia/Tokyo',
                },
                {
                    actualValue: 'Asia/Ujung_Pandang',
                    displayValue: 'Asia/Ujung_Pandang',
                },
                {
                    actualValue: 'Asia/Ulaanbaatar',
                    displayValue: 'Asia/Ulaanbaatar',
                },
                {
                    actualValue: 'Asia/Ulan_Bator',
                    displayValue: 'Asia/Ulan_Bator',
                },
                {
                    actualValue: 'Asia/Urumqi',
                    displayValue: 'Asia/Urumqi',
                },
                {
                    actualValue: 'Asia/Ust-Nera',
                    displayValue: 'Asia/Ust-Nera',
                },
                {
                    actualValue: 'Asia/Vientiane',
                    displayValue: 'Asia/Vientiane',
                },
                {
                    actualValue: 'Asia/Vladivostok',
                    displayValue: 'Asia/Vladivostok',
                },
                {
                    actualValue: 'Asia/Yakutsk',
                    displayValue: 'Asia/Yakutsk',
                },
                {
                    actualValue: 'Asia/Yekaterinburg',
                    displayValue: 'Asia/Yekaterinburg',
                },
                {
                    actualValue: 'Asia/Yerevan',
                    displayValue: 'Asia/Yerevan',
                },
                {
                    actualValue: 'Atlantic/Azores',
                    displayValue: 'Atlantic/Azores',
                },
                {
                    actualValue: 'Atlantic/Bermuda',
                    displayValue: 'Atlantic/Bermuda',
                },
                {
                    actualValue: 'Atlantic/Canary',
                    displayValue: 'Atlantic/Canary',
                },
                {
                    actualValue: 'Atlantic/Cape_Verde',
                    displayValue: 'Atlantic/Cape_Verde',
                },
                {
                    actualValue: 'Atlantic/Faeroe',
                    displayValue: 'Atlantic/Faeroe',
                },
                {
                    actualValue: 'Atlantic/Faroe',
                    displayValue: 'Atlantic/Faroe',
                },
                {
                    actualValue: 'Atlantic/Jan_Mayen',
                    displayValue: 'Atlantic/Jan_Mayen',
                },
                {
                    actualValue: 'Atlantic/Madeira',
                    displayValue: 'Atlantic/Madeira',
                },
                {
                    actualValue: 'Atlantic/Reykjavik',
                    displayValue: 'Atlantic/Reykjavik',
                },
                {
                    actualValue: 'Atlantic/South_Georgia',
                    displayValue: 'Atlantic/South_Georgia',
                },
                {
                    actualValue: 'Atlantic/St_Helena',
                    displayValue: 'Atlantic/St_Helena',
                },
                {
                    actualValue: 'Atlantic/Stanley',
                    displayValue: 'Atlantic/Stanley',
                },
                {
                    actualValue: 'Australia/ACT',
                    displayValue: 'Australia/ACT',
                },
                {
                    actualValue: 'Australia/Adelaide',
                    displayValue: 'Australia/Adelaide',
                },
                {
                    actualValue: 'Australia/Brisbane',
                    displayValue: 'Australia/Brisbane',
                },
                {
                    actualValue: 'Australia/Broken_Hill',
                    displayValue: 'Australia/Broken_Hill',
                },
                {
                    actualValue: 'Australia/Canberra',
                    displayValue: 'Australia/Canberra',
                },
                {
                    actualValue: 'Australia/Currie',
                    displayValue: 'Australia/Currie',
                },
                {
                    actualValue: 'Australia/Darwin',
                    displayValue: 'Australia/Darwin',
                },
                {
                    actualValue: 'Australia/Eucla',
                    displayValue: 'Australia/Eucla',
                },
                {
                    actualValue: 'Australia/Hobart',
                    displayValue: 'Australia/Hobart',
                },
                {
                    actualValue: 'Australia/LHI',
                    displayValue: 'Australia/LHI',
                },
                {
                    actualValue: 'Australia/Lindeman',
                    displayValue: 'Australia/Lindeman',
                },
                {
                    actualValue: 'Australia/Lord_Howe',
                    displayValue: 'Australia/Lord_Howe',
                },
                {
                    actualValue: 'Australia/Melbourne',
                    displayValue: 'Australia/Melbourne',
                },
                {
                    actualValue: 'Australia/NSW',
                    displayValue: 'Australia/NSW',
                },
                {
                    actualValue: 'Australia/North',
                    displayValue: 'Australia/North',
                },
                {
                    actualValue: 'Australia/Perth',
                    displayValue: 'Australia/Perth',
                },
                {
                    actualValue: 'Australia/Queensland',
                    displayValue: 'Australia/Queensland',
                },
                {
                    actualValue: 'Australia/South',
                    displayValue: 'Australia/South',
                },
                {
                    actualValue: 'Australia/Sydney',
                    displayValue: 'Australia/Sydney',
                },
                {
                    actualValue: 'Australia/Tasmania',
                    displayValue: 'Australia/Tasmania',
                },
                {
                    actualValue: 'Australia/Victoria',
                    displayValue: 'Australia/Victoria',
                },
                {
                    actualValue: 'Australia/West',
                    displayValue: 'Australia/West',
                },
                {
                    actualValue: 'Australia/Yancowinna',
                    displayValue: 'Australia/Yancowinna',
                },
                {
                    actualValue: 'CET',
                    displayValue: 'CET',
                },
                {
                    actualValue: 'CST6CDT',
                    displayValue: 'CST6CDT',
                },
                {
                    actualValue: 'Chile/Continental',
                    displayValue: 'Chile/Continental',
                },
                {
                    actualValue: 'Chile/EasterIsland',
                    displayValue: 'Chile/EasterIsland',
                },
                {
                    actualValue: 'EET',
                    displayValue: 'EET',
                },
                {
                    actualValue: 'EST',
                    displayValue: 'EST',
                },
                {
                    actualValue: 'EST5EDT',
                    displayValue: 'EST5EDT',
                },
                {
                    actualValue: 'Europe/Amsterdam',
                    displayValue: 'Europe/Amsterdam',
                },
                {
                    actualValue: 'Europe/Andorra',
                    displayValue: 'Europe/Andorra',
                },
                {
                    actualValue: 'Europe/Athens',
                    displayValue: 'Europe/Athens',
                },
                {
                    actualValue: 'Europe/Belfast',
                    displayValue: 'Europe/Belfast',
                },
                {
                    actualValue: 'Europe/Belgrade',
                    displayValue: 'Europe/Belgrade',
                },
                {
                    actualValue: 'Europe/Berlin',
                    displayValue: 'Europe/Berlin',
                },
                {
                    actualValue: 'Europe/Bratislava',
                    displayValue: 'Europe/Bratislava',
                },
                {
                    actualValue: 'Europe/Brussels',
                    displayValue: 'Europe/Brussels',
                },
                {
                    actualValue: 'Europe/Bucharest',
                    displayValue: 'Europe/Bucharest',
                },
                {
                    actualValue: 'Europe/Budapest',
                    displayValue: 'Europe/Budapest',
                },
                {
                    actualValue: 'Europe/Busingen',
                    displayValue: 'Europe/Busingen',
                },
                {
                    actualValue: 'Europe/Chisinau',
                    displayValue: 'Europe/Chisinau',
                },
                {
                    actualValue: 'Europe/Copenhagen',
                    displayValue: 'Europe/Copenhagen',
                },
                {
                    actualValue: 'Europe/Dublin',
                    displayValue: 'Europe/Dublin',
                },
                {
                    actualValue: 'Europe/Gibraltar',
                    displayValue: 'Europe/Gibraltar',
                },
                {
                    actualValue: 'Europe/Guernsey',
                    displayValue: 'Europe/Guernsey',
                },
                {
                    actualValue: 'Europe/Helsinki',
                    displayValue: 'Europe/Helsinki',
                },
                {
                    actualValue: 'Europe/Isle_of_Man',
                    displayValue: 'Europe/Isle_of_Man',
                },
                {
                    actualValue: 'Europe/Istanbul',
                    displayValue: 'Europe/Istanbul',
                },
                {
                    actualValue: 'Europe/Jersey',
                    displayValue: 'Europe/Jersey',
                },
                {
                    actualValue: 'Europe/Kaliningrad',
                    displayValue: 'Europe/Kaliningrad',
                },
                {
                    actualValue: 'Europe/Kiev',
                    displayValue: 'Europe/Kiev',
                },
                {
                    actualValue: 'Europe/Lisbon',
                    displayValue: 'Europe/Lisbon',
                },
                {
                    actualValue: 'Europe/Ljubljana',
                    displayValue: 'Europe/Ljubljana',
                },
                {
                    actualValue: 'Europe/London',
                    displayValue: 'Europe/London',
                },
                {
                    actualValue: 'Europe/Luxembourg',
                    displayValue: 'Europe/Luxembourg',
                },
                {
                    actualValue: 'Europe/Madrid',
                    displayValue: 'Europe/Madrid',
                },
                {
                    actualValue: 'Europe/Malta',
                    displayValue: 'Europe/Malta',
                },
                {
                    actualValue: 'Europe/Mariehamn',
                    displayValue: 'Europe/Mariehamn',
                },
                {
                    actualValue: 'Europe/Minsk',
                    displayValue: 'Europe/Minsk',
                },
                {
                    actualValue: 'Europe/Monaco',
                    displayValue: 'Europe/Monaco',
                },
                {
                    actualValue: 'Europe/Moscow',
                    displayValue: 'Europe/Moscow',
                },
                {
                    actualValue: 'Europe/Nicosia',
                    displayValue: 'Europe/Nicosia',
                },
                {
                    actualValue: 'Europe/Oslo',
                    displayValue: 'Europe/Oslo',
                },
                {
                    actualValue: 'Europe/Paris',
                    displayValue: 'Europe/Paris',
                },
                {
                    actualValue: 'Europe/Podgorica',
                    displayValue: 'Europe/Podgorica',
                },
                {
                    actualValue: 'Europe/Prague',
                    displayValue: 'Europe/Prague',
                },
                {
                    actualValue: 'Europe/Riga',
                    displayValue: 'Europe/Riga',
                },
                {
                    actualValue: 'Europe/Rome',
                    displayValue: 'Europe/Rome',
                },
                {
                    actualValue: 'Europe/Samara',
                    displayValue: 'Europe/Samara',
                },
                {
                    actualValue: 'Europe/San_Marino',
                    displayValue: 'Europe/San_Marino',
                },
                {
                    actualValue: 'Europe/Sarajevo',
                    displayValue: 'Europe/Sarajevo',
                },
                {
                    actualValue: 'Europe/Simferopol',
                    displayValue: 'Europe/Simferopol',
                },
                {
                    actualValue: 'Europe/Skopje',
                    displayValue: 'Europe/Skopje',
                },
                {
                    actualValue: 'Europe/Sofia',
                    displayValue: 'Europe/Sofia',
                },
                {
                    actualValue: 'Europe/Stockholm',
                    displayValue: 'Europe/Stockholm',
                },
                {
                    actualValue: 'Europe/Tallinn',
                    displayValue: 'Europe/Tallinn',
                },
                {
                    actualValue: 'Europe/Tirane',
                    displayValue: 'Europe/Tirane',
                },
                {
                    actualValue: 'Europe/Tiraspol',
                    displayValue: 'Europe/Tiraspol',
                },
                {
                    actualValue: 'Europe/Uzhgorod',
                    displayValue: 'Europe/Uzhgorod',
                },
                {
                    actualValue: 'Europe/Vaduz',
                    displayValue: 'Europe/Vaduz',
                },
                {
                    actualValue: 'Europe/Vatican',
                    displayValue: 'Europe/Vatican',
                },
                {
                    actualValue: 'Europe/Vienna',
                    displayValue: 'Europe/Vienna',
                },
                {
                    actualValue: 'Europe/Vilnius',
                    displayValue: 'Europe/Vilnius',
                },
                {
                    actualValue: 'Europe/Volgograd',
                    displayValue: 'Europe/Volgograd',
                },
                {
                    actualValue: 'Europe/Warsaw',
                    displayValue: 'Europe/Warsaw',
                },
                {
                    actualValue: 'Europe/Zagreb',
                    displayValue: 'Europe/Zagreb',
                },
                {
                    actualValue: 'Europe/Zaporozhye',
                    displayValue: 'Europe/Zaporozhye',
                },
                {
                    actualValue: 'Europe/Zurich',
                    displayValue: 'Europe/Zurich',
                },
                {
                    actualValue: 'GMT',
                    displayValue: 'GMT',
                },
                {
                    actualValue: 'HST',
                    displayValue: 'HST',
                },
                {
                    actualValue: 'Indian/Antananarivo',
                    displayValue: 'Indian/Antananarivo',
                },
                {
                    actualValue: 'Indian/Chagos',
                    displayValue: 'Indian/Chagos',
                },
                {
                    actualValue: 'Indian/Christmas',
                    displayValue: 'Indian/Christmas',
                },
                {
                    actualValue: 'Indian/Cocos',
                    displayValue: 'Indian/Cocos',
                },
                {
                    actualValue: 'Indian/Comoro',
                    displayValue: 'Indian/Comoro',
                },
                {
                    actualValue: 'Indian/Kerguelen',
                    displayValue: 'Indian/Kerguelen',
                },
                {
                    actualValue: 'Indian/Mahe',
                    displayValue: 'Indian/Mahe',
                },
                {
                    actualValue: 'Indian/Maldives',
                    displayValue: 'Indian/Maldives',
                },
                {
                    actualValue: 'Indian/Mauritius',
                    displayValue: 'Indian/Mauritius',
                },
                {
                    actualValue: 'Indian/Mayotte',
                    displayValue: 'Indian/Mayotte',
                },
                {
                    actualValue: 'Indian/Reunion',
                    displayValue: 'Indian/Reunion',
                },
                {
                    actualValue: 'MET',
                    displayValue: 'MET',
                },
                {
                    actualValue: 'MST',
                    displayValue: 'MST',
                },
                {
                    actualValue: 'MST7MDT',
                    displayValue: 'MST7MDT',
                },
                {
                    actualValue: 'Mexico/BajaNorte',
                    displayValue: 'Mexico/BajaNorte',
                },
                {
                    actualValue: 'Mexico/BajaSur',
                    displayValue: 'Mexico/BajaSur',
                },
                {
                    actualValue: 'Mexico/General',
                    displayValue: 'Mexico/General',
                },
                {
                    actualValue: 'PST8PDT',
                    displayValue: 'PST8PDT',
                },
                {
                    actualValue: 'Pacific/Apia',
                    displayValue: 'Pacific/Apia',
                },
                {
                    actualValue: 'Pacific/Auckland',
                    displayValue: 'Pacific/Auckland',
                },
                {
                    actualValue: 'Pacific/Bougainville',
                    displayValue: 'Pacific/Bougainville',
                },
                {
                    actualValue: 'Pacific/Chatham',
                    displayValue: 'Pacific/Chatham',
                },
                {
                    actualValue: 'Pacific/Chuuk',
                    displayValue: 'Pacific/Chuuk',
                },
                {
                    actualValue: 'Pacific/Easter',
                    displayValue: 'Pacific/Easter',
                },
                {
                    actualValue: 'Pacific/Efate',
                    displayValue: 'Pacific/Efate',
                },
                {
                    actualValue: 'Pacific/Enderbury',
                    displayValue: 'Pacific/Enderbury',
                },
                {
                    actualValue: 'Pacific/Fakaofo',
                    displayValue: 'Pacific/Fakaofo',
                },
                {
                    actualValue: 'Pacific/Fiji',
                    displayValue: 'Pacific/Fiji',
                },
                {
                    actualValue: 'Pacific/Funafuti',
                    displayValue: 'Pacific/Funafuti',
                },
                {
                    actualValue: 'Pacific/Galapagos',
                    displayValue: 'Pacific/Galapagos',
                },
                {
                    actualValue: 'Pacific/Gambier',
                    displayValue: 'Pacific/Gambier',
                },
                {
                    actualValue: 'Pacific/Guadalcanal',
                    displayValue: 'Pacific/Guadalcanal',
                },
                {
                    actualValue: 'Pacific/Guam',
                    displayValue: 'Pacific/Guam',
                },
                {
                    actualValue: 'Pacific/Honolulu',
                    displayValue: 'Pacific/Honolulu',
                },
                {
                    actualValue: 'Pacific/Johnston',
                    displayValue: 'Pacific/Johnston',
                },
                {
                    actualValue: 'Pacific/Kiritimati',
                    displayValue: 'Pacific/Kiritimati',
                },
                {
                    actualValue: 'Pacific/Kosrae',
                    displayValue: 'Pacific/Kosrae',
                },
                {
                    actualValue: 'Pacific/Kwajalein',
                    displayValue: 'Pacific/Kwajalein',
                },
                {
                    actualValue: 'Pacific/Majuro',
                    displayValue: 'Pacific/Majuro',
                },
                {
                    actualValue: 'Pacific/Marquesas',
                    displayValue: 'Pacific/Marquesas',
                },
                {
                    actualValue: 'Pacific/Midway',
                    displayValue: 'Pacific/Midway',
                },
                {
                    actualValue: 'Pacific/Nauru',
                    displayValue: 'Pacific/Nauru',
                },
                {
                    actualValue: 'Pacific/Niue',
                    displayValue: 'Pacific/Niue',
                },
                {
                    actualValue: 'Pacific/Norfolk',
                    displayValue: 'Pacific/Norfolk',
                },
                {
                    actualValue: 'Pacific/Noumea',
                    displayValue: 'Pacific/Noumea',
                },
                {
                    actualValue: 'Pacific/Pago_Pago',
                    displayValue: 'Pacific/Pago_Pago',
                },
                {
                    actualValue: 'Pacific/Palau',
                    displayValue: 'Pacific/Palau',
                },
                {
                    actualValue: 'Pacific/Pitcairn',
                    displayValue: 'Pacific/Pitcairn',
                },
                {
                    actualValue: 'Pacific/Pohnpei',
                    displayValue: 'Pacific/Pohnpei',
                },
                {
                    actualValue: 'Pacific/Ponape',
                    displayValue: 'Pacific/Ponape',
                },
                {
                    actualValue: 'Pacific/Port_Moresby',
                    displayValue: 'Pacific/Port_Moresby',
                },
                {
                    actualValue: 'Pacific/Rarotonga',
                    displayValue: 'Pacific/Rarotonga',
                },
                {
                    actualValue: 'Pacific/Saipan',
                    displayValue: 'Pacific/Saipan',
                },
                {
                    actualValue: 'Pacific/Samoa',
                    displayValue: 'Pacific/Samoa',
                },
                {
                    actualValue: 'Pacific/Tahiti',
                    displayValue: 'Pacific/Tahiti',
                },
                {
                    actualValue: 'Pacific/Tarawa',
                    displayValue: 'Pacific/Tarawa',
                },
                {
                    actualValue: 'Pacific/Tongatapu',
                    displayValue: 'Pacific/Tongatapu',
                },
                {
                    actualValue: 'Pacific/Truk',
                    displayValue: 'Pacific/Truk',
                },
                {
                    actualValue: 'Pacific/Wake',
                    displayValue: 'Pacific/Wake',
                },
                {
                    actualValue: 'Pacific/Wallis',
                    displayValue: 'Pacific/Wallis',
                },
                {
                    actualValue: 'Pacific/Yap',
                    displayValue: 'Pacific/Yap',
                },
                {
                    actualValue: 'US/Alaska',
                    displayValue: 'US/Alaska',
                },
                {
                    actualValue: 'US/Aleutian',
                    displayValue: 'US/Aleutian',
                },
                {
                    actualValue: 'US/Arizona',
                    displayValue: 'US/Arizona',
                },
                {
                    actualValue: 'US/Central',
                    displayValue: 'US/Central',
                },
                {
                    actualValue: 'US/East-Indiana',
                    displayValue: 'US/East-Indiana',
                },
                {
                    actualValue: 'US/Eastern',
                    displayValue: 'US/Eastern',
                },
                {
                    actualValue: 'US/Hawaii',
                    displayValue: 'US/Hawaii',
                },
                {
                    actualValue: 'US/Indiana-Starke',
                    displayValue: 'US/Indiana-Starke',
                },
                {
                    actualValue: 'US/Michigan',
                    displayValue: 'US/Michigan',
                },
                {
                    actualValue: 'US/Mountain',
                    displayValue: 'US/Mountain',
                },
                {
                    actualValue: 'US/Pacific',
                    displayValue: 'US/Pacific',
                },
                {
                    actualValue: 'US/Pacific-New',
                    displayValue: 'US/Pacific-New',
                },
                {
                    actualValue: 'US/Samoa',
                    displayValue: 'US/Samoa',
                },
                {
                    actualValue: 'UTC',
                    displayValue: 'UTC',
                },
            ],
        },
    },
    nodeSettings: {
        '127.0.17.10': {
            hostname: {
                type: 'regex',
                data: '^(?!^[0-9-])[a-zA-Z0-9-]{1,63}(?<!-)$',
            },
        },
        '127.2.36.2': {
            hostname: {
                type: 'regex',
                data: '^(?!^[0-9-])[a-zA-Z0-9-]{1,63}(?<!-)$',
            },
        },
    },
    radioSettings: {
        '127.0.17.10': {
            radio0: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
            radio1: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
            radio2: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: '22',
                            displayValue: '22 dBm',
                        },
                        {
                            actualValue: '23',
                            displayValue: '23 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
        },
        '127.2.36.2': {
            radio0: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
            radio1: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
            radio2: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: '22',
                            displayValue: '22 dBm',
                        },
                        {
                            actualValue: '23',
                            displayValue: '23 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
        },
    },
    ethernetSettings: {
        '127.0.17.10': {
            eth0: {
                ethernetLink: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mtu: {
                    type: 'int',
                    data: {
                        min: 1500,
                        max: 1868,
                    },
                },
            },
            eth1: {
                ethernetLink: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mtu: {
                    type: 'int',
                    data: {
                        min: 1500,
                        max: 1868,
                    },
                },
            },
        },
        '127.2.36.2': {
            eth0: {
                ethernetLink: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mtu: {
                    type: 'int',
                    data: {
                        min: 1500,
                        max: 1868,
                    },
                },
            },
            eth1: {
                ethernetLink: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mtu: {
                    type: 'int',
                    data: {
                        min: 1500,
                        max: 1868,
                    },
                },
            },
        },
    },
    profileSettings: {
        '127.0.17.10': {
            nbr: {
                1: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
                2: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
                3: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
            },
        },
        '127.2.36.2': {
            nbr: {
                1: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
                2: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
                3: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
            },
        },
    },
};
const errorConfigData = {
    meshSettings: {
        clusterId: 'p2uiteam2',
        managementIp: '10.240.222.224',
        managementNetmask: '255.255.0.0',
        bpduFilter: 'enable',
        country: 'HK',
        encType: 'psk2',
        encKey: 'p2wtadmin',
        e2eEnc: 'enable',
        e2eEncKey: 'p2wtadmin1234',
        globalRoamingRSSIMargin: 5,
        globalDiscoveryInterval: 1000,
        globalHeartbeatInterval: 300,
        globalHeartbeatTimeout: 5000,
        globalStaleTimeout: 30000,
        globalTimezone: 'UTC',
    },
    radioSettings: {
        '127.0.17.10': {
            radio0: {
                wirelessMode: '11AC',
                txpower: '20',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 5,
                rssiFilterLower: 255,
                rssiFilterUpper: 255,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '48',
                centralFreq: '48',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'none',
                },
                profileId: {
                    nbr: '1',
                },
            },
            radio1: {
                wirelessMode: '11AC',
                txpower: '19',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 6,
                rssiFilterLower: -91,
                rssiFilterUpper: -14,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '149',
                centralFreq: '149',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'none',
                },
                profileId: {
                    nbr: '1',
                },
            },
            radio2: {
                wirelessMode: '11AC',
                txpower: '21',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 5,
                rssiFilterLower: -85,
                rssiFilterUpper: -14,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '157',
                centralFreq: '157',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'blacklist',
                    macList: ['64:9A:12:22:40:20'],
                },
                profileId: {
                    nbr: '1',
                },
            },
        },
        '127.2.36.2': {
            radio0: {
                wirelessMode: '11AC',
                txpower: '20',
                channelBandwidth: '80',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 5,
                rssiFilterLower: 255,
                rssiFilterUpper: 255,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '40',
                centralFreq: '40',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'none',
                },
                profileId: {
                    nbr: '1',
                },
            },
            radio1: {
                wirelessMode: '11AC',
                txpower: '17',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 5,
                rssiFilterLower: 255,
                rssiFilterUpper: 255,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '36',
                centralFreq: '36',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'none',
                },
                profileId: {
                    nbr: '1',
                },
            },
            radio2: {
                wirelessMode: '11AC',
                txpower: '22',
                channelBandwidth: '20',
                rtsCts: 'disable',
                distance: 'auto',
                maxNbr: 6,
                radioFilter: 'disable',
                rssiFilterTolerance: 5,
                rssiFilterLower: -85,
                rssiFilterUpper: 255,
                mobilityDomain: 'defaultdomain',
                shortgi: 'enable',
                mcs: 'auto',
                operationMode: 'mesh',
                channel: '157',
                centralFreq: '157',
                band: '5',
                status: 'enable',
                acl: {
                    type: 'none',
                },
                profileId: {
                    nbr: '1',
                },
            },
        },
    },
    nodeSettings: {
        '127.0.17.10': {
            hostname: 'UI-224',
            acl: {},
        },
        '127.2.36.2': {
            hostname: 'UI-226',
            acl: {
                whitelist: {},
                blacklist: {
                    source: ['12:12:12:12:12:12'],
                    destination: ['12:12:12:12:12:13'],
                },
            },
        },
    },
    ethernetSettings: {
        '127.0.17.10': {
            eth0: {
                ethernetLink: 'disable',
                mtu: 1500,
            },
            eth1: {
                ethernetLink: 'enable',
                mtu: 1500,
            },
        },
        '127.2.36.2': {
            eth0: {
                ethernetLink: 'enable',
                mtu: 1500,
            },
            eth1: {
                ethernetLink: 'enable',
                mtu: 1500,
            },
        },
    },
    profileSettings: {
        '127.0.17.10': {
            nbr: {
                1: {
                    maxNbr: '17',
                },
                2: {
                    maxNbr: 'disable',
                },
                3: {
                    maxNbr: 'disable',
                },
            },
        },
        '127.2.36.2': {
            nbr: {
                1: {
                    maxNbr: 'disable',
                },
                2: {
                    maxNbr: 'disable',
                },
                3: {
                    maxNbr: 'disable',
                },
            },
        },
    },
};
const errorConfigOptions = {
    meshSettings: {
        clusterId: {
            type: 'regex',
            data: '^[0-9a-zA-Z_-]{1,16}$',
        },
        managementIp: {
            type: 'regex',
            data:
                '^(?:25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|[0-1]?\\d?\\d)){3}$',
        },
        managementNetmask: {
            type: 'regex',
            data:
                '^((1(28|92)|2(24|4[08]|5[245]))(\\.0){3}|(255\\.)(1(28|92)|2(24|4[08]|5[245]))(\\.0){2}|(255\\.){2}(1(28|92)|2(24|4[08]|5[245]))(\\.0)|(255\\.){3}(1(28|92)|2(24|4[08]|5[245])))$',
        },
        bpduFilter: {
            type: 'enum',
            data: [
                {
                    actualValue: 'enable',
                    displayValue: 'Enable',
                },
                {
                    actualValue: 'disable',
                    displayValue: 'Disable',
                },
            ],
        },
        country: {
            type: 'enum',
            data: [
                {
                    actualValue: 'AL',
                    displayValue: 'Albania',
                },
                {
                    actualValue: 'DZ',
                    displayValue: 'Algeria',
                },
                {
                    actualValue: 'AR',
                    displayValue: 'Argentina',
                },
                {
                    actualValue: 'AU',
                    displayValue: 'Australia',
                },
                {
                    actualValue: 'AT',
                    displayValue: 'Austria',
                },
                {
                    actualValue: 'AZ',
                    displayValue: 'Azerbaijan',
                },
                {
                    actualValue: 'BY',
                    displayValue: 'Belarus',
                },
                {
                    actualValue: 'BE',
                    displayValue: 'Belgium',
                },
                {
                    actualValue: 'BZ',
                    displayValue: 'Belize',
                },
                {
                    actualValue: 'BO',
                    displayValue: 'Bolivia',
                },
                {
                    actualValue: 'BR',
                    displayValue: 'Brazil',
                },
                {
                    actualValue: 'BN',
                    displayValue: 'Brunei Darussalam',
                },
                {
                    actualValue: 'BG',
                    displayValue: 'Bulgaria',
                },
                {
                    actualValue: 'CA',
                    displayValue: 'Canada',
                },
                {
                    actualValue: 'CL',
                    displayValue: 'Chile',
                },
                {
                    actualValue: 'CN',
                    displayValue: 'China',
                },
                {
                    actualValue: 'CO',
                    displayValue: 'Colombia',
                },
                {
                    actualValue: 'HR',
                    displayValue: 'Croatia',
                },
                {
                    actualValue: 'CY',
                    displayValue: 'Cyprus',
                },
                {
                    actualValue: 'CZ',
                    displayValue: 'Czech Republic',
                },
                {
                    actualValue: 'DB',
                    displayValue: 'Debug',
                },
                {
                    actualValue: 'DK',
                    displayValue: 'Denmark',
                },
                {
                    actualValue: 'DO',
                    displayValue: 'Dominican Republic',
                },
                {
                    actualValue: 'EE',
                    displayValue: 'Estonia',
                },
                {
                    actualValue: 'FI',
                    displayValue: 'Finland',
                },
                {
                    actualValue: 'FR',
                    displayValue: 'France',
                },
                {
                    actualValue: 'GE',
                    displayValue: 'Georgia',
                },
                {
                    actualValue: 'DE',
                    displayValue: 'Germany',
                },
                {
                    actualValue: 'GR',
                    displayValue: 'Greece',
                },
                {
                    actualValue: 'GT',
                    displayValue: 'Guatemala',
                },
                {
                    actualValue: 'HN',
                    displayValue: 'Honduras',
                },
                {
                    actualValue: 'HK',
                    displayValue: 'Hong Kong SAR',
                },
                {
                    actualValue: 'HU',
                    displayValue: 'Hungary',
                },
                {
                    actualValue: 'IS',
                    displayValue: 'Iceland',
                },
                {
                    actualValue: 'IN',
                    displayValue: 'India',
                },
                {
                    actualValue: 'ID',
                    displayValue: 'Indonesia',
                },
                {
                    actualValue: 'IR',
                    displayValue: 'Iran',
                },
                {
                    actualValue: 'IE',
                    displayValue: 'Ireland',
                },
                {
                    actualValue: 'IL',
                    displayValue: 'Israel',
                },
                {
                    actualValue: 'IT',
                    displayValue: 'Italy',
                },
                {
                    actualValue: 'JM',
                    displayValue: 'Jamaica',
                },
                {
                    actualValue: 'JP',
                    displayValue: 'Japan',
                },
                {
                    actualValue: 'JO',
                    displayValue: 'Jordan',
                },
                {
                    actualValue: 'KE',
                    displayValue: 'Kenya',
                },
                {
                    actualValue: 'KR',
                    displayValue: 'Korea Republic',
                },
                {
                    actualValue: 'KW',
                    displayValue: 'Kuwait',
                },
                {
                    actualValue: 'LV',
                    displayValue: 'Latvia',
                },
                {
                    actualValue: 'LB',
                    displayValue: 'Lebanon',
                },
                {
                    actualValue: 'LI',
                    displayValue: 'Liechtenstein',
                },
                {
                    actualValue: 'LT',
                    displayValue: 'Lithuania',
                },
                {
                    actualValue: 'LU',
                    displayValue: 'Luxembourg',
                },
                {
                    actualValue: 'MO',
                    displayValue: 'Macau SAR',
                },
                {
                    actualValue: 'MK',
                    displayValue: 'Macedonia',
                },
                {
                    actualValue: 'MY',
                    displayValue: 'Malaysia',
                },
                {
                    actualValue: 'MX',
                    displayValue: 'Mexico',
                },
                {
                    actualValue: 'MC',
                    displayValue: 'Monaco',
                },
                {
                    actualValue: 'MA',
                    displayValue: 'Morocco',
                },
                {
                    actualValue: 'NL',
                    displayValue: 'Netherlands',
                },
                {
                    actualValue: 'NZ',
                    displayValue: 'New Zealand',
                },
                {
                    actualValue: 'NI',
                    displayValue: 'Nicaragua',
                },
                {
                    actualValue: 'NO',
                    displayValue: 'Norway',
                },
                {
                    actualValue: 'OM',
                    displayValue: 'Oman',
                },
                {
                    actualValue: 'PK',
                    displayValue: 'Pakistan',
                },
                {
                    actualValue: 'PA',
                    displayValue: 'Panama',
                },
                {
                    actualValue: 'PY',
                    displayValue: 'Paraguay',
                },
                {
                    actualValue: 'PE',
                    displayValue: 'Peru',
                },
                {
                    actualValue: 'PH',
                    displayValue: 'Philippines',
                },
                {
                    actualValue: 'PL',
                    displayValue: 'Poland',
                },
                {
                    actualValue: 'PT',
                    displayValue: 'Portugal',
                },
                {
                    actualValue: 'PR',
                    displayValue: 'Puerto Rico',
                },
                {
                    actualValue: 'QA',
                    displayValue: 'Qatar',
                },
                {
                    actualValue: 'RO',
                    displayValue: 'Romania',
                },
                {
                    actualValue: 'RU',
                    displayValue: 'Russia',
                },
                {
                    actualValue: 'SA',
                    displayValue: 'Saudi Arabia',
                },
                {
                    actualValue: 'SG',
                    displayValue: 'Singapore',
                },
                {
                    actualValue: 'SK',
                    displayValue: 'Slovakia',
                },
                {
                    actualValue: 'SI',
                    displayValue: 'Slovenia',
                },
                {
                    actualValue: 'ZA',
                    displayValue: 'South Africa',
                },
                {
                    actualValue: 'ES',
                    displayValue: 'Spain',
                },
                {
                    actualValue: 'SE',
                    displayValue: 'Sweden',
                },
                {
                    actualValue: 'CH',
                    displayValue: 'Switzerland',
                },
                {
                    actualValue: 'TW',
                    displayValue: 'Taiwan',
                },
                {
                    actualValue: 'TH',
                    displayValue: 'Thailand',
                },
                {
                    actualValue: 'TT',
                    displayValue: 'Trinidad And Tobago',
                },
                {
                    actualValue: 'TN',
                    displayValue: 'Tunisia',
                },
                {
                    actualValue: 'TR',
                    displayValue: 'Turkey',
                },
                {
                    actualValue: 'AE',
                    displayValue: 'United Arab Emirates',
                },
                {
                    actualValue: 'GB',
                    displayValue: 'United Kingdom',
                },
                {
                    actualValue: 'US',
                    displayValue: 'United States',
                },
                {
                    actualValue: 'UY',
                    displayValue: 'Uruguay',
                },
                {
                    actualValue: 'UZ',
                    displayValue: 'Uzbekistan',
                },
                {
                    actualValue: 'VE',
                    displayValue: 'Venezuela',
                },
                {
                    actualValue: 'VN',
                    displayValue: 'Vietnam',
                },
                {
                    actualValue: 'ZW',
                    displayValue: 'Zimbabwe',
                },
            ],
        },
        encKey: {
            type: 'regex',
            data: '^[0-9a-zA-Z_-]{8,16}$',
        },
        e2eEnc: {
            type: 'enum',
            data: [
                {
                    actualValue: 'enable',
                    displayValue: 'Enable',
                },
                {
                    actualValue: 'disable',
                    displayValue: 'Disable',
                },
            ],
        },
        e2eEncKey: {
            type: 'regex',
            data: '^[0-9a-zA-Z_-]{8,32}$',
        },
        globalRoamingRSSIMargin: {
            type: 'int',
            data: {
                min: 0,
                max: 50,
            },
        },
        globalDiscoveryInterval: {
            type: 'int',
            data: {
                min: 100,
                max: 1024000,
            },
        },
        globalHeartbeatInterval: {
            type: 'int',
            data: {
                min: 100,
                max: 1000,
            },
        },
        globalHeartbeatTimeout: {
            type: 'int',
            data: {
                min: 500,
                max: 5000,
            },
        },
        globalStaleTimeout: {
            type: 'int',
            data: {
                min: 100,
                max: 1024000,
            },
        },
        globalTimezone: {
            type: 'enum',
            data: [
                {
                    actualValue: 'Africa/Abidjan',
                    displayValue: 'Africa/Abidjan',
                },
                {
                    actualValue: 'Africa/Accra',
                    displayValue: 'Africa/Accra',
                },
                {
                    actualValue: 'Africa/Addis_Ababa',
                    displayValue: 'Africa/Addis_Ababa',
                },
                {
                    actualValue: 'Africa/Algiers',
                    displayValue: 'Africa/Algiers',
                },
                {
                    actualValue: 'Africa/Asmara',
                    displayValue: 'Africa/Asmara',
                },
                {
                    actualValue: 'Africa/Asmera',
                    displayValue: 'Africa/Asmera',
                },
                {
                    actualValue: 'Africa/Bamako',
                    displayValue: 'Africa/Bamako',
                },
                {
                    actualValue: 'Africa/Bangui',
                    displayValue: 'Africa/Bangui',
                },
                {
                    actualValue: 'Africa/Banjul',
                    displayValue: 'Africa/Banjul',
                },
                {
                    actualValue: 'Africa/Bissau',
                    displayValue: 'Africa/Bissau',
                },
                {
                    actualValue: 'Africa/Blantyre',
                    displayValue: 'Africa/Blantyre',
                },
                {
                    actualValue: 'Africa/Brazzaville',
                    displayValue: 'Africa/Brazzaville',
                },
                {
                    actualValue: 'Africa/Bujumbura',
                    displayValue: 'Africa/Bujumbura',
                },
                {
                    actualValue: 'Africa/Cairo',
                    displayValue: 'Africa/Cairo',
                },
                {
                    actualValue: 'Africa/Casablanca',
                    displayValue: 'Africa/Casablanca',
                },
                {
                    actualValue: 'Africa/Ceuta',
                    displayValue: 'Africa/Ceuta',
                },
                {
                    actualValue: 'Africa/Conakry',
                    displayValue: 'Africa/Conakry',
                },
                {
                    actualValue: 'Africa/Dakar',
                    displayValue: 'Africa/Dakar',
                },
                {
                    actualValue: 'Africa/Dar_es_Salaam',
                    displayValue: 'Africa/Dar_es_Salaam',
                },
                {
                    actualValue: 'Africa/Djibouti',
                    displayValue: 'Africa/Djibouti',
                },
                {
                    actualValue: 'Africa/Douala',
                    displayValue: 'Africa/Douala',
                },
                {
                    actualValue: 'Africa/El_Aaiun',
                    displayValue: 'Africa/El_Aaiun',
                },
                {
                    actualValue: 'Africa/Freetown',
                    displayValue: 'Africa/Freetown',
                },
                {
                    actualValue: 'Africa/Gaborone',
                    displayValue: 'Africa/Gaborone',
                },
                {
                    actualValue: 'Africa/Harare',
                    displayValue: 'Africa/Harare',
                },
                {
                    actualValue: 'Africa/Johannesburg',
                    displayValue: 'Africa/Johannesburg',
                },
                {
                    actualValue: 'Africa/Juba',
                    displayValue: 'Africa/Juba',
                },
                {
                    actualValue: 'Africa/Kampala',
                    displayValue: 'Africa/Kampala',
                },
                {
                    actualValue: 'Africa/Khartoum',
                    displayValue: 'Africa/Khartoum',
                },
                {
                    actualValue: 'Africa/Kigali',
                    displayValue: 'Africa/Kigali',
                },
                {
                    actualValue: 'Africa/Kinshasa',
                    displayValue: 'Africa/Kinshasa',
                },
                {
                    actualValue: 'Africa/Lagos',
                    displayValue: 'Africa/Lagos',
                },
                {
                    actualValue: 'Africa/Libreville',
                    displayValue: 'Africa/Libreville',
                },
                {
                    actualValue: 'Africa/Lome',
                    displayValue: 'Africa/Lome',
                },
                {
                    actualValue: 'Africa/Luanda',
                    displayValue: 'Africa/Luanda',
                },
                {
                    actualValue: 'Africa/Lubumbashi',
                    displayValue: 'Africa/Lubumbashi',
                },
                {
                    actualValue: 'Africa/Lusaka',
                    displayValue: 'Africa/Lusaka',
                },
                {
                    actualValue: 'Africa/Malabo',
                    displayValue: 'Africa/Malabo',
                },
                {
                    actualValue: 'Africa/Maputo',
                    displayValue: 'Africa/Maputo',
                },
                {
                    actualValue: 'Africa/Maseru',
                    displayValue: 'Africa/Maseru',
                },
                {
                    actualValue: 'Africa/Mbabane',
                    displayValue: 'Africa/Mbabane',
                },
                {
                    actualValue: 'Africa/Mogadishu',
                    displayValue: 'Africa/Mogadishu',
                },
                {
                    actualValue: 'Africa/Monrovia',
                    displayValue: 'Africa/Monrovia',
                },
                {
                    actualValue: 'Africa/Nairobi',
                    displayValue: 'Africa/Nairobi',
                },
                {
                    actualValue: 'Africa/Ndjamena',
                    displayValue: 'Africa/Ndjamena',
                },
                {
                    actualValue: 'Africa/Niamey',
                    displayValue: 'Africa/Niamey',
                },
                {
                    actualValue: 'Africa/Nouakchott',
                    displayValue: 'Africa/Nouakchott',
                },
                {
                    actualValue: 'Africa/Ouagadougou',
                    displayValue: 'Africa/Ouagadougou',
                },
                {
                    actualValue: 'Africa/Porto-Novo',
                    displayValue: 'Africa/Porto-Novo',
                },
                {
                    actualValue: 'Africa/Sao_Tome',
                    displayValue: 'Africa/Sao_Tome',
                },
                {
                    actualValue: 'Africa/Timbuktu',
                    displayValue: 'Africa/Timbuktu',
                },
                {
                    actualValue: 'Africa/Tripoli',
                    displayValue: 'Africa/Tripoli',
                },
                {
                    actualValue: 'Africa/Tunis',
                    displayValue: 'Africa/Tunis',
                },
                {
                    actualValue: 'Africa/Windhoek',
                    displayValue: 'Africa/Windhoek',
                },
                {
                    actualValue: 'America/Adak',
                    displayValue: 'America/Adak',
                },
                {
                    actualValue: 'America/Anchorage',
                    displayValue: 'America/Anchorage',
                },
                {
                    actualValue: 'America/Anguilla',
                    displayValue: 'America/Anguilla',
                },
                {
                    actualValue: 'America/Antigua',
                    displayValue: 'America/Antigua',
                },
                {
                    actualValue: 'America/Araguaina',
                    displayValue: 'America/Araguaina',
                },
                {
                    actualValue: 'America/Argentina',
                    displayValue: 'America/Argentina',
                },
                {
                    actualValue: 'America/Argentina/Buenos_Aires',
                    displayValue: 'America/Argentina/Buenos_Aires',
                },
                {
                    actualValue: 'America/Argentina/Catamarca',
                    displayValue: 'America/Argentina/Catamarca',
                },
                {
                    actualValue: 'America/Argentina/ComodRivadavia',
                    displayValue: 'America/Argentina/ComodRivadavia',
                },
                {
                    actualValue: 'America/Argentina/Cordoba',
                    displayValue: 'America/Argentina/Cordoba',
                },
                {
                    actualValue: 'America/Argentina/Jujuy',
                    displayValue: 'America/Argentina/Jujuy',
                },
                {
                    actualValue: 'America/Argentina/La_Rioja',
                    displayValue: 'America/Argentina/La_Rioja',
                },
                {
                    actualValue: 'America/Argentina/Mendoza',
                    displayValue: 'America/Argentina/Mendoza',
                },
                {
                    actualValue: 'America/Argentina/Rio_Gallegos',
                    displayValue: 'America/Argentina/Rio_Gallegos',
                },
                {
                    actualValue: 'America/Argentina/Salta',
                    displayValue: 'America/Argentina/Salta',
                },
                {
                    actualValue: 'America/Argentina/San_Juan',
                    displayValue: 'America/Argentina/San_Juan',
                },
                {
                    actualValue: 'America/Argentina/San_Luis',
                    displayValue: 'America/Argentina/San_Luis',
                },
                {
                    actualValue: 'America/Argentina/Tucuman',
                    displayValue: 'America/Argentina/Tucuman',
                },
                {
                    actualValue: 'America/Argentina/Ushuaia',
                    displayValue: 'America/Argentina/Ushuaia',
                },
                {
                    actualValue: 'America/Aruba',
                    displayValue: 'America/Aruba',
                },
                {
                    actualValue: 'America/Asuncion',
                    displayValue: 'America/Asuncion',
                },
                {
                    actualValue: 'America/Atikokan',
                    displayValue: 'America/Atikokan',
                },
                {
                    actualValue: 'America/Atka',
                    displayValue: 'America/Atka',
                },
                {
                    actualValue: 'America/Bahia',
                    displayValue: 'America/Bahia',
                },
                {
                    actualValue: 'America/Bahia_Banderas',
                    displayValue: 'America/Bahia_Banderas',
                },
                {
                    actualValue: 'America/Barbados',
                    displayValue: 'America/Barbados',
                },
                {
                    actualValue: 'America/Belem',
                    displayValue: 'America/Belem',
                },
                {
                    actualValue: 'America/Belize',
                    displayValue: 'America/Belize',
                },
                {
                    actualValue: 'America/Blanc-Sablon',
                    displayValue: 'America/Blanc-Sablon',
                },
                {
                    actualValue: 'America/Boa_Vista',
                    displayValue: 'America/Boa_Vista',
                },
                {
                    actualValue: 'America/Bogota',
                    displayValue: 'America/Bogota',
                },
                {
                    actualValue: 'America/Boise',
                    displayValue: 'America/Boise',
                },
                {
                    actualValue: 'America/Buenos_Aires',
                    displayValue: 'America/Buenos_Aires',
                },
                {
                    actualValue: 'America/Cambridge_Bay',
                    displayValue: 'America/Cambridge_Bay',
                },
                {
                    actualValue: 'America/Campo_Grande',
                    displayValue: 'America/Campo_Grande',
                },
                {
                    actualValue: 'America/Cancun',
                    displayValue: 'America/Cancun',
                },
                {
                    actualValue: 'America/Caracas',
                    displayValue: 'America/Caracas',
                },
                {
                    actualValue: 'America/Catamarca',
                    displayValue: 'America/Catamarca',
                },
                {
                    actualValue: 'America/Cayenne',
                    displayValue: 'America/Cayenne',
                },
                {
                    actualValue: 'America/Cayman',
                    displayValue: 'America/Cayman',
                },
                {
                    actualValue: 'America/Chicago',
                    displayValue: 'America/Chicago',
                },
                {
                    actualValue: 'America/Chihuahua',
                    displayValue: 'America/Chihuahua',
                },
                {
                    actualValue: 'America/Coral_Harbour',
                    displayValue: 'America/Coral_Harbour',
                },
                {
                    actualValue: 'America/Cordoba',
                    displayValue: 'America/Cordoba',
                },
                {
                    actualValue: 'America/Costa_Rica',
                    displayValue: 'America/Costa_Rica',
                },
                {
                    actualValue: 'America/Creston',
                    displayValue: 'America/Creston',
                },
                {
                    actualValue: 'America/Cuiaba',
                    displayValue: 'America/Cuiaba',
                },
                {
                    actualValue: 'America/Curacao',
                    displayValue: 'America/Curacao',
                },
                {
                    actualValue: 'America/Danmarkshavn',
                    displayValue: 'America/Danmarkshavn',
                },
                {
                    actualValue: 'America/Dawson',
                    displayValue: 'America/Dawson',
                },
                {
                    actualValue: 'America/Dawson_Creek',
                    displayValue: 'America/Dawson_Creek',
                },
                {
                    actualValue: 'America/Denver',
                    displayValue: 'America/Denver',
                },
                {
                    actualValue: 'America/Detroit',
                    displayValue: 'America/Detroit',
                },
                {
                    actualValue: 'America/Dominica',
                    displayValue: 'America/Dominica',
                },
                {
                    actualValue: 'America/Edmonton',
                    displayValue: 'America/Edmonton',
                },
                {
                    actualValue: 'America/Eirunepe',
                    displayValue: 'America/Eirunepe',
                },
                {
                    actualValue: 'America/El_Salvador',
                    displayValue: 'America/El_Salvador',
                },
                {
                    actualValue: 'America/Ensenada',
                    displayValue: 'America/Ensenada',
                },
                {
                    actualValue: 'America/Fort_Wayne',
                    displayValue: 'America/Fort_Wayne',
                },
                {
                    actualValue: 'America/Fortaleza',
                    displayValue: 'America/Fortaleza',
                },
                {
                    actualValue: 'America/Glace_Bay',
                    displayValue: 'America/Glace_Bay',
                },
                {
                    actualValue: 'America/Godthab',
                    displayValue: 'America/Godthab',
                },
                {
                    actualValue: 'America/Goose_Bay',
                    displayValue: 'America/Goose_Bay',
                },
                {
                    actualValue: 'America/Grand_Turk',
                    displayValue: 'America/Grand_Turk',
                },
                {
                    actualValue: 'America/Grenada',
                    displayValue: 'America/Grenada',
                },
                {
                    actualValue: 'America/Guadeloupe',
                    displayValue: 'America/Guadeloupe',
                },
                {
                    actualValue: 'America/Guatemala',
                    displayValue: 'America/Guatemala',
                },
                {
                    actualValue: 'America/Guayaquil',
                    displayValue: 'America/Guayaquil',
                },
                {
                    actualValue: 'America/Guyana',
                    displayValue: 'America/Guyana',
                },
                {
                    actualValue: 'America/Halifax',
                    displayValue: 'America/Halifax',
                },
                {
                    actualValue: 'America/Havana',
                    displayValue: 'America/Havana',
                },
                {
                    actualValue: 'America/Hermosillo',
                    displayValue: 'America/Hermosillo',
                },
                {
                    actualValue: 'America/Indiana',
                    displayValue: 'America/Indiana',
                },
                {
                    actualValue: 'America/Indiana/Indianapolis',
                    displayValue: 'America/Indiana/Indianapolis',
                },
                {
                    actualValue: 'America/Indiana/Knox',
                    displayValue: 'America/Indiana/Knox',
                },
                {
                    actualValue: 'America/Indiana/Marengo',
                    displayValue: 'America/Indiana/Marengo',
                },
                {
                    actualValue: 'America/Indiana/Petersburg',
                    displayValue: 'America/Indiana/Petersburg',
                },
                {
                    actualValue: 'America/Indiana/Tell_City',
                    displayValue: 'America/Indiana/Tell_City',
                },
                {
                    actualValue: 'America/Indiana/Vevay',
                    displayValue: 'America/Indiana/Vevay',
                },
                {
                    actualValue: 'America/Indiana/Vincennes',
                    displayValue: 'America/Indiana/Vincennes',
                },
                {
                    actualValue: 'America/Indiana/Winamac',
                    displayValue: 'America/Indiana/Winamac',
                },
                {
                    actualValue: 'America/Indianapolis',
                    displayValue: 'America/Indianapolis',
                },
                {
                    actualValue: 'America/Inuvik',
                    displayValue: 'America/Inuvik',
                },
                {
                    actualValue: 'America/Iqaluit',
                    displayValue: 'America/Iqaluit',
                },
                {
                    actualValue: 'America/Jamaica',
                    displayValue: 'America/Jamaica',
                },
                {
                    actualValue: 'America/Jujuy',
                    displayValue: 'America/Jujuy',
                },
                {
                    actualValue: 'America/Juneau',
                    displayValue: 'America/Juneau',
                },
                {
                    actualValue: 'America/Kentucky',
                    displayValue: 'America/Kentucky',
                },
                {
                    actualValue: 'America/Kentucky/Louisville',
                    displayValue: 'America/Kentucky/Louisville',
                },
                {
                    actualValue: 'America/Kentucky/Monticello',
                    displayValue: 'America/Kentucky/Monticello',
                },
                {
                    actualValue: 'America/Knox_IN',
                    displayValue: 'America/Knox_IN',
                },
                {
                    actualValue: 'America/Kralendijk',
                    displayValue: 'America/Kralendijk',
                },
                {
                    actualValue: 'America/La_Paz',
                    displayValue: 'America/La_Paz',
                },
                {
                    actualValue: 'America/Lima',
                    displayValue: 'America/Lima',
                },
                {
                    actualValue: 'America/Los_Angeles',
                    displayValue: 'America/Los_Angeles',
                },
                {
                    actualValue: 'America/Louisville',
                    displayValue: 'America/Louisville',
                },
                {
                    actualValue: 'America/Lower_Princes',
                    displayValue: 'America/Lower_Princes',
                },
                {
                    actualValue: 'America/Maceio',
                    displayValue: 'America/Maceio',
                },
                {
                    actualValue: 'America/Managua',
                    displayValue: 'America/Managua',
                },
                {
                    actualValue: 'America/Manaus',
                    displayValue: 'America/Manaus',
                },
                {
                    actualValue: 'America/Marigot',
                    displayValue: 'America/Marigot',
                },
                {
                    actualValue: 'America/Martinique',
                    displayValue: 'America/Martinique',
                },
                {
                    actualValue: 'America/Matamoros',
                    displayValue: 'America/Matamoros',
                },
                {
                    actualValue: 'America/Mazatlan',
                    displayValue: 'America/Mazatlan',
                },
                {
                    actualValue: 'America/Mendoza',
                    displayValue: 'America/Mendoza',
                },
                {
                    actualValue: 'America/Menominee',
                    displayValue: 'America/Menominee',
                },
                {
                    actualValue: 'America/Merida',
                    displayValue: 'America/Merida',
                },
                {
                    actualValue: 'America/Metlakatla',
                    displayValue: 'America/Metlakatla',
                },
                {
                    actualValue: 'America/Mexico_City',
                    displayValue: 'America/Mexico_City',
                },
                {
                    actualValue: 'America/Miquelon',
                    displayValue: 'America/Miquelon',
                },
                {
                    actualValue: 'America/Moncton',
                    displayValue: 'America/Moncton',
                },
                {
                    actualValue: 'America/Monterrey',
                    displayValue: 'America/Monterrey',
                },
                {
                    actualValue: 'America/Montevideo',
                    displayValue: 'America/Montevideo',
                },
                {
                    actualValue: 'America/Montreal',
                    displayValue: 'America/Montreal',
                },
                {
                    actualValue: 'America/Montserrat',
                    displayValue: 'America/Montserrat',
                },
                {
                    actualValue: 'America/Nassau',
                    displayValue: 'America/Nassau',
                },
                {
                    actualValue: 'America/New_York',
                    displayValue: 'America/New_York',
                },
                {
                    actualValue: 'America/Nipigon',
                    displayValue: 'America/Nipigon',
                },
                {
                    actualValue: 'America/Nome',
                    displayValue: 'America/Nome',
                },
                {
                    actualValue: 'America/Noronha',
                    displayValue: 'America/Noronha',
                },
                {
                    actualValue: 'America/North_Dakota',
                    displayValue: 'America/North_Dakota',
                },
                {
                    actualValue: 'America/North_Dakota/Beulah',
                    displayValue: 'America/North_Dakota/Beulah',
                },
                {
                    actualValue: 'America/North_Dakota/Center',
                    displayValue: 'America/North_Dakota/Center',
                },
                {
                    actualValue: 'America/North_Dakota/New_Salem',
                    displayValue: 'America/North_Dakota/New_Salem',
                },
                {
                    actualValue: 'America/Ojinaga',
                    displayValue: 'America/Ojinaga',
                },
                {
                    actualValue: 'America/Panama',
                    displayValue: 'America/Panama',
                },
                {
                    actualValue: 'America/Pangnirtung',
                    displayValue: 'America/Pangnirtung',
                },
                {
                    actualValue: 'America/Paramaribo',
                    displayValue: 'America/Paramaribo',
                },
                {
                    actualValue: 'America/Phoenix',
                    displayValue: 'America/Phoenix',
                },
                {
                    actualValue: 'America/Port-au-Prince',
                    displayValue: 'America/Port-au-Prince',
                },
                {
                    actualValue: 'America/Port_of_Spain',
                    displayValue: 'America/Port_of_Spain',
                },
                {
                    actualValue: 'America/Porto_Acre',
                    displayValue: 'America/Porto_Acre',
                },
                {
                    actualValue: 'America/Porto_Velho',
                    displayValue: 'America/Porto_Velho',
                },
                {
                    actualValue: 'America/Puerto_Rico',
                    displayValue: 'America/Puerto_Rico',
                },
                {
                    actualValue: 'America/Rainy_River',
                    displayValue: 'America/Rainy_River',
                },
                {
                    actualValue: 'America/Rankin_Inlet',
                    displayValue: 'America/Rankin_Inlet',
                },
                {
                    actualValue: 'America/Recife',
                    displayValue: 'America/Recife',
                },
                {
                    actualValue: 'America/Regina',
                    displayValue: 'America/Regina',
                },
                {
                    actualValue: 'America/Resolute',
                    displayValue: 'America/Resolute',
                },
                {
                    actualValue: 'America/Rio_Branco',
                    displayValue: 'America/Rio_Branco',
                },
                {
                    actualValue: 'America/Rosario',
                    displayValue: 'America/Rosario',
                },
                {
                    actualValue: 'America/Santa_Isabel',
                    displayValue: 'America/Santa_Isabel',
                },
                {
                    actualValue: 'America/Santarem',
                    displayValue: 'America/Santarem',
                },
                {
                    actualValue: 'America/Santiago',
                    displayValue: 'America/Santiago',
                },
                {
                    actualValue: 'America/Santo_Domingo',
                    displayValue: 'America/Santo_Domingo',
                },
                {
                    actualValue: 'America/Sao_Paulo',
                    displayValue: 'America/Sao_Paulo',
                },
                {
                    actualValue: 'America/Scoresbysund',
                    displayValue: 'America/Scoresbysund',
                },
                {
                    actualValue: 'America/Shiprock',
                    displayValue: 'America/Shiprock',
                },
                {
                    actualValue: 'America/Sitka',
                    displayValue: 'America/Sitka',
                },
                {
                    actualValue: 'America/St_Barthelemy',
                    displayValue: 'America/St_Barthelemy',
                },
                {
                    actualValue: 'America/St_Johns',
                    displayValue: 'America/St_Johns',
                },
                {
                    actualValue: 'America/St_Kitts',
                    displayValue: 'America/St_Kitts',
                },
                {
                    actualValue: 'America/St_Lucia',
                    displayValue: 'America/St_Lucia',
                },
                {
                    actualValue: 'America/St_Thomas',
                    displayValue: 'America/St_Thomas',
                },
                {
                    actualValue: 'America/St_Vincent',
                    displayValue: 'America/St_Vincent',
                },
                {
                    actualValue: 'America/Swift_Current',
                    displayValue: 'America/Swift_Current',
                },
                {
                    actualValue: 'America/Tegucigalpa',
                    displayValue: 'America/Tegucigalpa',
                },
                {
                    actualValue: 'America/Thule',
                    displayValue: 'America/Thule',
                },
                {
                    actualValue: 'America/Thunder_Bay',
                    displayValue: 'America/Thunder_Bay',
                },
                {
                    actualValue: 'America/Tijuana',
                    displayValue: 'America/Tijuana',
                },
                {
                    actualValue: 'America/Toronto',
                    displayValue: 'America/Toronto',
                },
                {
                    actualValue: 'America/Tortola',
                    displayValue: 'America/Tortola',
                },
                {
                    actualValue: 'America/Vancouver',
                    displayValue: 'America/Vancouver',
                },
                {
                    actualValue: 'America/Virgin',
                    displayValue: 'America/Virgin',
                },
                {
                    actualValue: 'America/Whitehorse',
                    displayValue: 'America/Whitehorse',
                },
                {
                    actualValue: 'America/Winnipeg',
                    displayValue: 'America/Winnipeg',
                },
                {
                    actualValue: 'America/Yakutat',
                    displayValue: 'America/Yakutat',
                },
                {
                    actualValue: 'America/Yellowknife',
                    displayValue: 'America/Yellowknife',
                },
                {
                    actualValue: 'Antarctica/Casey',
                    displayValue: 'Antarctica/Casey',
                },
                {
                    actualValue: 'Antarctica/Davis',
                    displayValue: 'Antarctica/Davis',
                },
                {
                    actualValue: 'Antarctica/DumontDUrville',
                    displayValue: 'Antarctica/DumontDUrville',
                },
                {
                    actualValue: 'Antarctica/Macquarie',
                    displayValue: 'Antarctica/Macquarie',
                },
                {
                    actualValue: 'Antarctica/Mawson',
                    displayValue: 'Antarctica/Mawson',
                },
                {
                    actualValue: 'Antarctica/McMurdo',
                    displayValue: 'Antarctica/McMurdo',
                },
                {
                    actualValue: 'Antarctica/Palmer',
                    displayValue: 'Antarctica/Palmer',
                },
                {
                    actualValue: 'Antarctica/Rothera',
                    displayValue: 'Antarctica/Rothera',
                },
                {
                    actualValue: 'Antarctica/South_Pole',
                    displayValue: 'Antarctica/South_Pole',
                },
                {
                    actualValue: 'Antarctica/Syowa',
                    displayValue: 'Antarctica/Syowa',
                },
                {
                    actualValue: 'Antarctica/Troll',
                    displayValue: 'Antarctica/Troll',
                },
                {
                    actualValue: 'Antarctica/Vostok',
                    displayValue: 'Antarctica/Vostok',
                },
                {
                    actualValue: 'Arctic/Longyearbyen',
                    displayValue: 'Arctic/Longyearbyen',
                },
                {
                    actualValue: 'Asia/Aden',
                    displayValue: 'Asia/Aden',
                },
                {
                    actualValue: 'Asia/Almaty',
                    displayValue: 'Asia/Almaty',
                },
                {
                    actualValue: 'Asia/Amman',
                    displayValue: 'Asia/Amman',
                },
                {
                    actualValue: 'Asia/Anadyr',
                    displayValue: 'Asia/Anadyr',
                },
                {
                    actualValue: 'Asia/Aqtau',
                    displayValue: 'Asia/Aqtau',
                },
                {
                    actualValue: 'Asia/Aqtobe',
                    displayValue: 'Asia/Aqtobe',
                },
                {
                    actualValue: 'Asia/Ashgabat',
                    displayValue: 'Asia/Ashgabat',
                },
                {
                    actualValue: 'Asia/Ashkhabad',
                    displayValue: 'Asia/Ashkhabad',
                },
                {
                    actualValue: 'Asia/Baghdad',
                    displayValue: 'Asia/Baghdad',
                },
                {
                    actualValue: 'Asia/Bahrain',
                    displayValue: 'Asia/Bahrain',
                },
                {
                    actualValue: 'Asia/Baku',
                    displayValue: 'Asia/Baku',
                },
                {
                    actualValue: 'Asia/Bangkok',
                    displayValue: 'Asia/Bangkok',
                },
                {
                    actualValue: 'Asia/Beirut',
                    displayValue: 'Asia/Beirut',
                },
                {
                    actualValue: 'Asia/Bishkek',
                    displayValue: 'Asia/Bishkek',
                },
                {
                    actualValue: 'Asia/Brunei',
                    displayValue: 'Asia/Brunei',
                },
                {
                    actualValue: 'Asia/Calcutta',
                    displayValue: 'Asia/Calcutta',
                },
                {
                    actualValue: 'Asia/Chita',
                    displayValue: 'Asia/Chita',
                },
                {
                    actualValue: 'Asia/Choibalsan',
                    displayValue: 'Asia/Choibalsan',
                },
                {
                    actualValue: 'Asia/Chongqing',
                    displayValue: 'Asia/Chongqing',
                },
                {
                    actualValue: 'Asia/Chungking',
                    displayValue: 'Asia/Chungking',
                },
                {
                    actualValue: 'Asia/Colombo',
                    displayValue: 'Asia/Colombo',
                },
                {
                    actualValue: 'Asia/Dacca',
                    displayValue: 'Asia/Dacca',
                },
                {
                    actualValue: 'Asia/Damascus',
                    displayValue: 'Asia/Damascus',
                },
                {
                    actualValue: 'Asia/Dhaka',
                    displayValue: 'Asia/Dhaka',
                },
                {
                    actualValue: 'Asia/Dili',
                    displayValue: 'Asia/Dili',
                },
                {
                    actualValue: 'Asia/Dubai',
                    displayValue: 'Asia/Dubai',
                },
                {
                    actualValue: 'Asia/Dushanbe',
                    displayValue: 'Asia/Dushanbe',
                },
                {
                    actualValue: 'Asia/Gaza',
                    displayValue: 'Asia/Gaza',
                },
                {
                    actualValue: 'Asia/Harbin',
                    displayValue: 'Asia/Harbin',
                },
                {
                    actualValue: 'Asia/Hebron',
                    displayValue: 'Asia/Hebron',
                },
                {
                    actualValue: 'Asia/Ho_Chi_Minh',
                    displayValue: 'Asia/Ho_Chi_Minh',
                },
                {
                    actualValue: 'Asia/Hong_Kong',
                    displayValue: 'Asia/Hong_Kong',
                },
                {
                    actualValue: 'Asia/Hovd',
                    displayValue: 'Asia/Hovd',
                },
                {
                    actualValue: 'Asia/Irkutsk',
                    displayValue: 'Asia/Irkutsk',
                },
                {
                    actualValue: 'Asia/Istanbul',
                    displayValue: 'Asia/Istanbul',
                },
                {
                    actualValue: 'Asia/Jakarta',
                    displayValue: 'Asia/Jakarta',
                },
                {
                    actualValue: 'Asia/Jayapura',
                    displayValue: 'Asia/Jayapura',
                },
                {
                    actualValue: 'Asia/Jerusalem',
                    displayValue: 'Asia/Jerusalem',
                },
                {
                    actualValue: 'Asia/Kabul',
                    displayValue: 'Asia/Kabul',
                },
                {
                    actualValue: 'Asia/Kamchatka',
                    displayValue: 'Asia/Kamchatka',
                },
                {
                    actualValue: 'Asia/Karachi',
                    displayValue: 'Asia/Karachi',
                },
                {
                    actualValue: 'Asia/Kashgar',
                    displayValue: 'Asia/Kashgar',
                },
                {
                    actualValue: 'Asia/Kathmandu',
                    displayValue: 'Asia/Kathmandu',
                },
                {
                    actualValue: 'Asia/Katmandu',
                    displayValue: 'Asia/Katmandu',
                },
                {
                    actualValue: 'Asia/Khandyga',
                    displayValue: 'Asia/Khandyga',
                },
                {
                    actualValue: 'Asia/Kolkata',
                    displayValue: 'Asia/Kolkata',
                },
                {
                    actualValue: 'Asia/Krasnoyarsk',
                    displayValue: 'Asia/Krasnoyarsk',
                },
                {
                    actualValue: 'Asia/Kuala_Lumpur',
                    displayValue: 'Asia/Kuala_Lumpur',
                },
                {
                    actualValue: 'Asia/Kuching',
                    displayValue: 'Asia/Kuching',
                },
                {
                    actualValue: 'Asia/Kuwait',
                    displayValue: 'Asia/Kuwait',
                },
                {
                    actualValue: 'Asia/Macao',
                    displayValue: 'Asia/Macao',
                },
                {
                    actualValue: 'Asia/Macau',
                    displayValue: 'Asia/Macau',
                },
                {
                    actualValue: 'Asia/Magadan',
                    displayValue: 'Asia/Magadan',
                },
                {
                    actualValue: 'Asia/Makassar',
                    displayValue: 'Asia/Makassar',
                },
                {
                    actualValue: 'Asia/Manila',
                    displayValue: 'Asia/Manila',
                },
                {
                    actualValue: 'Asia/Muscat',
                    displayValue: 'Asia/Muscat',
                },
                {
                    actualValue: 'Asia/Nicosia',
                    displayValue: 'Asia/Nicosia',
                },
                {
                    actualValue: 'Asia/Novokuznetsk',
                    displayValue: 'Asia/Novokuznetsk',
                },
                {
                    actualValue: 'Asia/Novosibirsk',
                    displayValue: 'Asia/Novosibirsk',
                },
                {
                    actualValue: 'Asia/Omsk',
                    displayValue: 'Asia/Omsk',
                },
                {
                    actualValue: 'Asia/Oral',
                    displayValue: 'Asia/Oral',
                },
                {
                    actualValue: 'Asia/Phnom_Penh',
                    displayValue: 'Asia/Phnom_Penh',
                },
                {
                    actualValue: 'Asia/Pontianak',
                    displayValue: 'Asia/Pontianak',
                },
                {
                    actualValue: 'Asia/Pyongyang',
                    displayValue: 'Asia/Pyongyang',
                },
                {
                    actualValue: 'Asia/Qatar',
                    displayValue: 'Asia/Qatar',
                },
                {
                    actualValue: 'Asia/Qyzylorda',
                    displayValue: 'Asia/Qyzylorda',
                },
                {
                    actualValue: 'Asia/Rangoon',
                    displayValue: 'Asia/Rangoon',
                },
                {
                    actualValue: 'Asia/Riyadh',
                    displayValue: 'Asia/Riyadh',
                },
                {
                    actualValue: 'Asia/Saigon',
                    displayValue: 'Asia/Saigon',
                },
                {
                    actualValue: 'Asia/Sakhalin',
                    displayValue: 'Asia/Sakhalin',
                },
                {
                    actualValue: 'Asia/Samarkand',
                    displayValue: 'Asia/Samarkand',
                },
                {
                    actualValue: 'Asia/Seoul',
                    displayValue: 'Asia/Seoul',
                },
                {
                    actualValue: 'Asia/Shanghai',
                    displayValue: 'Asia/Shanghai',
                },
                {
                    actualValue: 'Asia/Singapore',
                    displayValue: 'Asia/Singapore',
                },
                {
                    actualValue: 'Asia/Srednekolymsk',
                    displayValue: 'Asia/Srednekolymsk',
                },
                {
                    actualValue: 'Asia/Taipei',
                    displayValue: 'Asia/Taipei',
                },
                {
                    actualValue: 'Asia/Tashkent',
                    displayValue: 'Asia/Tashkent',
                },
                {
                    actualValue: 'Asia/Tbilisi',
                    displayValue: 'Asia/Tbilisi',
                },
                {
                    actualValue: 'Asia/Tehran',
                    displayValue: 'Asia/Tehran',
                },
                {
                    actualValue: 'Asia/Tel_Aviv',
                    displayValue: 'Asia/Tel_Aviv',
                },
                {
                    actualValue: 'Asia/Thimbu',
                    displayValue: 'Asia/Thimbu',
                },
                {
                    actualValue: 'Asia/Thimphu',
                    displayValue: 'Asia/Thimphu',
                },
                {
                    actualValue: 'Asia/Tokyo',
                    displayValue: 'Asia/Tokyo',
                },
                {
                    actualValue: 'Asia/Ujung_Pandang',
                    displayValue: 'Asia/Ujung_Pandang',
                },
                {
                    actualValue: 'Asia/Ulaanbaatar',
                    displayValue: 'Asia/Ulaanbaatar',
                },
                {
                    actualValue: 'Asia/Ulan_Bator',
                    displayValue: 'Asia/Ulan_Bator',
                },
                {
                    actualValue: 'Asia/Urumqi',
                    displayValue: 'Asia/Urumqi',
                },
                {
                    actualValue: 'Asia/Ust-Nera',
                    displayValue: 'Asia/Ust-Nera',
                },
                {
                    actualValue: 'Asia/Vientiane',
                    displayValue: 'Asia/Vientiane',
                },
                {
                    actualValue: 'Asia/Vladivostok',
                    displayValue: 'Asia/Vladivostok',
                },
                {
                    actualValue: 'Asia/Yakutsk',
                    displayValue: 'Asia/Yakutsk',
                },
                {
                    actualValue: 'Asia/Yekaterinburg',
                    displayValue: 'Asia/Yekaterinburg',
                },
                {
                    actualValue: 'Asia/Yerevan',
                    displayValue: 'Asia/Yerevan',
                },
                {
                    actualValue: 'Atlantic/Azores',
                    displayValue: 'Atlantic/Azores',
                },
                {
                    actualValue: 'Atlantic/Bermuda',
                    displayValue: 'Atlantic/Bermuda',
                },
                {
                    actualValue: 'Atlantic/Canary',
                    displayValue: 'Atlantic/Canary',
                },
                {
                    actualValue: 'Atlantic/Cape_Verde',
                    displayValue: 'Atlantic/Cape_Verde',
                },
                {
                    actualValue: 'Atlantic/Faeroe',
                    displayValue: 'Atlantic/Faeroe',
                },
                {
                    actualValue: 'Atlantic/Faroe',
                    displayValue: 'Atlantic/Faroe',
                },
                {
                    actualValue: 'Atlantic/Jan_Mayen',
                    displayValue: 'Atlantic/Jan_Mayen',
                },
                {
                    actualValue: 'Atlantic/Madeira',
                    displayValue: 'Atlantic/Madeira',
                },
                {
                    actualValue: 'Atlantic/Reykjavik',
                    displayValue: 'Atlantic/Reykjavik',
                },
                {
                    actualValue: 'Atlantic/South_Georgia',
                    displayValue: 'Atlantic/South_Georgia',
                },
                {
                    actualValue: 'Atlantic/St_Helena',
                    displayValue: 'Atlantic/St_Helena',
                },
                {
                    actualValue: 'Atlantic/Stanley',
                    displayValue: 'Atlantic/Stanley',
                },
                {
                    actualValue: 'Australia/ACT',
                    displayValue: 'Australia/ACT',
                },
                {
                    actualValue: 'Australia/Adelaide',
                    displayValue: 'Australia/Adelaide',
                },
                {
                    actualValue: 'Australia/Brisbane',
                    displayValue: 'Australia/Brisbane',
                },
                {
                    actualValue: 'Australia/Broken_Hill',
                    displayValue: 'Australia/Broken_Hill',
                },
                {
                    actualValue: 'Australia/Canberra',
                    displayValue: 'Australia/Canberra',
                },
                {
                    actualValue: 'Australia/Currie',
                    displayValue: 'Australia/Currie',
                },
                {
                    actualValue: 'Australia/Darwin',
                    displayValue: 'Australia/Darwin',
                },
                {
                    actualValue: 'Australia/Eucla',
                    displayValue: 'Australia/Eucla',
                },
                {
                    actualValue: 'Australia/Hobart',
                    displayValue: 'Australia/Hobart',
                },
                {
                    actualValue: 'Australia/LHI',
                    displayValue: 'Australia/LHI',
                },
                {
                    actualValue: 'Australia/Lindeman',
                    displayValue: 'Australia/Lindeman',
                },
                {
                    actualValue: 'Australia/Lord_Howe',
                    displayValue: 'Australia/Lord_Howe',
                },
                {
                    actualValue: 'Australia/Melbourne',
                    displayValue: 'Australia/Melbourne',
                },
                {
                    actualValue: 'Australia/NSW',
                    displayValue: 'Australia/NSW',
                },
                {
                    actualValue: 'Australia/North',
                    displayValue: 'Australia/North',
                },
                {
                    actualValue: 'Australia/Perth',
                    displayValue: 'Australia/Perth',
                },
                {
                    actualValue: 'Australia/Queensland',
                    displayValue: 'Australia/Queensland',
                },
                {
                    actualValue: 'Australia/South',
                    displayValue: 'Australia/South',
                },
                {
                    actualValue: 'Australia/Sydney',
                    displayValue: 'Australia/Sydney',
                },
                {
                    actualValue: 'Australia/Tasmania',
                    displayValue: 'Australia/Tasmania',
                },
                {
                    actualValue: 'Australia/Victoria',
                    displayValue: 'Australia/Victoria',
                },
                {
                    actualValue: 'Australia/West',
                    displayValue: 'Australia/West',
                },
                {
                    actualValue: 'Australia/Yancowinna',
                    displayValue: 'Australia/Yancowinna',
                },
                {
                    actualValue: 'CET',
                    displayValue: 'CET',
                },
                {
                    actualValue: 'CST6CDT',
                    displayValue: 'CST6CDT',
                },
                {
                    actualValue: 'Chile/Continental',
                    displayValue: 'Chile/Continental',
                },
                {
                    actualValue: 'Chile/EasterIsland',
                    displayValue: 'Chile/EasterIsland',
                },
                {
                    actualValue: 'EET',
                    displayValue: 'EET',
                },
                {
                    actualValue: 'EST',
                    displayValue: 'EST',
                },
                {
                    actualValue: 'EST5EDT',
                    displayValue: 'EST5EDT',
                },
                {
                    actualValue: 'Europe/Amsterdam',
                    displayValue: 'Europe/Amsterdam',
                },
                {
                    actualValue: 'Europe/Andorra',
                    displayValue: 'Europe/Andorra',
                },
                {
                    actualValue: 'Europe/Athens',
                    displayValue: 'Europe/Athens',
                },
                {
                    actualValue: 'Europe/Belfast',
                    displayValue: 'Europe/Belfast',
                },
                {
                    actualValue: 'Europe/Belgrade',
                    displayValue: 'Europe/Belgrade',
                },
                {
                    actualValue: 'Europe/Berlin',
                    displayValue: 'Europe/Berlin',
                },
                {
                    actualValue: 'Europe/Bratislava',
                    displayValue: 'Europe/Bratislava',
                },
                {
                    actualValue: 'Europe/Brussels',
                    displayValue: 'Europe/Brussels',
                },
                {
                    actualValue: 'Europe/Bucharest',
                    displayValue: 'Europe/Bucharest',
                },
                {
                    actualValue: 'Europe/Budapest',
                    displayValue: 'Europe/Budapest',
                },
                {
                    actualValue: 'Europe/Busingen',
                    displayValue: 'Europe/Busingen',
                },
                {
                    actualValue: 'Europe/Chisinau',
                    displayValue: 'Europe/Chisinau',
                },
                {
                    actualValue: 'Europe/Copenhagen',
                    displayValue: 'Europe/Copenhagen',
                },
                {
                    actualValue: 'Europe/Dublin',
                    displayValue: 'Europe/Dublin',
                },
                {
                    actualValue: 'Europe/Gibraltar',
                    displayValue: 'Europe/Gibraltar',
                },
                {
                    actualValue: 'Europe/Guernsey',
                    displayValue: 'Europe/Guernsey',
                },
                {
                    actualValue: 'Europe/Helsinki',
                    displayValue: 'Europe/Helsinki',
                },
                {
                    actualValue: 'Europe/Isle_of_Man',
                    displayValue: 'Europe/Isle_of_Man',
                },
                {
                    actualValue: 'Europe/Istanbul',
                    displayValue: 'Europe/Istanbul',
                },
                {
                    actualValue: 'Europe/Jersey',
                    displayValue: 'Europe/Jersey',
                },
                {
                    actualValue: 'Europe/Kaliningrad',
                    displayValue: 'Europe/Kaliningrad',
                },
                {
                    actualValue: 'Europe/Kiev',
                    displayValue: 'Europe/Kiev',
                },
                {
                    actualValue: 'Europe/Lisbon',
                    displayValue: 'Europe/Lisbon',
                },
                {
                    actualValue: 'Europe/Ljubljana',
                    displayValue: 'Europe/Ljubljana',
                },
                {
                    actualValue: 'Europe/London',
                    displayValue: 'Europe/London',
                },
                {
                    actualValue: 'Europe/Luxembourg',
                    displayValue: 'Europe/Luxembourg',
                },
                {
                    actualValue: 'Europe/Madrid',
                    displayValue: 'Europe/Madrid',
                },
                {
                    actualValue: 'Europe/Malta',
                    displayValue: 'Europe/Malta',
                },
                {
                    actualValue: 'Europe/Mariehamn',
                    displayValue: 'Europe/Mariehamn',
                },
                {
                    actualValue: 'Europe/Minsk',
                    displayValue: 'Europe/Minsk',
                },
                {
                    actualValue: 'Europe/Monaco',
                    displayValue: 'Europe/Monaco',
                },
                {
                    actualValue: 'Europe/Moscow',
                    displayValue: 'Europe/Moscow',
                },
                {
                    actualValue: 'Europe/Nicosia',
                    displayValue: 'Europe/Nicosia',
                },
                {
                    actualValue: 'Europe/Oslo',
                    displayValue: 'Europe/Oslo',
                },
                {
                    actualValue: 'Europe/Paris',
                    displayValue: 'Europe/Paris',
                },
                {
                    actualValue: 'Europe/Podgorica',
                    displayValue: 'Europe/Podgorica',
                },
                {
                    actualValue: 'Europe/Prague',
                    displayValue: 'Europe/Prague',
                },
                {
                    actualValue: 'Europe/Riga',
                    displayValue: 'Europe/Riga',
                },
                {
                    actualValue: 'Europe/Rome',
                    displayValue: 'Europe/Rome',
                },
                {
                    actualValue: 'Europe/Samara',
                    displayValue: 'Europe/Samara',
                },
                {
                    actualValue: 'Europe/San_Marino',
                    displayValue: 'Europe/San_Marino',
                },
                {
                    actualValue: 'Europe/Sarajevo',
                    displayValue: 'Europe/Sarajevo',
                },
                {
                    actualValue: 'Europe/Simferopol',
                    displayValue: 'Europe/Simferopol',
                },
                {
                    actualValue: 'Europe/Skopje',
                    displayValue: 'Europe/Skopje',
                },
                {
                    actualValue: 'Europe/Sofia',
                    displayValue: 'Europe/Sofia',
                },
                {
                    actualValue: 'Europe/Stockholm',
                    displayValue: 'Europe/Stockholm',
                },
                {
                    actualValue: 'Europe/Tallinn',
                    displayValue: 'Europe/Tallinn',
                },
                {
                    actualValue: 'Europe/Tirane',
                    displayValue: 'Europe/Tirane',
                },
                {
                    actualValue: 'Europe/Tiraspol',
                    displayValue: 'Europe/Tiraspol',
                },
                {
                    actualValue: 'Europe/Uzhgorod',
                    displayValue: 'Europe/Uzhgorod',
                },
                {
                    actualValue: 'Europe/Vaduz',
                    displayValue: 'Europe/Vaduz',
                },
                {
                    actualValue: 'Europe/Vatican',
                    displayValue: 'Europe/Vatican',
                },
                {
                    actualValue: 'Europe/Vienna',
                    displayValue: 'Europe/Vienna',
                },
                {
                    actualValue: 'Europe/Vilnius',
                    displayValue: 'Europe/Vilnius',
                },
                {
                    actualValue: 'Europe/Volgograd',
                    displayValue: 'Europe/Volgograd',
                },
                {
                    actualValue: 'Europe/Warsaw',
                    displayValue: 'Europe/Warsaw',
                },
                {
                    actualValue: 'Europe/Zagreb',
                    displayValue: 'Europe/Zagreb',
                },
                {
                    actualValue: 'Europe/Zaporozhye',
                    displayValue: 'Europe/Zaporozhye',
                },
                {
                    actualValue: 'Europe/Zurich',
                    displayValue: 'Europe/Zurich',
                },
                {
                    actualValue: 'GMT',
                    displayValue: 'GMT',
                },
                {
                    actualValue: 'HST',
                    displayValue: 'HST',
                },
                {
                    actualValue: 'Indian/Antananarivo',
                    displayValue: 'Indian/Antananarivo',
                },
                {
                    actualValue: 'Indian/Chagos',
                    displayValue: 'Indian/Chagos',
                },
                {
                    actualValue: 'Indian/Christmas',
                    displayValue: 'Indian/Christmas',
                },
                {
                    actualValue: 'Indian/Cocos',
                    displayValue: 'Indian/Cocos',
                },
                {
                    actualValue: 'Indian/Comoro',
                    displayValue: 'Indian/Comoro',
                },
                {
                    actualValue: 'Indian/Kerguelen',
                    displayValue: 'Indian/Kerguelen',
                },
                {
                    actualValue: 'Indian/Mahe',
                    displayValue: 'Indian/Mahe',
                },
                {
                    actualValue: 'Indian/Maldives',
                    displayValue: 'Indian/Maldives',
                },
                {
                    actualValue: 'Indian/Mauritius',
                    displayValue: 'Indian/Mauritius',
                },
                {
                    actualValue: 'Indian/Mayotte',
                    displayValue: 'Indian/Mayotte',
                },
                {
                    actualValue: 'Indian/Reunion',
                    displayValue: 'Indian/Reunion',
                },
                {
                    actualValue: 'MET',
                    displayValue: 'MET',
                },
                {
                    actualValue: 'MST',
                    displayValue: 'MST',
                },
                {
                    actualValue: 'MST7MDT',
                    displayValue: 'MST7MDT',
                },
                {
                    actualValue: 'Mexico/BajaNorte',
                    displayValue: 'Mexico/BajaNorte',
                },
                {
                    actualValue: 'Mexico/BajaSur',
                    displayValue: 'Mexico/BajaSur',
                },
                {
                    actualValue: 'Mexico/General',
                    displayValue: 'Mexico/General',
                },
                {
                    actualValue: 'PST8PDT',
                    displayValue: 'PST8PDT',
                },
                {
                    actualValue: 'Pacific/Apia',
                    displayValue: 'Pacific/Apia',
                },
                {
                    actualValue: 'Pacific/Auckland',
                    displayValue: 'Pacific/Auckland',
                },
                {
                    actualValue: 'Pacific/Bougainville',
                    displayValue: 'Pacific/Bougainville',
                },
                {
                    actualValue: 'Pacific/Chatham',
                    displayValue: 'Pacific/Chatham',
                },
                {
                    actualValue: 'Pacific/Chuuk',
                    displayValue: 'Pacific/Chuuk',
                },
                {
                    actualValue: 'Pacific/Easter',
                    displayValue: 'Pacific/Easter',
                },
                {
                    actualValue: 'Pacific/Efate',
                    displayValue: 'Pacific/Efate',
                },
                {
                    actualValue: 'Pacific/Enderbury',
                    displayValue: 'Pacific/Enderbury',
                },
                {
                    actualValue: 'Pacific/Fakaofo',
                    displayValue: 'Pacific/Fakaofo',
                },
                {
                    actualValue: 'Pacific/Fiji',
                    displayValue: 'Pacific/Fiji',
                },
                {
                    actualValue: 'Pacific/Funafuti',
                    displayValue: 'Pacific/Funafuti',
                },
                {
                    actualValue: 'Pacific/Galapagos',
                    displayValue: 'Pacific/Galapagos',
                },
                {
                    actualValue: 'Pacific/Gambier',
                    displayValue: 'Pacific/Gambier',
                },
                {
                    actualValue: 'Pacific/Guadalcanal',
                    displayValue: 'Pacific/Guadalcanal',
                },
                {
                    actualValue: 'Pacific/Guam',
                    displayValue: 'Pacific/Guam',
                },
                {
                    actualValue: 'Pacific/Honolulu',
                    displayValue: 'Pacific/Honolulu',
                },
                {
                    actualValue: 'Pacific/Johnston',
                    displayValue: 'Pacific/Johnston',
                },
                {
                    actualValue: 'Pacific/Kiritimati',
                    displayValue: 'Pacific/Kiritimati',
                },
                {
                    actualValue: 'Pacific/Kosrae',
                    displayValue: 'Pacific/Kosrae',
                },
                {
                    actualValue: 'Pacific/Kwajalein',
                    displayValue: 'Pacific/Kwajalein',
                },
                {
                    actualValue: 'Pacific/Majuro',
                    displayValue: 'Pacific/Majuro',
                },
                {
                    actualValue: 'Pacific/Marquesas',
                    displayValue: 'Pacific/Marquesas',
                },
                {
                    actualValue: 'Pacific/Midway',
                    displayValue: 'Pacific/Midway',
                },
                {
                    actualValue: 'Pacific/Nauru',
                    displayValue: 'Pacific/Nauru',
                },
                {
                    actualValue: 'Pacific/Niue',
                    displayValue: 'Pacific/Niue',
                },
                {
                    actualValue: 'Pacific/Norfolk',
                    displayValue: 'Pacific/Norfolk',
                },
                {
                    actualValue: 'Pacific/Noumea',
                    displayValue: 'Pacific/Noumea',
                },
                {
                    actualValue: 'Pacific/Pago_Pago',
                    displayValue: 'Pacific/Pago_Pago',
                },
                {
                    actualValue: 'Pacific/Palau',
                    displayValue: 'Pacific/Palau',
                },
                {
                    actualValue: 'Pacific/Pitcairn',
                    displayValue: 'Pacific/Pitcairn',
                },
                {
                    actualValue: 'Pacific/Pohnpei',
                    displayValue: 'Pacific/Pohnpei',
                },
                {
                    actualValue: 'Pacific/Ponape',
                    displayValue: 'Pacific/Ponape',
                },
                {
                    actualValue: 'Pacific/Port_Moresby',
                    displayValue: 'Pacific/Port_Moresby',
                },
                {
                    actualValue: 'Pacific/Rarotonga',
                    displayValue: 'Pacific/Rarotonga',
                },
                {
                    actualValue: 'Pacific/Saipan',
                    displayValue: 'Pacific/Saipan',
                },
                {
                    actualValue: 'Pacific/Samoa',
                    displayValue: 'Pacific/Samoa',
                },
                {
                    actualValue: 'Pacific/Tahiti',
                    displayValue: 'Pacific/Tahiti',
                },
                {
                    actualValue: 'Pacific/Tarawa',
                    displayValue: 'Pacific/Tarawa',
                },
                {
                    actualValue: 'Pacific/Tongatapu',
                    displayValue: 'Pacific/Tongatapu',
                },
                {
                    actualValue: 'Pacific/Truk',
                    displayValue: 'Pacific/Truk',
                },
                {
                    actualValue: 'Pacific/Wake',
                    displayValue: 'Pacific/Wake',
                },
                {
                    actualValue: 'Pacific/Wallis',
                    displayValue: 'Pacific/Wallis',
                },
                {
                    actualValue: 'Pacific/Yap',
                    displayValue: 'Pacific/Yap',
                },
                {
                    actualValue: 'US/Alaska',
                    displayValue: 'US/Alaska',
                },
                {
                    actualValue: 'US/Aleutian',
                    displayValue: 'US/Aleutian',
                },
                {
                    actualValue: 'US/Arizona',
                    displayValue: 'US/Arizona',
                },
                {
                    actualValue: 'US/Central',
                    displayValue: 'US/Central',
                },
                {
                    actualValue: 'US/East-Indiana',
                    displayValue: 'US/East-Indiana',
                },
                {
                    actualValue: 'US/Eastern',
                    displayValue: 'US/Eastern',
                },
                {
                    actualValue: 'US/Hawaii',
                    displayValue: 'US/Hawaii',
                },
                {
                    actualValue: 'US/Indiana-Starke',
                    displayValue: 'US/Indiana-Starke',
                },
                {
                    actualValue: 'US/Michigan',
                    displayValue: 'US/Michigan',
                },
                {
                    actualValue: 'US/Mountain',
                    displayValue: 'US/Mountain',
                },
                {
                    actualValue: 'US/Pacific',
                    displayValue: 'US/Pacific',
                },
                {
                    actualValue: 'US/Pacific-New',
                    displayValue: 'US/Pacific-New',
                },
                {
                    actualValue: 'US/Samoa',
                    displayValue: 'US/Samoa',
                },
                {
                    actualValue: 'UTC',
                    displayValue: 'UTC',
                },
            ],
        },
    },
    nodeSettings: {
        '127.0.17.10': {
            hostname: {
                type: 'regex',
                data: '^(?!^[0-9-])[a-zA-Z0-9-]{1,63}(?<!-)$',
            },
        },
        '127.2.36.2': {
            hostname: {
                type: 'regex',
                data: '^(?!^[0-9-])[a-zA-Z0-9-]{1,63}(?<!-)$',
            },
        },
    },
    radioSettings: {
        '127.0.17.10': {
            radio0: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
            radio1: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
            radio2: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: '22',
                            displayValue: '22 dBm',
                        },
                        {
                            actualValue: '23',
                            displayValue: '23 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
        },
        '127.2.36.2': {
            radio0: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'invalid',
                    data: 'channel',
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '42',
                        },
                        {
                            actualValue: '149',
                            displayValue: '155',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5210 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5775 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
            radio1: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
            radio2: {
                wirelessMode: {
                    type: 'regex',
                    data: '^.*$',
                },
                txpower: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1 dBm',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2 dBm',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3 dBm',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4 dBm',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5 dBm',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6 dBm',
                        },
                        {
                            actualValue: '7',
                            displayValue: '7 dBm',
                        },
                        {
                            actualValue: '8',
                            displayValue: '8 dBm',
                        },
                        {
                            actualValue: '9',
                            displayValue: '9 dBm',
                        },
                        {
                            actualValue: '10',
                            displayValue: '10 dBm',
                        },
                        {
                            actualValue: '11',
                            displayValue: '11 dBm',
                        },
                        {
                            actualValue: '12',
                            displayValue: '12 dBm',
                        },
                        {
                            actualValue: '13',
                            displayValue: '13 dBm',
                        },
                        {
                            actualValue: '14',
                            displayValue: '14 dBm',
                        },
                        {
                            actualValue: '15',
                            displayValue: '15 dBm',
                        },
                        {
                            actualValue: '16',
                            displayValue: '16 dBm',
                        },
                        {
                            actualValue: '17',
                            displayValue: '17 dBm',
                        },
                        {
                            actualValue: '18',
                            displayValue: '18 dBm',
                        },
                        {
                            actualValue: '19',
                            displayValue: '19 dBm',
                        },
                        {
                            actualValue: '20',
                            displayValue: '20 dBm',
                        },
                        {
                            actualValue: '21',
                            displayValue: '21 dBm',
                        },
                        {
                            actualValue: '22',
                            displayValue: '22 dBm',
                        },
                        {
                            actualValue: '23',
                            displayValue: '23 dBm',
                        },
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                channelBandwidth: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '20',
                            displayValue: '20 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40 MHz',
                        },
                        {
                            actualValue: '80',
                            displayValue: '80 MHz',
                        },
                    ],
                },
                rtsCts: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                distance: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: 300,
                                max: 23700,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: 'auto',
                                    displayValue: 'Default',
                                },
                            ],
                        },
                    ],
                },
                maxNbr: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '1',
                            displayValue: '1',
                        },
                        {
                            actualValue: '2',
                            displayValue: '2',
                        },
                        {
                            actualValue: '3',
                            displayValue: '3',
                        },
                        {
                            actualValue: '4',
                            displayValue: '4',
                        },
                        {
                            actualValue: '5',
                            displayValue: '5',
                        },
                        {
                            actualValue: '6',
                            displayValue: '6',
                        },
                    ],
                },
                radioFilter: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                rssiFilterTolerance: {
                    type: 'int',
                    data: {
                        min: 0,
                        max: 30,
                    },
                },
                rssiFilterLower: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                rssiFilterUpper: {
                    type: 'mixed',
                    data: [
                        {
                            type: 'int',
                            data: {
                                min: -95,
                                max: 0,
                            },
                        },
                        {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '255',
                                    displayValue: 'Disable',
                                },
                            ],
                        },
                    ],
                },
                mobilityDomain: {
                    type: 'regex',
                    data: '^[0-9a-zA-Z_-]{1,16}$',
                },
                shortgi: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mcs: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'auto',
                            displayValue: 'Auto',
                        },
                    ],
                },
                operationMode: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'mesh',
                            displayValue: 'Mesh',
                        },
                        {
                            actualValue: 'mobile',
                            displayValue: 'Mobile',
                        },
                        {
                            actualValue: 'static',
                            displayValue: 'Static',
                        },
                    ],
                },
                channel: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '36',
                        },
                        {
                            actualValue: '40',
                            displayValue: '40',
                        },
                        {
                            actualValue: '44',
                            displayValue: '44',
                        },
                        {
                            actualValue: '48',
                            displayValue: '48',
                        },
                        {
                            actualValue: '149',
                            displayValue: '149',
                        },
                        {
                            actualValue: '153',
                            displayValue: '153',
                        },
                        {
                            actualValue: '157',
                            displayValue: '157',
                        },
                        {
                            actualValue: '161',
                            displayValue: '161',
                        },
                        {
                            actualValue: '165',
                            displayValue: '165',
                        },
                    ],
                },
                centralFreq: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '36',
                            displayValue: '5180 MHz',
                        },
                        {
                            actualValue: '40',
                            displayValue: '5200 MHz',
                        },
                        {
                            actualValue: '44',
                            displayValue: '5220 MHz',
                        },
                        {
                            actualValue: '48',
                            displayValue: '5240 MHz',
                        },
                        {
                            actualValue: '149',
                            displayValue: '5745 MHz',
                        },
                        {
                            actualValue: '153',
                            displayValue: '5765 MHz',
                        },
                        {
                            actualValue: '157',
                            displayValue: '5785 MHz',
                        },
                        {
                            actualValue: '161',
                            displayValue: '5805 MHz',
                        },
                        {
                            actualValue: '165',
                            displayValue: '5825 MHz',
                        },
                    ],
                },
                band: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: '5',
                            displayValue: '5 GHz',
                        },
                    ],
                },
                status: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                profileId: {
                    type: 'object',
                    data: {
                        nbr: {
                            type: 'enum',
                            data: [
                                {
                                    actualValue: '1',
                                    displayValue: '1',
                                },
                                {
                                    actualValue: '2',
                                    displayValue: '2',
                                },
                                {
                                    actualValue: '3',
                                    displayValue: '3',
                                },
                            ],
                        },
                    },
                },
            },
        },
    },
    ethernetSettings: {
        '127.0.17.10': {
            eth0: {
                ethernetLink: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mtu: {
                    type: 'int',
                    data: {
                        min: 1500,
                        max: 1868,
                    },
                },
            },
            eth1: {
                ethernetLink: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mtu: {
                    type: 'int',
                    data: {
                        min: 1500,
                        max: 1868,
                    },
                },
            },
        },
        '127.2.36.2': {
            eth0: {
                ethernetLink: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mtu: {
                    type: 'int',
                    data: {
                        min: 1500,
                        max: 1868,
                    },
                },
            },
            eth1: {
                ethernetLink: {
                    type: 'enum',
                    data: [
                        {
                            actualValue: 'enable',
                            displayValue: 'Enable',
                        },
                        {
                            actualValue: 'disable',
                            displayValue: 'Disable',
                        },
                    ],
                },
                mtu: {
                    type: 'int',
                    data: {
                        min: 1500,
                        max: 1868,
                    },
                },
            },
        },
    },
    profileSettings: {
        '127.0.17.10': {
            nbr: {
                1: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
                2: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
                3: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
            },
        },
        '127.2.36.2': {
            nbr: {
                1: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
                2: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
                3: {
                    maxNbr: {
                        type: 'enum',
                        data: [
                            {
                                actualValue: '1',
                                displayValue: '1',
                            },
                            {
                                actualValue: '2',
                                displayValue: '2',
                            },
                            {
                                actualValue: '3',
                                displayValue: '3',
                            },
                            {
                                actualValue: '4',
                                displayValue: '4',
                            },
                            {
                                actualValue: '5',
                                displayValue: '5',
                            },
                            {
                                actualValue: '6',
                                displayValue: '6',
                            },
                            {
                                actualValue: '7',
                                displayValue: '7',
                            },
                            {
                                actualValue: '8',
                                displayValue: '8',
                            },
                            {
                                actualValue: '9',
                                displayValue: '9',
                            },
                            {
                                actualValue: '10',
                                displayValue: '10',
                            },
                            {
                                actualValue: '11',
                                displayValue: '11',
                            },
                            {
                                actualValue: '12',
                                displayValue: '12',
                            },
                            {
                                actualValue: '13',
                                displayValue: '13',
                            },
                            {
                                actualValue: '14',
                                displayValue: '14',
                            },
                            {
                                actualValue: '15',
                                displayValue: '15',
                            },
                            {
                                actualValue: '16',
                                displayValue: '16',
                            },
                            {
                                actualValue: '17',
                                displayValue: '17',
                            },
                            {
                                actualValue: '18',
                                displayValue: '18',
                            },
                            {
                                actualValue: '19',
                                displayValue: '19',
                            },
                            {
                                actualValue: '20',
                                displayValue: '20',
                            },
                            {
                                actualValue: '21',
                                displayValue: '21',
                            },
                            {
                                actualValue: '22',
                                displayValue: '22',
                            },
                            {
                                actualValue: '23',
                                displayValue: '23',
                            },
                            {
                                actualValue: '24',
                                displayValue: '24',
                            },
                            {
                                actualValue: '25',
                                displayValue: '25',
                            },
                            {
                                actualValue: '26',
                                displayValue: '26',
                            },
                            {
                                actualValue: '27',
                                displayValue: '27',
                            },
                            {
                                actualValue: '28',
                                displayValue: '28',
                            },
                            {
                                actualValue: '29',
                                displayValue: '29',
                            },
                            {
                                actualValue: '30',
                                displayValue: '30',
                            },
                            {
                                actualValue: '31',
                                displayValue: '31',
                            },
                            {
                                actualValue: '32',
                                displayValue: '32',
                            },
                            {
                                actualValue: '33',
                                displayValue: '33',
                            },
                            {
                                actualValue: '34',
                                displayValue: '34',
                            },
                            {
                                actualValue: '35',
                                displayValue: '35',
                            },
                            {
                                actualValue: '36',
                                displayValue: '36',
                            },
                            {
                                actualValue: '37',
                                displayValue: '37',
                            },
                            {
                                actualValue: '38',
                                displayValue: '38',
                            },
                            {
                                actualValue: '39',
                                displayValue: '39',
                            },
                            {
                                actualValue: '40',
                                displayValue: '40',
                            },
                            {
                                actualValue: '41',
                                displayValue: '41',
                            },
                            {
                                actualValue: '42',
                                displayValue: '42',
                            },
                            {
                                actualValue: '43',
                                displayValue: '43',
                            },
                            {
                                actualValue: '44',
                                displayValue: '44',
                            },
                            {
                                actualValue: '45',
                                displayValue: '45',
                            },
                            {
                                actualValue: '46',
                                displayValue: '46',
                            },
                            {
                                actualValue: '47',
                                displayValue: '47',
                            },
                            {
                                actualValue: '48',
                                displayValue: '48',
                            },
                            {
                                actualValue: '49',
                                displayValue: '49',
                            },
                            {
                                actualValue: '50',
                                displayValue: '50',
                            },
                            {
                                actualValue: '51',
                                displayValue: '51',
                            },
                            {
                                actualValue: '52',
                                displayValue: '52',
                            },
                            {
                                actualValue: '53',
                                displayValue: '53',
                            },
                            {
                                actualValue: '54',
                                displayValue: '54',
                            },
                            {
                                actualValue: '55',
                                displayValue: '55',
                            },
                            {
                                actualValue: '56',
                                displayValue: '56',
                            },
                            {
                                actualValue: '57',
                                displayValue: '57',
                            },
                            {
                                actualValue: '58',
                                displayValue: '58',
                            },
                            {
                                actualValue: '59',
                                displayValue: '59',
                            },
                            {
                                actualValue: '60',
                                displayValue: '60',
                            },
                            {
                                actualValue: '61',
                                displayValue: '61',
                            },
                            {
                                actualValue: '62',
                                displayValue: '62',
                            },
                            {
                                actualValue: '63',
                                displayValue: '63',
                            },
                            {
                                actualValue: '64',
                                displayValue: '64',
                            },
                            {
                                actualValue: '65',
                                displayValue: '65',
                            },
                            {
                                actualValue: '66',
                                displayValue: '66',
                            },
                            {
                                actualValue: '67',
                                displayValue: '67',
                            },
                            {
                                actualValue: '68',
                                displayValue: '68',
                            },
                            {
                                actualValue: '69',
                                displayValue: '69',
                            },
                            {
                                actualValue: '70',
                                displayValue: '70',
                            },
                            {
                                actualValue: '71',
                                displayValue: '71',
                            },
                            {
                                actualValue: '72',
                                displayValue: '72',
                            },
                            {
                                actualValue: '73',
                                displayValue: '73',
                            },
                            {
                                actualValue: '74',
                                displayValue: '74',
                            },
                            {
                                actualValue: '75',
                                displayValue: '75',
                            },
                            {
                                actualValue: '76',
                                displayValue: '76',
                            },
                            {
                                actualValue: '77',
                                displayValue: '77',
                            },
                            {
                                actualValue: '78',
                                displayValue: '78',
                            },
                            {
                                actualValue: '79',
                                displayValue: '79',
                            },
                            {
                                actualValue: '80',
                                displayValue: '80',
                            },
                            {
                                actualValue: '81',
                                displayValue: '81',
                            },
                            {
                                actualValue: '82',
                                displayValue: '82',
                            },
                            {
                                actualValue: '83',
                                displayValue: '83',
                            },
                            {
                                actualValue: '84',
                                displayValue: '84',
                            },
                            {
                                actualValue: '85',
                                displayValue: '85',
                            },
                            {
                                actualValue: '86',
                                displayValue: '86',
                            },
                            {
                                actualValue: '87',
                                displayValue: '87',
                            },
                            {
                                actualValue: '88',
                                displayValue: '88',
                            },
                            {
                                actualValue: '89',
                                displayValue: '89',
                            },
                            {
                                actualValue: '90',
                                displayValue: '90',
                            },
                            {
                                actualValue: 'disable',
                                displayValue: 'Disable',
                            },
                        ],
                    },
                },
            },
        },
    },
};
const nodeIp = [
    "127.0.17.10",
    "127.2.36.2"
]
const defaultProps = {
    skip: true,
    configData: JSON.stringify(configData),
    configOptions: JSON.stringify(configOptions),
    nodeIp: JSON.stringify(nodeIp),
}
const noErrorErrorStatus = {
    meshSettings: {
        clusterId: false,
        managementIp: false,
        managementNetmask: false,
        bpduFilter: false,
        country: false,
        encType: false,
        encKey: false,
        e2eEnc: false,
        e2eEncKey: false,
        globalRoamingRSSIMargin: false,
        globalDiscoveryInterval: false,
        globalHeartbeatInterval: false,
        globalHeartbeatTimeout: false,
        globalStaleTimeout: false,
        globalTimezone: false,
    },
    radioSettings: {
        '127.0.17.10': {
            radio0: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                },
                profileId: {
                    nbr: false,
                },
            },
            radio1: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                },
                profileId: {
                    nbr: false,
                },
            },
            radio2: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                    macList: [false],
                },
                profileId: {
                    nbr: false,
                },
            },
        },
        '127.2.36.2': {
            radio0: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                },
                profileId: {
                    nbr: false,
                },
            },
            radio1: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                },
                profileId: {
                    nbr: false,
                },
            },
            radio2: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                },
                profileId: {
                    nbr: false,
                },
            },
        },
    },
    nodeSettings: {
        '127.0.17.10': {
            hostname: false,
            acl: {},
        },
        '127.2.36.2': {
            hostname: false,
            acl: {
                whitelist: {},
                blacklist: {
                    source: [false],
                    destination: [false],
                },
            },
        },
    },
    ethernetSettings: {
        '127.0.17.10': {
            eth0: {
                ethernetLink: false,
                mtu: false,
            },
            eth1: {
                ethernetLink: false,
                mtu: false,
            },
        },
        '127.2.36.2': {
            eth0: {
                ethernetLink: false,
                mtu: false,
            },
            eth1: {
                ethernetLink: false,
                mtu: false,
            },
        },
    },
    profileSettings: {
        '127.0.17.10': {
            nbr: {
                1: {
                    maxNbr: false,
                },
                2: {
                    maxNbr: false,
                },
                3: {
                    maxNbr: false,
                },
            },
        },
        '127.2.36.2': {
            nbr: {
                1: {
                    maxNbr: false,
                },
                2: {
                    maxNbr: false,
                },
                3: {
                    maxNbr: false,
                },
            },
        },
    },
};
const haveErrorErrorStatus = {
    meshSettings: {
        clusterId: false,
        managementIp: false,
        managementNetmask: false,
        bpduFilter: false,
        country: false,
        encType: false,
        encKey: false,
        e2eEnc: false,
        e2eEncKey: false,
        globalRoamingRSSIMargin: false,
        globalDiscoveryInterval: false,
        globalHeartbeatInterval: false,
        globalHeartbeatTimeout: false,
        globalStaleTimeout: false,
        globalTimezone: false,
    },
    radioSettings: {
        '127.0.17.10': {
            radio0: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                },
                profileId: {
                    nbr: false,
                },
            },
            radio1: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                },
                profileId: {
                    nbr: false,
                },
            },
            radio2: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                    macList: [false],
                },
                profileId: {
                    nbr: false,
                },
            },
        },
        '127.2.36.2': {
            radio0: {
                wirelessMode: false,
                txpower: 'invalid',
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: 'wrongEnum',
                centralFreq: 'wrongEnum',
                band: false,
                status: false,
                acl: {
                    type: false,
                },
                profileId: {
                    nbr: false,
                },
            },
            radio1: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                },
                profileId: {
                    nbr: false,
                },
            },
            radio2: {
                wirelessMode: false,
                txpower: false,
                channelBandwidth: false,
                rtsCts: false,
                distance: false,
                maxNbr: false,
                radioFilter: false,
                rssiFilterTolerance: false,
                rssiFilterLower: false,
                rssiFilterUpper: false,
                mobilityDomain: false,
                shortgi: false,
                mcs: false,
                operationMode: false,
                channel: false,
                centralFreq: false,
                band: false,
                status: false,
                acl: {
                    type: false,
                },
                profileId: {
                    nbr: false,
                },
            },
        },
    },
    nodeSettings: {
        '127.0.17.10': {
            hostname: false,
            acl: {},
        },
        '127.2.36.2': {
            hostname: false,
            acl: {
                whitelist: {},
                blacklist: {
                    source: [false],
                    destination: [false],
                },
            },
        },
    },
    ethernetSettings: {
        '127.0.17.10': {
            eth0: {
                ethernetLink: false,
                mtu: false,
            },
            eth1: {
                ethernetLink: false,
                mtu: false,
            },
        },
        '127.2.36.2': {
            eth0: {
                ethernetLink: false,
                mtu: false,
            },
            eth1: {
                ethernetLink: false,
                mtu: false,
            },
        },
    },
    profileSettings: {
        '127.0.17.10': {
            nbr: {
                1: {
                    maxNbr: false,
                },
                2: {
                    maxNbr: false,
                },
                3: {
                    maxNbr: false,
                },
            },
        },
        '127.2.36.2': {
            nbr: {
                1: {
                    maxNbr: false,
                },
                2: {
                    maxNbr: false,
                },
                3: {
                    maxNbr: false,
                },
            },
        },
    },
};

afterEach(() => {
    i18n.t.mockReset();
})

describe('useValidator', () => {

    test('return empty errorStatus when skip', () => {
        const { result } = renderHook(() => useValidator(defaultProps))
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toEqual({})
    });

    test('return all false errorStatus when skip is false and data is valid', () => {
        const { result } = renderHook(() => useValidator({...defaultProps, skip: false}))
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toEqual(noErrorErrorStatus)
    })

    test('return errorStatus when skip is false and data is not valid', () => {
        mockI18n()
        const { result } = renderHook(() => useValidator({
            nodeIp: JSON.stringify(nodeIp),
            skip: false,
            configData: JSON.stringify(errorConfigData),
            configOptions: JSON.stringify(errorConfigOptions),
        }))
        expect(result.current).toHaveLength(2)
        expect(result.current[0]).toEqual(haveErrorErrorStatus)
    });

});