import { common } from '@material-ui/core/colors';
import { checkFwLTEDetail, isOem } from './common';

/**
 * Test for firmware checking function to behave as expected, this function
 * checks for individual features whether they are support to display to UI
 * or not. "CheckFirmwareVersionLargeThanOrEqualTo"
 **/
describe('Common function', () => {
    describe('Firmware checking mechanism', () => {
        test('Falsy if firmware version is newer than feature supported version', () => {
            const featureSupportedVersion = "v1.7.31"
            const fwVersion = "v1.7.30"

            expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeFalsy();
        });

        test('Truthy if firmware version is same as feature supported version', () => {
            const featureSupportedVersion = "v1.7.31"
            const fwVersion = "v1.7.31"

            expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeTruthy();
        });

        test('Falsey if firmware version input is null', () => {
            const featureSupportedVersion = "v1.7.31"
            const fwVersion = null

            expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeFalsy();
        });

        test('Truthy if firmware version input is larger than feature supported version', () => {
            const featureSupportedVersion = "v1.7.31"
            const fwVersion = "v1.7.32"

            expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeTruthy();
        });

        test('Falsey if firmware version input is older than feature supported version by 2nd digit place', () => {
            const featureSupportedVersion = "v1.7.31"
            const fwVersion = "v1.6.1"

            expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeFalsy();
        });

        test('Falsey if firmware version input is older than feature supported version ' +
            'by 2nd digit place but newer than feature supported version in 3rd digit place', () => {
                const featureSupportedVersion = "v1.7.31"
                const fwVersion = "v1.6.100"

                expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeFalsy();
            });

        test('Truthy if firmware version input is newer than feature supported version ' +
            'by 2nd digit place', () => {
                const featureSupportedVersion = "v1.7.31"
                const fwVersion = "v1.8.31"

                expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeTruthy();
            });

        test('Truthy if firmware version input is newer than feature supported version ' +
            'by 2nd digit place but older in 3rd digit place', () => {
                const featureSupportedVersion = "v1.7.31"
                const fwVersion = "v1.8.1"

                expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeTruthy();
            });

        test('Truthy if firmware version input is newer than feature supported version ' +
            'in terms of 1st digit place', () => {
                const featureSupportedVersion = "v1.7.31"
                const fwVersion = "v2.7.31"

                expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeTruthy();
            });

        test('Truthy if firmware version input is newer than feature supported version ' +
            'in terms of 1st digit place, but older in 2nd and 3rd digit place', () => {
                const featureSupportedVersion = "v1.7.31"
                const fwVersion = "v2.6.1"

                expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeTruthy();
            });

        test('Truthy if firmware version input is newer than feature supported version ' +
            'in terms of 1st digit place, but older in 2nd digit place', () => {
                const featureSupportedVersion = "v1.7.31"
                const fwVersion = "v2.6.31"

                expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeTruthy();
            });

        test('Truthy if firmware version input is newer than feature supported version ' +
            'in terms of 1st digit place, but older in 3rd digit place', () => {
                const featureSupportedVersion = "v1.7.31"
                const fwVersion = "v2.7.1"

                expect(checkFwLTEDetail(fwVersion, featureSupportedVersion)).toBeTruthy();
            });
    });
    
    describe('Is OEM check', () => {
        test('Should return false if it is not an OEM build', () => {
            const manifestWindowTitleName = 'Anywhere Node Manaager';
            expect(isOem(manifestWindowTitleName)).toBeFalsy();
        });

        test('Should return true if it is an OEM build', () => {
            const manifestWindowTitleName = 'Node Manaager';
            expect(isOem(manifestWindowTitleName)).toBeTruthy();
        });

        test('Should return false if it cannot be determined', () => {
            const manifestWindowTitleName = undefined;
            expect(isOem(manifestWindowTitleName)).toBeFalsy();
        });
    })
});