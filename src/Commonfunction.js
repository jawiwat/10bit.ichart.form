
function CallWebAPI(url, data, method, successCallBack, json=true) {
    let auth = '';
    try {
        auth = JSON.parse(localStorage.userdata).Token;

    } catch (e) {

    }

    fetch(url, {
        method: method,
        body: method == 'GET' ? undefined : data,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": 'Bearer ' + auth,
        }
    })
        .then(res => {

            if (json) {

                res.json().then(jj => {
                    successCallBack(jj);
                }).catch(er => {
                    successCallBack(false);
                })
            } else {
                res.text().then(j=> {
                successCallBack(j)
                })
            }
        })
        .catch(res => {
            console.log(res)
            successCallBack(false);
        })
}
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function toDateString(date, fm) {
    var str = '';

    if (fm == undefined)
        str = new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', });
    else
        str = moment(date).format(fm);
    return str;
}
function toDateTimeString(date, fm) {
    var str = '';

    if (fm == undefined) {
        str = new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', });
        str += ' ' + moment(date).format('HH:mm');
    }
    else
        str = moment(date).format(fm);
    return str;
}
function toTimeString(date, fm) {
    var str = '';
    if (fm == undefined) {
        //str = new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', });
        str += ' ' + moment(date).format('HH:mm');
    }
    else
        str = moment(date).format(fm);
    return str;
}
function getAge(birthYear) {
    var d = new Date();
    var n = d.getFullYear();
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    age = currentYear - birthYear;
    return age;
}
function getAgeYMD(bdate, sdate) {
    if (!bdate) return;
    var dob = bdate//moment(bdate).format('YYYY-MM-DDTHH:mm:ss')
    var age = '-'
    if (dob != null) {
        var getdayBirth = dob.split("-");
        var YB = parseInt(getdayBirth[0]);
        var MB = parseInt(getdayBirth[1]);
        var getday = getdayBirth[2].split("T");
        var DB = parseInt(getday[0]);
        var today = sdate ? new Date(sdate) : new Date(),
            result = {
                years: 0,
                months: 0,
                days: 0,
                toString: function () {
                    return (this.years ? this.years + ' ปี ' : '')
                        + (this.months ? this.months + ' เดือน ' : '')
                        + (this.days ? this.days + ' วัน' : '');
                }
            };
        result.months = ((today.getFullYear() * 12) + (today.getMonth() + 1)) - ((YB * 12) + (MB));

        if (0 > (result.days = today.getDate() - DB)) {
            var y = today.getFullYear(), m = today.getMonth();
            m = (--m < 0) ? 11 : m;
            result.days +=
                [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]
                + (((1 == m) && ((y % 4) == 0) && (((y % 100) > 0) || ((y % 400) == 0)))
                    ? 1 : 0);
            --result.months;
        }
        result.years = (result.months - (result.months % 12)) / 12;
        result.months = (result.months % 12);
        age = result.years + " ปี " + result.months + " เดือน " + result.days + " วัน";
    }
    return age;
}
function getYearAge(bdate, sdate) {
    if (!bdate) return;
    var dob = bdate//moment(bdate).format('YYYY-MM-DDTHH:mm:ss')
    var age = '-'
    if (dob != null) {
        var getdayBirth = dob.split("-");
        var YB = parseInt(getdayBirth[0]);
        var MB = parseInt(getdayBirth[1]);
        var getday = getdayBirth[2].split("T");
        var DB = parseInt(getday[0]);
        var today = sdate ? new Date(sdate) : new Date(),
            result = {
                years: 0,
                months: 0,
                days: 0,
                toString: function () {
                    return (this.years ? this.years + ' ปี ' : '')
                        + (this.months ? this.months + ' เดือน ' : '')
                        + (this.days ? this.days + ' วัน' : '');
                }
            };
        result.months = ((today.getFullYear() * 12) + (today.getMonth() + 1)) - ((YB * 12) + (MB));

        if (0 > (result.days = today.getDate() - DB)) {
            var y = today.getFullYear(), m = today.getMonth();
            m = (--m < 0) ? 11 : m;
            result.days +=
                [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m]
                + (((1 == m) && ((y % 4) == 0) && (((y % 100) > 0) || ((y % 400) == 0)))
                    ? 1 : 0);
            --result.months;
        }
        result.years = (result.months - (result.months % 12)) / 12;
        result.months = (result.months % 12);
        age = result.years;
    }
    return age;
}
function getGender(gendere) {
    var str = ''
    if (gendere == 'M') {
        str = "ชาย";
    } else if (gendere == 'F') {
        str = "หญิง";
    } else {
        str = "ไม่ระบุ";
    }
    return str;
}
function OpenLoading(id = '#mdw') {
    $(id).modal(
        {
            backdrop: 'static',
            keyboard: false
        });
}
function CloseLoading(id = '#mdw') {
    setTimeout(() => { $(id).modal('hide'); }, 200);

}
function CallConfirmBox(callback) {

   // console.log('CallConfirmBox',$('#mdMainConfirmSave'));
    $('#mdMainConfirmSave .btn-primary').off('click');
    $('#mdMainConfirmSave').modal();
    $('#mdMainConfirmSave .btn-primary').click(function () {
        $('#mdMainConfirmSave').modal('hide');
        callback();
        $(this).off('click');
    });


}
var getBathText = function (inputNumber) {

    var getText = function (input) {
        var toNumber = input.toString();
        var numbers = toNumber.split('').reverse();

        var numberText = "/หนึ่ง/สอง/สาม/สี่/ห้า/หก/เจ็ด/แปด/เก้า/สิบ".split('/');
        var unitText = "/สิบ/ร้อย/พ้น/หมื่น/แสน/ล้าน".split('/');

        var output = "";
        for (var i = 0; i < numbers.length; i++) {
            var number = parseInt(numbers[i]);
            var text = numberText[number];
            var unit = unitText[i];

            if (number == 0)
                continue;

            if (i == 1 && number == 2) {
                output = "ยี่สิบ" + output;
                continue;
            }

            if (i == 1 && number == 1) {
                output = "สิบ" + output;
                continue;
            }


            output = text + unit + output;
        }

        return output;
    }

    var fullNumber = Math.floor(inputNumber);
    var decimal = inputNumber - fullNumber;

    if (decimal == 0) {

        return getText(fullNumber) + "บาทถ้วน";

    } else {

        // convert decimal into full number, need only 2 digits
        decimal = decimal * 100;
        decimal = Math.round(decimal);

        return getText(fullNumber) + "บาท" + getText(decimal) + "สตางค์";
    }

};
//function closeLoadingPage() {
//    let md = document.getElementById('md_pageload');
//    console.log(md);
//    //return;
//    //$(id).modal(
//    //    {
//    //        backdrop: 'static',
//    //        keyboard: false
//    //    }
//    //);
//}
function openLoadingPage() {
    setTimeout(() => { $('#md_pageload').modal(); }, 200);

    //let md = document.getElementById('md_pageload');
    //md.className = 'modal';
    //md.setAttribute('style', '');
    //let bd = document.querySelector('.modal-backdrop.show');
    //if (bd) {
    //bd.remove();
    //}
}

