import { join } from 'path'
import fs from 'fs/promises'

interface Translations {
    [key: string]: string | Translations
}

class I18n {
    private translations: Map<string, Translations> = new Map()
    private defaultLocale = 'en'
    private loaded = false

    async loadTranslations() {
        if (this.loaded) return

        const translationsDir = join(__dirname, '../translations')
        try {
            const files = await fs.readdir(translationsDir)

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const locale = file.replace('.json', '')
                    const content = await fs.readFile(join(translationsDir, file), 'utf-8')
                    this.translations.set(locale, JSON.parse(content))
                }
            }
            this.loaded = true
            console.log(`Loaded translations for: ${Array.from(this.translations.keys()).join(', ')}`)
        } catch (error) {
            console.error('Failed to load translations:', error)
        }
    }

    t(key: string, locale: string = this.defaultLocale, args?: Record<string, string | number>): string {
        const keys = key.split('.')
        let value: any = this.translations.get(locale) || this.translations.get(this.defaultLocale)

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k]
            } else {
                return key
            }
        }

        if (typeof value !== 'string') {
            return key
        }

        if (args) {
            return value.replace(/\{(\w+)\}/g, (_, k) => {
                return args[k] !== undefined ? String(args[k]) : `{${k}}`
            })
        }

        return value
    }

    getLocales(): string[] {
        return Array.from(this.translations.keys())
    }
}

export const i18n = new I18n()
