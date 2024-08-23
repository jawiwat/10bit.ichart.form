<template>
    <div>
        TEST form
    </div>
    <div class="row">
        <div class="col">
            <div class="input-group">
                <input v-model="formurl" class="form-control">
                <div class="input-group-append">
                    <button class="btn btn-primary" @click="loadForm(formurl)">import form</button>
                </div>
            </div>
        </div>
        <div class="col">
            <select class="form-control" v-model="mode">
                <option>form</option>
                <option>print</option>
            </select>
        </div>
        <div class="col">
           <input type="text" v-model="vid" placeholder="VID" class="form-control">
        </div>
    </div>
    <KeepAlive>
        <component :is="comp" :mode="mode" :vid="vid" ref="vueform3">
        </component>
    </KeepAlive>
</template>
<script>
export default {
    data() {
        return {
            formurl:'',
            comp:'',
            vid:0,
            mode:'form',
        }
    },
    mounted() {

    },
    methods: {
        loadForm(compurl) {
            let th =this;
            ///รพ-สมุทรปราการ/admidsionnote.js
           // let compurl = '/api/FormBuilders/vue/getform/' + data.Formbuilder_RID;
            import(compurl)
                .then((g) => {
                    g.default.methods.toDateString = function (data) {
                        return toDateString(data)
                    }
                    g.default.methods.toDateTimeString = function (data) {
                        return toDateTimeString(data)
                    }
                    g.default.methods.toTimeString = function (data) {
                        return toTimeString(data)
                    }
                    g.default.methods.getAgeYMD = function (data) {
                        return getAgeYMD(data)
                    }
                    g.default.methods.getYearAge = function (data) {
                        return getYearAge(data)
                    }
                    g.default.methods.moment = function (data) {
                        return moment(data)
                    }

                    g.default.template = g.default.template.replaceAll('href="#"', 'href="javascript:;"')
                    let formname = 'formdatavue3-' +th.formurl.replaceAll('/','-')// data.Formbuilder_RID
                    app.component(formname, g.default);

                    console.log(app)
                    th.comp = formname;
                    th.display = true;
                    //  th.templateform= g.default.template


                });
        }
    }
}
</script>