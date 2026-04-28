const MENU = document.querySelector("#menu");
const ROUTER = document.querySelector("#ruteo");
const NAV = document.querySelector("ion-nav");

const HOME = document.querySelector("#pantalla-home");
const LOGIN = document.querySelector("#pantalla-login");
const REGISTRO = document.querySelector("#pantalla-registro");
const REGISTROEJERCICIO = document.querySelector("#pantalla-registroEjercicios");
const LISTADOREGISTROS = document.querySelector("#pantalla-listadoRegistros");
const INFORMETIEMPO = document.querySelector("#pantalla-informeTiempo");
const TIEMPODIARIO = document.querySelector("#pantalla-tiempoDiario");
const MAPA = document.querySelector("#pantalla-mapa");


// https://movetrack.develotion.com/

Inicio();

function Inicio(){
    Eventos();
    ArmarMenu();
}

function Eventos(){
    ROUTER.addEventListener('ionRouteDidChange', NavegarMenu);

    document.querySelector("#btnLogin").addEventListener('click', LoguearUsuario);
    document.querySelector("#btnRegistro").addEventListener('click', RegistrarUsuario);
    document.querySelector("#btnRegistroEjercicio").addEventListener('click', RegistrarActividad);
    
    document.querySelector("#btnFiltrarSemana").addEventListener('click', FiltrarUltimaSemana);
    document.querySelector("#btnFiltrarMes").addEventListener('click', FiltrarUltimoMes);
    document.querySelector("#btnFiltrarHistorico").addEventListener('click', FiltrarHistorico);
}

function CerrarMenu(){
    MENU.close();
}

function ArmarMenu(){
    let existeKey = localStorage.getItem("apikey");
    let cadena = `<ion-item onclick="CerrarMenu()" href="/">Home</ion-item>`;

    if(existeKey){
        cadena += ` <ion-item onclick="CerrarMenu()" href="/registroEjercicio">Crear Actividad</ion-item>
                    <ion-item onclick="CerrarMenu()" href="/listadoRegistros">Mis Actividades</ion-item>
                    <ion-item onclick="CerrarMenu()" href="/informeTiempo">Informes de Tiempo</ion-item>
                    <ion-item onclick="CerrarMenu()" href="/mapa">Mapa</ion-item>
                <ion-item onclick="DesloguearUsuario()">Logout</ion-item>
                `
    }else {
        cadena += `<ion-item onclick="CerrarMenu()" href="/login">Login</ion-item>
                <ion-item onclick="CerrarMenu()" href="/registro">Registro</ion-item>`
    }      
    document.querySelector("#menu-opciones").innerHTML = cadena;
}

function NavegarMenu(evt){
    const ruta = evt.detail.to;
    OcultarPantallas();
    if(ruta == "/"){
        HOME.style.display = "block";
    } else if (ruta == "/login"){
        LOGIN.style.display = "block";
    } else if (ruta == "/registro"){
        REGISTRO.style.display = "block";
        CargarPaises();
    } else if (ruta == "/registroEjercicio"){
        REGISTROEJERCICIO.style.display = "block";
        CargarActividades();
    } else if (ruta == "/listadoRegistros"){
        ListarActividades();
        LISTADOREGISTROS.style.display = "block";
    } else if (ruta == "/informeTiempo"){
        CargarInformes();
        INFORMETIEMPO.style.display = "block";
    } else if (ruta == "/mapa"){
        CalcularPorPais();
        MAPA.style.display = "block";
    }
}

function OcultarPantallas(){
    HOME.style.display = "none";
    LOGIN.style.display = "none";
    REGISTRO.style.display = "none";
    REGISTROEJERCICIO.style.display = "none";
    LISTADOREGISTROS.style.display = "none";
    INFORMETIEMPO.style.display = "none";
    MAPA.style.display = "none";
}

