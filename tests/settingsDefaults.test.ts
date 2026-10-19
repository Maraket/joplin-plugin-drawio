import { test } from 'node:test'
import * as assert from 'node:assert/strict'
import { SettingDefaults } from '../src/settingsDefaults'

test('the default language is one of the offered languages', () => {
    assert.ok(SettingDefaults.defaultLanguage in SettingDefaults.languages)
})

test('the default theme key used by the editor exists', () => {
    assert.ok('kennedy' in SettingDefaults.themeUi)
    assert.equal(SettingDefaults.ui, 'kennedy')
})

test('the default draw.io server is an https URL', () => {
    assert.match(SettingDefaults.server, /^https:\/\/[^\s']+$/)
})

test('language and theme labels contain no quotes that could break HTML attributes', () => {
    // These values reach the dialog HTML through JSON.stringify (see S1).
    for (const label of [...Object.values(SettingDefaults.languages), ...Object.values(SettingDefaults.themeUi)]) {
        assert.doesNotMatch(label, /['"<>]/, label)
    }
})
