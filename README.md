# iChart Form

Development environment for building and testing Vue 3 forms that integrate with the iChart EMR system. Forms are loaded dynamically at runtime and communicate with the iChart backend API.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- Access to an iChart backend (for API calls during development)
- **jQuery** and **Select2** — place `jquery.min.js` and `select2.full.min.js` in `src/js/` (required by `main.js`)

## Environment Setup

```sh
npm install
```

This installs:

| Package | Purpose |
|---------|---------|
| `vue` | Vue 3 framework |
| `vue3-sfc-loader` | Runtime compiler for remote `.vue` forms |
| `bootstrap` | UI styling |
| `moment` | Date/time formatting |
| `vite` | Dev server and build tool |
| `@vitejs/plugin-vue` | Vue SFC support |

## Development

Run the dev server and a production preview in **two separate terminals**.

### Terminal 1 — Dev server

```sh
npm run dev
```

Starts Vite on `http://0.0.0.0:5173` (accessible on your local network). Hot reload is enabled.

### Terminal 2 — Build and preview

```sh
npm run build
npm run preview
```

- `npm run build` — bundles the app into `dist/`
- `npm run preview` — serves the production build locally for verification

## Testing Forms

The app includes `TestForm.vue`, a form loader for local development.

1. Open the dev server URL in a browser.
2. Click a local file chip (`test.vue`, `test.js`, `default.js`) or paste a path and press **โหลดฟอร์ม**.
3. Switch **กรอกฟอร์ม** / **พิมพ์**. Press Enter in the path field to reload.
4. Set **VID** to load patient data from the API. Last path, mode, and VID are remembered.

Example paths:

```
/test/test.vue
/test/default.js
/test/test.js
/รพ-ราชบุรี/dischargeSummary.js
```

> **Note:** Form paths starting with `/รพ-*` are served from the iChart backend in production. During local dev you may need a Vite proxy or to place form files under `public/`.

### Authentication

API calls use a Bearer token from `localStorage.userdata`. Before testing, set user data in the browser console:

```js
localStorage.setItem('userdata', JSON.stringify({
  Token: 'your-jwt-token',
  FirstName: 'ชื่อ',
  LastName: 'นามสกุล',
  RID: 1
}))
```

Optional permissions:

```js
localStorage.setItem('Permission', JSON.stringify([
  { Name: 'permissionname', RID: 1, Correction: true }
]))
```

## Form Development

Each form is a Vue options component exported as `default` from a `.js` or `.vue` file.

- **`.js`** — options object with a `template` string (legacy / iChart Form Builder)
- **`.vue`** — Single File Component (`<template>` + `<script>`). Local files are compiled by Vite. Remote `.vue` files are compiled at runtime with `vue3-sfc-loader`.

See `test/test.vue` for a working SFC example. Forms should keep the Options API so `setdata` / `savedata` / `loaddata` remain callable by the host.

### Minimal structure (`.vue`)

```vue
<template>
  <div class="bg-white">
    <div v-if="mode == 'form'">
      <!-- editable form UI -->
    </div>
    <div v-if="mode == 'print'">
      <!-- print layout -->
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      val: {}
    }
  },
  props: {
    mode: '',
    visitid: '',
    rid: '',
    formdataid: undefined,
    PatientAccess_RID: '',
    cuserid: '',
    formtype: '',
    vid: '',
  },
  mounted() {
    this.loaddata()
  },
  methods: {
    setdata(d) { /* load saved form data */ },
    loaddata() { /* fetch patient / hospital data */ },
    savedata() { /* create new record */ },
    updatedata() { /* update existing record */ },
  }
}
</script>
```

### Minimal structure (`.js`)

```js
export default {
  template: `
    <div class="bg-white">
      <div v-if="mode == 'form'">
        <!-- editable form UI -->
      </div>
      <div v-if="mode == 'print'">
        <!-- print layout -->
      </div>
    </div>
  `,
  data() {
    return {
      val: {}   // all form field values go here
    }
  },
  props: {
    mode: '',              // 'form' | 'print'
    visitid: '',
    rid: '',               // form builder ID
    formdataid: undefined, // existing saved record ID (undefined = new)
    PatientAccess_RID: '',
    cuserid: '',
    formtype: '',
    vid: '',               // visit ID
  },
  mounted() {
    this.loaddata()
  },
  methods: {
    setdata(d) { /* load saved form data */ },
    loaddata() { /* fetch patient / hospital data */ },
    savedata() { /* create new record */ },
    updatedata() { /* update existing record */ },
  }
}
```

See `test/default.js` for a complete working example with Select2 and API integration.

### Required props (do not remove)

| Prop | Type | Description |
|------|------|-------------|
| `mode` | `string` | `'form'` or `'print'` |
| `visitid` | `string` | Visit identifier |
| `rid` | `string` | Form builder ID |
| `formdataid` | `number \| undefined` | Saved form data ID; `undefined` means new record |
| `PatientAccess_RID` | `string` | Patient access record ID |
| `cuserid` | `string` | Current user ID |
| `formtype` | `string` | Form type identifier |
| `vid` | `string` | Visit ID used for patient lookup |

