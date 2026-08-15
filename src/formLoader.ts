import * as Vue from 'vue'
import type { Component } from 'vue'

type FormComponent = Component & {
    methods?: Record<string, (...args: unknown[]) => unknown>
    template?: string
}

export interface LocalFormEntry {
    path: string
    label: string
    folder: string
    kind: 'vue' | 'js'
}

type FormImporter = () => Promise<{ default?: FormComponent } | FormComponent>

const localFormImporters = import.meta.glob('../test/**/*.{js,vue}') as Record<string, FormImporter>

function readGlobal<T>(name: string): T | undefined {
    return (window as unknown as Record<string, T | undefined>)[name]
}

const formHelperMethods: Record<string, (...args: unknown[]) => unknown> = {
    toDateString(data?: unknown) {
        const fn = readGlobal<typeof window.toDateString>('toDateString')
        return fn ? fn(data) : ''
    },
    toDateTimeString(data?: unknown) {
        const fn = readGlobal<typeof window.toDateTimeString>('toDateTimeString')
        return fn ? fn(data) : ''
    },
    toTimeString(data?: unknown) {
        const fn = readGlobal<typeof window.toTimeString>('toTimeString')
        return fn ? fn(data) : ''
    },
    getAgeYMD(data?: unknown) {
        const fn = readGlobal<typeof window.getAgeYMD>('getAgeYMD')
        return fn ? fn(data) : undefined
    },
    getYearAge(data?: unknown) {
        const fn = readGlobal<typeof window.getYearAge>('getYearAge')
        return fn ? fn(data) : undefined
    },
    moment(data?: unknown) {
        return window.moment ? window.moment(data) : data
    },
}

function isVueUrl(url: string): boolean {
    return /\.vue(\?|#|$)/i.test(url || '')
}

function isSfcSource(source: string): boolean {
    if (typeof source !== 'string') {
        return false
    }
    const trimmed = source.trim()
    if (/^<!DOCTYPE html>/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
        return false
    }
    return /<(?:template|script)[\s>]/i.test(trimmed)
}

export function normalizeFormUrl(url: string): string {
    const trimmed = String(url || '').trim()
    if (!trimmed) {
        return ''
    }
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed
    }
    return trimmed.startsWith('/') ? trimmed : '/' + trimmed
}

function localImporterKey(url: string): string {
    return '..' + url.split('?')[0]
}

function entryFromPath(filePath: string): LocalFormEntry {
    const path = filePath.startsWith('/') ? filePath : '/' + filePath
    const parts = path.split('/').filter(Boolean)
    const label = parts[parts.length - 1] || path
    const folder = parts.length > 1 ? '/' + parts.slice(0, -1).join('/') : '/'
    return {
        path,
        label,
        folder,
        kind: path.toLowerCase().endsWith('.vue') ? 'vue' : 'js',
    }
}

export function listLocalForms(): LocalFormEntry[] {
    return Object.keys(localFormImporters)
        .map((key) => entryFromPath(key.replace(/^\.\./, '')))
        .sort((a, b) => a.path.localeCompare(b.path, 'th'))
}

export async function listAvailableForms(): Promise<LocalFormEntry[]> {
    try {
        const res = await fetch('/__forms.json')
        if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length) {
                return data.map((item: Partial<LocalFormEntry>) =>
                    entryFromPath(String(item.path || ''))
                )
            }
        }
    } catch {
        // fall through to bundled local list
    }
    return listLocalForms()
}

export function filterForms(forms: LocalFormEntry[], query: string): LocalFormEntry[] {
    const q = query.trim().toLowerCase()
    if (!q) {
        return forms
    }
    return forms.filter((item) => {
        const hay = (item.label + ' ' + item.folder + ' ' + item.path + ' ' + item.kind).toLowerCase()
        return q.split(/\s+/).every((token) => hay.includes(token))
    })
}

export function groupForms(forms: LocalFormEntry[]): { folder: string; items: LocalFormEntry[] }[] {
    const map = new Map<string, LocalFormEntry[]>()
    for (const item of forms) {
        const list = map.get(item.folder) || []
        list.push(item)
        map.set(item.folder, list)
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b, 'th'))
        .map(([folder, items]) => ({ folder, items }))
}

