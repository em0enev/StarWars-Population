import EventEmitter from "eventemitter3";
import delay from "../utils";
import Film from "./Film";
import Planet from "./Planet";

export default class StarWarsUniverse extends EventEmitter {
    constructor() {
        super();
        this.films = [];
        this.planet = null;
    }

    static get events() {
        return {
            FILM_ADDED: 'film_added',
            UNIVERSE_POPULATED: 'universe_populated'
        }
    }

    static get constants() {
        return {
            PLANETS_URL_API: 'https://swapi.dev/api/planets/',
            PEOPLE_URL_API: 'https://swapi.dev/api/people/'
        }
    }

    async init() {
        const planetWithoutPopulation = await this._getPlanetWithoutPopulation();
        const firstTenPeople = await this._getFirstTenPeople();

        const planet = new Planet(planetWithoutPopulation.name, { populationDelay : 1 }, firstTenPeople)
        this.planet = planet;

        this.planet.on(Planet.events.PERSON_BORN, (data) => this._onPersonBorn(data))
        this.planet.on(Planet.events.POPULATING_COMPLETE, () => this._onUniversePopulated())
        await this.planet.populate();
    }

    async _getTotalPlanetsCount() {
        const response = await fetch(StarWarsUniverse.constants.PLANETS_URL_API);
        const { count } = await response.json();
        return count;
    }

    async _getPlanetWithoutPopulation(){
        const totalPlanetsCount = await this._getTotalPlanetsCount();
        
        for (let i = 1; i <= totalPlanetsCount; i++) {
            const response = await fetch(StarWarsUniverse.constants.PLANETS_URL_API + `${i}`)
            const data = await response.json();
            if (data.population === "0") {
                return data;
            }
        }
    }

    async _getFirstTenPeople(){
        let firstTenPeople = []

        for (let i = 1; i <= 10; i++) {
            const response = await fetch(StarWarsUniverse.constants.PEOPLE_URL_API + `${i}`);
            const data = await response.json();
            firstTenPeople.push(data);
        }

        return firstTenPeople;
    }

    _onPersonBorn(data){
        for (const url of data.filmsUrls) {
            if(!this._isFilmExist(url)){
                const film = new Film(url)
                this.films.push(film)
                this.emit(StarWarsUniverse.events.FILM_ADDED)
            }
        }
    }

    _onUniversePopulated(){
        this.emit(StarWarsUniverse.events.UNIVERSE_POPULATED)
    }

    _isFilmExist(url){
        for (const film of this.films) {
            if(film.url === url){
                return true;
            }
        }
        return false;
    }
}