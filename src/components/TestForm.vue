<template>
    <div class="bench">
        <header class="bench-bar">
            <div class="bench-brand">
                <span class="bench-mark">10BIT</span>
                <div>
                    <strong>iChart Form</strong>
                    <p>โหลดทดลองฟอร์ม .vue และ .js</p>
                </div>
            </div>
            <div class="bench-tools">
                <div class="seg" role="group" aria-label="โหมดแสดงผล">
                    <button type="button" :class="{ on: mode === 'form' }" @click="mode = 'form'">กรอกฟอร์ม</button>
                    <button type="button" :class="{ on: mode === 'print' }" @click="mode = 'print'">พิมพ์</button>
                </div>
                <label class="vid">
                    <span>VID</span>
                    <input v-model="vid" type="text" inputmode="numeric" placeholder="visit id" autocomplete="off">
                </label>
            </div>
        </header>

        <section class="bench-load">
            <form class="path-form" @submit.prevent="submitLoad">
                <label for="form-path">ค้นหาหรือเลือกฟอร์ม</label>
                <div class="path-row">
                    <div class="picker" ref="pickerRef">
                        <input
                            id="form-path"
                            v-model="formurl"
                            type="text"
                            placeholder="พิมพ์ชื่อไฟล์ โฟลเดอร์ หรือ path แล้ว Enter"
                            spellcheck="false"
                            autocomplete="off"
                            role="combobox"
                            aria-autocomplete="list"
                            :aria-expanded="openPicker"
                            aria-controls="form-picker-list"
                            :disabled="loading"
                            @focus="openPicker = true"
                            @input="onQueryInput"
                            @keydown="onPickerKey"
                        >
                        <div
                            v-if="openPicker"
                            id="form-picker-list"
                            class="menu"
                            role="listbox"
                        >
                            <div v-if="recentMatches.length" class="group">
                                <div class="group-h">ล่าสุด</div>
                                <button
                                    v-for="item in recentMatches"
                                    :key="'r-' + item.path"
                                    type="button"
                                    role="option"
                                    :class="{ on: optionPaths[activeIndex] === item.path, current: loadedUrl === item.path }"
                                    @mousedown.prevent="pickForm(item.path)"
                                >
                                    <span class="name">{{ item.label }}</span>
                                    <span class="meta">{{ item.folder }}</span>
                                    <em>{{ item.kind }}</em>
                                </button>
                            </div>
                            <div v-for="group in visibleGroups" :key="group.folder" class="group">
                                <div class="group-h">{{ group.folder }} · {{ group.items.length }}</div>
                                <button
                                    v-for="item in group.items"
                                    :key="item.path"
                                    type="button"
                                    role="option"
                                    :class="{ on: optionPaths[activeIndex] === item.path, current: loadedUrl === item.path }"
                                    @mousedown.prevent="pickForm(item.path)"
                                >
                                    <span class="name">{{ item.label }}</span>
                                    <span class="meta">{{ item.path }}</span>
                                    <em>{{ item.kind }}</em>
                                </button>
                            </div>
                            <p v-if="!filteredForms.length" class="menu-empty">
                                ไม่พบในรายการ — กดโหลดเพื่อเปิด path นี้โดยตรง
                            </p>
                            <p v-else-if="filteredForms.length > maxShown" class="menu-empty">
                                แสดง {{ maxShown }} จาก {{ filteredForms.length }} ไฟล์ · พิมพ์เพิ่มเพื่อกรอง
                            </p>
                        </div>
                    </div>
                    <button type="submit" :disabled="loading">
                        {{ loading ? 'กำลังโหลด…' : 'โหลดฟอร์ม' }}
                    </button>
                </div>
            </form>

            <p class="hint">{{ catalogHint }}</p>
            <p v-if="loadError" class="status err">{{ loadError }}</p>
            <p v-else-if="loading" class="status">กำลังโหลด {{ formurl }}</p>
            <p v-else-if="loadedUrl" class="status ok">โหลดแล้ว {{ loadedUrl }} · โหมด {{ mode === 'print' ? 'พิมพ์' : 'กรอกฟอร์ม' }}</p>
            <p v-else class="status">พิมพ์ค้นหา แล้วลูกศรขึ้น–ลงเพื่อเลือก · Enter เพื่อโหลด</p>
        </section>

        <main class="bench-stage">
            <div class="sheet" :class="{ busy: loading }" :aria-busy="loading">
                <component
                    v-if="comp"
                    :is="comp"
                    :key="instanceKey"
                    :mode="mode"
                    :vid="vid"
                    ref="vueform3"
                />
                <div v-else class="empty">
                    <strong>ยังไม่มีฟอร์มบนโต๊ะ</strong>
                    <span>เลือก test.vue เพื่อดูใบรับรองแพทย์ หรือใส่ path จากเครื่อง / โรงพยาบาล</span>
                </div>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
    filterForms,
    formComponentName,
    groupForms,
    listAvailableForms,
    loadFormComponent,
    normalizeFormUrl,
    type LocalFormEntry,
} from '../formLoader'

