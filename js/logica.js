import {crearTabla, actualizarTabla} from "./tabla.js"
import {Monstruo} from "./monstruo.js"
const URL = "http://localhost:3000/listaMonstruos";
const $seccionTabla = document.getElementById("tabla");
const $formulario = document.forms.formulario;
let listaMonstruos = [];

async function obtenerMonstruos(){ //traigo la lista del jsonserver
    try
    {
        const respuesta = await fetch(URL);
        if(!respuesta.ok)
        {
            throw respuesta;
        }

        const data = await respuesta.json();
        listaMonstruos = data;
        return data;
    }
    catch(error)
    {
        console.log("error:" + error);
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async function(){
    await obtenerMonstruos();
    actualizarTabla($seccionTabla, listaMonstruos);
   
    const miArray = JSON.parse(localStorage.getItem('armas'));
    const select = document.getElementById('miSelect');
    const chkNombre = document.getElementById("chkNombre");
    const chkAlias = document.getElementById("chkAlias");
    const chkDefensa = document.getElementById("chkDefensa");
    const chkMiedo = document.getElementById("chkMiedo");
    const chkTipo = document.getElementById("chkTipo");

    miArray.forEach(function(arma){
        let opcion = document.createElement('option');
        opcion.value = arma;
        opcion.text = arma;
        select.add(opcion);
    });
    

    chkNombre.addEventListener("change", function () {
        toggleColumnVisibility("col-nombre", chkNombre.checked);
        guardarColumnasSeleccionadas();
    });

    chkAlias.addEventListener("change", function () {
        toggleColumnVisibility("col-alias", chkAlias.checked);
        guardarColumnasSeleccionadas();
    });

    chkDefensa.addEventListener("change", function () {
        toggleColumnVisibility("col-defensa", chkDefensa.checked);
        guardarColumnasSeleccionadas();
    });

    chkMiedo.addEventListener("change", function () {
        toggleColumnVisibility("col-miedo", chkMiedo.checked);
        guardarColumnasSeleccionadas();
    });
    
    chkTipo.addEventListener("change", function () {
        toggleColumnVisibility("col-tipo", chkTipo.checked);
        guardarColumnasSeleccionadas();
    });

    cargarColumnasSeleccionadas();
    calcularPromedio(listaMonstruos);
});

function toggleColumnVisibility(claseColumna, isVisible) 
{
    const celdas = document.querySelectorAll(`.${claseColumna}`);
    celdas.forEach(function (celda) {
        celda.style.display = isVisible ? "" : "none";
    });
}

function guardarColumnasSeleccionadas() 
{
    const columnasSeleccionadas = {
        chkNombre: chkNombre.checked,
        chkAlias: chkAlias.checked,
        chkDefensa: chkDefensa.checked,
        chkMiedo: chkMiedo.checked,
        chkTipo: chkTipo.checked,
    };

    localStorage.setItem('columnasSeleccionadas', JSON.stringify(columnasSeleccionadas));
}

function cargarColumnasSeleccionadas() 
{
    const columnasSeleccionadas = JSON.parse(localStorage.getItem('columnasSeleccionadas'));

    if (columnasSeleccionadas) 
    {
        chkNombre.checked = columnasSeleccionadas.chkNombre;
        chkAlias.checked = columnasSeleccionadas.chkAlias;
        chkDefensa.checked = columnasSeleccionadas.chkDefensa;
        chkMiedo.checked = columnasSeleccionadas.chkMiedo;
        chkTipo.checked = columnasSeleccionadas.chkTipo;

        toggleColumnVisibility("col-nombre", chkNombre.checked);
        toggleColumnVisibility("col-alias", chkAlias.checked);
        toggleColumnVisibility("col-defensa", chkDefensa.checked);
        toggleColumnVisibility("col-miedo", chkMiedo.checked);
        toggleColumnVisibility("col-tipo", chkTipo.checked);
    }
}

$seccionTabla.addEventListener("click", (evento) => {
    if (evento.target.matches("td")) 
    {
        const id = evento.target.parentElement.dataset.id;
        const selectedMonstruo = listaMonstruos.find((mons) => mons.id == id)

        cargarFormMonstruo($formulario, selectedMonstruo);
        document.getElementById("eliminar").style.display = "block";
    } 
    else if (evento.target.matches("button[value='eliminar']")) 
    {
        const id = parseInt($formulario.txtId.value);
        handlerDelete(id);
        document.getElementById("eliminar").style.display = "none";
    }
});


document.getElementById("btnFiltrar").addEventListener("click", () => {
    const tipoSeleccionado = document.getElementById("selectFiltroTipo").value;
    
    if (tipoSeleccionado === "Todos") {
        actualizarTabla($seccionTabla, listaMonstruos);
        calcularPromedio(listaMonstruos);
    } else {
        const monstruosFiltrados = listaMonstruos.filter((mons) => mons.tipo === tipoSeleccionado);
        actualizarTabla($seccionTabla, monstruosFiltrados);
        calcularPromedio(monstruosFiltrados);
    }
});

function calcularPromedio(lista) 
{
    if(lista === null) //agrego la validacion para que espere los 2 segundos a que cargue la lista con la tabla y no muestre 
    {                   //error en el reduce 
        console.log("la lista se esta cargando todavia");
        document.getElementById("promedioMiedo").value = 0;
        document.getElementById("miedoMaximo").value = 0;
        document.getElementById("miedoMinimo").value = 0;
    }
        const totalMiedo = lista.reduce((sum, mons) => sum + mons.miedo, 0);
        const promedioMiedo = totalMiedo / lista.length;
        document.getElementById("promedioMiedo").value = promedioMiedo.toFixed(2);

        const miedo = lista.map((mons) => mons.miedo);
        const miedoMaximo = Math.max(...miedo);
        const miedoMinimo = Math.min(...miedo);

        document.getElementById("miedoMaximo").value = miedoMaximo.toFixed(2);
        document.getElementById("miedoMinimo").value = miedoMinimo.toFixed(2);
}

$formulario.addEventListener("submit",async (e) => {
    e.preventDefault();
    const {txtId,nombre,alias,defensa,miedo,tipo} = $formulario;

    if(txtId.value === "")
    {
        const newMonstruo = new Monstruo(Date.now(),nombre.value,alias.value,defensa.value,parseInt(miedo.value),tipo.value);
        await handlerCreate(newMonstruo);
    }
    else
    {
        const updateMonstruo = new Monstruo(parseInt(txtId.value),nombre.value,alias.value,defensa.value,parseInt(miedo.value),tipo.value);
        await handlerUpdate(updateMonstruo);
    }

    $formulario.reset();

    const updatedListaMonstruos = await obtenerMonstruos();
    actualizarTabla($seccionTabla,updatedListaMonstruos);
    calcularPromedio();
});

//PETICIONES AJAX
function ajaxRequest(method, url, data = null)
{
    return new Promise((resolve,reject) =>{
        const xhr = new XMLHttpRequest(); //creo el obj para las solicitudes http

        xhr.onreadystatechange = function(){ //creo la funcion para manejar los cambios en el estado de la solicitud
            if(xhr.readyState === 4) //si la solicitud es 4 esta completa
            {
                if(xhr.status >=200 && xhr.status < 300)
                {
                    resolve(JSON.parse(xhr.responseText));
                }
                else
                {
                    reject({status:xhr.status, statusText: xhr.statusText});
                }
            }
        };
        xhr.open(method,url,true);

        if(method === 'POST' || method === 'PUT')
        {
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
        else
        {
            xhr.send();
        }
    });
}

async function handlerCreate(nuevoMonstruo) 
{
    try {
        if (!validarCampo())
        {
            return;
        }

        mostrarSpinner();
        const response = await ajaxRequest('POST', URL, nuevoMonstruo);
        const updatedData = await obtenerMonstruos();

        setTimeout(() => {
            actualizarTabla($seccionTabla, updatedData);
            $formulario.reset();
            document.getElementById("cancelar").style.display = "none";
        }, 2000);
    } catch (error) {
        console.error(`Error ${error.status}: ${error.statusText}`);
    }
}

async function handlerUpdate(editMonstruo) 
{
    try {
        if (!validarCampo()) {
            return;
        }

        mostrarSpinner();
        const response = await ajaxRequest('PUT', `${URL}/${editMonstruo.id}`, editMonstruo);
        const updatedData = await obtenerMonstruos();

        setTimeout(() => {
            actualizarTabla($seccionTabla, updatedData);
            $formulario.reset();
            document.getElementById("cancelar").style.display = "none";
        }, 2000);
    } catch (error) {
        console.error(`Error ${error.status}: ${error.statusText}`);
    }
}

async function handlerDelete(id) 
{
    console.log("Entrando a handlerDelete con id:", id);

    mostrarSpinner();
    try 
    {
        const response = await fetch(`${URL}/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw response;
        }

        const updatedData = await obtenerMonstruos();
        console.log("Saliendo de handlerDelete"); 

        setTimeout(() => {
            actualizarTabla($seccionTabla, updatedData);
            $formulario.reset();
            document.getElementById("cancelar").style.display = "none";
        }, 2000);
    } 
    catch (error) 
    {
        console.error(`Error ${error.status}: ${error.statusText}`);
    }
}

function cargarFormMonstruo(formulario,monstruo)
{
    formulario.txtId.value = monstruo.id;
    formulario.nombre.value = monstruo.nombre;
    formulario.alias.value = monstruo.alias;
    formulario.defensa.value = monstruo.defensa;
    formulario.miedo.value = monstruo.miedo;
    formulario.tipo.value = monstruo.tipo;
    console.log(monstruo.id);
    //muestro el boton cancelar
    document.getElementById("cancelar").style.display = "block";
}

document.getElementById("cancelar").addEventListener("click", function () {
    $formulario.reset();
    document.getElementById("cancelar").style.display = "none";
    document.getElementById("eliminar").style.display = "none";
});

$formulario.addEventListener('submit', function (evento) {
    let check = true;

    if (!validarCampo()) 
    {
        check = false;
    }
    if (!validarCampo()) 
    {
        check = false;
    }
    //tienen que ser true ambos campos
    if (!check) 
    {
        evento.preventDefault();
    }
});

function validarCampo() 
{
    let nombre = document.getElementById('nombre').value;
    let alias = document.getElementById('alias').value;
    
    if (nombre === '' || alias === '') 
    {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, completa todos los campos del formulario.'
        });
        return false; //para que no se envie el form si estan vacios
    } 
    else 
    {
        return true; 
    }
}

function mostrarSpinner() 
{
    console.log("funcion mostrar spinner");
    if (validarCampo())
    {
        let spinnerCont = document.getElementById('spinner-container');
        spinnerCont.style.display = 'block';

        setTimeout(function () {
            spinnerCont.style.display = 'none';
            actualizarTabla($seccionTabla,listaMonstruos);
        }, 2000);
        return true;
    }
    else
    {
        return false;
    }
}