function closeLoadingPage() {
    setTimeout(() => { $('#md_pageload').modal('hide'); }, 200);

    //let md = document.getElementById('md_pageload');
    //md.className = 'modal';
    //md.setAttribute('style', '');
    //let bd = document.querySelector('.modal-backdrop.show');
    //if (bd) {
    //bd.remove();
    //}
}
function openoverloadding(el) {
    var ld = `
<div id="loadoveride" style="background:rgba(52,58,64,.7)" class="w-100 h-100 position-absolute d-flex align-items-center text-center">
    <div class="w-100 text-center">
        <i class="fas fa-spinner fa-pulse fa-3x"></i>
        <p>Loading...</p>
    </div>
</div>
`;
    $(el).append(ld)
}

function closeoverloadding(el) {
    $(el).find('#loadoveride').remove();
}

function getpermission(...name) {
    var th = this
    if (name.length == 0) {
        return null
    }
    
    var per = JSON.parse(localStorage.Permission || null) ?? []
    var f = per?.find(f => name.includes(f.Name.toLowerCase()))
    //console.log('fff',f);
    var pmg = f?.RID ? f?.Correction : null
    return pmg

}

window.CallWebAPI = CallWebAPI;
window.setCookie = setCookie;
window.getCookie = getCookie;
window.toDateString=toDateString;
window.toDateTimeString=toDateTimeString;
window.toTimeString=toTimeString;
window.getAge=getAge;
window.getAgeYMD=getAgeYMD;
window.getYearAge=getYearAge;
window.getGender=getGender;
window.OpenLoading=OpenLoading;
window.CloseLoading=CloseLoading;
window.CallConfirmBox=CallConfirmBox;
window.getBathText=getBathText;
window.openLoadingPage=openLoadingPage;
window.closeLoadingPage=closeLoadingPage;
window.openoverloadding=openoverloadding;
window.closeoverloadding=closeoverloadding;
window.getpermission=getpermission;

export default {getpermission }