const STORAGE_KEY = 'ichart-form-bench'
const maxShown = 80

const catalog = ref<LocalFormEntry[]>([])
const formurl = ref('/test/test.vue')
const loadedUrl = ref('')
const comp = ref('')
const vid = ref('')
const mode = ref('form')
const loading = ref(false)
const loadError = ref('')
const instanceKey = ref(0)
const openPicker = ref(false)
const activeIndex = ref(0)
const recentPaths = ref<string[]>([])
const pickerRef = ref<HTMLElement | null>(null)

const filteredForms = computed(() => filterForms(catalog.value, formurl.value))
const visibleForms = computed(() => filteredForms.value.slice(0, maxShown))
const visibleGroups = computed(() => {
    const recent = new Set(recentMatches.value.map((item) => item.path))
    return groupForms(visibleForms.value.filter((item) => !recent.has(item.path)))
})
const catalogHint = computed(() => {
    if (!catalog.value.length) {
        return 'ยังไม่พบไฟล์ฟอร์มใน /test หรือ /รพ-*'
    }
    if (formurl.value.trim()) {
        return `พบ ${filteredForms.value.length} จาก ${catalog.value.length} ฟอร์ม`
    }
    return `${catalog.value.length} ฟอร์มในเครื่อง · พิมพ์ชื่อเพื่อค้นหา`
})
const recentMatches = computed(() => {
    const q = formurl.value.trim().toLowerCase()
    return recentPaths.value
        .map((path) => catalog.value.find((item) => item.path === path) || {
            path,
            label: path.split('/').pop() || path,
            folder: path.split('/').slice(0, -1).join('/') || '/',
            kind: path.toLowerCase().endsWith('.vue') ? 'vue' : 'js',
        } as LocalFormEntry)
        .filter((item) => !q || filterForms([item], formurl.value).length)
        .slice(0, 5)
})
const optionPaths = computed(() => [
    ...recentMatches.value.map((item) => item.path),
    ...visibleForms.value.map((item) => item.path),
].filter((path, index, list) => list.indexOf(path) === index))

function remember() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        formurl: formurl.value,
        vid: vid.value,
        mode: mode.value,
        recent: recentPaths.value,
    }))
}

function pushRecent(path: string) {
    recentPaths.value = [path, ...recentPaths.value.filter((item) => item !== path)].slice(0, 8)
}

function restore() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            return
        }
        const saved = JSON.parse(raw) as {
            formurl?: string
            vid?: string | number
            mode?: string
            recent?: string[]
        }
        if (saved.formurl) {
            formurl.value = saved.formurl
        }
        if (saved.vid != null) {
            vid.value = String(saved.vid)
        }
        if (saved.mode === 'form' || saved.mode === 'print') {
            mode.value = saved.mode
        }
        if (Array.isArray(saved.recent)) {
            recentPaths.value = saved.recent.filter((item) => typeof item === 'string')
        }
    } catch {
        // keep defaults
    }
}

