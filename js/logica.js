const armas = ['Esqueleto', 'Zombie', 'Vampiro', 'Fantasma', 'Bruja', 'Hombre lobo'];
localStorage.setItem('armas', JSON.stringify(armas));

document.addEventListener('DOMContentLoaded', function(){
    let miArray = JSON.parse(localStorage.getItem('armas'))// cargo el array de localstorage
    let select = document.getElementById('miSelect'); //cargo opciones para el select

    miArray.forEach(function(arma){
        let opcion = document.createElement('option');
        opcion.value = arma;
        opcion.text = arma;
        select.add(opcion);});
});
// import {monstruos as monsters} from "../app.js/data.js";
import {actualizarTabla} from "./tabla.js"
import {Monstruo} from "./monstruo.js"

window.addEventListener("click", function (event) 
{
    if (event.target.matches("td")) 
    {
        const id = event.target.parentElement.dataset.id;    
        const selectedMonstruo = monstruos.find((mons)=>{
            return mons.id == id;
        });
        cargarFormMonstruo($formulario,selectedMonstruo);
    }
    else if(event.target.matches("button[value='eliminar']"))
    {
        const id = parseInt($formulario.txtId.value);
        handlerDelete(id);
    }
});

const monstruos = JSON.parse(localStorage.getItem("monstruos")) || [];

console.log(monstruos);

const $seccionTabla = document.getElementById("tabla");
const $formulario = document.forms[0];


$formulario.addEventListener("submit", (e)=>{
    e.preventDefault();
    console.log("enviando");

    const {txtId, nombre,alias,defensa,miedo,tipo} = $formulario;  //referencia a controles del form


    if(txtId.value === "")
    {
        //nuevo monstruo
        const newMonstruo = new Monstruo(Date.now(),nombre.value,alias.value,defensa.value,parseInt(miedo.value),tipo.value);
        handlerCreate(newMonstruo);

    }
    else
    {
        //modificar el monstruo
        const updateMonstruo = new Monstruo(parseInt(txtId.value),nombre.value,alias.value,defensa.value,parseInt(miedo.value),tipo.value);
        handlerUpdate(updateMonstruo);

    }

    $formulario.reset();

});

function handlerCreate(nuevoMonstruo)
{
    if(mostrarSpinner())
    {
        monstruos.push(nuevoMonstruo);
        //actualizarTabla($seccionTabla,monstruos);
        localStorage.setItem('monstruos', JSON.stringify(monstruos));
    }

}

function handlerUpdate(editMonstruo)
{
    let index = monstruos.findIndex((mons)=>mons.id == editMonstruo.id);
    monstruos.splice(index, 1 , editMonstruo);//busco y reemplzo el monstruo
    actualizarTabla($seccionTabla,monstruos);
    localStorage.setItem('monstruos', JSON.stringify(monstruos));
}

function handlerDelete(id)
{
    let index = monstruos.findIndex((mons)=>mons.id == id);
    monstruos.splice(index, 1);
    actualizarTabla($seccionTabla,monstruos);
    localStorage.setItem('monstruos', JSON.stringify(monstruos));
    $formulario.reset();
}


function validarFormulario() 
{
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

function mostrarSpinner() 
{
    console.log("funcion mostrar spinne");
    if (validarFormulario())
    {
        //event.preventDefault(); // Evita la recarga de la página

        let spinnerCont = document.getElementById('spinner-container');
        spinnerCont.style.display = 'block';

        setTimeout(function () {
            spinnerCont.style.display = 'none';

            actualizarTabla($seccionTabla,monstruos);
        }, 2000);
        return true;
    }
    else
    {
        return false;
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
}