### Required methods (do not remove)

| Method | When called | Purpose |
|--------|-------------|---------|
| `setdata(d)` | Host loads saved data | Populate `val` from stored `FormDB` JSON |
| `loaddata()` | `mounted` | Fetch hospital info, patient visit, vitals |
| `savedata()` | Save button click | POST new record to `/api/formdatas/` |
| `updatedata()` | Save button click (existing) | PUT update to `/api/FormDatas/updateForm` |

On successful save, emit `formsaved` with the API response:

```js
this.$emit('formsaved', res)
```

### Save payload

**Create** (`formdataid` is undefined):

```js
{
  FormDB: JSON.stringify(this.val),
  Formbuilder_RID: this.rid,
  Owner_RID: this.cuserid,
  CreateByID: this.cuserid,
  Type: this.formtype,
  Visit_RID: this.vid,
  DateUpdate: moment().format('YYYY-MM-DDtHH:mm:ss'),
}
```

**Update** (`formdataid` is set):

```js
{
  FormDB: JSON.stringify(this.val),
  RID: this.formdataid,
  UserEdit_RID: this.cuserid,
}
```

### Common API endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/OPDCard/loadhospitalinformation` | POST | Hospital name |
| `/api/VisitDatas/Searchpatientvisit` | POST | Patient visit data |
| `/api/EMR/loadopdscreenprogress` | POST | CC, HPI from OPD screen |
| `/api/formdatas/` | POST | Create form data |
| `/api/FormDatas/updateForm` | PUT | Update form data |
| `/api/UserDatas/SearchAll` | POST | User/doctor search (Select2) |

## Global Utilities

Imported in `main.js` and exposed on `window`:

| Function | Description |
|----------|-------------|
| `CallWebAPI(url, data, method, callback)` | Authenticated `fetch` wrapper |
| `moment` | Date formatting library |
| `toDateString(date, format?)` | Thai locale date string |
| `toDateTimeString(date, format?)` | Thai locale date + time |
| `toTimeString(date, format?)` | Time string |
| `getAgeYMD(bdate, sdate?)` | Age as years/months/days (Thai) |
| `getYearAge(bdate, sdate?)` | Age in years only |
| `getGender(code)` | `M` → ชาย, `F` → หญิง |
| `getBathText(number)` | Number to Thai baht text |
| `getpermission(...names)` | Check user permissions |
| `OpenLoading` / `CloseLoading` | Bootstrap modal loading |
| `CallConfirmBox(callback)` | Confirmation dialog |

Helper methods are also injected into loaded form components by `TestForm.vue`:

`toDateString`, `toDateTimeString`, `toTimeString`, `getAgeYMD`, `getYearAge`, `moment`

## Select2 Component

Registered globally as `<select2>`. Used for AJAX search dropdowns:

```html
<select2
  v-model="val.phyname"
  :url="'/api/UserDatas/SearchAll'"
  minlen="1"
  sendpropname="kw"
  :processresult="processsearchphyresutl"
  ref="searchadmisowner"
/>
```

| Prop | Description |
|------|-------------|
| `url` | API endpoint |
| `minlen` | Minimum characters before search |
| `sendpropname` | JSON property name for search term (default: `term`) |
| `processresult` | Transform API response to `{ id, text }[]` |
| `processrequest` | Transform search term before sending |
| `selectedcallback` | Called on selection |

Use `this.$refs.searchadmisowner.setRawvalue(value)` in `setdata()` to restore a saved selection.

## Project Structure

```
ichart-form/
├── index.html              # Entry HTML
├── vite.config.js          # Vite config (host: 0.0.0.0)
├── package.json
├── src/
│   ├── main.js             # App bootstrap, global imports
│   ├── App.vue             # Root component
│   ├── Commonfunction.js   # Shared utilities (CallWebAPI, dates, etc.)
│   ├── formLoader.ts       # Dynamic .js / .vue form loader
│   ├── style.css           # Global styles
│   ├── adminlte.min.css    # AdminLTE theme
│   ├── components/
│   │   ├── TestForm.vue    # Dev form loader
│   │   ├── Select2.vue     # AJAX select dropdown
│   │   └── HelloWorld.vue
│   ├── fontawesome-pro/    # Font Awesome Pro icons
│   └── js/                 # jQuery, Select2 (add manually)
├── test/
│   ├── default.js          # Example form with Select2
│   ├── test.js             # Example form (JS module)
│   └── test.vue            # Example form (Vue SFC)
└── dist/                   # Production build output
```

## Build & Deployment

```sh
npm run build
```

Output is written to `dist/`. Deploy this folder to your web server or integrate form `.js` files into the iChart Form Builder.

In production, forms are typically served from:

```
/api/FormBuilders/vue/getform/{Formbuilder_RID}
```

or hospital-specific paths such as `/รพ-{hospital}/{formName}.js` or `/รพ-{hospital}/{formName}.vue`.

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
