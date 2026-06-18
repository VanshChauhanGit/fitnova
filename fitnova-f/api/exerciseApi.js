import axios from 'axios';

const exerciseAPI = axios.create({
  baseURL: 'https://exercisedb.p.rapidapi.com',
  headers: {
    'X-RapidAPI-Key': 'f161361abemsh820c9294dcdb5a6p13905fjsn5961672678b1',

    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
  },
});

export default exerciseAPI;
