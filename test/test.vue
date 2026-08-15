<template>
<div class="bg-white">
    <div v-if="mode=='form'">
        <div>
            <div><!--header-->
                <h4 class="text-center font-weight-bold mt-2">ชื่อฟอร์ม</h4>
            </div>
            <div><!--body-->
                <div class="mb-2">
                    <label class="mb-0">ข้าพเจ้า</label>
                </div>
                <div class="row mb-2">
                    <div class="col-md-6">
                        <label>ได้ทำการตรวจร่างกายของ</label>
                        <input type="text" v-model="val.patientName" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label>สถานที่อยู่ (ที่สามารถติดต่อได้)</label>
                        <input type="text" v-model="val.address" class="form-control">
                    </div>
                </div>
                <div class="row mb-2">
                    <div class="col-md-6">
                        <label>เบอร์โทรศัพท์</label>
                        <input type="text" v-model="val.phone" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label>หมายเลขบัตรประชาชน</label>
                        <input type="text" v-model="val.cid" class="form-control">
                    </div>
                </div>
                <div class="row mb-2 align-items-end">
                    <div class="col-md-4">
                        <label>แล้วเมื่อวันที่</label>
                        <input type="datetime-local" v-model="val.examDate" class="form-control">
                    </div>
                    <div class="col-md-8">
                        <button type="button" class="btn btn-info" @click="loadCcDx">
                            <i class="fa fa-plus"></i> คลิกเพื่อดึงข้อมูลอาการสำคัญและการวินิจฉัย
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <label>มีอาการ</label>
                    <textarea v-model="val.symptoms" class="form-control" rows="4"></textarea>
                </div>
                <div class="mb-2">
                    <label>การวินิจฉัยโรค</label>
                    <textarea v-model="val.diagnosis" class="form-control" rows="4"></textarea>
                </div>
                <div class="mb-2">
                    <label class="font-weight-bold">สรุปความเห็น และข้อแนะนำของแพทย์</label>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="chkTreatInHospital" v-model="val.treatInHospital">
                        <label class="form-check-label" for="chkTreatInHospital">ผู้ป่วยได้รับการรักษาในโรงพยาบาล</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="chkRestLeave" v-model="val.restLeave">
                        <label class="form-check-label" for="chkRestLeave">หยุดพักรักษาตัว</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="chkDoctorOpinion" v-model="val.doctorOpinion">
                        <label class="form-check-label" for="chkDoctorOpinion">ความเห็นของแพทย์</label>
                    </div>
                </div>
            </div>
            <div><!--footer -->
                <div class="text-center"><button class="btn btn-primary mt-2 w-25" style="text-align:center" @click="savedata" type="button"><i class="fa fa-fw fa-save"></i>บันทึกเอกสาร</button></div>
                <div class="text-center"><span class="small text-red"><b>***กรุณากดปุ่มบันทึกเอกสารทุกครั้งเมื่อมีการเพิ่มหรือเปลี่ยนแปลงข้อมูล***</b></span></div>
            </div>
        </div>
    </div>
    <div v-if="mode=='print'">
        <div style="padding: 20px; font-size: 16px; line-height: 1.8;">
            <h4 class="text-center font-weight-bold mb-4">ใบรับรองแพทย์</h4>
            <div class="mb-2">
                ข้าพเจ้า ได้ทำการตรวจร่างกายของ
                <span style="display:inline-block; min-width:220px; border-bottom:1px solid #000; text-align:center;">{{ val.patientName }}</span>
                สถานที่อยู่ (ที่สามารถติดต่อได้)
                <span style="display:inline-block; min-width:200px; border-bottom:1px solid #000; text-align:center;">{{ val.address }}</span>
            </div>
            <div class="mb-2">
                เบอร์โทรศัพท์
                <span style="display:inline-block; min-width:140px; border-bottom:1px solid #000; text-align:center;">{{ val.phone }}</span>
                หมายเลขบัตรประชาชน
                <span style="display:inline-block; min-width:180px; border-bottom:1px solid #000; text-align:center;">{{ val.cid }}</span>
            </div>
            <div class="mb-2">
                แล้วเมื่อวันที่
                <span style="display:inline-block; min-width:180px; border-bottom:1px solid #000; text-align:center;">{{ formatExamDate(val.examDate) }}</span>
            </div>
            <div class="mb-2">
                มีอาการ
                <div style="min-height:60px; border-bottom:1px solid #000; white-space:pre-wrap; padding:4px 0;">{{ val.symptoms }}</div>
            </div>
            <div class="mb-3">
                การวินิจฉัยโรค
                <div style="min-height:60px; border-bottom:1px solid #000; white-space:pre-wrap; padding:4px 0;">{{ val.diagnosis }}</div>
            </div>
            <div class="mb-2">
                <b>สรุปความเห็น และข้อแนะนำของแพทย์</b>
            </div>
            <div class="mb-1">
                <span style="font-family:monospace;">{{ val.treatInHospital ? '☑' : '☐' }}</span>
                ผู้ป่วยได้รับการรักษาในโรงพยาบาล
            </div>
            <div class="mb-1">
                <span style="font-family:monospace;">{{ val.restLeave ? '☑' : '☐' }}</span>
                หยุดพักรักษาตัว
            </div>
            <div class="mb-3">
                <span style="font-family:monospace;">{{ val.doctorOpinion ? '☑' : '☐' }}</span>
                ความเห็นของแพทย์
            </div>
            <div class="row mt-5">
                <div class="col-6"></div>
                <div class="col-6 text-center">
                    <div>ลงชื่อ .............................................</div>
                    <div>({{ val.saveName || '.............................................' }})</div>
                    <div>แพทย์ผู้ตรวจ</div>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            val: {
                name: '',
                patientName: '',
                address: '',
                phone: '',
                cid: '',
                examDate: '',
                symptoms: '',
                diagnosis: '',
                treatInHospital: false,
                restLeave: false,
                doctorOpinion: false,
                cc: '',
                hpi: '',
                Lastvs: {},
            },
        };
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
    watch: {
    },
    computed: {
        user() {
            try {
                return JSON.parse(localStorage.userdata || 'null') || {}
            } catch (e) {
                return {}
            }
        },
        uname() {
            return ((this.user.FirstName || '') + ' ' + (this.user.LastName || '')).trim()
        }
    },
    mounted: function () {
        this.loaddata();
    },
    methods: {
        setdata: function (d) {
            var th = this;
            th.val = d;
            th.val.createDate = toDateTimeString();
            if (!th.val.Lastvs) {
                th.val.Lastvs = {}
            }
        },
        formatExamDate: function (date) {
            if (!date) return '';
            return moment(date).format('DD/MM/YYYY, HH:mm');
        },
        loaddata: function () {
            var th = this;
            CallWebAPI('/api/OPDCard/loadhospitalinformation', '', 'POST', (res) => {
                if (res && res.result) {
                    th.val.hosname = res.result.name
                }
            });
            CallWebAPI('/api/VisitDatas/Searchpatientvisit', JSON.stringify({ vid: th.vid }), 'POST', (res) => {
                if (!res || res === false) {
                    return
                }
                th.Patient = res
                th.val.patient = th.Patient.Patient;
                th.val.hn = th.Patient.HN
                if (res.Patient) {
                    var p = res.Patient;
                    var prefix = p.PrefixName || p.TitleName || '';
                    th.val.patientName = (prefix + ' ' + (p.FirstName || '') + ' ' + (p.LastName || '')).trim();
                    th.val.address = p.Address || p.CurrentAddress || th.val.address;
                    th.val.phone = p.Mobile || p.Phone || p.Tel || th.val.phone;
                    th.val.cid = p.CID || p.CitizenID || th.val.cid;
                }
                if (!th.val.examDate) {
                    th.val.examDate = moment().format('YYYY-MM-DDTHH:mm');
                }
                if (res.DOB) {
                    var today = new Date(res.DOB);
                    var age = new Date().getFullYear() - today.getFullYear();
                }
                th.val.age = age
                th.loadArrfirst();

            });
        },
        loadCcDx: function () {
            var th = this;
            if (!th.Patient || !th.Patient.AN) {
                return;
            }
            CallWebAPI('/api/EMR/loadopdscreenprogress', JSON.stringify({ an: th.Patient.AN }), 'POST', (res) => {
                if (res && res.status && res.result && res.result.length > 0) {
                    th.val.cc = res.result[0].cc || '';
                    th.val.hpi = res.result[0].hpi || '';
                    th.val.symptoms = th.val.cc || th.val.hpi || '';
                    th.val.diagnosis = res.result[0].dx || res.result[0].diagnosis || th.val.diagnosis;
                }
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
    }
}
</script>
