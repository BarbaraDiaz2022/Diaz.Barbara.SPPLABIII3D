class Personaje 
{
    constructor(id, nombre) 
    {
      this.id = id;
      this.nombre = nombre;
    }
}

export class Monstruo extends Personaje 
{
    constructor(id, nombre, alias, defensa, miedo,tipo) 
    {
      super(id, nombre);
      this.alias = alias;
      this.defensa = defensa;
      this.miedo = miedo;
      this.tipo = tipo;
    }
}