function onQueryInput() {
    openPicker.value = true
    activeIndex.value = 0
}

function onPickerKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        openPicker.value = false
        return
    }
    if (event.key === 'ArrowDown') {
        event.preventDefault()
        openPicker.value = true
        const max = Math.max(optionPaths.value.length - 1, 0)
        activeIndex.value = activeIndex.value >= max ? 0 : activeIndex.value + 1
        return
    }
    if (event.key === 'ArrowUp') {
        event.preventDefault()
        openPicker.value = true
        const max = Math.max(optionPaths.value.length - 1, 0)
        activeIndex.value = activeIndex.value <= 0 ? max : activeIndex.value - 1
        return
    }
    if (event.key === 'Enter' && openPicker.value && optionPaths.value.length) {
        event.preventDefault()
        void loadForm(optionPaths.value[activeIndex.value] || formurl.value)
    }
}

function onDocumentClick(event: MouseEvent) {
    if (!pickerRef.value) {
        return
    }
    if (!pickerRef.value.contains(event.target as Node)) {
        openPicker.value = false
    }
}

async function loadForm(compurl: string) {
    const path = normalizeFormUrl(compurl)
    formurl.value = path
    openPicker.value = false
    loading.value = true
    loadError.value = ''
    pushRecent(path)
    remember()
    try {
        const component = await loadFormComponent(path)
        instanceKey.value += 1
        const formname = formComponentName(path, instanceKey.value)
        window.app.component(formname, component)
        comp.value = formname
        loadedUrl.value = path
    } catch (err) {
        console.error(err)
        comp.value = ''
        loadedUrl.value = ''
        loadError.value = err instanceof Error ? err.message : String(err)
    } finally {
        loading.value = false
    }
}

function submitLoad() {
    const selected = openPicker.value ? optionPaths.value[activeIndex.value] : ''
    void loadForm(selected || formurl.value)
}

function pickForm(path: string) {
    void loadForm(path)
}

onMounted(async () => {
    restore()
    document.addEventListener('mousedown', onDocumentClick)
    catalog.value = await listAvailableForms()
    void loadForm(formurl.value)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', onDocumentClick)
})

watch([vid, mode], remember)
</script>

<style>
html,
body,
#app {
    min-height: 100%;
    margin: 0;
    background: oklch(0.955 0.012 82);
}
</style>

<style scoped>
.bench {
    --ink: oklch(0.28 0.03 250);
    --muted: oklch(0.45 0.02 250);
    --paper: oklch(0.955 0.012 82);
    --sheet: oklch(0.992 0.004 90);
    --navy: oklch(0.32 0.045 248);
    --teal: oklch(0.52 0.09 195);
    --line: oklch(0.82 0.02 85);
    --err: oklch(0.48 0.14 25);
    --ok: oklch(0.42 0.08 155);
    min-height: 100vh;
    color: var(--ink);
    font-family: Sarabun, "Noto Sans Thai", sans-serif;
}

.bench-bar,
.bench-load {
    max-width: 1120px;
    margin: 0 auto;
    padding-left: clamp(16px, 3vw, 28px);
    padding-right: clamp(16px, 3vw, 28px);
}

.bench-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 28px;
    align-items: flex-end;
    justify-content: space-between;
    padding-top: 22px;
    padding-bottom: 18px;
    border-bottom: 3px solid var(--navy);
}

.bench-brand {
    display: flex;
    gap: 12px;
    align-items: center;
}

.bench-mark {
    display: grid;
    place-items: center;
    min-width: 54px;
    height: 54px;
    padding: 0 6px;
    background: var(--navy);
    color: oklch(0.96 0.02 85);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.bench-brand strong {
    display: block;
    font-size: 1.35rem;
    font-weight: 700;
    line-height: 1.2;
}

.bench-brand p {
    margin: 2px 0 0;
    color: var(--muted);
    font-size: 0.92rem;
}

.bench-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
}