function CargarActividades(){
    PrenderLoading("Cargando Actividades");

    let userkey = localStorage.getItem("apikey");
    let iduser = localStorage.getItem("idusuario");
    
    fetch(`https://movetrack.develotion.com/actividades.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': userkey,
            'iduser': iduser
        }
    }).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(data){
        console.log(data);
        let cadena = "";
        for(let actividad of data.actividades){
            cadena += `<ion-select-option value="${actividad.id}">${actividad.nombre}</ion-select-option>`
        }
        document.querySelector("#slcActividades").innerHTML = cadena;
        ApagarLoading();
    })    
}

function RegistrarActividad(){
    let actividad = document.querySelector("#slcActividades").value;
    let tiempo = document.querySelector("#txtRegistroEjercicioTiempo").value;
    let fecha = document.querySelector("#txtRegistroEjercicioTiempoFecha").value;
    
    try {
        if(actividad == null || tiempo == "" || fecha == null){
            throw new Error("Complete todos los campos");
        } else if(tiempo <= 0){
            throw new Error("El tiempo debe ser mayor a 0");
        } else if(!EsFechaCorrecta(fecha)){
            throw new Error("La fecha no puede ser superior a la de hoy");
        }

        let keyUsuario = localStorage.getItem("apikey");
        let idUsuario = localStorage.getItem("idusuario");
        let nuevaActividad = new Object();
        nuevaActividad.idActividad = actividad;
        nuevaActividad.idUsuario = idUsuario;
        nuevaActividad.tiempo = tiempo;
        nuevaActividad.fecha = fecha.substring(0,10);
    

        PrenderLoading("Registrando Actividad");
        fetch(`https://movetrack.develotion.com/registros.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': keyUsuario,
                'iduser': idUsuario
            },
            body: JSON.stringify(nuevaActividad),
        }).then(function(response){
            console.log(response);
            return response.json();
        }).then(function(data){
            console.log(data);
            MostrarToast(`${data.mensaje}`,3000);
            ApagarLoading();
        })
    } catch (error) {
        MostrarToast(`${error}`,3000);
    }
}

function EsFechaCorrecta(fechaCalendario){
    let f1 = new Date(fechaCalendario);
    let f2 = new Date();
    return f1 < f2;
}

//Retorna todas las actividades
async function GetActividades(){
    let userkey = localStorage.getItem("apikey");
    let iduser = localStorage.getItem("idusuario");
    
    let response = await fetch(`https://movetrack.develotion.com/actividades.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': userkey,
            'iduser': iduser
        }
    });

    let lista = await response.json();
    return lista;
}

//Retorna mis actividades
async function GetMisRegistros(){
    let userkey = localStorage.getItem("apikey");
    let iduser = localStorage.getItem("idusuario");
    
    let response = await fetch(`https://movetrack.develotion.com/registros.php?idUsuario=${iduser}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': userkey,
            'iduser': iduser
        }
    });

    let lista = await response.json();
    return lista;
}

let listaActividades = new Array();
let misRegistros = new Array();
async function ListarActividades(){
    document.querySelector("#listaDeMisRegistros").innerHTML = "";

    console.log(listaActividades);
    PrenderLoading("Cargando Lista");
    if(listaActividades.length == 0) {
        listaActividades = await GetActividades();
        console.log(listaActividades, "todas las actividades");
    }
    
    misRegistros = await GetMisRegistros();
    console.log(misRegistros, "todos mis registros");
    
    FiltrarHistorico();
    ApagarLoading();
}

function FiltrarUltimaSemana(){
    document.querySelector("#listaDeMisRegistros").innerHTML = "";
    PrenderLoading("Cargando Lista");
    for(let r of misRegistros.registros){
        for(let a of listaActividades.actividades){
            let fecha = new Date(r.fecha);
            if(EstaEnUltimaSemana(fecha) && r.idActividad == a.id){
                document.querySelector("#listaDeMisRegistros").innerHTML += `<ion-card>
                                                                                <img  src="https://movetrack.develotion.com/imgs/${a.imagen}.png"/>
                                                                                <ion-card-header>
                                                                                    <ion-card-title>${a.nombre}</ion-card-title>
                                                                                    <ion-card-subtitle>${r.tiempo} Minutos</ion-card-subtitle>
                                                                                </ion-card-header>

                                                                                <ion-card-content>
                                                                                    Fecha: ${r.fecha}
                                                                                </ion-card-content>
                                                                                <ion-button fill="clear" onclick="EliminarRegistro(${r.id})">Eliminar</ion-button>
                                                                            </ion-card>`;
            }
        } 
    }
    ApagarLoading();
}

function EstaEnUltimaSemana(fecha){
    let fechaHoy = new Date();
    fechaHoy.setDate(fechaHoy.getDate() - 8);
    return fecha >= fechaHoy;
}

