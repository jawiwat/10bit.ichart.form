export default {
    template: `
<div class="bg-white">
    <div v-if="mode=='form'">
        <div>
            <div><!--header-->
                <h4 class="text-center font-weight-bold mt-2">ชื่อฟอร์ม</h4>
            </div>
            <div><!--body-->
                <select2 v-model="val.phyname" :url="'/api/UserDatas/SearchAll'" class="ml-2 mr-2" minlen="1" sendpropname="kw" :processresult="processsearchphyresutl" @docname="asanamerec"  ref="searchadmisowner"></select2>
            </div>
            <div><!--footer -->
                <div class="text-center"><button class="btn btn-primary mt-2 w-25" style="text-align:center" @click="savedata" type="button"><i class="fa fa-fw fa-save"></i>บันทึกเอกสาร</button></div>
                <div class="text-center"><span class="small text-red"><b>***กรุณากดปุ่มบันทึกเอกสารทุกครั้งเมื่อมีการเพิ่มหรือเปลี่ยนแปลงข้อมูล***</b></span></div>
            </div>
        </div>
    </div>
    <div v-if="mode=='print'">
        
    </div>
</div>
`,
    data() {
        return {
            val: {
                name: '',
                cc: '',
                hpi: '',
                Lastvs: {},
            },
            //userdt: JSON.parse(localStorage.userdata).FirstName + " " + JSON.parse(localStorage.userdata).LastName,
        };
    },
    props: {
        // interface method
        // donot remove
        mode: '',//form,print
        visitid: '',
        rid: '',//formid
        formdataid: undefined,//formdata id
        PatientAccess_RID: '',
        cuserid: '',
        formtype: '',
        vid: '',
        //----------------------
    },
    watch: {
    },
    computed: {
        user() {
            var local = localStorage.userdata || null;
            return JSON.parse(local);
        },
        uname() {
            return this.user.FirstName + ' ' + (this.user.LastName || '');
        }
    },
    mounted: function () {
        this.loaddata();
    },
    methods: {
        // interface method 
        // donot remove
        setdata: function (d) {
            var th = this;
            th.val = d;
            th.val.createDate = toDateTimeString();
            if (!th.val.Lastvs) {
                th.val.Lastvs = {}
            }
            if (th.mode != 'print') {
                this.$refs.searchadmisowner.setRawvalue(th.val.phyname);

            }
        },
        loaddata: function () {
            var th = this;
            CallWebAPI('/api/OPDCard/loadhospitalinformation', '', 'POST', (res) => {
                if (res && res.result) {
                    th.val.hosname = res.result.name
                }
            });
            CallWebAPI('/api/VisitDatas/Searchpatientvisit', JSON.stringify({ vid: th.vid }), 'POST', (res) => {
                th.Patient = res
                th.val.patient = th.Patient.Patient;
                th.val.hn = th.Patient.HN
                if (res.DOB) {
                    var today = new Date(res.DOB);
                    var age = new Date().getFullYear() - today.getFullYear();
                }
                th.val.age = age
                th.loadArrfirst();

            });
        },
        processsearchphyresutl: function (data) {
            var res = data.map((x) => {
                var lname = "";
                if (x.LastName != null) {
                    lname = x.LastName;
                }
                return {
                    id: x.FirstName + " " + lname,
                    text: x.FirstName + " " + lname,
                    data: x,
                };
            });
            return res;
        },
        asanamerec: function (data) {
            var th = this
            this.$refs.searchadmisowner.setRawvalue(data.text);
            th.val.asaName = data.text
        },
        loadArrfirst: function () {
            var th = this;
            if (th.formdataid != undefined && th.formdataid) {
                return true
            }
            CallWebAPI('/api/EMR/loadopdscreenprogress', JSON.stringify({ an: th.Patient.AN }), 'POST', (res) => {
                if (th.formdataid != undefined && th.formdataid) {
                    return true
                }
                if (res && res.status) {
                    if (res.result.length > 0) {
                        th.val.cc = res.result[0].cc
                        th.val.hpi = res.result[0].hpi
                    }
                }
                if (th.Patient.LastVitalsign) {
                    th.val.Lastvs = th.Patient.LastVitalsign;
                }
            });

        },
        savedata: function () {
            this.val.saveName = this.uname;
            if (this.formdataid != undefined) {
                this.updatedata();
                return;
            }
            var req = {
                FormDB: JSON.stringify(this.val),
                Formbuilder_RID: this.rid,
                Owner_RID: this.cuserid,
                CreateByID: this.cuserid,
                Type: this.formtype,
                Visit_RID: this.vid,
                DateUpdate: moment().format("YYYY-MM-DDtHH:mm:ss"),

            }

            var th = this;
            CallWebAPI('/api/formdatas/', JSON.stringify(req), 'POST', (res) => {
                th.$emit('formsaved', res);
            });

        },
        updatedata: function () {
            var req = {
                FormDB: JSON.stringify(this.val),
                RID: this.formdataid,
                UserEdit_RID: this.cuserid,
            }
            var th = this;
            CallWebAPI('/api/FormDatas/updateForm', JSON.stringify(req), 'PUT', res => {
                th.$emit('formsaved', res);
            })
        }
        //----------------------------
    }
}