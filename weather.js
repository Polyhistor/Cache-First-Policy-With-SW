window.addEventListener('load', () => {
  document.querySelector('ul#weather').innerHTML = '';
  Promise.all([fetchWeather(1), fetchWeather(2), fetchWeather(3)])
    .then((responses) => {
      responses.forEach((response) => {
        response.json().then((data) => {
          let li;

          if (data[0] && data[0].error) {
            li = `<li>Offline</li>`;
          } else {
            li = `<li>${data.title}</li>`;
          }
          document.querySelector('ul#weather').innerHTML += li;
        });
      });
    })
    .catch((e) => {
      console.info(e);
    });
});

function fetchWeather(city) {
  return fetch('https://jsonplaceholder.typicode.com/todos/1' + city);
}
