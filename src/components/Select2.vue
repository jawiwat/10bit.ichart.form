<template>
     <select class="form-control" :name="name" :disabled="disabled" :required="required" ref="refsel2"></select>
</template>
<script>
    export default {
        data() {
            return {
                select2: null,
            };
        },
        model: {
            event: 'change',
            prop: 'value'
        },
        props: {
            id: {
                type: String,
                default: ''
            },
            name: {
                type: String,
                default: ''
            },
            placeholder: {
                type: String,
                default: ''
            },
            options: {
                type: Array,
                default: () => []
            },
            disabled: {
                type: Boolean,
                default: false
            },
            required: {
                type: Boolean,
                default: false
            },
            settings: {
                type: Object,
                default: () => { }
            },
            method: {
                type: String,
                default: 'POST'
            },
            minlen: {
                type: String,
                default: 2
            },
            url: '',
            modelValue: {
                default: null
            },
            selectedcallback: {
                type: Function,
                default: undefined
            },
            processresult: {
                type: Function,
                default: undefined
            },
            processrequest: {
                type: Function,
                default: undefined
            },
            sendpropname: {
                type: String,
                default: 'term'
            },
            htmltoption: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            options(val) {
                this.setOption(val);
            },
            //value(val) {
            //    this.setValue(val);
            //}
            aa(val){
                console.log('val',val);
            }
        },
        emits: [
            'update:modelValue'
        ],
        computed: {
            aa() {
                return this.$el?.val
            }
        },
        methods: {
            setOption(val = []) {
                this.select2.empty();
                this.select2.select2({
                    placeholder: this.placeholder,
                    ...this.settings,
                    data: val
                });
                this.setValue(this.value);
            },
            setValue(val) {
                var th = this;

                if (val == 'undefined' || val == null || val == '' || val == this.value || val == {}) {
                    return;
                }
                //console.log('setValue', val);
                if (val instanceof Array) {
                    this.select2.val([...val]);
                    this.select2.trigger('change');
                } else {
                    var req = {
                        //term: val,
                    }
                    req[th.sendpropname] = val;
                    var th = this;
                    if (val == '') {
                        $(th.$refs.refsel2).empty();
                        th.select2.trigger('change');
                        th.$emit('change', undefined);
                        th.$emit('select', undefined);
                        return;
                    }

                    CallWebAPI(this.url, JSON.stringify(req), 'POST', function (res) {
                        //console.log(res)
                        if (res.length > 0) {
                            if (th.processresult != undefined) {
                                var res = th.processresult(res);
                                //console.log(res)
                                var option = new Option(res[0].text, res[0].id, false, false);// document.createElement('option');
                                //option.value = res[0].id;// $('<option value="' + res[0].id + '"></option>')
                                //option.innerHTML = (th.htmltoption == true ? (res[0].text) : res[0].text);
                                $(th.$refs.refsel2).append(option).change();
                                $(th.$refs.refsel2).val(res[0].id).change();
                                th.value = res[0].id;
                                th.$emit('change', th.value);
                                th.$emit('select', res[0]);
                            } else {
                                $(th.$refs.refsel2).append('<option value="' + res[0].id + '">' + res[0].text + '</option>')
                                $(th.$refs.refsel2).val(res[0].id).change();
                                th.select2.trigger('change');
                                th.value = res[0].id;
                                th.$emit('change', th.value);
                                th.$emit('select', th.value);
                            }
                            //console.log($(th.$refs.refsel2));
                        }

                        //th.select2.val(res[0]);
                        //th.select2.trigger('change');
                    });
                    //this.select2.val([val]);
                }
            },
            setRawvalue: function (val) {
                var th = this;
                //console.log(val);
                
                //if (val) {
                $(th.$refs.refsel2).append('<option value="' + val  + '">' + val + '</option>')
                   
                $(th.$refs.refsel2).val(val).trigger('change')
                //    console.log(th.$refs.refsel2);
                //}
                
               // ;
                //th.value = res[0].id;
                //th.$emit('change', th.value);
                //th.$emit('select', res[0]);
            },
            test: function () {
                console.log('lkjhgfdsfghjkl;');
            },
            clearValue() {
                var th=this
                th.val = null;
                th.value = null;
                $(th.$refs.refsel2).empty();
                th.select2.trigger('change');
                th.$emit('change', undefined);
                th.$emit('select', undefined);
            }
        },
        mounted() {
            var th = this;
            let auth = '';
            try {
                auth = JSON.parse(localStorage.userdata||null)?.Token;

            } catch (e) {

            }
            this.select2 = $(th.$refs.refsel2)
                //.find('select')
                .select2({
                    //width: '100%',
                    theme: 'bootstrap4',
                    placeholder: th.placeholder,
                    ...this.settings,
                    data: this.options,
                    minimumInputLength: this.minlen,
                    templateResult: function (d) {
                        if (th.htmltoption == true)
                            return $(d.text);
                        else
                            return d.text
                    },
                    templateSelection: function (d) {
                        if (th.htmltoption == true)
                            return $(d.text);
                        else
                            return d.text
                    },
                    ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
                        type: this.method,
                        //contentType: "application/json; charset=utf-8",
                        headers: {
                            "Content-Type": "application/json; charset=utf-8",
                            "Authorization": 'Bearer ' + auth
                        },
                        url: this.url,
                        //dataType: 'json',
                        data: function (term, page) {
                            var req = {
                                // term: term.term
                            }
                            req[th.sendpropname] = th.processrequest == undefined ? term.term : th.processrequest(term);

                            return JSON.stringify(req);//"{'term':\"" + term.term + "\"}";
                        },

                        processResults: function (data) {
                            // Tranforms the top-level key of the response object from 'items' to 'results'
                            if (th.processresult == undefined)
                                return {
                                    results: data
                                };
                            else {
                                return {
                                    results: th.processresult(data),
                                }
                            }
                        },
                    }
                })
                .on('select2:select select2:unselect', ev => {
                    this.$emit('change', this.select2.val());
                    this.$emit('select', ev['params']['data']);
                    this.$emit('docname', ev['params']['data']);
                    this.$emit('update:modelValue', this.select2.val())
                    if (this.selectedcallback != undefined)
                        this.selectedcallback(this.select2.val());
                });
            this.setValue(this.value);
        },
        beforeDestroy() {
            this.select2.select2('destroy');
        }
    }
</script>
<style scoped>
</style>