.seg {
    display: flex;
    border: 1px solid var(--navy);
}

.seg button {
    border: 0;
    background: transparent;
    color: var(--navy);
    padding: 8px 14px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.seg button.on {
    background: var(--navy);
    color: oklch(0.97 0.015 85);
}

.vid {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--navy);
    padding: 0 10px;
    background: var(--sheet);
}

.vid span {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
}

.vid input {
    border: 0;
    background: transparent;
    font: inherit;
    width: 8rem;
    padding: 8px 0;
    outline: none;
}

.bench-load {
    padding-top: 18px;
    padding-bottom: 8px;
}

.path-form label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
}

.path-row {
    display: flex;
    gap: 8px;
    align-items: stretch;
}

.picker {
    flex: 1;
    min-width: 0;
    position: relative;
}

.picker input {
    width: 100%;
    border: 1px solid var(--line);
    background: var(--sheet);
    color: var(--ink);
    font: inherit;
    padding: 10px 12px;
    outline: none;
}

.picker input:focus {
    border-color: var(--teal);
}

.menu {
    position: absolute;
    z-index: 20;
    left: 0;
    right: 0;
    top: calc(100% + 4px);
    max-height: 320px;
    overflow: auto;
    background: var(--sheet);
    border: 1px solid var(--line);
    box-shadow: 0 14px 30px oklch(0.4 0.03 85 / 0.16);
}

.group-h {
    padding: 8px 12px 4px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--muted);
    background: oklch(0.97 0.008 82);
    position: sticky;
    top: 0;
}

.menu button {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr) auto;
    gap: 8px;
    width: 100%;
    border: 0;
    border-top: 1px solid oklch(0.92 0.01 82);
    background: transparent;
    color: var(--ink);
    font: inherit;
    text-align: left;
    padding: 8px 12px;
    cursor: pointer;
}

.menu button .name,
.menu button .meta {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.menu button .meta {
    color: var(--muted);
    font-size: 0.85rem;
}

.menu button em {
    font-style: normal;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--muted);
}

.menu button.on {
    background: oklch(0.93 0.03 195);
}

.menu button.current .name {
    font-weight: 700;
}

.menu-empty {
    margin: 0;
    padding: 12px;
    color: var(--muted);
    font-size: 0.9rem;
}

.path-row > button {
    border: 0;
    background: var(--teal);
    color: oklch(0.98 0.01 195);
    font: inherit;
    font-weight: 700;
    padding: 10px 16px;
    white-space: nowrap;
    cursor: pointer;
}

.path-row > button:disabled {
    opacity: 0.6;
    cursor: wait;
}

.hint {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 0.86rem;
}

.status {
    margin: 12px 0 0;
    min-height: 1.4em;
    color: var(--muted);
    font-size: 0.92rem;
}

.status.err {
    color: var(--err);
}

.status.ok {
    color: var(--ok);
}

.bench-stage {
    padding: 18px clamp(16px, 3vw, 28px) 40px;
}

.sheet {
    max-width: 1120px;
    margin: 0 auto;
    background: var(--sheet);
    border: 1px solid var(--line);
    box-shadow: 0 18px 40px oklch(0.4 0.03 85 / 0.12);
    min-height: 420px;
    padding: 18px 20px 28px;
    position: relative;
}

.sheet.busy::after {
    content: "";
    position: absolute;
    inset: 0;
    background: oklch(0.99 0.004 90 / 0.55);
}

.empty {
    display: grid;
    place-content: center;
    min-height: 360px;
    text-align: center;
    gap: 8px;
    color: var(--muted);
}

.empty strong {
    color: var(--ink);
    font-size: 1.15rem;
}

@media (max-width: 720px) {
    .path-row {
        flex-direction: column;
    }
}
</style>