function attachFormHelpers(component: FormComponent): FormComponent {
    if (!component || typeof component !== 'object') {
        throw new Error('Loaded form is not a Vue component')
    }
    if (!component.methods) {
        component.methods = {}
    }
    for (const [name, fn] of Object.entries(formHelperMethods)) {
        if (typeof component.methods[name] !== 'function') {
            component.methods[name] = fn
        }
    }
    if (typeof component.template === 'string') {
        component.template = component.template.replaceAll('href="#"', 'href="javascript:;"')
    }
    return component
}

function unwrapModule(mod: { default?: FormComponent } | FormComponent): FormComponent {
    if (mod && typeof mod === 'object' && 'default' in mod && mod.default) {
        return mod.default
    }
    return mod as FormComponent
}

function wrapLoadError(message: string, primary: unknown, secondary?: unknown): Error {
    const detail = [primary, secondary]
        .map((item) => (item instanceof Error ? item.message : item ? String(item) : ''))
        .filter(Boolean)
        .join(' | ')
    const err = new Error(detail ? message + ' — ' + detail : message) as Error & {
        cause: unknown
        nativeError?: unknown
    }
    err.cause = primary
    err.nativeError = secondary
    return err
}

function resolveFormAsset(fromUrl: string, path: string): string {
    if (/^https?:\/\//i.test(path) || path.startsWith('/')) {
        return path
    }
    try {
        const origin = window.location.origin
        const base = fromUrl.startsWith('/') ? origin + fromUrl : origin + '/' + fromUrl
        return new URL(path, base).pathname
    } catch {
        return path
    }
}

async function loadVueSfc(url: string): Promise<FormComponent> {
    const { loadModule } = await import('vue3-sfc-loader')
    const moduleCache = Object.assign(Object.create(null), { vue: Vue }) as Record<string, unknown>
    return loadModule(url, {
        moduleCache,
        async getFile(path: string) {
            const resolved = resolveFormAsset(url, String(path))
            const res = await fetch(resolved)
            if (!res.ok) {
                throw new Error('โหลดไฟล์ไม่ได้ ' + resolved + ' (' + res.status + ')')
            }
            let source = await res.text()
            if (!isSfcSource(source)) {
                throw new Error('ไฟล์ไม่ใช่ Vue SFC: ' + resolved)
            }
            source = source.replaceAll('href="#"', 'href="javascript:;"')
            return {
                type: '.vue',
                getContentData: async () => source,
            }
        },
        addStyle(textContent: string) {
            const style = document.createElement('style')
            style.textContent = textContent
            document.head.appendChild(style)
        },
    }) as Promise<FormComponent>
}

export async function loadFormComponent(url: string): Promise<FormComponent> {
    const normalized = normalizeFormUrl(url)
    if (!normalized) {
        throw new Error('กรุณาใส่ path ของฟอร์ม')
    }

    const importer = localFormImporters[localImporterKey(normalized)]
    if (importer) {
        const mod = await importer()
        return attachFormHelpers(unwrapModule(mod))
    }

    if (isVueUrl(normalized)) {
        try {
            const mod = await import(/* @vite-ignore */ normalized)
            return attachFormHelpers(unwrapModule(mod))
        } catch (nativeErr) {
            try {
                return attachFormHelpers(await loadVueSfc(normalized))
            } catch (sfcErr) {
                throw wrapLoadError('โหลด Vue form ไม่สำเร็จ: ' + normalized, sfcErr, nativeErr)
            }
        }
    }

    try {
        const mod = await import(/* @vite-ignore */ normalized)
        return attachFormHelpers(unwrapModule(mod))
    } catch (err) {
        throw wrapLoadError('โหลด JS form ไม่สำเร็จ: ' + normalized, err)
    }
}

export function formComponentName(url: string, generation = 1): string {
    const slug = String(url || '').replace(/[^a-zA-Z0-9]+/g, '-')
    return 'formdatavue3-' + slug + '-' + generation
}
