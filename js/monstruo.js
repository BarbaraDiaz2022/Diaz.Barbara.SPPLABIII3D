// Definir la clase base "Personaje"
class Personaje 
{
    constructor(id, nombre) 
    {
      this.id = id;
      this.nombre = nombre;
    }
}
  
  // Definir la clase derivada "Monstruo" que hereda de "Personaje"
export class Monstruo extends Personaje 
{
    constructor(id, nombre, alias, defensa, miedo,tipo) 
    {
      // Llamar al constructor de la clase base "Personaje"
      super(id, nombre);
  
      // Inicializar los atributos específicos de la clase "Monstruo"
      this.alias = alias;
      this.defensa = defensa;
      this.miedo = miedo;
      this.tipo = tipo;
    }
}