function FiltrarUltimoMes(){
    document.querySelector("#listaDeMisRegistros").innerHTML = "";
    PrenderLoading("Cargando Lista");
    for(let r of misRegistros.registros){
        for(let a of listaActividades.actividades){
            let fecha = new Date(`${r.fecha}T00:00:00`);
            let fechaHoy = new Date();
            if(fecha.getMonth() == fechaHoy.getMonth() && r.idActividad == a.id){
                document.querySelector("#listaDeMisRegistros").innerHTML += `<ion-card>
                                                                                <img  src="https://movetrack.develotion.com/imgs/${a.imagen}.png"/>
                                                                                <ion-card-header>
                                                                                    <ion-card-title>${a.nombre}</ion-card-title>
                                                                                    <ion-card-subtitle>${r.tiempo} Minutos</ion-card-subtitle>
                                                                                </ion-card-header>

                                                                                <ion-card-content>
                                                                                    Fecha: ${r.fecha}
                                                                                </ion-card-content>
                                                                                <ion-button fill="clear" onclick="EliminarRegistro(${r.id})">Eliminar</ion-button>
                                                                            </ion-card>`;
            }
        } 
    }
    ApagarLoading();
}

function FiltrarHistorico(){
    document.querySelector("#listaDeMisRegistros").innerHTML = "";
    PrenderLoading("Cargando Lista");
    for(let r of misRegistros.registros){

        for(let a of listaActividades.actividades){
            if(r.idActividad == a.id){
                document.querySelector("#listaDeMisRegistros").innerHTML += `<ion-card>
                                                                                <img  src="https://movetrack.develotion.com/imgs/${a.imagen}.png"/>
                                                                                <ion-card-header>
                                                                                    <ion-card-title>${a.nombre}</ion-card-title>
                                                                                    <ion-card-subtitle>${r.tiempo} Minutos</ion-card-subtitle>
                                                                                </ion-card-header>

                                                                                <ion-card-content>
                                                                                    Fecha: ${r.fecha}
                                                                                </ion-card-content>
                                                                                <ion-button fill="clear" onclick="EliminarRegistro(${r.id})">Eliminar</ion-button>
                                                                            </ion-card>`;
            }
        } 
    }
    ApagarLoading();
}

function EliminarRegistro(idRegistro){

    let userkey = localStorage.getItem("apikey");
    let iduser = localStorage.getItem("idusuario");

    PrenderLoading("Eliminando");
    fetch(`https://movetrack.develotion.com/registros.php?idRegistro=${idRegistro}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'apikey': userkey,
            'iduser': iduser
        },
    }).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(data){
        console.log(data);
        ApagarLoading();
        ListarActividades();   
        MostrarToast(`${data.mensaje}`,3000);    
    })
}

/// INFORME DE TIEMPO
async function CargarInformes(){

    PrenderLoading("Cargando informes");
    let misActividadesRegistradas = await GetMisRegistros();
    console.log(misActividadesRegistradas, "mis actividades registradas");
    let contadorTotal = 0;
    let contadorDiario = 0;
    for(let act of misActividadesRegistradas.registros){
        contadorTotal += act.tiempo
        if(EsActividadHoy(act)){
            contadorDiario += act.tiempo;
        }
    }

    document.querySelector("#resultado-Tiempo-Total").innerHTML = `<ion-item color="primary"> Tiempo total: ${contadorTotal} minutos</ion-item> `;
    document.querySelector("#resultado-Tiempo-Diario").innerHTML = `<ion-item color="primary"> Tiempo hoy: ${contadorDiario} minutos</ion-item>`;
    ApagarLoading();

    console.log(contadorTotal);
    console.log(contadorDiario);
}

function EsActividadHoy(act) {
    let fechaHoy = new Date();
    let f1 = new Date(`${act.fecha}T00:00:00`);

    return f1.getFullYear() === fechaHoy.getFullYear() &&
           f1.getMonth() === fechaHoy.getMonth() &&
           f1.getDate() === fechaHoy.getDate();
}

/// LOGIN -- REGISTER 
function CargarPaises(){
    PrenderLoading("Cargando Paises");
    fetch(`https://movetrack.develotion.com/paises.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function(response){
        console.log(response);
        return response.json();
    }).then(function(data){
        console.log(data);
        let cadena = "";
        for(let pais of data.paises){
            cadena += `<ion-select-option value="${pais.id}">${pais.name}</ion-select-option>`
        }
        document.querySelector("#slcPaises").innerHTML = cadena;
        ApagarLoading();
    })
}

