/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<object, object, unknown>
    export default component
}

declare function toDateString(date?: unknown, fm?: string): string
declare function toDateTimeString(date?: unknown, fm?: string): string
declare function toTimeString(date?: unknown, fm?: string): string
declare function getAgeYMD(bdate?: unknown, sdate?: unknown): string | undefined
declare function getYearAge(bdate?: unknown, sdate?: unknown): number | undefined
declare function CallWebAPI(
    url: string,
    data: string,
    method: string,
    successCallBack: (res: unknown) => void,
    json?: boolean
): void

interface MomentLike {
    (date?: unknown): { format: (pattern: string) => string }
    format: (pattern: string) => string
}

interface Window {
    app: import('vue').App
    moment: MomentLike
    toDateString: typeof toDateString
    toDateTimeString: typeof toDateTimeString
    toTimeString: typeof toTimeString
    getAgeYMD: typeof getAgeYMD
    getYearAge: typeof getYearAge
}

declare const moment: MomentLike
