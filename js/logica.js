import {crearTabla, actualizarTabla} from "./tabla.js"
import {Monstruo} from "./monstruo.js"
const URL = "http://localhost:3000/listaMonstruos";
const $seccionTabla = document.getElementById("tabla");
const $formulario = document.forms.formulario;
let listaMonstruos = [];

/**codigo segundo parcial  */
async function obtenerMonstruos() //obtengo la lista de monstruos de json-server
{
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
    await obtenerMonstruos(); //espero hasta traer la lista 
    actualizarTabla($seccionTabla,listaMonstruos);
    calcularPromedio();
});

$seccionTabla.addEventListener("click",(evento) =>{
    if(evento.target.matches("td"))
    {
        const id = evento.target.parentElement.dataset.id;
        const selectedMonstruo = listaMonstruos.find((mons) => mons.id == id)
        
        cargarFormMonstruo($formulario,selectedMonstruo);
        //console.log(id);

        document.getElementById("eliminar").style.display ="block";
    }
    else if(evento.target.matches("button[value]='eliminar'"))
    {
        console.log("id: ", $formulario.txtId.value);
        const id = parseInt($formulario.txtId.value);
        console.log("id brrado: ",id);
        handlerDelete(id);

        document.getElementById("eliminar").style.display = "none";
    }
});


/**filtrar por tipo de monstruo */
document.getElementById("btnFiltrar").addEventListener("click",()=>{
    const tipoSeleccionado = document.getElementById("selectFiltroTipo").value;

    if(tipoSeleccionado === "Todos")
    {
        actualizarTabla($seccionTabla,listaMonstruos);
        calcularPromedio(listaMonstruos); //calculo el promedio de los monstruos filtrados
    }
    else
    {
        const monstruosFiltrados = listaMonstruos.filter((mons) => mons.tipo === tipoSeleccionado);
        actualizarTabla($seccionTabla,monstruosFiltrados);
        calcularPromedio(monstruosFiltrados);
    }
});

function calcularPromedio(lista)
{
    const totalMiedo = lista.reduce((sum,mons) => sum + mons.miedo, 0);
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
    try
    {
        if(!validarCampo())
        {
            return;
        }

        mostrarSpinner();
        const response = await ajaxRequest('POST',URL,nuevoMonstruo);
        const updatedData = await obtenerMonstruos();

        setTimeout(()=>{
            actualizarTabla($seccionTabla,updatedData);
            ocultarCarga();
        },2000);

        $formulario.reset();
    }
    catch(error)
    {
        console.error(`Error ${error.status}: ${error.statusText}`)
    }

    ocultarCarga();
}

async function handlerUpdate(editMonstruo)
{
    try
    {
        if(!validarCampo())
        {
            return;
        }

        mostrarSpinner();
        const response = await ajaxRequest('PUT', `${URL}/${editMonstruo.id}`, editMonstruo);        
        const updatedData = await obtenerMonstruos();       
        setTimeout(() => {
            actualizarTabla($seccionTabla, updatedData);           
            ocultarCarga();
        }, 2000);
    }
    catch(error) 
    {
        console.error(`Error ${error.status}: ${error.statusText}`);
        
        ocultarCarga();
    }
}

async function handlerDelete(id)
{
    mostrarSpinner();
    try 
    {
        const response = await axios.delete(`${URL}/${id}`);
        const updatedData = await obtenerMonstruos();

        setTimeout(() => {
            actualizarTabla($seccionTabla, updatedData);
            ocultarCarga();
        }, 2000);
    } 
    catch(error) 
    {
        console.error(`Error ${error.response.status}: ${error.response.statusText}`);
        ocultarCarga();
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
}


// Función de validación 
$formulario.addEventListener('submit', function (evento) {

    let check = true;

    // Validar el campo nombre
    if (!validarCampo()) {
        check = false;
    }

    // Validar el campo alias
    if (!validarCampo()) {
        check = false;
    }

    if (!check) {
        evento.preventDefault(); // Evitar el envío
    }
});

function validarCampo() {
    // console.log('entro aca');
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

const armas = ['Esqueleto', 'Zombie', 'Vampiro', 'Fantasma', 'Bruja', 'Hombre lobo'];
localStorage.setItem('armas', JSON.stringify(armas));

document.addEventListener('DOMContentLoaded', function(){
    const miArray = JSON.parse(localStorage.getItem('armas'))// cargo el array de localstorage
    const select = document.getElementById('miSelect'); //cargo opciones para el select

    miArray.forEach(function(arma){
        let opcion = document.createElement('option');
        opcion.value = arma;
        opcion.text = arma;
        select.add(opcion);
    });
});

function ocultarCarga() {
    let loader = document.getElementById("spinner-container");
    loader.style.display = "none";
}
/**fin codigo segundo parcial  */

function mostrarSpinner() 
{
    console.log("funcion mostrar spinne");
    if (validarCampo())
    {
        //event.preventDefault(); // Evita la recarga de la página

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