function LoguearUsuario(){
    let usuario = document.querySelector("#txtLoginUsuario").value;
    let password = document.querySelector("#txtLoginPassword").value;
    LoguearConUsuarioyPass(usuario,password);
}

function LoguearConUsuarioyPass(usuario, password){
    let datosUsuario = new Object();
    datosUsuario.usuario = usuario;
    datosUsuario.password = password;

    PrenderLoading("Logueando");
    fetch(`https://movetrack.develotion.com/login.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario),

    }).then(function(response){

        console.log(response);
        return response.json();
    
    }).then(function(data){
        console.log(data);
        if (data.codigo == 200){
            localStorage.setItem("apikey",data.apiKey);
            localStorage.setItem("idusuario",data.id);
            ArmarMenu();
            NAV.push("page-home");
            ApagarLoading();
            MostrarToast("Bienvenido",3000);
        } else {
            ApagarLoading();
            MostrarToast(`${data.mensaje}`,3000);
        }
    })
}

function RegistrarUsuario(){
    let usuario = document.querySelector("#txtRegistroUsuario").value;
    let contrasenia = document.querySelector("#txtRegistroPassword").value;
    let pais = document.querySelector("#slcPaises").value;

    try {
        if(pais == null || usuario == "" || contrasenia == ""){
            throw new Error("Debe completar todos los campos");
        }
        let nuevoUsuario = new Object();
        nuevoUsuario.usuario = usuario;
        nuevoUsuario.password = contrasenia;
        nuevoUsuario.idPais = pais;

        PrenderLoading("Registrando usuario");
        fetch(`https://movetrack.develotion.com/usuarios.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario),
        }).then(function (response) {
            console.log(response);
            return response.json();
        }).then(function (data) {
            if(data.codigo == 200){
                console.log(data);
                ApagarLoading();
                LoguearConUsuarioyPass(nuevoUsuario.usuario, nuevoUsuario.password);
            } else {
                ApagarLoading();
                MostrarToast(`${data.mensaje}`,3000);
            }
        })
    } catch (error) {
        MostrarToast(`${error}`,3000);
    }
}

function DesloguearUsuario(){
    localStorage.clear();
    ArmarMenu();
    NAV.push("page-home");
    CerrarMenu();
}




/// MAPA
var map = null;
function CrearMapa(){
    map = L.map('map').setView([-34.89792, -56.1905664], 3);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 1,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}



async function CalcularPorPais(){
    PrenderLoading("Cargando Mapa");
    let listaUsuarioPorPais = new Array();
    let listaPaises = new Array();

    listaUsuarioPorPais = await GetUsuariosPorPais();
    listaPaises = await GetPaisesCargados();

    console.log(listaUsuarioPorPais, "todos los paises");
    console.log(listaPaises, "10 paises");

    if(map != null) {
        map.remove();
    }
    CrearMapa();

    for(let p1 of listaUsuarioPorPais.paises){

        for(let p2 of listaPaises.paises){
            if(p1.id == p2.id){
                var marker = L.marker([p2.latitude, p2.longitude]).addTo(map).bindPopup(`Cantidad de usuarios registrados: ${p1.cantidadDeUsuarios}`);
            }
        }
    }
    ApagarLoading();
}



async function GetUsuariosPorPais(){
    let userkey = localStorage.getItem("apikey");
    let iduser = localStorage.getItem("idusuario");
    
    let response = await fetch(`https://movetrack.develotion.com/usuariosPorPais.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'apikey': userkey,
            'iduser': iduser
        }
    });

    let lista = await response.json();
    return lista;
}

async function GetPaisesCargados(){   
    let response = await fetch(`https://movetrack.develotion.com/paises.php`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let lista = await response.json();
    return lista;
}


/// AUXILIARES
const loading = document.createElement('ion-loading');
function PrenderLoading(texto) {

    loading.cssClass = 'my-custom-class';
    loading.message = texto;
    //loading.duration = 2000;
    document.body.appendChild(loading);
    loading.present();
}

function ApagarLoading() {
    loading.dismiss();
}

function MostrarToast(mensaje, duracion) {
    const toast = document.createElement('ion-toast');
    toast.message = mensaje;
    toast.duration = duracion;
    document.body.appendChild(toast);
    toast.present();
}