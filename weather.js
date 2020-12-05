window.addEventListener('load', () => {
  document.querySelector('ul#weather').innerHTML = '';
  Promise.all([fetchWeather(1), fetchWeather(2), fetchWeather(3)]).then(
    (responses) => {
      responses.forEach((response) => {
        response.json().then((data) => {
          const li = `<li>${data.title}</li>`;
          document.querySelector('ul#weather').innerHTML += li;
        });
      });
    }
  );
});

function fetchWeather(city) {
  return fetch('https://jsonplaceholder.typicode.com/todos/1' + city);
}
