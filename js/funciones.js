var http = new XMLHttpRequest();
var row;
var iID;
var iNombre;
var iCuatrimestre;
var iFecha;
var iManana;
var iNoche;
var bmt;
var loading;
window.addEventListener('load', loader);

function loader() {
    iNombre = document.getElementById('nombre');
    iCuatrimestre = document.getElementById('cuatrimestre');
    iFecha = document.getElementById('fecha');
    iManana = document.getElementById('manana');
    iNoche = document.getElementById('noche');

    btnEliminar = document.getElementById('btnDelete');
    btnModificar = document.getElementById('btnEdit');

    btnEnd = document.getElementById('end');
    bmt = document.getElementById('bodytable');
    loading = document.getElementById('loading');
    /* Eventos */
    btnModificar.addEventListener('click', Modificar);
    btnEliminar.addEventListener('click', Eliminar);

    btnEnd.addEventListener('click', cerrar)
    /* HTTP */
    http.onreadystatechange = cb;
    http.open("GET", `http://localhost:3000/materias`, true);
    http.send();
}

function cb() {
    if (http.readyState === 4) {
        if (http.status === 200) {
            let personas = http.responseText;
            FillGrid(JSON.parse(personas));
        }
    }
}

function FillGrid(personas) {
    try {
        personas.forEach(element => {
            let tr = document.createElement('tr');
            for (let index = 0; index < 5; index++) {
                let td = document.createElement('td');
                let tn;
                switch (index) {
                    case 0:
                        tn = document.createTextNode(element.id);
                        td.setAttribute('hidden', true);
                        break;
                    case 1:
                        tn = document.createTextNode(element.nombre);
                        break;
                    case 2:
                        tn = document.createTextNode(element.cuatrimestre);
                        break;
                    case 3:
                        tn = document.createTextNode(element.fechaFinal);
                        break;
                    case 4:
                        tn = document.createTextNode(element.turno);
                        break;
                    default:
                        break;
                }
                td.appendChild(tn);
                tr.appendChild(td);

            }
            tr.addEventListener('dblclick', modalShow);

            if (element.id % 2 == 0) {
                tr.setAttribute('class', 'filaImpar');
            }

            bmt.appendChild(tr);
        });
    } catch (error) {
        alert(error);
    }
}

function modalShow(e) {
    e.preventDefault();
    row = e.target.parentNode;
    openHideDiv();
    iID = e.target.parentNode.childNodes[0].textContent;
    iNombre.value = e.target.parentNode.childNodes[1].textContent;
    iCuatrimestre.value = e.target.parentNode.childNodes[2].textContent;
    iFecha.value = formatDate(e.target.parentNode.childNodes[3].textContent);
    iManana.checked = e.target.parentNode.childNodes[4].textContent == 'Mañana';
    iNoche.checked = e.target.parentNode.childNodes[4].textContent == 'Noche';
}

function $(id) {
    return document.getElementById(id).value;
}

function openHideDiv() {
    let div = document.getElementById('formPersona');
    div.hidden = !div.hidden;

    iNombre.removeAttribute('class', 'errValidation');
    iCuatrimestre.removeAttribute('class', 'errValidation');
    iCuatrimestre.disabled = true;
    iFecha.removeAttribute('class', 'errValidation');
    iManana.removeAttribute('class', 'errValidation');
    iNoche.removeAttribute('class', 'errValidation');
}

function hideSpinner(bHide) {
    let div = document.getElementById('loading');
    let img = document.getElementsByTagName('img')[0];
    div.hidden = bHide
    if (bHide) {
        img.setAttribute('class', 'hide-child');
    } else {
        img.removeAttribute('class', 'hide-child');
    }
}

function cerrar() {
    let div = document.getElementById('formPersona');
    div.hidden = true;
    resetForm();
    row = null;
}

function resetForm() {
    iNombre.value = '';
    iCuatrimestre.value = '';
    iFecha.value = '';
    iManana.checked = false;
    iNoche.checked = false;
}

/* eventos */

