
export const crearTabla = (data)=>{

    if(!Array.isArray(data)) return null;
    const datosOrdenados = data.slice().sort((a, b) => b.miedo - a.miedo);

    const tabla = document.createElement("table");
    tabla.appendChild(crearCabecera(datosOrdenados[0]));
    tabla.appendChild(crearCuerpo(datosOrdenados));

    return tabla;
};

const crearCabecera = (elemento) =>{
    const tHead = document.createElement("thead");
    let headRow = document.createElement("tr"); 

    for(const key in elemento)
    {
        if(key === "id")
        {
            continue;
        }
        const th = document.createElement("th");
        th.textContent = key;
        headRow.appendChild(th);
    }

    tHead.appendChild(headRow);
    return tHead;
};

const crearCuerpo = (data) =>{

    if(!Array.isArray(data)) return null;

    const tBody = document.createElement("tbody");

    data.forEach((element) => {

        const tr = document.createElement("tr");
        
        for(const key in element)
        {
            if(key === "id")
            {
                tr.dataset.id = element[key];
            }
            else
            {
                const td = document.createElement("td");
                td.textContent = element[key];

                tr.appendChild(td);
            }
        }
        tBody.appendChild(tr);
    });

    return tBody;
};


export const actualizarTabla = (contenedor,data)=>{
    while(contenedor.hasChildNodes())
    {
        contenedor.removeChild(contenedor.firstElementChild);
    }
    contenedor.appendChild(crearTabla(data));
};
