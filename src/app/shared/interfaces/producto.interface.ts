export class Producto {
    constructor(
        public id:number,
        public nombre: string,
        public precio:number,
        public imagen:string,
        public cantidad:number,
        public descripcion:string,
        public psa: number,
        public rareza: string,
    ) { }
}