function Eliminar() {
    try {
        openHideDiv();
        hideSpinner(false);
        http.onreadystatechange = resDelete;
        http.open('POST', 'http://localhost:3000/eliminar', true);

        let obj = new Object();
        obj.id = iID;
        let element = JSON.stringify(obj);

        /* element = (`{"id":"${iID}"}`); */
        http.setRequestHeader('Content-type', 'application/json');
        http.send(element)
    } catch (error) {
        hideSpinner(true);
    }
}

function resDelete() {
    try {
        if (http.readyState == 4) {
            if (http.status === 200) {
                let element = JSON.parse(http.responseText);
                if(element.type == 'ok'){
                    bmt.removeChild(row);
                }
                row = null;
                resetForm();
            } else {
                alert('error');
            }
            hideSpinner(true);
        }
    } catch (error) {
        hideSpinner(true);
    }
}

function Modificar() {
    //validaciones
    if ($('nombre').length >= 6) {
        iNombre.removeAttribute('class', 'errValidation');
/*         if ($('cuatrimestre').length > 3) {
            iCuatrimestre.removeAttribute('class', 'errValidation'); */
            if (new Date($('fecha')) > Date.now()) {
                iFecha.removeAttribute('class', 'errValidation');
                if ((iManana.checked || iNoche.checked)) {
                    iManana.removeAttribute('class', 'errValidation');
                    iNoche.removeAttribute('class', 'errValidation');
                    try {
                        openHideDiv();
                        hideSpinner(false);
                        http.onreadystatechange = resEdit;
                        http.open('POST', 'http://localhost:3000/editar', true);
                        let obj = new Object();
                        obj.id = iID;
                        obj.nombre = $('nombre');
                        obj.cuatrimestre = $('cuatrimestre');
                        obj.fechaFinal = formatServerDate($('fecha'));
                        obj.turno = (iManana.checked ? $('manana') : $('noche'));
                        let element = JSON.stringify(obj);
                        http.setRequestHeader('Content-type', 'application/json');
                        http.send(element);
                    } catch (error) {
                        hideSpinner(true);
                    }
                } else {
                    alert('Ingrese un Turno');
                    iTurno.setAttribute('class', 'errValidation');
                }
            } else {
                alert('Fecha incorrecta');
                iFecha.setAttribute('class', 'errValidation');
            }
       /*  } else {
            alert('Cuatrimestre incorrecto');
            iCuatrimestre.setAttribute('class', 'errValidation');
        } */
    } else {
        alert('Nombre incorrecto');
        iNombre.setAttribute('class', 'errValidation');
    }

}

function resEdit() {
    try {
        if (http.readyState == 4) {
            if (http.status === 200) {
                let element = JSON.parse(http.responseText);
                if (element.type == 'ok') {
                    newTR = getTR();
                    bmt.replaceChild(newTR, row);
                }
                row = null;
                resetForm();
            } else {
                alert('error');
            }
            hideSpinner(true);
        }
    } catch (error) {
        hideSpinner(true);
    }
}

/* Auxiliares */
function getTR() {
    try {
        let tr = document.createElement('tr');
        for (let index = 0; index < 5; index++) {
            let td = document.createElement('td');
            let tn;
            switch (index) {
                case 0:
                    tn = document.createTextNode(row.childNodes[0].textContent);
                    td.setAttribute('hidden', true);
                    break;
                case 1:
                    tn = document.createTextNode($('nombre'));
                    break;
                case 2:
                    tn = document.createTextNode($('cuatrimestre'));
                    break;
                case 3:
                    tn = document.createTextNode(formatServerDate($('fecha')));
                    break;
                case 4:
                    tn = document.createTextNode((iManana.checked ? $('manana') : $('noche')));
                    break;
                default:
                    break;
            }
            td.appendChild(tn);
            tr.appendChild(td);
        }
        if (parseInt(row.childNodes[0].textContent) % 2 === 0) {
            tr.setAttribute('class', 'filaImpar');
        }
        tr.addEventListener('dblclick', modalShow);
        return tr;
    } catch (error) {
        alert(error);
    }
}

function formatDate(date) {
    return date.split("/").reverse().join("-");
}

function formatServerDate(date) {
    console.log(date.split("-").reverse().join("/"));
    return date.split("-").reverse().join("/");
}
